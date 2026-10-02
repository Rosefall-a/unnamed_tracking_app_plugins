# Plugin UI Playground

This demo uses a real Vue 3 frontend supplied by the plugin package.

It provides four pages, a private Discord webhook setting, and an **Announce this page to Discord** button on every page. The Vue app is loaded by the host in a sandboxed iframe and talks to the host through the plugin frontend bridge.

## Secret handling

The manifest requests `plugin.storage` and `notifications.send`.

The webhook is **not** stored in `ui.json` or ordinary plugin settings. The frontend sends it to the host's secret API, which stores it as `secrets/discord_webhook` in the plugin's private persistent data directory. The runtime gives the plugin action access to that directory as `PLUGIN_DATA_DIR`; the action reads the webhook from there when it sends an announcement.

Plugin storage is private to the plugin runtime, quota-limited, path-confined, and written with owner-only file permissions. The frontend does not put the webhook in browser localStorage/sessionStorage.

Installation creates pending permission requests. The plugin remains disabled until the requested permissions are approved.

The frontend example uses a pinned Vue CDN script to keep this demo self-contained. A production plugin should normally ship a self-contained Vue/Vite build under `frontend/`.

## Where the pages appear

After installation and permission approval, open **Settings → Plugins → Plugin UI Playground** in Unnamed Tracking. The host embeds the plugin frontend in the plugin UI panel. The four plugin-owned pages are the tabs inside that embedded panel:

| Page | What to look for |
| --- | --- |
| **Overview** | The first/default tab; confirms the custom Vue frontend loaded. |
| **Library** | Example filter controls and filtered sample rows; changing filters should immediately change the table. |
| **Details** | Plugin/frontend/storage/action information. |
| **Diagnostics** | Frontend bridge, page-count, filter, and secret-API smoke-test information. |

The **Discord announcement** controls appear below the current page. Enter a webhook, choose **Save webhook securely**, then use **Announce this page**. The action receives the current page context, so changing tabs and announcing should produce a different page name.

These are plugin-owned pages, not new top-level Unnamed Tracking routes. They should therefore remain inside the **Plugin UI Playground** panel under **Settings → Plugins**.
