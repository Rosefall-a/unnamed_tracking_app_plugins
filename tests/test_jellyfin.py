from __future__ import annotations

import json
from urllib.error import HTTPError
from urllib.parse import parse_qs, urlsplit

import pytest
from test_domain_plugins import ROOT, load_plugin


@pytest.fixture
def service(monkeypatch):
    plugin = load_plugin("jellyfin-media-sync")
    settings = {
        "server_url": "https://jellyfin.example/base",
        "user_id": "a" * 32,
        "background_sync": False,
        "sync_interval_minutes": 15,
    }
    state, calls = {}, []
    grants = {
        x["name"]
        for x in json.loads(
            (ROOT / "examples/jellyfin-media-sync/manifest.json").read_text()
        )["capabilities"]
    }

    def gateway(method, capability, payload):
        calls.append((method, capability, payload))
        if capability not in grants:
            raise RuntimeError("denied: SECRET-details")
        if method == "settings.get":
            return {"value": settings.get(payload["key"])}
        if method == "storage.get":
            return {"value": state.get(payload["key"])}
        if method == "storage.put":
            state[payload["key"]] = payload["value"]
        if method == "storage.keys":
            return {"keys": [x for x in state if x.startswith(payload["prefix"])]}
        if method == "storage.delete":
            state.pop(payload["key"], None)
        if method == "events.poll":
            return {"events": [], "cursor": 42}
        return {"authorized": True}

    monkeypatch.setattr(plugin, "request", gateway)
    monkeypatch.setattr(plugin.time, "sleep", lambda seconds: None)
    assert plugin.save_token({"api_key": "SECRET-token"})["ok"]
    return plugin, settings, state, calls, grants


def test_paginated_sync_imports_more_than_200_and_persists_progress(
    service, monkeypatch
):
    plugin, _, state, calls, _ = service
    offsets = []

    def page(config, path, token):
        offset = int(parse_qs(urlsplit(path).query)["StartIndex"][0])
        offsets.append(offset)
        assert token == "SECRET-token"
        return {
            "TotalRecordCount": 205,
            "Items": [
                {
                    "Id": str(i),
                    "Name": f"Movie {i}",
                    "RunTimeTicks": 6000000000,
                    "UserData": {"Played": True, "PlayCount": 2},
                    "Genres": ["Drama"],
                }
                for i in range(offset, min(offset + 100, 205))
            ],
        }

    monkeypatch.setattr(plugin, "jf", page)
    result = plugin.sync_library()
    assert offsets == [0, 100, 200]
    batches = [
        payload["items"] for method, _, payload in calls if method == "media.import"
    ]
    assert list(map(len, batches)) == [100, 100, 5]
    assert batches[0][0]["runtime_minutes"] == 10
    assert batches[0][0]["played"] is True
    assert batches[0][0]["play_count"] == 2
    assert result["phase"] == "complete" and result["processed"] == 205
    assert json.loads(state["last_sync.json"])["count"] == 205
    assert "SECRET" not in json.dumps(result)


def test_token_never_returned_and_destination_change_requires_new_token(service):
    plugin, settings, _, _, _ = service
    assert "SECRET" not in json.dumps(plugin.get_config({})) + json.dumps(
        plugin.status({})
    )
    settings["server_url"] = "https://other.example"
    with pytest.raises(plugin.SyncError, match="changed"):
        plugin.sync_library()


def test_legacy_token_upgrade_is_explicit_and_does_not_echo_secret(service):
    plugin, _, state, _, _ = service
    state["secrets/api_key"] = "SECRET-legacy"
    with pytest.raises(plugin.SyncError, match="upgrading") as error:
        plugin.sync_library()
    assert "SECRET" not in str(error.value)


def test_invalid_configuration_is_visible_in_worker_status(service):
    plugin, settings, _, _, _ = service
    settings["user_id"] = "username"
    plugin.worker_tick()
    assert plugin.status({})["phase"] == "error"
    assert "not a username" in plugin.status({})["error"]


@pytest.mark.parametrize(
    "url",
    [
        "file:///tmp/x",
        "https://user:SECRET@host",
        "https://host?token=SECRET",
        "https://host/#fragment",
        "https://host:invalid",
        "https://host\n/path",
    ],
)
def test_invalid_server_never_reaches_http(service, url):
    plugin, settings, _, _, _ = service
    settings["server_url"] = url
    with pytest.raises(plugin.SyncError):
        plugin.configuration()


def test_outbound_denial_happens_before_http(service, monkeypatch):
    plugin, _, _, _, grants = service
    grants.remove("network.outbound")

    def forbidden(*args):
        pytest.fail("HTTP must not be attempted after denied grant")

    monkeypatch.setattr(plugin, "build_opener", forbidden)
    with pytest.raises(RuntimeError, match="denied"):
        plugin.jf(plugin.configuration(), "/Items", "SECRET-token")


def test_http_uses_authorization_bounded_read_and_no_redirects(service, monkeypatch):
    plugin, _, _, calls, _ = service

    class Response:
        def __enter__(self):
            return self

        def __exit__(self, *args):
            pass

        def read(self, size):
            assert size == plugin.MAX_RESPONSE_BYTES + 1
            return b'{"Items": [], "TotalRecordCount": 0}'

    class Opener:
        def open(self, req, timeout):
            assert timeout == 15
            assert req.full_url == "https://jellyfin.example/base/Items"
            assert 'Token="SECRET-token"' in req.headers["Authorization"]
            return Response()

    monkeypatch.setattr(plugin, "build_opener", lambda handler: Opener())
    plugin.jf(plugin.configuration(), "/Items", "SECRET-token")
    assert calls[-1][:2] == ("capabilities.check", "network.outbound")
    with pytest.raises(plugin.SyncError, match="redirected"):
        plugin.NoRedirects().redirect_request(
            None, None, 302, "", {}, "https://evil.example"
        )


@pytest.mark.parametrize(
    "code,expected",
    [(401, "rejected"), (403, "rejected"), (429, "rate limited"), (500, "HTTP 500")],
)
def test_safe_http_errors(service, monkeypatch, code, expected):
    plugin, _, _, _, _ = service

    class Opener:
        def open(self, *args, **kwargs):
            raise HTTPError("https://SECRET.example", code, "SECRET", {}, None)

    monkeypatch.setattr(plugin, "build_opener", lambda handler: Opener())
    with pytest.raises(plugin.SyncError, match=expected) as exc:
        plugin.jf(plugin.configuration(), "/Items", "SECRET-token")
    assert "SECRET" not in str(exc.value)


def test_worker_queue_retry_cursor_and_denial_are_durable(service, monkeypatch):
    plugin, settings, state, calls, grants = service
    plugin.sync_now({})
    assert any(x.startswith("sync/requests/") for x in state)

    def failed():
        raise RuntimeError("SECRET-token")

    monkeypatch.setattr(plugin, "sync_library", failed)
    plugin.worker_tick()
    assert plugin.status({})["phase"] == "error"
    assert "SECRET" not in json.dumps(plugin.status({}))
    assert not any(x.startswith("sync/requests/") for x in state)
    settings["background_sync"] = True
    calls.clear()
    plugin.worker_tick()
    assert not any(method == "media.import" for method, _, _ in calls)
    plugin.refresh_status({})
    assert json.loads(state["sync/event-cursor.json"]) == 42
    grants.remove("tasks.background")
    with pytest.raises(RuntimeError, match="denied"):
        plugin.sync_now({})


def test_queue_arriving_during_sync_survives(service, monkeypatch):
    plugin, _, state, _, _ = service
    plugin.sync_now({})
    first = {x for x in state if x.startswith("sync/requests/")}

    def synced():
        plugin.sync_now({})
        return {}

    monkeypatch.setattr(plugin, "sync_library", synced)
    plugin.worker_tick()
    remaining = {x for x in state if x.startswith("sync/requests/")}
    assert len(remaining) == 1 and remaining.isdisjoint(first)


def test_invalid_page_and_incomplete_pagination_fail(service, monkeypatch):
    plugin, _, _, _, _ = service
    monkeypatch.setattr(
        plugin, "jf", lambda *args: {"Items": [], "TotalRecordCount": 1}
    )
    with pytest.raises(plugin.SyncError, match="pagination"):
        plugin.sync_library()
    monkeypatch.setattr(
        plugin, "jf", lambda *args: {"Items": {}, "TotalRecordCount": 0}
    )
    with pytest.raises(plugin.SyncError, match="metadata"):
        plugin.sync_library()


def test_skips_malformed_items_and_handles_nullable_metadata(service, monkeypatch):
    plugin, _, _, _, _ = service
    monkeypatch.setattr(
        plugin,
        "jf",
        lambda *args: {
            "TotalRecordCount": 2,
            "Items": [
                None,
                {
                    "Id": "1",
                    "Name": "A",
                    "Genres": None,
                    "ImageTags": None,
                    "RunTimeTicks": "bad",
                    "UserData": None,
                },
            ],
        },
    )
    result = plugin.sync_library()
    assert result["skipped"] == 1 and result["processed"] == 2
