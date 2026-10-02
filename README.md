# Unnamed Tracking official plugins

This repository contains official demo plugins and reference implementations for the Unnamed Tracking App Plugin API v1.

## Security warning

**Full API access allows plugins to read and modify all user data. Only enable this for plugins you trust.** Scoped capabilities should be preferred whenever possible.

## For users: getting and installing a plugin

1. Browse the plugins below and choose one that provides behavior you want to try.
2. Download its `.utp` package from Releases. Do not rename a source `.py` file into a `.utp`.
3. In Unnamed Tracking, open **Settings → Plugins → Install plugin**.
4. Select the `.utp` file.
5. Review its permissions, dependencies, publisher, and version.
6. Confirm installation and enable it.

The six **real demo plugins** provide useful application behavior. New development packages are explicitly **untrusted** `.utp` files for local testing; release builds require the configured publisher key:
- **Playtime Report** reads the game library, calculates statistics, and stores a report.
- **Recently Played Notifier** reads recent activity, formats a notification, and stores its last run.
- **Metadata Curator** reads a plugin setting, performs a metadata search, normalizes the result, and stores a snapshot.
- **Plugin UI Playground** demonstrates a real Vue 3 frontend, lifecycle state, private plugin storage, and Discord page announcements.
- **[Help Button capability showcase](examples/help-button/README.md)** demonstrates a global overlay, host dialog, local toast, notification, sidebar, native Settings, Home extension, game action, route, external navigation, settings, storage and events.
- **[Jellyfin Media Sync](examples/jellyfin-media-sync/README.md)** demonstrates write-only destination-bound tokens, paginated HTTP, supervised queued work, movie imports, event polling, persistent progress and native configuration. Its README identifies the generic HTTP-broker, import-identity/playback and background-identity contracts still needed by the host.

Three security-focused reference plugins exercise scoped domain APIs without importing host code: a document viewer, a self-service session manager, and an external Discord delivery provider. `example.ui-api` remains the smallest declarative UI/gateway example. Historical packages, including older lifecycle/events/advanced examples, remain immutable in `dist/` and their generated release histories. The catalogue advertises the ten currently maintained source plugins.

## Official examples

| Plugin | Type | What it demonstrates |
| --- | --- | --- |
| `example.playtime-report` | Real demo | Game-library statistics, persistent storage, native UI |
| `example.recently-played-notifier` | Real demo | Game data + notifications + persistent state |
| `example.metadata-curator` | Real demo | Settings + metadata search + result normalization |
| `example.ui-playground` | Real demo | Vue 3 frontend + private storage + Discord page announcements |
| `example.ui-api` | Reference | Declarative UI and gateway requests |
| `example.help-button` | Showcase | Labelled native capability cards and first-class host contributions |
| `example.jellyfin-media-sync` | Integration | Native configuration, secrets, supervised movie sync and progress |
| `example.scoped-document-viewer` | Official feature example | PR #241 scoped game document viewer: game Docs links, original download, sandbox PDF, UTF-8 text, sanitized HTML/XHTML and Office/OpenDocument reading previews ([guide](examples/scoped-document-viewer/README.md), [behavior comparison](docs/scoped-document-viewer.md)) |
| `example.self-service-session-manager` | High-risk reference | PR #248 parity: native account/admin Settings, rich metadata/maps, scoped revocation, GeoIP configuration |
| `example.discord-delivery-provider` | Reference | Core-coordinated external delivery and write-only secrets |

### What makes a real demo plugin?

A real demo performs application-level work after receiving data from the host. It has logic, state transformation, and a visible or useful result. It does **not** implement the host's lifecycle, gateway, notification service, metadata service, or storage engine.

That distinction is deliberate: the application provides the plugin platform; plugins provide behavior on top of it.

## For developers

Read the complete [plugin author guide](docs/plugin-author-guide.md) and
[third-party catalogue specification](docs/catalogue-specification.md). They cover
independent repositories/catalogues, API v1, manifests, runtime, scoped data,
pages, signing, builds, SemVer, hashes, release history and release-specific
automatic-update policy.

Distribution is generated from real packages. Author runtime declarations in
`manifest.json`, and publisher/tags/icon/notes/update policy in `release.json`.
Every new package includes its README and generated `distribution.json`. Do not
hand-edit `list.json` or `releases/*.json`. Each catalogue release retains its own
manifest, docs, scopes, hashes and policy. Major version bumps default to
`automatic_update: false`; a later patch may permit updates again. The current
host `plugin-manager` accepts this additive v1 list, but does not yet expose its
extra history/README/tags or consume automatic-update policy; the guides document
that compatibility boundary explicitly.

A plugin declares its identity, compatibility range, capabilities, permissions, dependencies, UI contributions, storage quota, optional frontend bundle, and package integrity in `manifest.json`. Runtime access goes through the v1 gateway rather than direct database access, host filesystem access, or application internals.

Plugins may also declare authenticated JSON backend handlers. Normal handlers are mounted below `/api/plugins/<plugin-id>/...` with `backend.routes.plugin`; the host owns authentication, installation-scoped grants, lifecycle gating, conflicts, limits, and auditing. `backend.routes.host` is reserved for exceptional trusted plugins that need a direct `/api/...` route. The document viewer and session manager demonstrate the safe namespaced form while continuing to access user data only through scoped Plugin API methods.

### Plugin frontends

Help Button and Jellyfin use the explicit `native_frontend` contract with
`frontend.native`. Their bundled `native/` modules export `activate(context)` and
use supplied Vue/host APIs. CSS selectors are scoped to plugin classes and polling
timers have lifecycle cleanup. This privileged mode requires administrator review;
generated declarative UI remains available without the native grant. The package
builder includes and validates native entries/styles alongside iframe assets.

Plugins may ship a static `frontend/` bundle. The host serves that bundle inside a sandboxed iframe, so a plugin can ship a complete Vue/Vite application without being able to modify the host Vue application or access its DOM. The frontend communicates with the host through a small `postMessage` bridge for approved operations such as saving settings, storing secrets, and running declared plugin actions. Production plugins should bundle their frontend dependencies; the UI Playground uses a pinned Vue CDN dependency only to keep the example source small.

Use the real demos as templates:
- Start with **playtime-report** for a complete read → process → persist workflow.
- Use **recently-played-notifier** for a plugin that combines core data with a side effect.
- Use **metadata-curator** for configurable integration logic.
- Use **ui-api** when learning the declarative UI/gateway contract in isolation.
- Use **Scoped Document Viewer** for a sandboxed game Docs reader that calls a read-only domain API and scoped download bridge.
- Use **[Self-Service Session Manager](examples/self-service-session-manager/README.md)** for full native Settings integration, separate read/destructive grants, scoped admin APIs, maps, and GeoIP configuration. Its native browser permission is Critical and requires appropriate review.
- Use **External Discord Delivery Provider** for provider registration, write-only secrets, and core-owned delivery state.

For development/testing, run `pytest`, `python tools/build_packages.py`,
`python tools/distribution.py --root .validation --check-source`,
`python tools/verify_packages.py .validation/dist/*.utp`, and
`python tools/validate_packages.py .validation/dist/*.utp`. A development build
generates an isolated preview under `.validation/`, exercises all ten current
plugins and retains historical packages. New preview releases are unsigned by
default; unchanged published packages are reused byte for byte.

Main publication uses the existing `--require-signing` command with
`PLUGIN_SIGNING_KEY_B64` and `PLUGIN_SIGNING_KEY_ID` for an active scoped key in
`publishers/registry.json`. Changed source/docs/SDK/metadata receive an automatic
SemVer increment using Conventional Commits; unchanged packages are reused.
Publication writes `/dist`, release histories, `list.json` and resolved source
versions together, and fails if signing or validation fails. GitHub release
events retain the existing asset upload mechanism and include catalogue/history
metadata. Tag the generated main snapshot after publication succeeds. Never
commit a private key or overwrite an old release to correct it.

For key rotation, add and review the successor public key before it signs releases, retain the predecessor as `retiring` only for the approved overlap, then mark it `revoked`. A revoked key must not be used to produce a release. Publish the matching reviewed registry to the host deployment before switching release signing, and never alter historical release artifacts to simulate a rotation.

## Repository layout

- `examples/` — official demo and reference plugins
- `sdk/` — protocol helper used by plugins
- `publishers/` — publisher verification keys
- `tools/build_packages.py` — package builder
- `tests/` — plugin validation tests
- `dist/` — generated installable packages
- `releases/` — generated historical release snapshots
- `catalogue.json` — author-maintained display name and hosting base URL
- `list.json` — generated current catalogue and complete per-plugin histories
- `tools/schemas/` — exported public manifest/UI contracts


### Currently installable packages

All ten maintained plugins are built and validated in development CI. Download
the current package linked by `list.json` or from a published GitHub release.
Legacy distributions retain their original signatures/unsigned status; newly
published releases require a reviewed signer. Catalogue membership itself does
not establish host publisher trust or approve the requested permissions.
