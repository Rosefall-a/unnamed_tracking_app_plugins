# Events: inspect activity types

## Goal

Poll a bounded page of current-user activity without copying sensitive payloads.

## Prerequisites

Declare `events.subscribe` v1 with a reason and obtain its grant. Start from Help
Button for an action, or Jellyfin for a persistent polling cursor.

## Minimal code

<!-- recipe: events -->
```python
from sdk.plugin_protocol import request

def run(values: dict) -> dict:
    result = request("events.poll", "events.subscribe", {"since": 0, "limit": 5})
    return {"event_types": [event["event_type"] for event in result.get("events", [])]}
```

This teaching action always starts at cursor zero. A background consumer should
read its saved cursor, process a bounded batch, then save the returned cursor
after successful work. Make side effects idempotent; do not infer exactly-once
delivery from polling. Jellyfin's `refresh_status` demonstrates the cursor shape.

## Test command

```sh
python -m pytest tests/test_feature_tutorials.py -k events
python -m pytest tests/test_jellyfin.py -k worker_queue
```

## Expected result

An activity fixture containing `game.updated` returns only that type. A denied
grant fails. The Jellyfin test additionally checks durable cursor/queue behavior
and denial without a real external service.

## Common mistakes

Advancing the cursor before processing succeeds; replaying notifications on every
poll; persisting another user's event payload; starting an unbounded polling loop
inside a UI action. See [background tasks](background-tasks.md).
