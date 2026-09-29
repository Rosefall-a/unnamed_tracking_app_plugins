import json
from pathlib import Path

ROOT = Path(__file__).parents[1]
PLUGINS = ("ui-api", "playtime-report", "recently-played-notifier", "metadata-curator", "ui-playground",)


def test_manifests_are_v1_and_unique():
    ids = []
    for name in PLUGINS:
        data = json.loads((ROOT / "examples" / name / "manifest.json").read_text())
        assert data["manifest_version"] == 1
        assert data["version"].count(".") == 2
        assert data["entrypoint"] == "plugin:main"
        assert len(data["integrity"]["sha256"]) == 64
        assert data["integrity"]["signature"] is not None or name in {"playtime-report", "recently-played-notifier", "metadata-curator", "ui-playground"}
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


def test_demo_manifests_do_not_claim_fake_signatures():
    for name in ("playtime-report", "recently-played-notifier", "metadata-curator", "ui-playground"):
        data = json.loads((ROOT / "examples" / name / "manifest.json").read_text())
        assert data["integrity"]["signature"] is None
        assert data["integrity"]["key_id"] is None


def test_ui_playground_manifest_points_to_real_frontend_entry():
    data = json.loads((ROOT / "examples" / "ui-playground" / "manifest.json").read_text())
    assert data["frontend"]["entry"] == "frontend/index.html"
    assert (ROOT / "examples" / "ui-playground" / "frontend" / "index.html").is_file()
