# Secrets

## Goal and prerequisites

Save a destination-bound token without returning it to the browser. Begin with
Jellyfin's complete form/action and `plugin.settings`/`plugin.storage` grants.
External requests additionally require live `network.outbound` approval.

Keep tokens out of ordinary settings, action results, README, logs, package
payloads, browser storage and catalogue metadata. Host secrets are distinct from
displayable configuration.

The existing examples demonstrate two supported paths:

* UI Playground uses `plugin.store-secret` in the iframe bridge. The host stores
  a write-only value in the plugin's private runtime data directory; the Python
  action reads its declared `secrets/` file through `PLUGIN_DATA_DIR`.
* Jellyfin sends its secret field only to the explicit `save-token` action. That
  action stores a private JSON value via plugin storage, binding it to the
  configured server and user. `get-config` and status never return the token.

## Adapt the Jellyfin pattern

1. Collect the token using a secret field and an explicit save action.
2. Validate configuration and token before saving.
3. Save the token with the destination identity. Return only success/failure.
4. Before sending it externally, recheck the live outbound grant and destination.
5. If server/user changes, require a new token save. Refuse cross-host redirects.
6. Test that every result, error, status and log omits the token.

Do not interpret a `secrets/` key convention as a separate universal secrets API
or stronger cryptographic isolation. These are existing plugin patterns subject
to host storage/runtime policy. Native browser privileges are powerful; keep
secret access minimal and separate from normal read-only pages.

## Minimal configuration and save result

Jellyfin's UI declares a secret field separately from ordinary settings:

```json
{"id": "api_key", "label": "API key or access token", "type": "secret"}
```

Its explicit `save-token` action binds the validated value to current settings:

```python
store("secrets/api_key", {
    "token": token, "server": config["server_url"], "user": config["user_id"],
})
return {"ok": True, "message": "Token saved. It will never be returned to the UI."}
```

This fragment uses `token`, `config` and `store` from the complete `save_token`
handler in `examples/jellyfin-media-sync/plugin.py`. Include its validation and
`stored_token`'s destination check. The key name does not create a separate secret API.

## Test command

```sh
python -m pytest tests/test_jellyfin.py -k "token or outbound or http"
node --test tests/native_frontends.test.mjs
```

## Expected result

Save succeeds without returning the token; changing server/user requires a new
save. Denied egress prevents HTTP. Native tests verify the input is cleared.
Real host acceptance checks secret retention/deletion across lifecycle operations.

## Common mistakes

Echoing credentials in errors; putting them in settings or URLs; forwarding a
token to a changed server; following redirects with authorization; claiming
cryptographic isolation the chosen storage pattern does not establish.

Jellyfin uses the existing write-only secret mechanism for one installation credential. An administrator configures it through a declared, role-checked action; user linking never copies the credential into ordinary settings.
