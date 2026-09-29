import json
from pathlib import Path
ROOT=Path(__file__).parents[1]
PLUGINS=("lifecycle","events","ui-api","advanced","notifications","metadata","events-filter")

def test_manifests_are_v1_and_unique():
    ids=[]
    for name in PLUGINS:
        data=json.loads((ROOT/"examples"/name/"manifest.json").read_text())
        assert data["manifest_version"]==1 and data["version"].count(".")==2
        assert data["entrypoint"]=="plugin:main"
        assert len(data["integrity"]["sha256"])==64
        assert data["integrity"]["key_id"] in {"official-example-2026","official-example-2026-additional"}
        assert data["integrity"]["signature"]
        ids.append(data["plugin_id"])
    assert len(ids)==len(set(ids))

def test_plugins_do_not_import_application_source():
    for name in PLUGINS:
        source=(ROOT/"examples"/name/"plugin.py").read_text()
        assert "src.plugin_api" not in source and "ValidationGateway" not in source
