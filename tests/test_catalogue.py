import json
import re
from pathlib import Path

ROOT = Path(__file__).parents[1]


def test_catalogue_matches_shipped_plugins() -> None:
    catalogue = json.loads((ROOT / "list.json").read_text(encoding="utf-8"))
    assert catalogue["version"] == 1
    entries = catalogue["plugins"]
    assert entries

    manifests = {}
    for path in (ROOT / "examples").glob("*/manifest.json"):
        manifest = json.loads(path.read_text(encoding="utf-8"))
        manifests[manifest["plugin_id"]] = manifest

    shipped_ids = {
        re.sub(r"-[0-9]+\.[0-9]+\.[0-9]+$", "", path.stem)
        for path in (ROOT / "dist").glob("*.utp")
    }
    assert {entry["plugin_id"] for entry in entries} == shipped_ids

    for entry in entries:
        manifest = manifests[entry["plugin_id"]]
        assert set(entry) == {"plugin_id", "name", "description", "version", "url"}
        assert entry["name"] == manifest["name"]
        assert entry["description"] == manifest["description"]
        assert entry["version"] == manifest["version"]
        assert entry["url"].endswith(
            "/dist/" + manifest["plugin_id"] + "-" + manifest["version"] + ".utp"
        )
