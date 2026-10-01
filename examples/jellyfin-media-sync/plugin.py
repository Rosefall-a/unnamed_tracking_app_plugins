"""One supervised worker; HTTP, import and durable state stay at public boundaries."""

from __future__ import annotations

import json
import re
import time
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode, urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener
from uuid import uuid4

from sdk.plugin_protocol import request

PAGE_SIZE = 100
MAX_RESPONSE_BYTES = 4 * 1024 * 1024


class SyncError(ValueError):
    """Safe, actionable error; never contains response bodies, URLs or tokens."""


class NoRedirects(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise SyncError(
            "Jellyfin redirected the request. Configure its final server URL."
        )


def setting(key: str, default: Any = None) -> Any:
    value = request("settings.get", "plugin.settings", {"key": key}).get("value")
    return default if value is None else value


def load(key: str, default: Any = None) -> Any:
    raw = request("storage.get", "plugin.storage", {"key": key}).get("value")
    if raw is None:
        return default
    try:
        return json.loads(raw)
    except (TypeError, ValueError):
        raise SyncError(
            "Plugin state is damaged. Disable the plugin and restore its storage backup."
        ) from None


def store(key: str, value: Any) -> None:
    request("storage.put", "plugin.storage", {"key": key, "value": json.dumps(value)})


def server_url(value: Any) -> str:
    if not isinstance(value, str):
        raise SyncError("Configure a Jellyfin server URL.")
    try:
        parts = urlsplit(value.strip())
        _ = parts.port
    except ValueError:
        raise SyncError("The Jellyfin server port is invalid.") from None
    if (
        parts.scheme not in {"http", "https"}
        or not parts.hostname
        or parts.username
        or parts.password
        or parts.query
        or parts.fragment
        or any(c.isspace() for c in value)
        or '"' in value
        or "\\" in value
    ):
        raise SyncError(
            "Use an HTTP(S) server URL without credentials, query or fragment."
        )
    return value.strip().rstrip("/")


def configuration() -> dict[str, Any]:
    server = server_url(setting("server_url", ""))
    user = str(setting("user_id", "")).strip().replace("-", "")
    if not re.fullmatch(r"[a-fA-F0-9]{32}", user):
        raise SyncError("Use the Jellyfin user's 32-character ID, not a username.")
    interval = setting("sync_interval_minutes", 15)
    if (
        isinstance(interval, bool)
        or not isinstance(interval, (int, float))
        or not 5 <= interval <= 1440
    ):
        raise SyncError("The sync interval must be between 5 and 1440 minutes.")
    return {
        "server_url": server,
        "user_id": user.lower(),
        "sync_interval_minutes": interval,
        "background_sync": setting("background_sync", False) is True,
    }


def save_token(values: dict[str, Any]) -> dict[str, Any]:
    # Secret fields are sent only to this explicit action, never normal settings.
    config = configuration()
    token = values.get("api_key")
    if not isinstance(token, str) or not re.fullmatch(r"[A-Za-z0-9._-]{8,512}", token):
        return {"ok": False, "error": "Enter a valid Jellyfin API key or access token."}
    store(
        "secrets/api_key",
        {"token": token, "server": config["server_url"], "user": config["user_id"]},
    )
    return {"ok": True, "message": "Token saved. It will never be returned to the UI."}


def get_config(values: dict[str, Any]) -> dict[str, Any]:
    del values
    return {
        key: setting(key, default)
        for key, default in {
            "server_url": "",
            "user_id": "",
            "background_sync": False,
            "sync_interval_minutes": 15,
        }.items()
    }


def stored_token(config: dict[str, Any]) -> str:
    raw = request("storage.get", "plugin.storage", {"key": "secrets/api_key"}).get(
        "value"
    )
    if not raw:
        raise SyncError("Save a Jellyfin API key or access token first.")
    try:
        secret = json.loads(raw)
    except (TypeError, ValueError):
        raise SyncError(
            "Save a token again after upgrading to version 2; legacy tokens were not destination-bound."
        ) from None
    if not isinstance(secret, dict) or not secret.get("token"):
        raise SyncError("Save a Jellyfin API key or access token first.")
    if (
        secret.get("server") != config["server_url"]
        or secret.get("user") != config["user_id"]
    ):
        raise SyncError(
            "Server or user changed. Save a token again to authorize the new destination."
        )
    token = secret["token"]
    if not isinstance(token, str) or not re.fullmatch(r"[A-Za-z0-9._-]{8,512}", token):
        raise SyncError("The stored token is invalid. Save a replacement token.")
    return token


def jf(config: dict[str, Any], path: str, token: str) -> dict[str, Any]:
    # A live grant check precedes EVERY request; no hidden direct HTTP on denial.
    request("capabilities.check", "network.outbound", {})
    authorization = (
        'MediaBrowser Client="Unnamed Tracking Jellyfin Sync", Device="Plugin Runtime", '
        f'DeviceId="example.jellyfin-media-sync", Version="2.0.0", Token="{token}"'
    )
    req = Request(
        config["server_url"] + path,
        headers={"Accept": "application/json", "Authorization": authorization},
    )
    try:
        with build_opener(NoRedirects()).open(req, timeout=15) as response:
            data = response.read(MAX_RESPONSE_BYTES + 1)
    except HTTPError as exc:
        if exc.code in {401, 403}:
            raise SyncError(
                "Jellyfin rejected the token. Check its access and save a replacement token."
            ) from None
        if exc.code == 429:
            raise SyncError(
                "Jellyfin rate limited this sync. Retry after the configured interval."
            ) from None
        raise SyncError(
            f"Jellyfin returned HTTP {exc.code}. Check the server and user ID."
        ) from None
    except (URLError, OSError, TimeoutError):
        raise SyncError(
            "Cannot reach Jellyfin. Check the server, TLS and runtime egress; the default sandbox needs a generic HTTP broker."
        ) from None
    if len(data) > MAX_RESPONSE_BYTES:
        raise SyncError("Jellyfin response exceeded the 4 MiB page limit.")
    try:
        result = json.loads(data)
    except (ValueError, UnicodeDecodeError):
        raise SyncError(
            "Jellyfin returned invalid JSON. Check the server URL."
        ) from None
    if not isinstance(result, dict):
        raise SyncError("Jellyfin returned an unexpected response.")
    return result


def normalize(item: dict[str, Any], server: str) -> dict[str, Any] | None:
    external_id, title = item.get("Id"), item.get("Name")
    if (
        not isinstance(external_id, str)
        or not external_id
        or not isinstance(title, str)
        or not title.strip()
    ):
        return None
    # Older Jellyfin-compatible fixtures may omit Type; GetItems Movie payloads\n    # are treated as movies for backwards compatibility.\n    item_type = item.get("Type", "Movie")
    if item_type not in {"Movie", "Series"}:
        return None
    genres = item.get("Genres")
    genres = genres if isinstance(genres, list) else []
    tags = item.get("Tags")
    tags = tags if isinstance(tags, list) else []
    anime_markers = {str(x).strip().casefold() for x in (*genres, *tags) if isinstance(x, str)}
    is_anime = "anime" in anime_markers or any("anime" in x for x in anime_markers)
    media_type = "anime" if is_anime else ("tv_show" if item_type == "Series" else "movie")
    ticks = item.get("RunTimeTicks")
    ticks = (
        ticks
        if isinstance(ticks, int) and not isinstance(ticks, bool) and ticks >= 0
        else 0
    )
    user_data = item.get("UserData") or {}
    if not isinstance(user_data, dict):
        user_data = {}
    count = user_data.get("PlayCount", 0)
    images = item.get("ImageTags")
    images = images if isinstance(images, dict) else {}
    return {
        "external_id": external_id,
        "media_type": media_type,
        "title": title.strip()[:500],
        "runtime_minutes": round(ticks / 600000000) if ticks else None,
        "release_year": item.get("ProductionYear"),
        "genres": [x[:128] for x in genres if isinstance(x, str)][:50],
        # No credential-bearing artwork URL is ever persisted in host media.
        "poster_url": server
        + "/Items/"
        + quote(external_id, safe="")
        + "/Images/Primary"
        if images.get("Primary")
        else None,
        "played": user_data.get("Played") is True,
        "play_count": count
        if isinstance(count, int) and not isinstance(count, bool) and count >= 0
        else 0,
        "last_played_at": user_data.get("LastPlayedDate"),
    }


def status(values: dict[str, Any]) -> dict[str, Any]:
    del values
    # An explicit allowlist prevents future state fields leaking secrets.
    state = load("sync/state.json", {})
    return {
        key: state[key]
        for key in (
            "phase",
            "processed",
            "total",
            "skipped",
            "started_at",
            "finished_at",
            "error",
            "retry_at",
        )
        if key in state
    }


def sync_now(values: dict[str, Any]) -> dict[str, Any]:
    del values
    request("capabilities.check", "tasks.background", {})
    # Unique immutable request keys avoid racing the worker's state writes.
    store("sync/requests/" + str(uuid4()), {"requested_at": int(time.time())})
    return {
        "queued": True,
        "message": "Queued for the enabling user's media library. Progress updates on this page.",
    }


def list_media(values: dict[str, Any]) -> dict[str, Any]:
    del values
    return request("media.list", "media.read", {"limit": 100})


def refresh_status(values: dict[str, Any]) -> dict[str, Any]:
    del values
    cursor = load("sync/event-cursor.json", 0)
    result = request("events.poll", "events.subscribe", {"since": cursor, "limit": 50})
    store("sync/event-cursor.json", result.get("cursor", cursor))
    return {
        "event_count": len(result.get("events", [])),
        "cursor": result.get("cursor", cursor),
    }


def sync_library() -> dict[str, Any]:
    request("capabilities.check", "tasks.background", {})
    config = configuration()
    token = stored_token(config)
    state = {
        "phase": "syncing",
        "processed": 0,
        "total": 0,
        "skipped": 0,
        "started_at": int(time.time()),
    }
    store("sync/state.json", state)
    offset = 0
    while True:
        query = urlencode(
            {
                "UserId": config["user_id"],
                "Recursive": "true",
                "IncludeItemTypes": "Movie,Series",
                "EnableUserData": "true",
                "Fields": "Genres,ProviderIds,Tags,DateCreated",
                "SortBy": "SortName",
                "SortOrder": "Ascending",
                "StartIndex": offset,
                "Limit": PAGE_SIZE,
            }
        )
        page = jf(config, "/Items?" + query, token)
        items = page.get("Items")
        total = page.get("TotalRecordCount")
        if (
            not isinstance(items, list)
            or len(items) > PAGE_SIZE
            or isinstance(total, bool)
            or not isinstance(total, int)
            or total < 0
        ):
            raise SyncError("Jellyfin returned invalid page metadata.")
        state["total"] = total
        # Re-importing is intentional: current watched state can change remotely.
        normalized = []
        for item in items:
            movie = (
                normalize(item, config["server_url"])
                if isinstance(item, dict)
                else None
            )
            if movie is None:
                state["skipped"] += 1
            else:
                normalized.append(movie)
        if normalized:
            # Send the source type with every item so the host can preserve the
            # Jellyfin distinction between films, TV shows and anime. Older host
            # media.import implementations may ignore the extra field, but the
            # plugin never collapses the Jellyfin catalogue before import.
            request("media.import", "media.write", {"items": normalized})
        offset += len(items)
        state["processed"] = offset
        store("sync/state.json", state)
        if offset >= total:
            break
        if not items:
            raise SyncError(
                "Jellyfin pagination stopped before all items were returned. Retry the sync."
            )
        time.sleep(0.1)
    state.update(phase="complete", finished_at=int(time.time()))
    store("sync/state.json", state)
    store("last_sync.json", {"timestamp": state["finished_at"], "count": offset})
    return state


def worker_tick() -> int:
    request("capabilities.check", "tasks.background", {})
    keys = request("storage.keys", "plugin.storage", {"prefix": "sync/requests/"}).get(
        "keys", []
    )
    state = load("sync/state.json", {})
    now = int(time.time())
    interval = 15 * 60
    try:
        config = configuration()
        interval = config["sync_interval_minutes"] * 60
        due = config["background_sync"] and now >= state.get(
            "retry_at", state.get("finished_at", 0) + interval
        )
        if not keys and not due:
            return 5
        sync_library()
        refresh_status({})
    except (RuntimeError, OSError, ValueError, TypeError) as exc:
        # Gateway exceptions can contain arbitrary details: only SyncError is safe.
        error = (
            str(exc)
            if isinstance(exc, SyncError)
            else "A plugin permission or gateway operation failed. Review grants and runtime diagnostics."
        )
        state = load("sync/state.json", {})
        state.update(
            phase="error", error=error, finished_at=now, retry_at=now + interval
        )
        store("sync/state.json", state)
    finally:
        # Requests arriving during the sync survive for the next worker tick.
        for key in keys:
            request("storage.delete", "plugin.storage", {"key": key})
    return 5


def main() -> None:
    request("lifecycle.ready", "lifecycle.ready", {})
    # Readiness precedes capability requests, which are forbidden while starting.
    time.sleep(1)
    while True:
        try:
            delay = worker_tick()
        except (RuntimeError, OSError, ValueError, TypeError):
            # Configuration/grants may be absent while the admin is setting up.
            delay = 30
        time.sleep(delay)


if __name__ == "__main__":
    main()
