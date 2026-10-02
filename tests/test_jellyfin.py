from __future__ import annotations

import json
from urllib.parse import parse_qs, urlsplit
from uuid import uuid4

import pytest
from test_domain_plugins import load_plugin

USER = str(uuid4())
OTHER = str(uuid4())
JF_USER = "a" * 32
MOVIES, TV, ANIME = (c * 32 for c in "123")
FILM, SHOW, ANIME_SHOW = (c * 32 for c in "456")


def context(user=USER, admin=False):
    return {"_plugin_context": {"user_id": user, "is_admin": admin}}


@pytest.fixture
def service(monkeypatch):
    plugin = load_plugin("jellyfin-media-sync")
    state, calls, imported, subscriptions = {}, [], {}, set()
    denied = set()
    catalogue = {
        MOVIES: [
            {
                "Id": FILM,
                "Name": "A Film",
                "Type": "Movie",
                "Genres": ["Anime"],
                "UserData": {"Played": False, "PlaybackPositionTicks": 50},
            }
        ],
        TV: [
            {
                "Id": SHOW,
                "Name": "A Show",
                "Type": "Series",
                "UserData": {"Played": True},
            }
        ],
        ANIME: [{"Id": ANIME_SHOW, "Name": "An Anime", "Type": "Series"}],
    }
    episodes = {
        TV: [
            {
                "Id": "b" * 32,
                "SeriesId": SHOW,
                "ParentIndexNumber": 1,
                "IndexNumber": 1,
                "Name": "Pilot",
                "UserData": {"Played": True},
            },
            {
                "Id": "c" * 32,
                "SeriesId": SHOW,
                "ParentIndexNumber": 1,
                "IndexNumber": 2,
                "Name": "Second",
                "UserData": {"Played": False},
            },
        ],
        ANIME: [
            {
                "Id": "d" * 32,
                "SeriesId": ANIME_SHOW,
                "ParentIndexNumber": 1,
                "IndexNumber": 1,
                "UserData": {"Played": True},
            }
        ],
    }

    def gateway(method, capability, payload):
        calls.append((method, capability, payload))
        if capability in denied:
            raise RuntimeError("denied SECRET")
        key = payload.get("key")
        if method == "storage.get":
            return {"value": state.get(key)}
        if method == "storage.put":
            state[key] = payload["value"]
        if method == "storage.keys":
            return {"keys": [k for k in state if k.startswith(payload["prefix"])]}
        if method == "storage.delete":
            state.pop(key, None)
        if method == "tasks.subscribe":
            subscriptions.add(USER)
        if method == "tasks.unsubscribe":
            subscriptions.discard(USER)
        if method == "tasks.subscribers":
            users = sorted(subscriptions)
            return {
                "users": users[
                    payload["offset"] : payload["offset"] + payload["limit"]
                ],
                "total": len(users),
            }
        if method == "tasks.request":
            item = payload["payload"]
            identity = (payload["user_id"], item["source_scope"], item["external_id"])
            previous = imported.get(identity, {})
            if previous and previous["revision"] != item["expected_revision"]:
                return {
                    "id": previous["id"],
                    "conflict": "local_watch_state_changed",
                    "revision": previous["revision"],
                }
            result = {
                **previous,
                "id": previous.get("id", str(uuid4())),
                "revision": uuid4().hex * 2,
                "item": item,
            }
            imported[identity] = result
            return result
        if method == "network.request":
            url = urlsplit(payload["url"])
            if url.path.endswith("/System/Info"):
                data = {"Id": "server"}
            elif url.path.endswith("/Users"):
                data = [{"Id": JF_USER, "Name": "Alice"}]
            elif url.path.endswith("/Library/VirtualFolders"):
                data = [
                    {"ItemId": id, "Name": name}
                    for id, name in [(MOVIES, "Movies"), (TV, "TV"), (ANIME, "Anime")]
                ]
            else:
                query = parse_qs(url.query)
                library = query["ParentId"][0]
                source = (
                    episodes.get(library, [])
                    if query["IncludeItemTypes"] == ["Episode"]
                    else catalogue[library]
                )
                offset = int(query["StartIndex"][0])
                data = {
                    "Items": source[offset : offset + 100],
                    "TotalRecordCount": len(source),
                }
            return {"status": 200, "data": data}
        return {"authorized": True}

    monkeypatch.setattr(plugin, "request", gateway)
    admin = context(admin=True)
    plugin.save_master(
        {**admin, "server_url": "https://jf.example/base", "api_key": "SECRET-token"}
    )
    plugin.test_connection(admin)
    plugin.save_mappings(
        {**admin, "mappings": {MOVIES: "movie", TV: "tv_show", ANIME: "anime"}}
    )
    plugin.authorize_identity({**admin, "host_user_id": USER, "user_id": JF_USER})
    plugin.save_user({**context(), "user_id": JF_USER})
    return plugin, state, calls, imported, denied, catalogue, episodes


def sync(service):
    plugin = service[0]
    for _ in range(50):
        result = plugin.sync_library(USER)
        if result["phase"] == "complete":
            return result
    pytest.fail("sync did not finish")


def test_master_server_secret_and_user_isolation(service):
    plugin, state, _, _, _, _, _ = service
    assert (
        json.loads(state["secrets/master_token"])["server"] == "https://jf.example/base"
    )
    assert not any(
        k.startswith("secrets/") and k != "secrets/master_token" for k in state
    )
    assert "SECRET" not in json.dumps(plugin.get_config(context(admin=True)))
    assert "master" not in plugin.get_config(context(OTHER))
    with pytest.raises(plugin.SyncError, match="approve"):
        plugin.save_user({**context(OTHER), "user_id": JF_USER})
    for action in (
        plugin.save_master,
        plugin.save_token,
        plugin.save_mappings,
        plugin.test_connection,
        plugin.authorize_identity,
    ):
        with pytest.raises(plugin.SyncError, match="Administrator"):
            action(context())


def test_movies_tv_anime_identity_repeatability_and_partial_progress(service):
    result = sync(service)
    plugin, _, calls, imported, _, _, _ = service
    assert result["processed"] == 6
    assert len(imported) == 3
    items = {value["item"]["media_type"]: value["item"] for value in imported.values()}
    assert items["movie"]["played"] is False and items["movie"]["in_progress"] is True
    assert (
        items["tv_show"]["played"] is False
    )  # Series object Played never completes a show.
    assert items["anime"]["inventory_complete"] is True
    episode_calls = [
        p["payload"]
        for m, _, p in calls
        if m == "tasks.request" and p["payload"]["episodes"]
    ]
    assert any(p["episodes"][0]["watched"] is False for p in episode_calls)
    assert any(p["media_type"] == "anime" for p in episode_calls)
    ids = {k: v["id"] for k, v in imported.items()}
    calls.clear()
    sync(service)
    assert not any(m == "tasks.request" for m, _, _ in calls)
    assert ids == {k: v["id"] for k, v in imported.items()}
    movie_id = next(
        v["id"] for v in imported.values() if v["item"]["media_type"] == "movie"
    )
    watch = plugin.watch_now(
        {"_plugin_context": {"user_id": USER, "resource_id": movie_id}}
    )
    assert watch["url"] == "https://jf.example/base/web/index.html#!/details?id=" + FILM
    assert "SECRET" not in watch["url"]
    assert (
        plugin.watch_now(
            {"_plugin_context": {"user_id": OTHER, "resource_id": movie_id}}
        )["ok"]
        is False
    )
    assert (
        plugin.watch_now(
            {"_plugin_context": {"user_id": USER, "resource_id": str(uuid4())}}
        )["ok"]
        is False
    )


def test_changed_watched_renamed_deleted_and_conflict(service):
    sync(service)
    plugin, _, calls, imported, _, catalogue, episodes = service
    catalogue[MOVIES][0]["Name"] = "Renamed"
    catalogue[MOVIES][0]["UserData"]["Played"] = True
    episodes[TV][1]["UserData"]["Played"] = True
    sync(service)
    movie = next(v for v in imported.values() if v["item"]["media_type"] == "movie")
    assert movie["item"]["title"] == "Renamed" and movie["item"]["played"] is True
    assert len(imported) == 3
    movie["revision"] = "f" * 64  # A local edit must produce a visible conflict.
    catalogue[MOVIES][0]["UserData"]["Played"] = False
    assert sync(service)["conflicts"] >= 1
    assert movie["item"]["played"] is True
    catalogue[MOVIES] = []
    episodes[TV].pop()
    calls.clear()
    sync(service)
    assert any(
        p["payload"]["episodes"][0].get("removed")
        for m, _, p in calls
        if m == "tasks.request" and p["payload"]["episodes"]
    )
    assert (
        plugin.watch_now(
            {"_plugin_context": {"user_id": USER, "resource_id": movie["id"]}}
        )["ok"]
        is False
    )


def test_pagination_is_bounded_and_resumable(service):
    _, state, calls, imported, _, catalogue, _ = service
    catalogue[MOVIES] = [
        {"Id": f"{i:032x}", "Name": f"Movie {i}", "Type": "Movie"} for i in range(205)
    ]
    assert service[0].sync_library(USER)["phase"] == "syncing"
    assert any(k.endswith("/cursor") for k in state)
    sync(service)
    offsets = [
        parse_qs(urlsplit(p["url"]).query)["StartIndex"][0]
        for m, _, p in calls
        if m == "network.request"
        and "IncludeItemTypes=Movie" in p["url"]
        and "ParentId=" + MOVIES in p["url"]
    ]
    assert offsets == ["0", "100", "200"]
    assert len(imported) == 207


@pytest.mark.parametrize(
    "url",
    [
        "file:///tmp/x",
        "https://user:SECRET@host",
        "https://host?token=x",
        "https://host/#x",
        "https://host:invalid",
        "https://host\n/x",
    ],
)
def test_invalid_server(service, url):
    with pytest.raises(service[0].SyncError):
        service[0].save_master({**context(admin=True), "server_url": url})


def test_invalid_mapping_and_destination_bound_secret(service):
    plugin = service[0]
    with pytest.raises(plugin.SyncError):
        plugin.save_mappings({**context(admin=True), "mappings": {"bad": "anime"}})
    plugin.save_master({**context(admin=True), "server_url": "https://other.example"})
    with pytest.raises(plugin.SyncError, match="changed"):
        plugin.test_connection(context(admin=True))


def test_server_error_permission_denial_retry_and_redaction(service, monkeypatch):
    plugin, state, _, _, denied, _, _ = service
    plugin.sync_now(context())
    denied.add("network.outbound")
    plugin.worker_tick()
    status = plugin.status(context())
    assert status["phase"] == "error" and status["retry_at"] > status["finished_at"]
    assert "SECRET" not in json.dumps(status)
    denied.add("tasks.background")
    with pytest.raises(RuntimeError):
        plugin.sync_now(context())
    denied.clear()
    monkeypatch.setattr(plugin, "request", lambda *args: {"status": 503})
    with pytest.raises(plugin.SyncError, match="HTTP 503"):
        plugin.jf({"server_url": "https://example"}, "/Items", "SECRET-token")


def test_invalid_page_is_not_a_completed_census(service, monkeypatch):
    plugin = service[0]
    monkeypatch.setattr(
        plugin, "jf", lambda *args: {"Items": [], "TotalRecordCount": 1}
    )
    with pytest.raises(plugin.SyncError, match="pagination"):
        plugin.sync_library(USER)
    assert plugin.status(context())["phase"] != "complete"


def test_episode_playback_position_implies_partial_not_completed(service):
    _, _, calls, _, _, _, episodes = service
    for episode in episodes[TV]:
        episode["UserData"]["Played"] = False
    episodes[TV][1]["UserData"]["PlaybackPositionTicks"] = 100
    sync(service)
    writes = [
        p["payload"]
        for method, _, p in calls
        if method == "tasks.request" and p["payload"]["media_type"] == "tv_show"
    ]
    assert writes[-1]["in_progress"] is True
    assert all(
        not episode["watched"] for write in writes for episode in write["episodes"]
    )


def test_explicit_anime_mapping_beats_heuristics_and_auto_is_fallback(service):
    plugin = service[0]
    movie = {"Id": FILM, "Name": "Film", "Type": "Movie", "Genres": ["Anime"]}
    assert (
        plugin.normalize(movie, "https://jf.example", "movie")["media_type"] == "movie"
    )
    assert (
        plugin.normalize(movie, "https://jf.example", "anime")["media_type"] == "anime"
    )
    assert plugin.normalize(movie, "https://jf.example")["media_type"] == "anime"


def test_bad_episode_numbering_never_finalizes_complete_inventory(service):
    _, _, calls, _, _, _, episodes = service
    episodes[TV][1]["IndexNumber"] = None
    assert sync(service)["skipped"] == 1
    final = [
        p["payload"]
        for method, _, p in calls
        if method == "tasks.request" and p["payload"]["media_type"] == "tv_show"
    ][-1]
    assert final["inventory_complete"] is False


def test_explicit_resolution_retries_remote_state_without_touching_another_user(
    service,
):
    sync(service)
    plugin, _, _, imported, _, catalogue, _ = service
    movie = next(v for v in imported.values() if v["item"]["media_type"] == "movie")
    movie["revision"] = "f" * 64
    catalogue[MOVIES][0]["UserData"]["Played"] = True
    sync(service)
    assert (
        plugin.get_config(context())["reviews"][0]["reason"]
        == "local_watch_state_changed"
    )
    with pytest.raises(plugin.SyncError):
        plugin.resolve_conflict({**context(OTHER), "external_id": FILM})
    assert plugin.resolve_conflict({**context(), "external_id": FILM})["ok"]
    sync(service)
    assert (
        next(v for v in imported.values() if v["item"]["media_type"] == "movie")[
            "item"
        ]["played"]
        is True
    )
