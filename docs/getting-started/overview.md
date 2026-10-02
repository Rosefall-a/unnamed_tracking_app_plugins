# What is a plugin?

A plugin is a manifest plus Python behavior, optionally with declarative UI or
bundled browser assets. Its installable form is a `.utp`: the existing v1 ZIP
package with `manifest.json` and a `payload/` tree. Python is packaged as source;
there is no separate compiled runtime or alternative package manager.

For example, Playtime Report asks the gateway for the authenticated user's
library, calculates totals and saves a user-scoped report in plugin storage.
The host supplies the data and persistence; the plugin supplies the calculation.

The host inspects the package, verifies integrity and signing, resolves
compatibility/dependencies, reviews permissions, starts supervised workers and
gates every action. Your code must not import the application's database or
private modules. Missing public functionality requires a host API change.

## Choose a starting point

1. Use the [first-plugin tutorial](first-plugin.md) for a minimal declarative action.
2. Use [UI/API](../examples/index.md) for a small settings/page example.
3. Use a real demo only when you need its capabilities: reports, metadata,
   notifications, documents, sessions or background integration.

API v1 support alone does not guarantee all newer capabilities exist on an old
host. Test the actual Plugin Manager build you support and declare compatibility
accordingly. CI checks the actual host `plugin-manager` branch as well as the
exported manifest/UI schemas.
