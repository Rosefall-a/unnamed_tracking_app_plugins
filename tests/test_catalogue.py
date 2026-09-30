import json
from pathlib import Path


ROOT = Path(__file__).parents[1]


def test_catalogue_matches_shipped_plugins() -> None:
    catalogue = json.loads((ROOT / "list.json").read_text(encoding="utf-8"))
    assert catalogue["version"] == 1
    entries = catalogue["plugins"]
    assert entries

    built_ids = set()
    for path in (ROOT / "dist").glob("*.utp"):
        built_ids.add(path.name.rsplit("-", 1)[0])

    assert {entry["plugin_id"] for entry in entries} == built_ids
    for entry in entries:
        assert set(entry) == {"plugin_id", "name", "description", "version", "url"}
        manifest = json.loads(
            (ROOT / "examples" / entry["plugin_id"].split(".", 1)[-1] / "manifest.json").read_text(
                encoding="utf-8"
            )
        ) if (ROOT / "examples" / entry["plugin_id"].split(".", 1)[-1] / "manifest.json").is_file() else None
        assert entry["url"].endswith(
            f"/dist/{entry['plugin_id']}-{entry['version']}.utp"
        )
