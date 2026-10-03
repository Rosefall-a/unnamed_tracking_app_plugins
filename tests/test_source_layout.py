"""Fail rather than silently dropping misplaced or incomplete plugin sources."""
import json
import shutil

import pytest

from tools.check_source_layout import check
from tools.distribution import ROOT, discover_plugins


def test_all_maintained_sources_have_full_contracts(built_distribution):
    check()
    current = json.loads((built_distribution / "list.json").read_text(encoding="utf-8"))
    assert {m["plugin_id"] for _, m in discover_plugins(ROOT)} == {
        p["plugin_id"] for p in current["plugins"]
    }


@pytest.mark.parametrize("defect", ["old_tree", "missing_manifest", "missing_entrypoint", "duplicate_id"])
def test_discovery_rejects_layout_drift(tmp_path, defect):
    shutil.copytree(ROOT / "examples/ui-api", tmp_path / "examples/ui-api")
    if defect == "old_tree":
        (tmp_path / "examples.old").mkdir()
    elif defect == "missing_manifest":
        (tmp_path / "examples/stub").mkdir()
        (tmp_path / "examples/stub/README.md").write_text("Obsolete stub", encoding="utf-8")
    elif defect == "missing_entrypoint":
        (tmp_path / "examples/ui-api/plugin.py").unlink()
    else:
        shutil.copytree(tmp_path / "examples/ui-api", tmp_path / "examples/duplicate")
    with pytest.raises(ValueError):
        discover_plugins(tmp_path)
