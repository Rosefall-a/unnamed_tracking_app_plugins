# SDK and gateway calls

The bundled `sdk.plugin_protocol.request` helper writes newline-delimited JSON
to stdout and reads one response from stdin. Each request has `api_version: v1`,
`method`, `capability` and object `payload`. Errors raise `RuntimeError`.

```python
from sdk.plugin_protocol import request

def refresh(values: dict) -> dict:
    del values
    result = request("games.list", "games.read", {"limit": 50})
    return {"games": result.get("games", result.get("items", []))}
```

## Add a gateway operation

1. Start with a documented operation demonstrated by an existing plugin.
2. Declare its capability and permission at the exact supported version.
3. Validate caller input before requesting work; set bounded limits.
4. Normalize only the fields your logic needs. Keep host data DTOs separate from
   your stored format.
5. Test a successful reply, missing/invalid fields, gateway closure and denial.

The host injects `_plugin_context` into actions; never accept browser-supplied user
or installation identity as authority. SDK requests do not bypass live grants.
`lifecycle.ready` is runtime-local and is not a manifest capability to invent.
The entrypoint stays alive; user-triggered behavior belongs in handlers.

`route_response` and `route_query_value` support the existing JSON route envelope;
see [routes](routes.md). Plugins import the SDK and standard library, never
`src.database`, `src.features` or host test fixtures. A missing public operation
must be solved at the host API boundary, not by copying its implementation here.
