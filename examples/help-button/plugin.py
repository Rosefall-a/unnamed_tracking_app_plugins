"""Intentionally playful showcase; every host operation uses Plugin API v1."""

from __future__ import annotations

import json
import time
from typing import Any

from sdk.plugin_protocol import request

RICKROLL_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"


def rickroll(values: dict[str, Any]) -> dict[str, str]:
    del values
    return {"redirect_url": RICKROLL_URL}


def remember(values: dict[str, Any]) -> dict[str, Any]:
    context = values.get("_plugin_context") or {}
    user = context.get("user_id")
    if not user:
        raise ValueError("An authenticated action context is required.")
    request(
        "storage.put",
        "plugin.storage",
        {
            "key": f"visits/{user}.json",
            "value": json.dumps(
                {"visited_at": int(time.time()), "kind": context.get("kind", "page")}
            ),
        },
    )
    return {"message": "A very important demo visit has been remembered."}


def inspect_state(values: dict[str, Any]) -> dict[str, Any]:
    user = (values.get("_plugin_context") or {}).get("user_id")
    if not user:
        raise ValueError("An authenticated action context is required.")
    raw = request("storage.get", "plugin.storage", {"key": f"visits/{user}.json"}).get(
        "value"
    )
    greeting = request("settings.get", "plugin.settings", {"key": "greeting"}).get(
        "value"
    )
    return {
        "visit": json.loads(raw) if raw else None,
        "greeting": greeting or "Absolutely no useful advice here.",
    }


def notify(values: dict[str, Any]) -> dict[str, Any]:
    del values
    return request(
        "notifications.send",
        "notifications.send",
        {
            "title": "Help Button capability showcase",
            "body": "This is a real host notification from an intentionally unhelpful demo.",
        },
    )


def activity(values: dict[str, Any]) -> dict[str, Any]:
    del values
    result = request("events.poll", "events.subscribe", {"since": 0, "limit": 5})
    return {"event_types": [event["event_type"] for event in result.get("events", [])]}


def main() -> None:
    request("lifecycle.ready", "lifecycle.ready", {})
    while True:
        time.sleep(3600)


if __name__ == "__main__":
    main()
