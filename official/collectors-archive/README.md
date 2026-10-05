# Collector's Archive

With optional `frontend.shortcuts` access, Alt+E opens Cards, Alt+S opens Sets,
and Alt+B opens Bounties. N opens the create control on those plugin pages.
These bindings appear in host help and personal shortcut settings only while
the plugin is enabled and authorized; users can disable or remap them. Existing
bindings keep working if one of these keys conflicts.

Official preview of **Cards, Sets and Bounties**, moved together out of the host.
It preserves the complete card designer (front/back templates, symbols, uploaded
art, rarity, set placement and print status), archive numbers, prestige challenges,
set completion, automatic and custom goals, objectives, evidence, journal entries
and reward history. Prestige requires verified 100% achievement completion and
creates one deterministic challenge for each card.

Install the preview through the plugin manager and review its permissions. Open
**Collector's Archive** under Account settings and import your legacy records
before using the archive. Imports retain original identifiers and archive numbers;
retrying never overwrites an imported or edited record. Each account imports its
own records. The host retains the original tables, and importing does not modify
or delete them. Keep a database backup until you've checked your archive.

Cards, Sets and Bounties appear in the main menu while the plugin is enabled.
Completed-game context actions can create cards. On phones, use the hamburger to
open those entries. The existing native appearance tokens, modal controls and
headings work in Light, Dark, System, preset and custom palettes.

The plugin owns its state through `plugin.storage`; it does not import host
modules, declare database models or access the database directly. The public
`library.legacy.read` grant permits the one-time, read-only legacy export.
`games.read` supplies owned game and achievement data; `media.read` supplies
owned evidence metadata. Withdrawing a required permission stops the contribution
through the normal host lifecycle. The source starts at **0.0.1** and remains a
preview pending the official signing/release process. Branch archives are
untrusted previews and require explicit installation consent.

Use the plugin manager's storage backup/restore controls before updating or
removing the plugin. Disable retains its namespace. Uninstalling with data deletion
removes the plugin copy; the retained legacy server records remain available.

Run `npm ci && npm run build:native` at the plugin repository root to compile the
plugin-owned Vue components. The build uses the documented `context.vue` runtime
and `context.ui` components; it bundles no host source or second Vue runtime.
Python behavior tests and actual host/runtime/browser acceptance are maintained
alongside the source. Published signed archives remain immutable.

For a disposable installed host, run
`node tools/check_collectors_archive_ui.mjs <host-source> <output> <backend-url> <temporary-admin-cookies.json>`.
The check creates temporary ordinary users through the public API, imports all
seven retained record groups, exercises native set/card creation, objectives,
evidence, journals, reward idempotency and cross-user denial, and captures loaded
phone/desktop Light/Dark pages. It also checks global search, Home goals,
deadline reminders and disable/re-enable cleanup. Accounts created by the check
are removed afterwards. Never use personal session cookies or production data.
Set `COLLECTOR_FRONTEND_ORIGIN` to the same backend origin to exercise a compiled
production frontend through Nginx instead of the local static review proxy.
