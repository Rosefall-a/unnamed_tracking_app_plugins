import json
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).parents[1]
PLUGINS = (
    "scoped-document-viewer",
    "self-service-session-manager",
    "help-button",
    "jellyfin-media-sync",
)


def test_manifests_are_v1_and_unique():
    ids = []
    for name in PLUGINS:
        data = json.loads((ROOT / "examples" / name / "manifest.json").read_text(encoding="utf-8"))
        assert data["manifest_version"] == 1
        assert data["version"].count(".") == 2
        assert data["entrypoint"] == "plugin:main"
        assert len(data["integrity"]["sha256"]) == 64
        assert data["integrity"]["signature"] is not None or name in PLUGINS
        ids.append(data["plugin_id"])
    assert len(ids) == len(set(ids))


def test_plugins_do_not_import_application_source():
    for name in PLUGINS:
        source = (ROOT / "examples" / name / "plugin.py").read_text(encoding="utf-8")
        assert "src.plugin_api" not in source and "ValidationGateway" not in source


def test_real_plugin_manifests_declare_required_capabilities():
    expected = {
        "scoped-document-viewer": {"documents.read"},
        "self-service-session-manager": {
            "sessions.read", "sessions.revoke", "sessions.admin.read",
            "sessions.admin.revoke", "sessions.geoip.read", "sessions.geoip.configure",
            "backend.routes.plugin", "frontend.settings", "frontend.native",
        },
        "metadata-curator": {"games.read", "plugin.settings", "plugin.storage"},
        "ui-playground": {"notifications.send"},
        "help-button": set(),
        "jellyfin-media-sync": {"media.write", "plugin.storage", "tasks.background", "network.outbound", "frontend.context.media", "frontend.page.extend"},
    }
    for name, capabilities in expected.items():
        data = json.loads((ROOT / "examples" / name / "manifest.json").read_text(encoding="utf-8"))
        declared = {item["name"] for item in data["capabilities"]}
        granted = {item["capability"]["name"] for item in data["permissions"]}
        assert capabilities <= declared
        assert capabilities <= granted


def test_every_example_has_an_executable_entrypoint_source():
    for name in PLUGINS:
        manifest = json.loads((ROOT / "examples" / name / "manifest.json").read_text(encoding="utf-8"))
        module, function = manifest["entrypoint"].split(":")
        assert module == "plugin"
        assert function == "main"
        assert (ROOT / "examples" / name / "plugin.py").is_file()


def test_permissions_are_declared_capabilities():
    for name in PLUGINS:
        manifest = json.loads((ROOT / "examples" / name / "manifest.json").read_text(encoding="utf-8"))
        capabilities = {
            (item["name"], item["version"]) for item in manifest.get("capabilities", [])
        }
        for permission in manifest.get("permissions", []):
            capability = permission["capability"]
            assert (capability["name"], capability["version"]) in capabilities, (
                f"{name}: permission {capability['name']} is not declared as a capability"
            )


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


def test_help_button_declares_global_overlay_and_home_extension() -> None:
    data = json.loads((ROOT / "examples" / "help-button" / "ui.json").read_text(encoding="utf-8"))
    slots = {item["slot"] for item in data["extensions"]}
    assert slots == {"home.after-widgets"}
    assert data["overlays"] == [{"id": "floating-help", "page_id": "floating", "order": 900}]
    assert not data.get("page_replacements")
    action = next(item for item in data["actions"] if item["id"] == "rickroll")
    assert action["external_navigation"] is True


def test_jellyfin_declares_secret_storage_and_background_capabilities() -> None:
    manifest = json.loads((ROOT / "examples" / "jellyfin-media-sync" / "manifest.json").read_text(encoding="utf-8"))
    capabilities = {item["name"] for item in manifest["capabilities"]}
    assert {"media.write", "plugin.storage", "tasks.background", "network.outbound", "frontend.context.media"} <= capabilities
    ui = json.loads((ROOT / "examples" / "jellyfin-media-sync" / "ui.json").read_text(encoding="utf-8"))
    assert any(action["id"] == "watch-now" for action in ui["actions"])
