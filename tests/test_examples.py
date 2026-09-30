import json
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).parents[1]
PLUGINS = (
    "ui-api",
    "scoped-document-viewer",
    "self-service-session-manager",
    "discord-delivery-provider",
    "playtime-report",
    "recently-played-notifier",
    "metadata-curator",
    "ui-playground",
)


def test_manifests_are_v1_and_unique():
    ids = []
    for name in PLUGINS:
        data = json.loads((ROOT / "examples" / name / "manifest.json").read_text())
        assert data["manifest_version"] == 1
        assert data["version"].count(".") == 2
        assert data["entrypoint"] == "plugin:main"
        assert len(data["integrity"]["sha256"]) == 64
        assert data["integrity"]["signature"] is not None or name in PLUGINS
        ids.append(data["plugin_id"])
    assert len(ids) == len(set(ids))


def test_plugins_do_not_import_application_source():
    for name in PLUGINS:
        source = (ROOT / "examples" / name / "plugin.py").read_text()
        assert "src.plugin_api" not in source and "ValidationGateway" not in source


def test_real_plugins_contain_application_logic():
    for name in (
        "playtime-report",
        "recently-played-notifier",
        "metadata-curator",
        "ui-playground",
    ):
        source = (ROOT / "examples" / name / "plugin.py").read_text()
        assert len(source.splitlines()) >= 30


def test_real_plugin_manifests_declare_required_capabilities():
    expected = {
        "playtime-report": {"games.read", "plugin.storage"},
        "recently-played-notifier": {
            "games.read",
            "notifications.send",
            "plugin.storage",
        },
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
    for name in (
        "playtime-report",
        "recently-played-notifier",
        "metadata-curator",
        "ui-playground",
    ):
        data = json.loads((ROOT / "examples" / name / "manifest.json").read_text())
        assert data["integrity"]["signature"] is None
        assert data["integrity"]["key_id"] is None


def test_ui_playground_manifest_points_to_real_frontend_entry():
    data = json.loads(
        (ROOT / "examples" / "ui-playground" / "manifest.json").read_text()
    )
    assert data["frontend"]["entry"] == "frontend/index.html"
    assert (ROOT / "examples" / "ui-playground" / "frontend" / "index.html").is_file()


def test_every_example_has_an_executable_entrypoint_source():
    for name in PLUGINS:
        manifest = json.loads((ROOT / "examples" / name / "manifest.json").read_text())
        module, function = manifest["entrypoint"].split(":")
        assert module == "plugin"
        assert function == "main"
        assert (ROOT / "examples" / name / "plugin.py").is_file()


def test_permissions_are_declared_capabilities():
    for name in PLUGINS:
        manifest = json.loads((ROOT / "examples" / name / "manifest.json").read_text())
        capabilities = {
            (item["name"], item["version"]) for item in manifest.get("capabilities", [])
        }
        for permission in manifest.get("permissions", []):
            capability = permission["capability"]
            assert (capability["name"], capability["version"]) in capabilities, (
                f"{name}: permission {capability['name']} is not declared as a capability"
            )


def test_ui_playground_has_every_required_runtime_capability():
    manifest = json.loads(
        (ROOT / "examples" / "ui-playground" / "manifest.json").read_text()
    )
    capability_names = {item["name"] for item in manifest["capabilities"]}
    assert {"notifications.send", "plugin.storage"} <= capability_names
    assert {
        item["capability"]["name"] for item in manifest["permissions"]
    } <= capability_names
    assert manifest["frontend"]["entry"] == "frontend/index.html"


def test_package_validator_rejects_undeclared_permission(tmp_path):
    package = tmp_path / "invalid.utp"
    manifest = {
        "manifest_version": 1,
        "plugin_id": "example.invalid",
        "name": "Invalid",
        "version": "1.0.0",
        "entrypoint": "plugin:main",
        "sdk_version_range": "^1.0.0",
        "application_version_range": "*",
        "capabilities": [{"name": "games.read", "version": 1}],
        "permissions": [
            {"capability": {"name": "plugin.storage", "version": 1}, "rationale": "bad"}
        ],
        "integrity": {"sha256": "0" * 64, "signature": None, "key_id": None},
    }
    with zipfile.ZipFile(package, "w") as archive:
        archive.writestr("manifest.json", json.dumps(manifest))
    import subprocess

    result = subprocess.run(
        [sys.executable, str(ROOT / "tools" / "validate_packages.py"), str(package)],
        capture_output=True,
        text=True,
    )
    assert result.returncode != 0
    assert "not declared by capabilities" in result.stderr
