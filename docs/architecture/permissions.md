# Capabilities and permissions

A capability identifies an available host feature and its version. A permission
request declares why this plugin needs that feature. A grant is the host's
approved authority for an installation. These are three separate facts.

```json
{
  "capabilities": [{"name": "games.read", "version": 1}],
  "permissions": [{
    "capability": {"name": "games.read", "version": 1},
    "rationale": "Count the signed-in user's games when requested."
  }]
}
```

This is a manifest fragment, not a complete package. Declaring it does not grant
access. The host starts from default deny and checks grants on operations and UI
contributions. It also supplies the risk classification: authors cannot add a
`risk` field to downgrade native or administrative authority.

Request domain permissions and UI contributions individually. A sidebar grant
does not grant game data. `frontend.native` does not grant backend administration.
An active signing identity does not grant either. Installation and update reviews
show rationales, risk groups and newly requested scopes.

An ordinary update may use existing approvals. A release requesting a new scope
must wait for explicit approval; denial keeps the predecessor active. Test this
with the real authenticated host suite, as described in [conformance](../testing/lifecycle.md).
