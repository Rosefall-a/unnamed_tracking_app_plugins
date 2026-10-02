# Versioning and automatic-update policy

There is one versioning system: the existing source fingerprint and Conventional
Commit policy. The fingerprint includes manifest declarations (excluding generated
integrity/version), source, SDK, README and release inputs.

| Changed source commit | Existing bump |
| --- | --- |
| `fix:` or other changes | Patch |
| `feat:` / `feat(scope):` | Minor |
| `type!:` / breaking-change footer | Major |
| No fingerprint change | Reuse exact published package |
| Explicit higher manifest version | Preserve author override |

Shared SDK changes release every consumer; independent source changes release
only that plugin. Full Git history is required. Source moves also check the
previous recorded path, while historical package provenance stays immutable.
Make squash subjects meaningful. Generated-only commits do not create a second
version bump.

`automatic_update` is **release-specific**, stored in the signed payload and
history. `null` selects the builder default: false for major bumps, true otherwise.
Explicit false opts that version out; a later patch can opt in independently.
Do not edit old flags or treat opt-out as a permanent plugin property.

Eligibility is not authorization. The host still checks its own automatic-update
setting, signing trust, compatibility, dependencies, permission changes, major
crossings and healthy activation. Test false→true releases and newly requested
scopes with real-host acceptance before advertising support.
