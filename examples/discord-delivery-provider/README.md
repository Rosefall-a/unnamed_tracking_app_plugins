# External Discord Delivery Provider

This reference plugin registers `example.discord-delivery-provider.discord` with the core notification coordinator. Core decides which notifications are eligible, checks the user's provider setting and active grant, owns deduplication and retry state, and sends a minimized delivery DTO to the plugin's `deliver` action.

Permissions requested:

- `notification_providers.register`: register and remove the namespaced provider.
- `notification_providers.deliver`: receive eligible minimized delivery work.
- `plugin.storage`: store a Discord webhook in private, write-only runtime storage.

The runtime accepts only HTTPS `discord.com` or `discordapp.com` `/api/webhooks/` destinations and limits message content to Discord's 2,000-character bound. The plugin never logs or returns the webhook. Set `PLUGIN_RUNTIME_DISCORD_EGRESS=true` to enable the narrowly scoped runtime sender; outbound access remains disabled otherwise.

Build all packages with `python tools/build_packages.py`. Local builds are intentionally unsigned and require the host's untrusted-package confirmation; release CI supplies the reviewed signing identity. Requires the host Plugin API v1 notification-provider capabilities introduced by the Phase 2 plugin-manager work.
