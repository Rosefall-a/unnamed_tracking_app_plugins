from __future__ import annotations
import time
from typing import Any
from sdk.plugin_protocol import request

RICKROLL_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

def plugin_route() -> dict[str, str]:
    """Describe the plugin-owned page route used by the native host."""
    return {"path": "/plugins/example.help-button/help", "page_id": "help"}


def navigation_actions() -> list[dict[str, str]]:
    """Return the navigation actions this example intentionally exposes."""
    return [
        {"id": "help", "label": "Totally Not Helpful", "target": "help"},
        {"id": "rickroll", "label": "Press to get help", "target": "external"},
    ]


def global_extension() -> dict[str, str]:
    """Describe the global extension without touching the host DOM."""
    return {"slot": "app.global", "page_id": "help", "order": "900"}


def home_override() -> dict[str, str]:
    """Describe the Home Hub replacement contribution."""
    return {"slot": "home.replace", "page_id": "help", "order": "900"}


def rickroll(values: dict[str, Any]) -> dict[str, str]:
    """Return a host-validated external navigation result."""
    del values
    return {
        "redirect_url": RICKROLL_URL,
        "route": plugin_route()["path"],
        "action": navigation_actions()[1]["id"],
    }

def main() -> None:
    request("lifecycle.ready", "lifecycle.ready", {})
    while True:
        time.sleep(3600)

if __name__ == "__main__":
    main()
