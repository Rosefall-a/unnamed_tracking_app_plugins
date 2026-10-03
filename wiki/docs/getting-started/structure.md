# Repository structure

```text
examples/<name>/        functional reference and demo plugins
  manifest.json        runtime, permissions and compatibility
  plugin.py            implementation using sdk.plugin_protocol
  README.md            release-specific user/developer instructions
  release.json         publisher label, notes, tags, icon and update policy
  ui.json              declared actions/settings/pages, when needed
  frontend/            optional sandboxed browser bundle
  native/              optional privileged Vue module
official/<name>/        maintained features and clearly labelled previews; same layout
sdk/                   public protocol helper
tools/                 builder, validators, exported schemas, host checks
tests/                 Python, package/release and browser tests
publishers/            reviewed verification registry and public keys
wiki/docs/             wiki, screenshots and historical reports
dist/                  generated immutable installable .utp versions
releases/              generated append-only history, including retired plugins
catalogue.json         authored name and HTTPS hosting base
list.json              generated current catalogue and per-plugin histories
wiki/mkdocs.yml         wiki navigation/theme and strict link validation
mkdocs.yml             repository-root entry point inheriting the wiki configuration
```

`examples/` and `official/` are the source roots used by the same builder,
validators and host acceptance. Categories grant no additional permissions.
Complete third-party repositories can use the same layout without
joining the official catalogue. There is no `examples.old/` fallback discovery.
Incomplete source directories fail validation rather than silently disappearing.

`dist/` is not an authoring directory. Do not edit ZIPs, rewrite an old package,
or delete historical versions to tidy the tree. `releases/` records exact
manifest, permissions, hashes, signing, documentation and policy for each version.
`list.json` is generated from those package snapshots. GitHub Releases presents
and distributes the same outputs; it does not replace repository history.

The [cleanup audit](../history/ecosystem-audit.md) explains which source remnants
were retired and which catalogue-backed sources were restored.
