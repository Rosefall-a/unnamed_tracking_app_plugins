from __future__ import annotations
import time
from typing import Any

RICKROLL_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

def rickroll(values: dict[str, Any]) -> dict[str, str]:
    del values
    return {"redirect_url": RICKROLL_URL}

def main() -> None:
    while True:
        time.sleep(3600)

if __name__ == "__main__":
    main()
