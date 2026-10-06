from __future__ import annotations

import time

from sdk.plugin_protocol import request


def library_glance(values: dict) -> dict:
    """Read only the authenticated user's public library representation."""
    context = values.get("_plugin_context") or {}
    if not isinstance(context, dict) or not context.get("user_id"):
        raise ValueError("An authenticated widget action context is required.")
    result = request("games.list", "games.read", {"limit": 8})
    return {"games": [
        {"id": str(game["id"]), "title": str(game["title"])}
        for game in result.get("games", [])
    ]}


def main() -> None:
    request("lifecycle.ready", "lifecycle.ready", {})
    while True:
        time.sleep(3600)


if __name__ == "__main__":
    main()
