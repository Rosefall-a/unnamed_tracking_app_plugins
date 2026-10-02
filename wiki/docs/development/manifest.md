# Manifest and compatibility

`manifest.json` declares identity, version, entrypoint, compatibility,
capabilities, permissions, dependencies, UI identifiers, quota and integrity.
The [first-plugin manifest](../getting-started/first-plugin.md) is a complete
minimal example. The exported v1 schema is the field-level authority; the actual
host validates it again during installation.

## Extend a manifest deliberately

1. Identify the public operation you will invoke and its capability.
2. Add `{ "name": "plugin.settings", "version": 1 }` to `capabilities` when adding
   settings, and the same reference with a clear rationale to `permissions`.
3. Add UI section/action/page IDs to `ui`, and exactly matching IDs in `ui.json`.
4. Run source validation, build and full package validation. Missing handlers,
   unknown fields, mismatched UI IDs and undeclared action capabilities fail.

Do not add author-defined `risk` fields. Host risk classification is authoritative.
Distribution-only fields belong in `release.json`, not the manifest.

## Compatibility and dependencies

Use stable `MAJOR.MINOR.PATCH` versions. The host supports exact versions, `^1.0.0`,
`~1.0.0`, `1.x`, `*`, and comma-separated AND constraints such as
`>=1.0.0,<2.0.0`; npm-style spaces or `||` are not supported. Declare a range
tested against the capabilities and runtime behavior you actually use.

Dependencies are objects such as
`{"plugin_id": "org.example.helper", "version_range": "^1.0.0", "optional": false}`.
The host resolves them and reviews each plugin separately. A dependency does not
inherit another plugin's grants.

Keep `plugin_id` stable for updates; choose a namespace you control. An explicitly
higher source version overrides automatic selection. Otherwise existing
Conventional Commits determine the next version; see [versioning](../publishing/versioning.md).
Test old/new data formats before changing compatibility ranges.
