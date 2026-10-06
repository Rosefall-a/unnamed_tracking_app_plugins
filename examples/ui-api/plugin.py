"""Small public gateway and host-managed schedule example."""

from __future__ import annotations

import time

from sdk.plugin_protocol import request


def refresh(values: dict) -> dict:
    """Read the invoking user's library and ordinary display preference."""
    del values
    games = request("games.list", "games.read", {"limit": 50})
    settings = request("settings.get", "plugin.settings", {"key": "display_mode"})
    return {
        "games": games.get("games", games.get("items", [])),
        "display_mode": settings.get("value"),
    }


def scheduled_summary(values: dict) -> dict:
    """Report a bounded summary for the existing background administrator's library."""
    del values
    games = request("games.list", "games.read", {"limit": 50})
    count = len(games.get("games", games.get("items", [])))
    return {
        "completed": True,
        "summary": f"Read {count} games from the background administrator's library.",
    }


def main() -> None:
    """Report readiness and keep the supervised worker available for declared actions."""
    request("lifecycle.ready", "lifecycle.ready", {})
    while True:
        time.sleep(3600)


if __name__ == "__main__":
    main()
