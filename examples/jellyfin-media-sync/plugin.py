from __future__ import annotations
import json
import time
from typing import Any
from urllib.parse import quote
from urllib.request import Request, urlopen
from sdk.plugin_protocol import request

def setting(key: str, default: str = "") -> str:
    value = request("settings.get", "plugin.settings", {"key": key}).get("value")
    return value if isinstance(value, str) else default

def secret(key: str) -> str:
    value = request("storage.get", "plugin.storage", {"key": "secrets/" + key}).get("value")
    return value if isinstance(value, str) else ""

def jf(server: str, path: str, token: str, method: str = "GET", body: bytes | None = None) -> Any:
    headers = {"Accept": "application/json", "X-Emby-Token": token}
    if body is not None:
        headers["Content-Type"] = "application/json"
    with urlopen(Request(server.rstrip("/") + path, data=body, headers=headers, method=method), timeout=20) as response:
        return json.loads(response.read().decode("utf-8"))

def auth(server: str, user: str, api_key: str, password: str) -> tuple[str, str]:
    if api_key:
        return api_key, user
    body = json.dumps({"Username": user, "Pw": password}).encode("utf-8")
    data = jf(server, "/Users/AuthenticateByName", "", "POST", body)
    return str(data["AccessToken"]), str(data["User"]["Id"])

def list_media(values: dict[str, Any]) -> dict[str, Any]:
    limit = values.get("limit", 100)
    if not isinstance(limit, int) or isinstance(limit, bool):
        limit = 100
    return request("media.list", "media.read", {"limit": max(1, min(limit, 100))})

def sync_now(values: dict[str, Any]) -> dict[str, Any]:
    del values
    server, user = setting("server_url").strip(), setting("user_id").strip()
    api_key, password = secret("api_key"), secret("password")
    if not server or not user or not (api_key or password):
        raise ValueError("Configure the Jellyfin server URL, user ID, and API key or password first.")
    token, resolved_user = auth(server, user, api_key, password)
    path = "/Users/" + quote(resolved_user) + "/Items?Recursive=true&IncludeItemTypes=Movie&Fields=RunTimeTicks,UserData,PrimaryImageAspectRatio,ProductionYear,Genres&Limit=200"
    data = jf(server, path, token)
    items = []
    for item in data.get("Items", []):
        user_data = item.get("UserData") or {}
        ticks = int(item.get("RunTimeTicks") or 0)
        items.append({
            "external_id": item.get("Id"),
            "title": item.get("Name") or "Untitled",
            "runtime_minutes": round(ticks / 10000000 / 60) if ticks else None,
            "release_year": item.get("ProductionYear"),
            "genres": item.get("Genres") or [],
            "poster_url": server.rstrip("/") + "/Items/" + str(item.get("Id")) + "/Images/Primary",
            "played": bool(user_data.get("Played")),
            "play_count": int(user_data.get("PlayCount") or 0),
            "last_played_at": user_data.get("LastPlayedDate")
        })
    result = request("media.import", "media.write", {"items": items})
    request("storage.put", "plugin.storage", {"key": "last_sync.json", "value": json.dumps({"timestamp": int(time.time()), "count": len(items)})})
    return result | {"synced": len(items)}

def refresh_status(values: dict[str, Any]) -> dict[str, Any]:
    del values
    raw = request("storage.get", "plugin.storage", {"key": "last_event_cursor"}).get("value")
    since = int(raw) if isinstance(raw, str) and raw.isdigit() else 0
    result = request("events.poll", "events.subscribe", {"limit": 50, "since": since})
    cursor = result.get("cursor")
    if isinstance(cursor, int):
        request("storage.put", "plugin.storage", {"key": "last_event_cursor", "value": str(cursor)})
    return result


def poll_events() -> None:
    try:
        refresh_status({})
    except Exception:
        pass

def main() -> None:
    request("lifecycle.ready", "lifecycle.ready", {})
    while True:
        try:
            if setting("background_sync", "false").lower() == "true":
                sync_now({})
            poll_events()
        except Exception as exc:
            try:
                request("storage.put", "plugin.storage", {"key": "last_error", "value": str(exc)[:1000]})
            except Exception:
                pass
        time.sleep(15 * 60)

if __name__ == "__main__":
    main()
