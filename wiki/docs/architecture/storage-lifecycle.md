# Storage and lifecycle

Packages contain code and defaults. Installation data lives outside the package:

| State | Interface | Author's responsibility |
| --- | --- | --- |
| Ordinary settings | Declared UI form and `settings.get` | Validate values; provide missing-value defaults |
| Persistent plugin data | `storage.get`, `storage.put`, declared quota | Scope keys by authenticated identity; version stored formats |
| Write-only secrets | Explicit save flow demonstrated by Jellyfin or the iframe bridge | Omit from read APIs/logs; bind external credentials to destinations |
| Worker memory | Normal Python state | Reconstruct it after process restart; never assume durability |
| Retained packages | Host package history and rollback | Preserve readability of data written by later code |

The host owns install, start/stop, enable/disable, update, rollback, reinstall,
purge and uninstall. The plugin owns compatibility of its stored representation.
Restart or replacing code must not erase installation data. Purge and uninstall
are the explicit destructive operations.

For a stored JSON object, start with `{"schema_version": 1, ...}`. Handle absent
or malformed data deliberately. Prefer additive changes and idempotent migrations.
Rollback restores code; it does not restore old data or undo external side effects.

Use the [operation table](../lifecycle/operations.md),
[update/recovery procedure](../lifecycle/updates.md) and
[storage tutorial](../development/storage.md) when designing your plugin.
