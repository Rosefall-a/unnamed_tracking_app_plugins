# Scoped Document Viewer

This reference plugin demonstrates a standalone sidebar page backed only by Plugin API v1's `documents.read` capability. It lists opaque document DTOs for the active user and opens host-approved PDF or UTF-8 plain-text representations.

The host performs ownership checks, path confinement, MIME validation, UTF-8 validation, active-content rejection, and the 5 MiB limit. The plugin never receives a filesystem path and renders text with `textContent`, never as HTML.

Permission requested:

- `documents.read`: list and read supported documents belonging to the signed-in user's games.
- `backend.routes.plugin`: expose the same operations below `/api/plugins/example.scoped-document-viewer/documents` without claiming a global host URL.

The route handlers receive only the host-normalized authenticated request envelope and then call `documents.list` or `documents.read`. The gateway applies the current route caller's user ID, so an opaque document ID from another account is still rejected at the domain boundary. The plugin imports only `sdk.plugin_protocol`; it has no database, filesystem, FastAPI, or host-source dependency.

Build all packages with `python tools/build_packages.py`. Local builds are intentionally unsigned and require the host's untrusted-package confirmation; release CI supplies the reviewed signing identity. Requires the host Plugin API v1 domain capabilities and mediated action support introduced by the Phase 2 plugin-manager work.
