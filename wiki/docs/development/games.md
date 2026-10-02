# Game access: count a bounded library page

## Goal

Return the number of games in the first page for the authenticated caller.

## Prerequisites

Complete the first-plugin tutorial. Declare `games.read` v1 in capabilities and
permissions, explain the purpose, and approve it in your development host.

## Minimal code

<!-- recipe: games -->
```python
from sdk.plugin_protocol import request

def run(values: dict) -> dict:
    result = request("games.list", "games.read", {"limit": 50})
    return {"game_count": len(result.get("games", result.get("items", [])))}
```

Bind `plugin:run` to an action as in Library Summary. The host supplies caller
ownership; do not pass a browser-selected account ID to impersonate another user.
The bound is part of the result's meaning: 50 returned games does not prove the
whole library contains 50 games.

## Test command

```sh
python -m pytest tests/test_feature_tutorials.py -k games
python -m pytest tests/test_author_tutorial.py
```

## Expected result

The exact recipe emits `games.list` with `games.read` and a limit of 50. A fixture
with three games returns `{"game_count": 3}`; a denied response fails the action.
In the development host, Count games returns the caller's bounded count.

## Common mistakes

Treating the first page as an unbounded total; importing host models; forgetting
the read grant; swallowing a denied request and presenting it as an empty library.
Use Playtime Report when you also need scoped persistence and calculation tests.
