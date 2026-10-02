# Secrets

Keep tokens out of ordinary settings, action results, README, logs, package
payloads, browser storage and catalogue metadata. Host secrets are distinct from
displayable configuration.

The existing examples demonstrate two supported paths:

* UI Playground uses `plugin.store-secret` in the iframe bridge. The host stores
  a write-only value in the plugin's private runtime data directory; the Python
  action reads its declared `secrets/` file through `PLUGIN_DATA_DIR`.
* Jellyfin sends its secret field only to the explicit `save-token` action. That
  action stores a private JSON value via plugin storage, binding it to the
  configured master server. `get-config` and status never return the token.

## Adapt the Jellyfin pattern

1. Collect the token using a secret field and an explicit save action.
2. Validate configuration and token before saving.
3. Save the token with the destination identity. Return only success/failure.
4. Before sending it externally, recheck the live outbound grant and destination.
5. If the server changes, require a new token save. User links reference the master credential and require their own approved identity. Refuse cross-host redirects.
6. Test that every result, error, status and log omits the token.

Do not interpret a `secrets/` key convention as a separate universal secrets API
or stronger cryptographic isolation. These are existing plugin patterns subject
to host storage/runtime policy. Native browser privileges are powerful; keep
secret access minimal and separate from normal read-only pages.
