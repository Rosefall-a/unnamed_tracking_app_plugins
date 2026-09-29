from __future__ import annotations

import json

from sdk.plugin_protocol import request


DEFAULT_QUERY = "Example Game"


def main() -> None:
    settings = request("settings.get", "plugin.settings", {"key": "query"})
    query = str(settings.get("value") or DEFAULT_QUERY).strip() or DEFAULT_QUERY

    result = request(
        "games.metadata.search",
        "games.read",
        {"query": query, "limit": 10},
    )
    matches = list(result.get("results", result.get("games", result.get("items", []))))

    curated = [
        {
            "name": item.get("name") or item.get("title"),
            "id": item.get("id"),
            "source": item.get("source") or item.get("provider"),
        }
        for item in matches
    ]

    request(
        "storage.put",
        "plugin.storage",
        {"key": "latest-search", "value": json.dumps({"query": query, "results": curated}, sort_keys=True)},
    )
    request(
        "lifecycle.ready",
        "plugin.storage",
        {"state": "ready", "query": query, "result_count": len(curated)},
    )


if __name__ == "__main__":
    main()
