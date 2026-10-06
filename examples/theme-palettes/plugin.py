"""Declarative palettes use only the public lifecycle protocol."""
import time
from sdk.plugin_protocol import request


def main() -> None:
    request("lifecycle.ready", "lifecycle.ready", {})
    while True:
        time.sleep(3600)


if __name__ == "__main__":
    main()
