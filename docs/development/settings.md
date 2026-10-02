# Settings

Start from UI/API to add a small generated settings form. Settings belong to the
installation; ordinary values are separate from secrets and plugin-owned
persistent state.

1. Declare `plugin.settings` v1 and its permission.
2. Add a settings section ID to `manifest.ui.settings`.
3. Define a section in `ui.json` with `id`, `title`, and `fields`:

```json
{"id": "display", "title": "Display", "fields": [{"id": "display_mode", "label": "Display mode", "type": "text", "default": "compact"}]}
```

4. Reference the section ID in a declared page's `settings` list.
5. Read it using the gateway and handle absent defaults:

```python
mode = request("settings.get", "plugin.settings", {"key": "display_mode"}).get("value") or "compact"
```

The host owns saving, form validation and approval. Putting individual fields
directly into top-level `settings[]` is invalid. A plugin's configuration form is
distinct from contributing a new host Settings section; that uses
`frontend.settings` and, when native components are loaded, `frontend.native`.

Test empty values, invalid settings, restart and update preservation. Keep tokens
out of these ordinary fields; use [secrets](secrets.md).

Jellyfin uses administrator-checked backend actions and plugin storage for its master server configuration, so an ordinary installation settings write cannot change its server credential or identity approvals. See [Jellyfin setup and screenshots](../examples/jellyfin.md).
