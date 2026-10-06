"""Catalogue validation follows host route splits without importing its server."""

from pathlib import Path

import pytest
from pydantic import BaseModel, ValidationError
from tools.check_host_contract import load_catalogue_entry


class Dependency(BaseModel):
    """Only the public dependency shape needed by these transport fixtures."""

    plugin_id: str


@pytest.mark.parametrize("split", [False, True])
def test_catalogue_model_loads_both_layouts(tmp_path: Path, split: bool) -> None:
    """Resolve release/dependency references and retain field validation."""
    routes = tmp_path / "src/backend/src/api/routes"
    source = routes / ("plugin_manager/models.py" if split else "plugins.py")
    source.parent.mkdir(parents=True)
    source.write_text(
        'raise RuntimeError("Do not import the application server")\n'
        "class PluginCatalogRelease(BaseModel):\n"
        "    version: str = Field(min_length=1)\n"
        "class PluginCatalogEntry(BaseModel):\n"
        "    plugin_id: str = Field(min_length=1)\n"
        "    dependencies: tuple[PluginDependency, ...] = ()\n"
        "    releases: tuple[PluginCatalogRelease, ...] = ()\n",
        encoding="utf-8",
    )
    if split:
        (routes / "plugins.py").write_text("# Models were moved.\n", encoding="utf-8")
    model = load_catalogue_entry(tmp_path, Dependency)
    entry = model.model_validate(
        {
            "plugin_id": "example.test",
            "dependencies": [{"plugin_id": "example.parent"}],
            "releases": [{"version": "1.0.0"}],
        }
    )
    assert entry.dependencies[0].plugin_id == "example.parent"
    assert entry.releases[0].version == "1.0.0"
    with pytest.raises(ValidationError):
        model.model_validate({"plugin_id": ""})


def test_missing_catalogue_model_has_actionable_error(tmp_path: Path) -> None:
    """A changed contract produces a useful failure instead of StopIteration."""
    source = tmp_path / "src/backend/src/api/routes/plugins.py"
    source.parent.mkdir(parents=True)
    source.write_text("# No catalogue model.\n", encoding="utf-8")
    with pytest.raises(ValueError, match="catalogue entry model is missing"):
        load_catalogue_entry(tmp_path, Dependency)
