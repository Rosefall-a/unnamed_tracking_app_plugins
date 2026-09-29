# Unnamed Tracking official plugins

This repository contains official demo plugins and reference implementations for the Unnamed Tracking App Plugin API v1.

## For users: getting and installing a plugin

1. Browse the plugins below and choose one that provides behavior you want to try.
2. Download its `.utp` package from Releases. Do not rename a source `.py` file into a `.utp`.
3. In Unnamed Tracking, open **Settings → Plugins → Install plugin**.
4. Select the `.utp` file.
5. Review its permissions, dependencies, publisher, and version.
6. Confirm installation and enable it.

The four **real demo plugins** are intentionally useful, end-to-end examples. Demo packages are buildable as explicitly **untrusted** `.utp` files for local testing; release builds can sign them with the configured publisher key:
- **Playtime Report** reads the game library, calculates statistics, and stores a report.
- **Recently Played Notifier** reads recent activity, formats a notification, and stores its last run.
- **Metadata Curator** reads a plugin setting, performs a metadata search, normalizes the result, and stores a snapshot.
- **Plugin UI Playground** demonstrates a real Vue 3 frontend, lifecycle state, private plugin storage, and Discord page announcements.

`example.ui-api` is the only small protocol/reference example retained. The older lifecycle/events/advanced/notifications/metadata/event-filter examples were removed because they duplicated platform internals rather than demonstrating useful plugin behavior.

## Official examples

| Plugin | Type | What it demonstrates |
| --- | --- | --- |
| `example.playtime-report` | Real demo | Game-library statistics, persistent storage, native UI |
| `example.recently-played-notifier` | Real demo | Game data + notifications + persistent state |
| `example.metadata-curator` | Real demo | Settings + metadata search + result normalization |
| `example.ui-playground` | Real demo | Vue 3 frontend + private storage + Discord page announcements |
| `example.ui-api` | Reference | Declarative UI and gateway requests |

### What makes a real demo plugin?

A real demo performs application-level work after receiving data from the host. It has logic, state transformation, and a visible or useful result. It does **not** implement the host's lifecycle, gateway, notification service, metadata service, or storage engine.

That distinction is deliberate: the application provides the plugin platform; plugins provide behavior on top of it.

## For developers

A plugin declares its identity, compatibility range, capabilities, permissions, dependencies, UI contributions, storage quota, optional frontend bundle, and package integrity in `manifest.json`. Runtime access goes through the v1 gateway rather than direct database access, host filesystem access, or application internals.

### Plugin frontends

Plugins may ship a static `frontend/` bundle. The host serves that bundle inside a sandboxed iframe, so a plugin can ship a complete Vue/Vite application without being able to modify the host Vue application or access its DOM. The frontend communicates with the host through a small `postMessage` bridge for approved operations such as saving settings, storing secrets, and running declared plugin actions. Production plugins should bundle their frontend dependencies; the UI Playground uses a pinned Vue CDN dependency only to keep the example source small.

Use the real demos as templates:
- Start with **playtime-report** for a complete read → process → persist workflow.
- Use **recently-played-notifier** for a plugin that combines core data with a side effect.
- Use **metadata-curator** for configurable integration logic.
- Use **ui-api** when learning the declarative UI/gateway contract in isolation.

For development/testing, run `pytest`, `python tools/build_packages.py`, and `python tools/verify_packages.py dist/*.utp`. Without a signing key, the builder preserves the checked-in signed `.utp` artifacts and does not regenerate them, because changing the SDK would invalidate their existing signatures. To build/re-sign the reference and demo plugins, provide `PLUGIN_SIGNING_KEY_B64` and `PLUGIN_SIGNING_KEY_ID` for an active key in `publishers/registry.json`. Never commit the private key. The registry binds every public key to its publisher, status, permitted plugin-ID prefixes and source file; release builds fail closed if the signer is missing, inactive, unregistered or outside scope.

For key rotation, add and review the successor public key before it signs releases, retain the predecessor as `retiring` only for the approved overlap, then mark it `revoked`. A revoked key must not be used to produce a release. Publish the matching reviewed registry to the host deployment before switching release signing, and never alter historical release artifacts to simulate a rotation.

## Repository layout

- `examples/` — official demo and reference plugins
- `sdk/` — protocol helper used by plugins
- `publishers/` — publisher verification keys
- `tools/build_packages.py` — package builder
- `tests/` — plugin validation tests
- `dist/` — generated installable packages


### Currently installable packages

The repository retains the signed `example.ui-api` reference package. The four real demos, including `example.ui-playground`, can be built as unsigned local-test packages; signed release artifacts should be produced with the publisher key.
