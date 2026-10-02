# Recently Played Notifier

The **Send notification** action reads the signed-in user's recent games,
formats a notification, returns the result and stores a small execution record
under `users/<host-injected-user-id>/last-run`. It requests `games.read`,
`notifications.send`, `plugin.storage` and `frontend.navigation.main` for its
sidebar page. The supervised entrypoint reports ready and stays alive; restarting
it does not send duplicate notifications automatically.

It is intentionally application-level behavior. The host owns the notification service and game data; the plugin only consumes those capabilities.

Build/test and release instructions are in the [author guide](../../docs/plugin-author-guide.md).
README, tags, icon and resolved release policy are included in each new package.
