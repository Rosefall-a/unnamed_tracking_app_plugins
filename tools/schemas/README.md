# Plugin API v1 public schemas

These JSON Schemas were exported with Pydantic `model_json_schema()` from
`PluginManifest` and `PluginUiDocument` on the host's `feat/ui-ux-redevelopment`
branch for the explicit v1.1.0 contract (4 October 2026). The wire major remains
`v1`; manifests and UI documents both declare `api_contract_version: "1.1.0"`.
An absent declaration remains v1.0.0 and cannot execute on the new host.

They are validation contracts, not a second runtime or SDK. The local validator
also checks semantic versions, declaration uniqueness, executable handlers,
references and packaged release metadata. `tools/check_host_contract.py` checks
new packages against the actual host models and installation registry. When the
public contract changes, review and re-export both schemas, and run that check.
