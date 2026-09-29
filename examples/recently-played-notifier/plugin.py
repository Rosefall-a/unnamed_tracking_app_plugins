from __future__ import annotations

import json
from datetime import datetime, timezone

from sdk.plugin_protocol import request


def _timestamp(game: dict) -> str:
    value = game.get("last_played") or game.get("last_played_at") or ""
    return str(value)


def main() -> None:
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
            "key": "last-run",
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

    request(
        "lifecycle.ready",
        "notifications.send",
        {"state": "ready", "notified": bool(names), "count": len(names)},
    )


if __name__ == "__main__":
    main()
