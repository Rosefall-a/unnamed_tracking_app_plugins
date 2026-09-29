import json
from pathlib import Path

ROOT = Path(__file__).parents[1]
PLUGINS = (
    "lifecycle", "events", "ui-api", "advanced", "notifications",
    "metadata", "events-filter", "playtime-report",
    "recently-played-notifier", "metadata-curator", "ui-playground",
)


def test_manifests_are_v1_and_unique():
    ids = []
    for name in PLUGINS:
        data = json.loads((ROOT / "examples" / name / "manifest.json").read_text())
        assert data["manifest_version"] == 1
        assert data["version"].count(".") == 2
        assert data["entrypoint"] == "plugin:main"
        assert len(data["integrity"]["sha256"]) == 64
        assert data["integrity"]["signature"]
        ids.append(data["plugin_id"])
    assert len(ids) == len(set(ids))


def test_plugins_do_not_import_application_source():
    for name in PLUGINS:
        source = (ROOT / "examples" / name / "plugin.py").read_text()
        assert "src.plugin_api" not in source and "ValidationGateway" not in source


def test_real_plugins_contain_application_logic():
    for name in ("playtime-report", "recently-played-notifier", "metadata-curator", "ui-playground"):
        source = (ROOT / "examples" / name / "plugin.py").read_text()
        assert len(source.splitlines()) >= 30


def test_real_plugin_manifests_declare_required_capabilities():
    expected = {
        "playtime-report": {"games.read", "plugin.storage"},
        "recently-played-notifier": {"games.read", "notifications.send", "plugin.storage"},
        "metadata-curator": {"games.read", "plugin.settings", "plugin.storage"},
        "ui-playground": {"notifications.send"},
    }
    for name, capabilities in expected.items():
        data = json.loads((ROOT / "examples" / name / "manifest.json").read_text())
        declared = {item["name"] for item in data["capabilities"]}
        granted = {item["capability"]["name"] for item in data["permissions"]}
        assert capabilities <= declared
        assert capabilities <= granted
