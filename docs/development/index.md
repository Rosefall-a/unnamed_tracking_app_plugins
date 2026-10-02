# Choose a tutorial

First complete [Library Summary](../getting-started/first-plugin.md). It provides
the manifest, entrypoint, UI action, package commands and development-host install.
The recipes below add one feature at a time; their code/config fragments belong
in a complete plugin, rather than forming standalone installable packages.

| Goal | Tutorial | Maintained example |
| --- | --- | --- |
| Read ordinary configuration | [Settings](settings.md) | UI/API |
| Preserve per-user results | [Persistent storage](storage.md) | Playtime Report |
| Save a token without returning it | [Secrets](secrets.md) | Jellyfin |
| Read game data | [Game access](games.md) | Library Summary, Playtime Report |
| Read media data | [Media access](media.md) | Jellyfin |
| Consume host activity | [Events](events.md) | Help Button, Jellyfin |
| Queue durable work | [Background tasks](background-tasks.md) | Jellyfin |
| Notify the signed-in user | [Notifications](notifications.md) | Recently Played Notifier |
| Add a page or sandboxed bundle | [UI](ui.md) | UI/API, Document Viewer |
| Integrate a reviewed Vue component | [Native frontend](native.md) | Help Button |
| Add a sidebar entry | [Navigation](navigation.md) | UI/API, Help Button |
| Add a scoped browser or HTTP route | [Routes](routes.md) | Help Button, Document Viewer |
| Open an explicitly reviewed destination | [External links](external-links.md) | Help Button |

Each recipe includes a test command and an expected outcome. Unit fixtures test
plugin behavior; only the real host conformance suite establishes authentication,
effective grants and transactional lifecycle behavior.
