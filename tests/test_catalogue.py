import json
from pathlib import Path

ROOT = Path(__file__).parents[1]


def test_catalogue_matches_plugin_manifests() -> None:
    catalogue = json.loads((ROOT / "list.json").read_text(encoding="utf-8"))
    assert catalogue["version"] == 1
    entries = catalogue["plugins"]
    assert entries

    manifests = {}
    for path in (ROOT / "examples").glob("*/manifest.json"):
        manifest = json.loads(path.read_text(encoding="utf-8"))
        manifests[manifest["plugin_id"]] = manifest

    assert len({entry["plugin_id"] for entry in entries}) == len(entries)
    for entry in entries:
        manifest = manifests[entry["plugin_id"]]
        package_name = entry["plugin_id"] + "-" + entry["version"] + ".utp"
        assert set(entry) == {"plugin_id", "name", "description", "version", "url"}
        assert entry["name"] == manifest["name"]
        assert entry["description"] == manifest["description"]
        assert entry["url"].endswith("/dist/" + package_name)
