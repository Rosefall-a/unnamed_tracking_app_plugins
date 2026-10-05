from __future__ import annotations

import json

from test_domain_plugins import ROOT, load_plugin


def test_help_contributions_and_minimal_permissions():
    root = ROOT / "examples/help-button"
    manifest = json.loads((root / "manifest.json").read_text(encoding="utf-8"))
    ui = json.loads((root / "ui.json").read_text(encoding="utf-8"))
    capabilities = {item["name"] for item in manifest["capabilities"]}
    assert capabilities == {
        "frontend.navigation.main",
        "frontend.navigation.settings",
        "frontend.settings",
        "frontend.placement.settings.preferences",
        "frontend.overlay",
        "frontend.dialog",
        "frontend.context.game",
        "frontend.page.extend",
        "frontend.routes",
        "frontend.native",
        "plugin.settings",
        "plugin.storage",
        "events.subscribe",
        "notifications.send",
    }
    assert {
        item["capability"]["name"] for item in manifest["permissions"]
    } == capabilities
    assert ui["routes"][0]["path"] == "showcase"
    assert ui["settings_sections"][0]["page_id"] == "help"
    assert ui["dialog_contributions"][0]["dialog_id"] in {
        x["id"] for x in ui["dialogs"]
    }
    for key in ("settings", "actions", "pages", "menus"):
        assert set(manifest["ui"][key]) == {x["id"] for x in ui[key]}
    assert manifest["dependencies"] == []
    assert manifest["native_frontend"]["entry"] == "native/app.js"


def test_help_state_is_scoped_to_authenticated_context(monkeypatch):
    plugin = load_plugin("help-button")
    calls = []
    state = {}

    def gateway(method, capability, payload):
        calls.append((method, capability, payload))
        if method == "storage.put":
            state[payload["key"]] = payload["value"]
        if method == "settings.get":
            return {"value": "Custom demo greeting"}
        return {"value": state.get(payload.get("key"))}

    monkeypatch.setattr(plugin, "request", gateway)
    plugin.remember(
        {"_plugin_context": {"user_id": "user-a", "kind": "game", "resource_id": "g"}}
    )
    assert (
        plugin.inspect_state({"_plugin_context": {"user_id": "user-a"}})["visit"][
            "kind"
        ]
        == "game"
    )
    assert (
        plugin.inspect_state({"_plugin_context": {"user_id": "user-b"}})["visit"]
        is None
    )
    assert calls[-1][:2] == ("settings.get", "plugin.settings")
    assert all("resource_id" not in value for value in state.values())


def test_help_notification_events_and_external_navigation(monkeypatch):
    plugin = load_plugin("help-button")
    calls = []

    def gateway(method, capability, payload):
        calls.append((method, capability, payload))
        return {
            "events": [{"event_type": "game.updated", "payload": {"private": "title"}}]
        }

    monkeypatch.setattr(plugin, "request", gateway)
    assert plugin.activity({}) == {"event_types": ["game.updated"]}
    plugin.notify({})
    assert calls[1][:2] == ("notifications.send", "notifications.send")
    assert plugin.rickroll({}) == {"redirect_url": plugin.RICKROLL_URL}


def test_help_gateway_denial_propagates(monkeypatch):
    import pytest

    plugin = load_plugin("help-button")

    def denied(*args):
        raise RuntimeError("permission denied")

    monkeypatch.setattr(plugin, "request", denied)
    with pytest.raises(RuntimeError, match="permission denied"):
        plugin.notify({})
