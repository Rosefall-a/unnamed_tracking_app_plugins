# Shortcut playground

This is an **example**, not an official feature. It requires Plugin API **1.1.0** and SDK **>=1.1.0,<1.2.0**. It has no compatibility adapter for a v1.0 host.

Open **Extensions → Shortcut playground** after installation and approval. Add or remove up to five random Alt+Shift shortcuts. Each binding opens this page and reports which action ran. The host owns dispatch, personal enable/disable choices, remapping, conflict detection and help.

The plugin deliberately requests **Ctrl/Cmd+K**, which conflicts with Search library. Search keeps working and the example binding is highlighted and paused. Open **Preferences → Keyboard shortcuts**, expand **Shortcut playground**, and change its keys to try it. Removing a binding or stopping the plugin removes it from dispatch and help; account preferences are retained for a later reinstall.

Permissions:

| Capability | Purpose |
| --- | --- |
| `frontend.navigation.main` | Add the example to Extensions. |
| `frontend.routes` | Declare the `playground` route. |
| `frontend.shortcuts` | Register host-managed shortcuts. |
| `frontend.native` | Run the small native Vue teaching page and scoped CSS; this is privileged and requires explicit approval. |

No game data, secrets, storage, network access or notifications are requested. Binding callbacks pause while typing or using a dialog.

Run `pytest`, `node --test tests/shortcut_playground.test.mjs` and `python tools/build_packages.py --output-root .validation`. CI publishes development packages through the **unsigned-dist** artifact on every branch push; these require normal unsigned-package consent. Published signed releases and retained history are never edited in place.
