"""The maintained Home demo uses only scoped public data and explicit UI grants."""
from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).parents[1]
sys.path.insert(0, str(ROOT))
SOURCE = ROOT / "examples/home-widgets"


def plugin():
    spec = importlib.util.spec_from_file_location("home_widget_demo", SOURCE / "plugin.py")
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_library_widget_requires_authoritative_authenticated_context():
    module = plugin()
    for values in ({}, {"_plugin_context": {}}, {"_plugin_context": "forged"}):
        with pytest.raises(ValueError, match="authenticated"):
            module.library_glance(values)


def test_library_widget_uses_the_public_gateway_and_returns_only_public_fields(monkeypatch):
    module = plugin()
    calls = []

    def request(method, capability, payload):
        calls.append((method, capability, payload))
        return {"games": [{"id": "game-id", "title": "Example game", "private": "not exposed"}]}

    monkeypatch.setattr(module, "request", request)
    assert module.library_glance({"_plugin_context": {"user_id": "member"}}) == {
        "games": [{"id": "game-id", "title": "Example game"}]
    }
    assert calls == [("games.list", "games.read", {"limit": 8})]


def test_widget_source_declarations_are_explicit_and_mobile_options_are_personal():
    manifest = json.loads((SOURCE / "manifest.json").read_text(encoding="utf-8"))
    document = json.loads((SOURCE / "ui.json").read_text(encoding="utf-8"))
    assert manifest["api_contract_version"] == document["api_contract_version"] == "1.1.0"
    assert {item["name"] for item in manifest["capabilities"]} == {
        "games.read", "frontend.home.widgets", "frontend.native"
    }
    assert {item["capability"]["name"] for item in manifest["permissions"]} == {
        "games.read", "frontend.home.widgets", "frontend.native"
    }
    assert len(document["home_widgets"]) == 2
    glance, media = document["home_widgets"]
    assert glance["mobile_page_id"] != glance["page_id"]
    assert glance["configuration"][0]["id"] == "limit"
    assert media["page_id"] == "embedded-media"
    assert manifest["ui"]["settings"] == []
    assert manifest["integrity"]["signature"] is None
