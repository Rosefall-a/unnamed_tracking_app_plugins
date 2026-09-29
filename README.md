# Unnamed Tracking official plugins

This repository contains official demo plugins and reference implementations for the Unnamed Tracking App Plugin API v1.

## For users: getting and installing a plugin

1. Browse the plugins below and choose one that provides behavior you want to try.
2. Download its `.utp` package from Releases. Do not rename a source `.py` file into a `.utp`.
3. In Unnamed Tracking, open **Settings → Plugins → Install plugin**.
4. Select the `.utp` file.
5. Review its permissions, dependencies, publisher, and version.
6. Confirm installation and enable it.

The four **real demo plugins** are intentionally useful, end-to-end examples. Their source is included here, but they are not emitted as installable `.utp` packages until a trusted publisher signing key is supplied:
- **Playtime Report** reads the game library, calculates statistics, and stores a report.
- **Recently Played Notifier** reads recent activity, formats a notification, and stores its last run.
- **Metadata Curator** reads a plugin setting, performs a metadata search, normalizes the result, and stores a snapshot.
- **Plugin UI Playground** demonstrates native pages, empty filter controls, lifecycle state, and Discord page announcements.

The other examples remain small protocol/reference tests. They demonstrate individual API calls without pretending to be complete applications.

## Official examples

| Plugin | Type | What it demonstrates |
| --- | --- | --- |
| `example.playtime-report` | Real demo | Game-library statistics, persistent storage, native UI |
| `example.recently-played-notifier` | Real demo | Game data + notifications + persistent state |
| `example.metadata-curator` | Real demo | Settings + metadata search + result normalization |
| `example.ui-playground` | Real demo | Native pages + empty filters + Discord page announcements |
| `example.lifecycle` | Reference | Startup/readiness, settings, and storage |
| `example.events` | Reference | User-scoped event subscriptions |
| `example.ui-api` | Reference | Declarative UI and gateway requests |
| `example.advanced` | Reference | Scoped identity and storage |
| `example.notifications` | Reference | Notification capability |
| `example.metadata` | Reference | Metadata capability |
| `example.events-filter` | Reference | Event filtering and rate limits |

### What makes a real demo plugin?

A real demo performs application-level work after receiving data from the host. It has logic, state transformation, and a visible or useful result. It does **not** implement the host's lifecycle, gateway, notification service, metadata service, or storage engine.

That distinction is deliberate: the application provides the plugin platform; plugins provide behavior on top of it.

## For developers

A plugin declares its identity, compatibility range, capabilities, permissions, dependencies, UI contributions, storage quota, and package integrity in `manifest.json`. Runtime access goes through the v1 gateway rather than direct database access, host filesystem access, or application internals.

Use the real demos as templates:
- Start with **playtime-report** for a complete read → process → persist workflow.
- Use **recently-played-notifier** for a plugin that combines core data with a side effect.
- Use **metadata-curator** for configurable integration logic.
- Use the smaller reference examples when learning one protocol feature in isolation.

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

The repository currently ships signed `.utp` artifacts for the four reference plugins: **lifecycle**, **events**, **ui-api**, and **advanced**. These are the packages the application can accept immediately. The three real demos are source-complete and tested, but release packaging is intentionally gated on publisher signing.
