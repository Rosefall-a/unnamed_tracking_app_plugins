"""v1.1-only frontend shortcut teaching example; no host implementation imports."""

import time

from sdk.plugin_protocol import request


def main() -> None:
    """Announce readiness while the host owns the frontend shortcut lifecycle."""
    request("lifecycle.ready", "lifecycle.ready", {})
    while True:
        time.sleep(3600)


if __name__ == "__main__":
    main()
