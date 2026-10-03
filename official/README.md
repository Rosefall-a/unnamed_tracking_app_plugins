# Official plugins

[Unnamed Tracking PWA](pwa/README.md) is maintained official functionality,
currently **0.0.1**, published through the scoped official signing identity.

[Jellyfin Media Sync](jellyfin-media-sync/README.md) starts at **0.0.1**, an official
preview under test with the separate ID `official.jellyfin-media-sync`. Its release
uses that same reviewed official signing pipeline. Version 1.0 will follow
validation and an explicit release decision.

The separate [Jellyfin demo](../examples/jellyfin-media-sync/README.md) remains an
example. Official plugins are maintained user-facing features. Demonstrations
remain in `examples/` and use separate demo signing identities. Valid signature
and official status are distinct; every plugin still requires its declared
permissions, with no sandbox exemptions or special host APIs.
