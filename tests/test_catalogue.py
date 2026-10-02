import json
import zipfile
from pathlib import Path

from tools.distribution import validate_distribution, version_key

ROOT = Path(__file__).parents[1]


def test_catalogue_matches_plugin_manifests(built_distribution):
    validate_distribution(ROOT)
    validate_distribution(built_distribution, check_source=True)
    catalogue = json.loads((built_distribution / "list.json").read_text(encoding="utf-8"))
    assert catalogue["version"] == 1
    entries = catalogue["plugins"]
    manifests = {m["plugin_id"]: m for p in (ROOT / "examples").glob("*/manifest.json") for m in [json.loads(p.read_text())]}
    assert entries
    assert len({e["plugin_id"] for e in entries}) == len(entries)
    assert {e["plugin_id"] for e in entries} == set(manifests)
    for entry in entries:
        authored = manifests[entry["plugin_id"]]
        package = built_distribution / "dist" / entry["package"]["filename"]
        with zipfile.ZipFile(package) as archive:
            manifest = json.loads(archive.read("manifest.json"))
            release = json.loads(archive.read("payload/distribution.json"))
            assert entry["readme"] == archive.read("payload/README.md").decode("utf-8")
            assert archive.read("payload/" + entry["icon"]["path"])
        assert entry["name"] == authored["name"] == manifest["name"]
        assert entry["description"] == authored["description"] == manifest["description"]
        assert version_key(entry["version"]) >= version_key(authored["version"])
        assert entry["version"] == manifest["version"] == release["version"]
        assert entry["url"].endswith("/dist/" + package.name)
        assert entry["tags"] == release["tags"]
        assert entry["permissions"] == authored["permissions"] == manifest["permissions"]
        assert entry["releases"][-1]["version"] == entry["version"]
        assert entry["documentation"]["packaged"]
