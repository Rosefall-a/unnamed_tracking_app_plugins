# Events, background tasks and notifications

Jellyfin is the working example for `events.subscribe`, `tasks.background`,
durable progress and a single supervised worker. Recently Played Notifier is a
small example of a user-triggered host notification.

## Background integration recipe

1. Put long-running work in the plugin entrypoint, not an unbounded action.
2. A bounded action validates configuration, records a queued request and returns
   promptly. Store progress via `plugin.storage`.
3. The supervised worker consumes the queue, performs bounded pages of work and
   updates durable progress. Retry explicitly; preserve failure state.
4. Poll host events using `events.poll` with `events.subscribe`. Retain progress
   or cursors as required by the demonstrated contract; do not infer exactly-once
   delivery. Make side effects idempotent.
5. Provide a status action and cancellation/cleanup behavior. Test restart during
   work and disable before the next operation.

`tasks.background` is the existing host capability; this repository does not
introduce a second scheduler. Jellyfin's source/README describes current broker,
import identity, playback and background identity limitations.

## Send a notification

Declare `notifications.send` and a matching rationale, then use:

```python
request("notifications.send", "notifications.send", {
    "title": "Report ready", "body": "Your requested report is available."
})
```

The host owns delivery preferences and notification records. A native local
toast is transient browser feedback, not a persistent notification. Discord
Delivery Provider demonstrates separately declared provider registration and
core-coordinated delivery; do not duplicate host retries/deduplication here.

Test empty data (no unwanted notification), failures, repeated events, queue
deduplication and resumed work. Never put secrets or another user's data in a
notification.
