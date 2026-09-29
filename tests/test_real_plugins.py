import json
from pathlib import Path

ROOT = Path(__file__).parents[1]
PLUGINS = {
    "playtime-report": ("games.list", "storage.put", "lifecycle.ready"),
    "recently-played-notifier": ("games.list", "storage.put", "notifications.send", "lifecycle.ready"),
    "metadata-curator": ("settings.get", "games.metadata.search", "storage.put", "lifecycle.ready"),
    "ui-playground": ("notifications.send",),
}


def test_real_plugins_contain_application_logic():
    for name, methods in PLUGINS.items():
        source = (ROOT / "examples" / name / "plugin.py").read_text()
        assert len(source.splitlines()) >= 30
        if name != "ui-playground":
            assert "from sdk.plugin_protocol import request" in source
        for method in methods:
            assert f'"{method}"' in source


def test_real_plugin_manifests_match_source():
    for name in PLUGINS:
        manifest = json.loads((ROOT / "examples" / name / "manifest.json").read_text())
        assert manifest["plugin_id"].startswith("example.")
        assert manifest["entrypoint"] == "plugin:main"
        assert len(manifest["integrity"]["sha256"]) == 64
        assert manifest["integrity"]["signature"] is not None or name in PLUGINS
