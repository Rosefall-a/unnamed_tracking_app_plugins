# Blue Hour Palettes

An executable Plugin API v1.1 example that adds a personal palette under
**Settings → Appearance & interface → Color palette**. Install its verified
`.utp`, approve only `frontend.themes`, and enable it. Preview both modes,
choose **Apply palette**, or **Edit these colors** to customize it. The host
saves a personal copy; disabling, revoking or uninstalling the plugin removes
its preset choice while preserving each account's selected colors.

`ui.json` provides both light and dark semantic color roles. No CSS, native
JavaScript, iframe, private data permission, or application import is needed.
Theme permission is independent of other frontend registration grants.

Palette downloads use the host's standard portable JSON format. System mode
continues to follow the device. Contrast checks remain advisory.

Build and validate using the repository's normal distribution commands. This
source is a demo identity, not an official production release or trust claim.
