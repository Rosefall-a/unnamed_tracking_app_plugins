# Update, rollback, reinstall, purge and uninstall

The host owns each lifecycle transaction. Package history is distribution data;
it does not execute code or restore stored data.

| Operation | Expected persistence |
| --- | --- |
| Start/stop, host/runtime restart, disable/enable | Settings, secrets, owned storage preserved |
| Ordinary update | Preserved; health check before final activation |
| Update requesting new permissions | Candidate waits for explicit approval; old version remains active |
| Manual rollback / failed-start restoration | Stored data preserved, previous retained package restored |
| Reinstall retaining data | Existing configuration/storage preserved |
| Confirmed reinstall with purge | Data/configuration cleared; permission approval reset |
| Uninstall | Package, retained versions and plugin-owned host records/data removed |

## Test a safe update

1. Install/configure a known-good version and save a sentinel storage value.
2. Publish a new version using the existing builder. Check its own manifest,
   hashes, signature, compatibility, notes and automatic-update flag.
3. Preview it. For a new scope, verify old behavior still works while approval is pending.
4. Approve/activate, check healthy startup and confirm the sentinel/configuration survives.
5. Roll back to the locally retained predecessor and verify the same data is readable.
6. Reinstall preserving data, then perform confirmed purge only on a disposable
   installation. Reapprove/configure and verify it starts from defaults.
7. Uninstall and confirm plugin-owned storage/configuration and retained packages are gone.

The existing real-host acceptance tests this full sequence with Jellyfin, including
secrets, automatic opt-out/opt-in, failed startup and permission staging. Additional
reference-package acceptance tests real workers and runtime transactions for
UI/API, report, notifier and curator. See [testing](../testing/index.md).

## Migration considerations

![Real host package and update review](../assets/screenshots/update-review.png)

Store an explicit data schema version. Prefer additive fields and readers that
accept the previous schema. Make migrations idempotent and bounded, and avoid
irreversible writes before health-tested activation. Rollback changes executable
code, not installation data; old code must be able to read data written by the
candidate. Document backup/recovery and any manual migration required. Never
promise that rollback restores an external service or reverses notifications.
