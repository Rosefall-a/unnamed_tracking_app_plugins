from __future__ import annotations

import json
import sys
import time

CAPABILITY = "notifications.send"


def announce_page(values: dict) -> bool:
    webhook = str(values.get("discord_webhook", "")).strip()
    context = values.get("_plugin_context", {})
    page = context.get("page_title") or context.get("page_id") or "Unknown page"
    path = context.get("path") or "/"
    if not webhook:
        return False
    print(json.dumps({
        "discord_webhook": webhook,
        "content": f"Unnamed Tracking: a user is viewing **{page}** ({path}).",
    }), flush=True)
    return True


def main() -> None:
    # Long-lived so the manager can visibly show the running lifecycle state.
    while True:
        time.sleep(3600)


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "announce":
        raise SystemExit(0 if announce_page(json.load(sys.stdin)) else 1)
    main()
