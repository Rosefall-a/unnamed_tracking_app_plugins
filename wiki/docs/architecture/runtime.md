# Gateway and runtime

Use `from sdk.plugin_protocol import request`. The builder bundles this public
helper into each package. It writes a v1 JSON request on stdout and consumes the
gateway response on stdin; stdout is reserved for that exchange. Write diagnostic
messages to stderr and omit secrets.

```python
from sdk.plugin_protocol import request

result = request("games.list", "games.read", {"limit": 50})
```

`games.list` names an operation; `games.read` names the authority required for it.
The gateway authenticates the installation and user, checks effective grants,
validates inputs and applies application ownership rules. Supplying a different
user ID in JSON does not change the caller.

The host imports the declared `module:function` entrypoint in a supervised worker.
Call `lifecycle.ready` and keep it alive. User actions execute in separate bounded
processes; an action's global variables are not a shared state store. Do durable
background work in the worker and expose short queue/status actions.

Runtime isolation depends on the deployment's available sandbox. Linux acceptance
uses actual process groups, resource limits and an isolation probe. Its explicitly
configured process-mode run does not claim bubblewrap isolation. Native frontend
modules have separate privileged browser authority; Python isolation does not
make native DOM access safe.

See [gateway details](../development/gateway.md), [background tasks](../development/background-tasks.md)
and [runtime security](../security/runtime.md). Never substitute a database import
or private HTTP call for a denied public operation.
