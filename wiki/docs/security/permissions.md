# Default deny and host-owned risk

The host grants only approved capabilities and checks them on every operation.
Manifest declarations, catalogue membership and UI visibility do not establish
authorization. The host owns risk classification, hierarchical grant semantics,
authenticated identity, permission deltas, elevated reauthentication and lifecycle
gating. Authors cannot mark a risky permission safe in package metadata.

Review separate read/destructive scopes and rationales. Do not replace a denied
narrow grant with `api.full`. Full API access can read and modify all user data;
native frontend authority runs inside the host browser realm. Use these only
where the host's explicit policy and administrator review permit them.

## Test the denied path

Decline a permission during install, or revoke it on a disposable enabled plugin.
The action should fail safely, the UI should explain the denial, and no alternate
private route should run. New permissions in an update must require review;
automatic eligibility cannot grant them. Confirm that disabled/unhealthy plugins
cannot dispatch actions/routes or serve privileged assets.

Third-party catalogue registration is independent of publisher-key registration
and approval. Trust the reviewed signing identity separately, then review each
package's behavior and requested authority.
