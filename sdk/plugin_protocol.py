from __future__ import annotations
import json,sys
from typing import Any

def request(method: str, capability: str, payload: dict[str, Any]) -> dict[str, Any]:
    print(json.dumps({"api_version":"v1","method":method,"capability":capability,"payload":payload}), flush=True)
    line=sys.stdin.readline()
    if not line: raise RuntimeError("plugin gateway closed the connection")
    response=json.loads(line)
    if response.get("error"): raise RuntimeError(str(response["error"]))
    return dict(response.get("payload", {}))
