from __future__ import annotations

import time
from sdk.plugin_protocol import request


def refresh(values: dict) -> dict:
    del values
    games = request("games.list", "games.read", {"limit": 50})
    settings = request("settings.get", "plugin.settings", {"key": "display_mode"})
    return {"games": games.get("games", games.get("items", [])), "display_mode": settings.get("value")}


def main() -> None:
    request("lifecycle.ready", "lifecycle.ready", {})
    while True:
        time.sleep(3600)


if __name__ == "__main__":
    main()
