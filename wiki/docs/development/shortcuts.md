# Keyboard shortcuts

Plugin API v1.1 adds the optional `frontend.shortcuts` permission. It does not
grant data access or native execution. Existing shortcuts keep working when a
new binding conflicts; the new key is paused and highlighted in Preferences →
Keyboard shortcuts. Each user can disable or remap bindings, and a master switch
pauses all shortcuts. Help, hover hints and the quick tour use those active keys.

Declare `shortcuts` in `ui.json` with a stable `id`, `label`, one to four `keys`
and exactly one `page_id`, `route_id`, `action_id` or `control`. A `control` is
`search` or `create` and requires `when_route_id`; mark the visible control with
`data-shortcut="search"` or `data-shortcut="create"`. The target must exist in the
same UI document. Route and action permissions remain required independently.
Use `visibility.admin_only` for administrator contributions.

```json
{
  "id": "open-library",
  "label": "Open my plugin library",
  "group": "My plugin",
  "keys": ["Alt+Shift+L"],
  "route_id": "library"
}
```

Native plugins also need `frontend.native` and can call
`context.host.registerShortcut({ id, label, keys, group?, paths? }, callback)`.
It returns an unregister function. Paths must belong to the plugin's namespace;
omitting them makes the binding available throughout the app. Both declarative
and native bindings are capped at 64 per plugin. Host cleanup removes them on
disable, permission withdrawal, account changes and failed activation. Retain
stable IDs so personal overrides survive reinstalling the plugin.

Supported modifiers are `CtrlOrMeta`, `Ctrl`, `Meta`, `Alt` and `Shift`. Combine
them with one letter, digit, function key, supported punctuation or named key
such as `ArrowDown`, `Enter` or `Space`. `CtrlOrMeta+K` works with Control on
Windows/Linux and Command on macOS. Sequences and executable targets are not
accepted. Bindings pause during composition, repeat, AltGraph input, typing and
host dialogs. Plugins should use host registration rather than private global
keyboard listeners.

The [Shortcut Playground](../examples/index.md) is an **example**, requires SDK
`>=1.1.0,<1.2.0`, and deliberately conflicts with Search. It can add and remove
random bindings without rebuilding its document. Collector's Archive owns its
Cards, Sets and Bounties bindings; these are absent from the core help page when
the plugin is unavailable.

Sandboxed pages use the shared appearance bridge's read-only `keyboard_shortcuts`
snapshot. It forwards active IDs and combinations to the parent, where the host
rechecks availability and applies its normal keyboard guards. Older bridges
receive default navigation/dialog hints only while those original keys remain
active. The snapshot contains no credentials or arbitrary navigation targets.
