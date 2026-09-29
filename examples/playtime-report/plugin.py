from __future__ import annotations

from sdk.plugin_protocol import request


def _number(game: dict, *keys: str) -> float:
    for key in keys:
        value = game.get(key)
        try:
            if value is not None:
                return float(value)
        except (TypeError, ValueError):
            pass
    return 0.0


def main() -> None:
    result = request("games.list", "games.read", {"limit": 500})
    games = list(result.get("games", result.get("items", [])))

    total_minutes = sum(
        _number(game, "playtime_minutes", "total_playtime_minutes", "playtime")
        for game in games
    )
    ranked = sorted(
        games,
        key=lambda game: _number(game, "playtime_minutes", "total_playtime_minutes", "playtime"),
        reverse=True,
    )

    top_games = [
        {
            "name": str(game.get("name") or game.get("title") or "Unknown game"),
            "minutes": int(_number(game, "playtime_minutes", "total_playtime_minutes", "playtime")),
        }
        for game in ranked[:10]
    ]

    request(
        "storage.put",
        "plugin.storage",
        {
            "key": "latest-report",
            "value": __import__("json").dumps(
                {
                    "game_count": len(games),
                    "total_minutes": int(total_minutes),
                    "top_games": top_games,
                },
                sort_keys=True,
            ),
        },
    )
    request(
        "lifecycle.ready",
        "plugin.storage",
        {"state": "ready", "game_count": len(games), "total_minutes": int(total_minutes)},
    )


if __name__ == "__main__":
    main()
