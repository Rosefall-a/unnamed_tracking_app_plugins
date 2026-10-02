from __future__ import annotations

import json
import time
from datetime import datetime, timezone

from sdk.plugin_protocol import request


def _timestamp(game: dict) -> str:
    value = game.get("last_played") or game.get("last_played_at") or ""
    return str(value)


def run(values: dict) -> dict:
    user_id = (values.get("_plugin_context") or {}).get("user_id")
    if not user_id:
        raise ValueError("An authenticated action context is required.")
    result = request("games.list", "games.read", {"limit": 100})
    games = list(result.get("games", result.get("items", [])))
    games.sort(key=_timestamp, reverse=True)

    recent = games[:5]
    names = [str(game.get("name") or game.get("title") or "Unknown game") for game in recent]
    stamp = datetime.now(timezone.utc).isoformat()

    request(
        "storage.put",
        "plugin.storage",
        {
            "key": f"users/{user_id}/last-run",
            "value": json.dumps({"ran_at": stamp, "games": names}, sort_keys=True),
        },
    )

    if names:
        request(
            "notifications.send",
            "notifications.send",
            {
                "title": "Recently played",
                "body": "Latest library activity: " + ", ".join(names),
            },
        )

    return {"notified": bool(names), "count": len(names), "games": names}


def main() -> None:
    request("lifecycle.ready", "lifecycle.ready", {})
    while True:
        time.sleep(3600)


if __name__ == "__main__":
    main()
