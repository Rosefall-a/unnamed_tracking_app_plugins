# Background tasks: queue work and return promptly

## Goal

Have an action record durable work for one supervised worker.

## Prerequisites

Declare `tasks.background` and `plugin.storage` v1 with permission rationales.
Read Jellyfin's `sync_now`, `worker_tick` and entrypoint before adapting its queue.
The action below is only the producer; it requires a matching worker consumer.

## Minimal code

<!-- recipe: background -->
```python
import json
from uuid import uuid4
from sdk.plugin_protocol import request

def run(values: dict) -> dict:
    request("capabilities.check", "tasks.background", {})
    request("storage.put", "plugin.storage", {
        "key": "sync/requests/" + str(uuid4()),
        "value": json.dumps({"requested": True}),
    })
    return {"queued": True}
```

Unique request keys avoid an action overwriting the worker's progress. The worker
must consume bounded batches, save progress and only remove completed requests.
Recover outstanding requests after restart; record safe failures and retries.
Do not introduce another scheduler or assume one action process shares memory
with the entrypoint. See the [complete integration recipe](events-tasks.md).

## Test command

```sh
python -m pytest tests/test_feature_tutorials.py -k background
python -m pytest tests/test_jellyfin.py -k "worker_queue or queue_arriving"
```

## Expected result

The recipe checks background authority before writing a durable request and
returns `queued: true`. Denial prevents the write. Jellyfin's tests verify a
request arriving during sync survives and that retry/cursor state is durable.
The real host suite runs the supervised sync worker against a disposable service.

## Common mistakes

Running the sync in the action; using one mutable queue key for competing writes;
equating queued with completed; retrying irreversible side effects without
deduplication; continuing work after the live background grant is revoked.
