# Blue Hour and Purple Blocks

An executable Plugin API v1.1 example under **Settings → Appearance & interface → Color palette**.
Blue Hour offers calm blue colours. Purple Blocks makes the interface purple, adds bold borders,
and changes rounded controls, cards, dialogs, the desktop sidebar, mobile drawer
and bottom navigation into square blocks. Both provide light and dark modes.

Install a verified `.utp` or the CI `unsigned-dist` preview using the host's unsigned-package
consent. Approve `frontend.themes` to expose palettes. Approving the separate privileged
`frontend.native` permission also loads the optional native stylesheet. Native JavaScript can
access the signed-in application; palette-only plugins do not need that permission.

Choose Purple Blocks to preview menus and cards, then **Apply palette**. The CSS is scoped to
`[data-plugin-theme="plugin:example.theme-palettes:purple-blocks"]`, which the host applies only
when the saved light and dark palette matches this active, approved contribution. Switching
presets or editing colours removes the shape override. Disabling, revoking or uninstalling the
plugin removes its stylesheet and preset choices while preserving the account's saved colours.

`native/style.css` demonstrates overrides of public tokens and host selectors. Theme plugins
can use their own CSS for wider interface changes when their native permission is approved.
Keep overrides scoped, retain focus indicators, and test desktop and touch layouts in both modes.
The preview carries the same theme scope. No application source imports are required.

Palette export/import uses the portable host JSON format; system mode follows the device.
Contrast checks remain advisory. This source is an example identity, not an official release.
Build and validate using the repository's normal distribution commands.
