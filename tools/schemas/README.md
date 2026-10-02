# Plugin API v1 public schemas

These JSON Schemas were exported with Pydantic `model_json_schema()` from
`PluginManifest` and `PluginUiDocument` on host `plugin-manager` revision
`17a184c176af846b23bc67e3d5d5324c26415cbe` (2 October 2026).

They are validation contracts, not a second runtime or SDK. The local validator
also checks semantic versions, declaration uniqueness, executable handlers,
references and packaged release metadata. `tools/check_host_contract.py` checks
new packages against the actual host models and installation registry. When the
public contract changes, review and re-export both schemas, and run that check.
