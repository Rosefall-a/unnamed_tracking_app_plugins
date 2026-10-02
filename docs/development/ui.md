# Plugin-owned pages and browser UI

Choose the smallest UI mode that supports your behavior:

| Mode | Source | Authority |
| --- | --- | --- |
| Declarative UI | `ui.json` sections, actions, tables, dialogs, pages | Host renders and filters declared contributions |
| Sandboxed bundle | `frontend/index.html` and local assets | Opaque iframe and approved bridge |
| Native frontend | `native/` module | Privileged host Vue/browser context; explicit review |

The [first-plugin tutorial](../getting-started/first-plugin.md) creates a real
declarative page. Pages refer to existing action/settings/table/dialog IDs;
`pages[].components` is not v1. Every action needs an executable `module:function`
handler. Keep manifest and UI IDs synchronized.

## Add a sandboxed frontend

Declare `frontend: {"entry": "frontend/index.html"}` and bundle local HTML/JS/CSS
dependencies. Use the existing `postMessage` bridge (`plugin.run-action`,
`plugin.save-settings`, `plugin.store-secret`) demonstrated by the shipped
frontends. Correlate responses, bound timeouts and handle denial/malformed replies.
The iframe does not receive arbitrary host DOM, cookie or database access.

Document Viewer demonstrates authenticated inline asset delivery with
`frontend.inline_assets: true`, contextual `document_id`/`game_id`, and
`plugin.download-document`. This uses the host's existing authorized inlining
and bridge; it does not weaken the opaque sandbox or grant arbitrary downloads.
The UI Playground's pinned Vue CDN is a teaching limitation; bundle dependencies
for independent production publication.

Test actual assets in a browser, including missing bridge replies, stale
responses, denied grants, unsupported content and disable/unmount cleanup.
[Screenshots](../assets/screenshots/index.md) distinguish component fixtures
from authenticated host workflow evidence.
