# Plugin UI Playground

This deliberately obvious demo exercises native plugin UI.

It provides four pages, several intentionally empty filter controls, a write-only Discord webhook field, and an **Announce this page to Discord** button on every page.

The filters are placeholders and do not alter host data.

The Discord action requires `notifications.send`. Installation creates a pending permission request and the plugin remains disabled until that permission is granted.
