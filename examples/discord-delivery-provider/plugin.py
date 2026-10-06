"""Register a Discord provider while core retains delivery ownership."""

from __future__ import annotations

import os
import sys
import time
from pathlib import Path
from typing import Any
from urllib.parse import urlsplit

from sdk.plugin_protocol import GatewayRequestError, request

PLUGIN_ID = "example.discord-delivery-provider"
PROVIDER_ID = f"{PLUGIN_ID}.discord"


def _valid_delivery(value: Any) -> bool:
    return (
        isinstance(value, dict)
        and isinstance(value.get("notification_id"), str)
        and isinstance(value.get("title"), str)
        and isinstance(value.get("body"), str)
        and isinstance(value.get("event_at"), int)
    )


def deliver(values: dict[str, Any]) -> dict[str, Any]:
    """Return a bounded runtime-owned Discord delivery request."""
    delivery = values.get("delivery")
    if not _valid_delivery(delivery):
        return {"success": False, "retryable": False, "error": "Invalid delivery work."}
    assert isinstance(delivery, dict)
    title = str(delivery["title"]).strip()[:250]
    body = str(delivery["body"]).strip()[:1600]
    if not title or not body:
        return {"success": False, "retryable": False, "error": "Empty notification."}
    return {"discord": True, "content": f"**{title}**\n{body}"}


def check_configuration(_values: dict[str, Any]) -> dict[str, Any]:
    """Report configuration state without returning the secret."""
    root = Path(os.environ.get("PLUGIN_DATA_DIR", "/plugin-data"))
    secret = root / "secrets" / "discord_webhook"
    if not secret.is_file():
        return {"configured": False, "valid_destination": False}
    try:
        parts = urlsplit(secret.read_text(encoding="utf-8").strip())
    except OSError:
        return {"configured": False, "valid_destination": False}
    valid = (
        parts.scheme == "https"
        and parts.hostname in {"discord.com", "discordapp.com"}
        and parts.path.startswith("/api/webhooks/")
    )
    return {"configured": True, "valid_destination": valid}


def _register_provider() -> None:
    """Retry idempotent registration while the host callback becomes available."""
    delay = 1
    while True:
        try:
            request(
                "notification_providers.register",
                "notification_providers.register",
                {
                    "provider_id": PROVIDER_ID,
                    "name": "Discord (plugin)",
                    "action_id": "deliver",
                },
            )
            return
        except GatewayRequestError as exc:
            if exc.code != "unavailable":
                raise
            print(
                "Waiting for the host gateway before registering the Discord provider.",
                file=sys.stderr,
                flush=True,
            )
            time.sleep(delay)
            delay = min(delay * 2, 30)


def main() -> None:
    """Register the provider, then remain available for supervised delivery actions."""
    _register_provider()
    while True:
        time.sleep(3600)


if __name__ == "__main__":
    main()
