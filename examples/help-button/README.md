# Help Button: capability showcase

Version 2.0.0 targets Plugin API v1 on the completed `plugin-manager` platform.
This is intentionally a playful developer showcase, not a support application.
It has no plugin dependencies and bundles plain JavaScript using the host-supplied
Vue API; no CDN or frontend build tool is required.

## Surfaces and permissions

| Permission | Visible demonstration and reason |
| --- | --- |
| `frontend.overlay` | Floating Help Button on host pages |
| `frontend.dialog` | Host-owned demonstration modal opened by the floating button |
| `frontend.navigation.main` | Help showcase sidebar entry |
| `frontend.navigation.settings` | Settings sidebar link |
| `frontend.settings` | Native Settings contribution, separate from Plugins configuration |
| `frontend.context.game` | Remember demo visit in a game context; no game-data read grant |
| `frontend.page.extend` | Labelled card below Home widgets |
| `frontend.routes` | `/plugins/example.help-button/showcase` |
| `frontend.native` | **Privileged** Vue cards, scoped CSS and local toast in the host realm |
| `notifications.send` | A real current-user host notification, distinct from the local toast |
| `events.subscribe` | Poll five current-user event types on demand |
| `plugin.storage` | Remember/read a timestamp in the authenticated user's demo namespace |
| `plugin.settings` | Read the configurable greeting with the saved visit |

The external help-video action declares `external_navigation` and confirmation.
Its destination is a fixed HTTPS YouTube URL. It needs no outbound HTTP grant:
the browser navigates after user confirmation. The native view uses the public
host action SDK and an exact destination check before navigating a new tab.

Home is extended rather than replaced. No page-replacement, broad API, user-data
read, host-route or outbound-network privileges are requested. Every gateway
operation still depends on a live host grant. Denied UI grants remove the relevant
contribution; denying native mode leaves declarative pages/actions available.
The native modal launcher and local toast require native mode.

## Configuration and use

Install the package through Settings → Plugins and review the native frontend
privilege. Enable it, then open Help showcase from the sidebar or Settings.
In Plugins → Help Button → Settings, change the demo greeting. Read remembered
visit to observe that configuration together with persisted state.

Try the floating dialog, toast, real notification, event inspection, Home card,
game contextual action, remembered visit after reload, and suspicious help video.
The native UI visibly labels the capability behind each card. It never mutates
host DOM or imports host application internals. Timers and CSS registrations are
cleaned up when the host removes the plugin.

## Test, build and install

From the repository root:

```sh
pytest
python tools/build_packages.py
python tools/verify_packages.py dist/*.utp
python tools/validate_packages.py dist/*.utp
```

`tests/test_help_button.py` covers behavior, per-user state and protocol requests.
`tests/test_canonical_packages.py` covers packaged native assets and integrity.
`tests/test_native_frontends.py` runs the behavioral native tests with Node when
installed; CI installs Node explicitly. No host checkout is needed for these tests.

Development produces `dist/example.help-button-2.0.0.utp`, deliberately unsigned.
The existing release workflow rebuilds/signs with its configured reviewed
publisher key; the source does not contain private signing material. An unsigned
native package must go through the host's elevated permission consent and password
reauthentication. No signature or installation check is bypassed.

Manual host verification: install the actual package, allow the listed leaves,
check all surfaces, revoke one UI leaf and reload, revoke storage and try a saved
visit, then disable the plugin. Its contributions must disappear. No host-side
special case is required for this example.
