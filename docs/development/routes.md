# Navigation and routes

Plugin pages are declared UI surfaces; host navigation and backend routes are
separate contributions with their own grants.

## Add sidebar navigation

Add `frontend.navigation.main` v1 and its permission. Mark a declared page with
`"navigation": {"sidebar": true}`. Validate matching page IDs and test that the
host hides the contribution when the plugin is disabled or the grant is denied.
UI/API is the small working example. Help Button demonstrates additional
Settings/Home/game/overlay contributions and external navigation.

For plugin-provided browser routes, request `frontend.routes` and use the existing
UI schema's route declaration. Do not replace the host router. Host Settings
sections require `frontend.settings`; page replacement has separate scoped
high-impact grants, not an implicit extension privilege.

## Add an authenticated JSON handler

Document Viewer and Session Manager declare `backend_routes` in their manifests.
A relative path such as `documents/{document_id}` with `scope: plugin` mounts
below `/api/plugins/<plugin-id>/...`. Request `backend.routes.plugin` and the
domain capability used by the handler.

```python
from sdk.plugin_protocol import request, route_response, route_query_value

def list_documents_route(route_request: dict) -> dict:
    limit = route_query_value(route_request, "limit")
    result = request("documents.list", "documents.read", {"limit": min(int(limit or 32), 32)})
    return route_response(result)
```

Validate numeric inputs and use the examples' safe bounded errors before adopting
this sketch. The host supplies normalized query/path/context dictionaries and
owns authentication, lifecycle, live grants, conflict checks and output limits.
Admin handlers declare `authorization: admin`; caller-supplied user IDs never
replace host ownership checks. Return `{status_code, body}` rather than a host
framework response.

`backend.routes.host` is exceptional authority for direct `/api/...` routes.
Do not claim management paths or implement private authentication middleware.
