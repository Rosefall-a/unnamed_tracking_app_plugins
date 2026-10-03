from __future__ import annotations

import json
import time

from sdk.plugin_protocol import request


DEFAULT_QUERY = "Example Game"


def search(values: dict) -> dict:
    user_id = (values.get("_plugin_context") or {}).get("user_id")
    if not user_id:
        raise ValueError("An authenticated action context is required.")
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
        {"key": f"users/{user_id}/latest-search", "value": json.dumps({"query": query, "results": curated}, sort_keys=True)},
    )
    return {"query": query, "result_count": len(curated), "results": curated}


def main() -> None:
    request("lifecycle.ready", "lifecycle.ready", {})
    while True:
        time.sleep(3600)


if __name__ == "__main__":
    main()
