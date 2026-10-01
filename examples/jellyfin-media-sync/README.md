# Jellyfin Media Sync

Version 2.0.0 is the serious integration example for Plugin API v1 on the completed
`plugin-manager` platform. It bundles a privileged native Vue interface without
CDN dependencies. It synchronizes **films, TV shows, and anime** for the host user that enabled the
installation. Jellyfin movies and series are paginated together, and anime is
identified from Jellyfin genre/tag metadata without requiring a separate library. It has no plugin dependencies.

## Configuration

1. Install the `.utp` in Settings → Plugins and review the narrow permissions below.
2. Enable it from the host account whose media library should receive imports.
3. Use the **same account** to configure it in the Jellyfin Sync sidebar page or
   native Settings section. Save the HTTP(S) server URL (including a proxy base
   path if applicable), Jellyfin user ID (32 hex characters), interval (5–1440
   minutes), and optional periodic-sync switch.
4. Enter a Jellyfin API key or user access token. Do not enter a password or a
   username. Save configuration and token. Blank token entry preserves the token.
5. Queue a sync. The supervised worker handles it and the native progress panel
   refreshes every five seconds. Periodic sync is disabled by default.

Token entry is a declared secret field. Ordinary settings contain no credential.
The explicit `save-token` action writes into reserved `secrets/api_key` storage;
only plugin backend code reads that namespace. The token is never returned by
configuration, status, media, event or action responses. It is bound to the saved
server and Jellyfin user: changing either requires saving a token again, preventing
an old credential being forwarded to a new destination. No credentials belong in
source, catalogue, artwork URLs, logs or packages. There is no password-login flow.

This is an installation-owned integration, not per-user Jellyfin account linking.
Queued work always imports for the enabling host account, not the person pressing
Queue sync. Grant backend data capabilities only to that intended account. The
host currently lacks a public background identity/profile contract, so configure
and enable consistently; multi-user account linking is not claimed.

## Permissions and behavior

| Permission | Why it is needed |
| --- | --- |
| `media.read` | Preview 100 media items in the current user's host library |
| `media.write` | Import paginated normalized movies for the enabling user |
| `plugin.settings` | Read non-secret integration configuration |
| `plugin.storage` | Reserved secret token, queued requests, progress and event cursor |
| `tasks.background` | Supervised worker, queued manual and periodic synchronization |
| `events.subscribe` | Poll host activity after sync or on demand, retaining only a cursor |
| `network.outbound` | HTTP only to the configured Jellyfin server, checked before every request |
| `frontend.native` | **Privileged** native Vue configuration and progress in the host realm |
| `frontend.navigation.main` | Jellyfin Sync sidebar entry |
| `frontend.navigation.settings` | Settings sidebar link |
| `frontend.settings` | Native integration Settings section |
| `frontend.routes` | `/plugins/example.jellyfin-media-sync/sync` |

No parent subtree, full API, host routes, game read or notification permission is
requested. Configuration and native Settings contributions are distinct: the
same fields/actions also remain available in generated Plugins configuration
when native mode is denied. Save ordinary fields first, then press Save token
separately. Runtime grants remain authoritative for all gateway calls.

The worker uses bounded 100-item Jellyfin pages containing both Movie and Series items, a 4 MiB response limit, 15-second
HTTP timeout, JSON validation, and a live outbound grant check for **each** request.
It uses the standard Authorization header, refuses all redirects, and uses default
TLS verification. Server URLs cannot carry credentials/query/fragment. Progress
is persisted after each import page. Unique queued request keys survive restart;
only the worker writes progress, avoiding concurrent manual/background syncs.
A new request arriving during sync is processed next. Partial imports are retained
on error and a retry starts from the beginning to refresh remote watched state.

Errors distinguish credential rejection, HTTP failure, rate limiting, response
size/shape, incomplete pagination and connection/TLS/egress failure. Raw exception
text and Jellyfin response bodies are never persisted. Failed periodic work waits
the configured interval; manual queue requests can retry sooner. Disabling the
plugin terminates the host-supervised worker; native polling timers are cleaned up.

Host event polling observes host activity; Jellyfin polling reads the remote
library. These are separate integrations. No Jellyfin webhook subscription or
bidirectional playback update is claimed.

## Generic platform gaps discovered

These limits are in the platform, not solved with plugin-specific host paths:

* **Brokered outbound HTTP:** `network.outbound` can be checked, but no generic
  gateway HTTP method or host allowlist contract exists. The default bubblewrap
  runtime unshares networking, so direct HTTP cannot reach Jellyfin. The example
  reports an actionable connection error there. Direct requests work only in an
  already configured runtime permitting egress (for example its documented
  nonbubble mode). This plugin does not switch isolation modes. A host-owned,
  permission-enforced HTTP broker with server allowlisting, bounded responses,
  redirect policy and secret references is the required generic contract.
* **Provider-neutral import identity and playback:** `media.import` currently
  hard-codes source `jellyfin` and upserts Jellyfin media by title. It accepts external IDs
  but does not persist/use them for deduplication. Different movies sharing a title
  can merge; renamed items can duplicate. Runtime, genres, poster URL and a true
  watched flag are applied; release year, play count, last-played date and watched
  reversals are not persisted. The plugin normalizes and sends these fields but
  does not claim complete playback parity. A generic provider/external-ID upsert
  and versioned playback DTO are required. It never accesses the host database.
* **Background identity:** workers inherit the enabling user's host scope. A
  public authenticated worker identity and per-user integration/secret namespace
  are required before automatic account linking can be implemented safely.

Token-free artwork URLs may require public/proxy access; embedding the secret in
host-visible URLs is intentionally avoided. No generic authenticated artwork
proxy is currently exposed to plugins.

## Test, build and release

Upgrading from 1.x changes the UI to native mode and configuration to token + user
ID. Save the token again to bind it to the destination; legacy raw tokens produce
an explicit upgrade message. Old password login is unsupported. The host must
review newly requested permissions during this major update.

From the repository root:

```sh
pytest
python tools/build_packages.py
python tools/verify_packages.py dist/*.utp
python tools/validate_packages.py dist/*.utp
```

Behavior tests cover paging beyond 200 items, watched data normalization, queued
work, persistent progress, event cursors, retries, invalid configuration, secret
redaction, credential destination binding, outbound grant denial and redirect
rejection. Native tests exercise loading, saving, secret clearing, progress and
cleanup. Package tests check assets, deterministic digests, invalid native assets
and corruption rejection.

Development builds `dist/example.jellyfin-media-sync-2.0.0.utp` unsigned. The
existing release workflow signs with the configured reviewed publisher key.
Publisher keys/signing rules and package validation are unchanged. Installation
of an unsigned native package requires the normal elevated-consent/password flow.

Manual integration: install the actual package on `plugin-manager`, configure a
test Jellyfin library with more than 200 mixed films and TV shows, including anime, sync in an egress-enabled runtime,
verify progress and host imports, change watched state and repeat. Try invalid
credentials, a renamed movie, equal titles, an unreachable URL, a revoked outbound
grant, disabled periodic sync, restart during a queued sync and plugin disable.
In the default isolated runtime, verify the documented HTTP limitation is visible.

Protocol references: [Jellyfin GetItems](https://api.jellyfin.org/#tag/Items/operation/GetItems)
and the [official Python API client](https://github.com/jellyfin/jellyfin-apiclient-python/blob/master/jellyfin_apiclient_python/api.py).
