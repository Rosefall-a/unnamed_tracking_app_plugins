# Plugin UI Playground

This demo uses a real Vue 3 frontend supplied by the plugin package.

It provides four pages, a private Discord webhook setting, and an **Announce this page to Discord** button on every page. The Vue app is loaded by the host in a sandboxed iframe and talks to the host through the plugin frontend bridge.

## Secret handling

The manifest requests `plugin.storage` and `notifications.send`.

The webhook is **not** stored in `ui.json` or ordinary plugin settings. The frontend sends it to the host's secret API, which stores it as `secrets/discord_webhook` in the plugin's private persistent data directory. The runtime gives the plugin action access to that directory as `PLUGIN_DATA_DIR`; the action reads the webhook from there when it sends an announcement.

Plugin storage is private to the plugin runtime, quota-limited, path-confined, and written with owner-only file permissions. The frontend does not put the webhook in browser localStorage/sessionStorage.

Installation creates pending permission requests. The plugin remains disabled until the requested permissions are approved.

The frontend example uses a pinned Vue CDN script to keep this demo self-contained. A production plugin should normally ship a self-contained Vue/Vite build under `frontend/`.