from __future__ import annotations

import json
import os
import time
from pathlib import Path

from sdk.plugin_protocol import request

CAPABILITY = "notifications.send"


def announce_page(values: dict) -> bool:
    context = values.get("_plugin_context", {})
    if isinstance(context, str):
        try:
            context = json.loads(context)
        except json.JSONDecodeError:
            context = {}
    page = context.get("page_title") or context.get("page_id") or "Unknown page"
    path = context.get("path") or "/"
    data_dir = Path(os.environ.get("PLUGIN_DATA_DIR", "/plugin-data"))
    secret_path = data_dir / "secrets" / "discord_webhook"
    try:
        webhook = secret_path.read_text(encoding="utf-8").strip()
    except OSError:
        webhook = ""
    if not webhook:
        return False
    # The webhook is only used as a private presence check in this demo.
    # Never echo the secret into the runtime response/log stream.
    print(json.dumps({
        "content": f"Unnamed Tracking: a user is viewing **{page}** ({path}).",
    }), flush=True)
    return True


def main() -> None:
    while True:
        time.sleep(3600)


if __name__ == "__main__":
    if len(os.sys.argv) > 1 and os.sys.argv[1] == "announce":
        raise SystemExit(0 if announce_page(json.load(os.sys.stdin)) else 1)
    main()
