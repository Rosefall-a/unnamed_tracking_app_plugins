# Unnamed Tracking official plugins

This repository contains official demo plugins and reference implementations for the Unnamed Tracking App Plugin API v1.

## For users: getting and installing a plugin

1. Browse the plugins below and choose one that provides behavior you want to try.
2. Download its `.utp` package from Releases. Do not rename a source `.py` file into a `.utp`.
3. In Unnamed Tracking, open **Settings → Plugins → Install plugin**.
4. Select the `.utp` file.
5. Review its permissions, dependencies, publisher, and version.
6. Confirm installation and enable it.

The three **real demo plugins** are intentionally useful, end-to-end examples:
- **Playtime Report** reads the game library, calculates statistics, and stores a report.
- **Recently Played Notifier** reads recent activity, formats a notification, and stores its last run.
- **Metadata Curator** reads a plugin setting, performs a metadata search, normalizes the result, and stores a snapshot.

The other examples remain small protocol/reference tests. They demonstrate individual API calls without pretending to be complete applications.

## Official examples

| Plugin | Type | What it demonstrates |
| --- | --- | --- |
| `example.playtime-report` | Real demo | Game-library statistics, persistent storage, native UI |
| `example.recently-played-notifier` | Real demo | Game data + notifications + persistent state |
| `example.metadata-curator` | Real demo | Settings + metadata search + result normalization |
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

For development/testing, run `pytest` and `python tools/build_packages.py`. Generated installable packages are written to `dist/`.

## Repository layout

- `examples/` — official demo and reference plugins
- `sdk/` — protocol helper used by plugins
- `publishers/` — publisher verification keys
- `tools/build_packages.py` — package builder
- `tests/` — plugin validation tests
- `dist/` — generated installable packages
