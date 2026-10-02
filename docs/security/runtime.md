# Runtime boundary and what plugins cannot do

The host runtime supervises Python workers and handler subprocesses, mediates
gateway requests, applies resource/network policy and gates execution on lifecycle
and grants. Bubblewrap may provide additional process isolation. The host can
explicitly allow reduced process isolation; this is a deployment policy, not a
manifest setting or a guarantee that arbitrary Python is safely sandboxed.

Plugins must not directly access host databases/files, import application models,
read core credentials, invent private gateway methods, replace permission checks,
or duplicate the host installer/runtime. Plugin-owned runtime data is limited to
the existing storage/secret contract. Outbound requests need a live grant and
runtime egress policy; an approved capability alone does not guarantee connectivity.

Sandboxed UI uses an opaque iframe and approved bridge. Native modules run in a
privileged browser context and require explicit review; do not describe them as
equivalent to an iframe sandbox. Backend routes remain authenticated and
installation-scoped even for a native plugin.

Use safe limits and sanitization for untrusted content. Document Viewer bundles
its readers and sanitizer, rejects active content and treats unsupported formats
as explicit errors. Secrets must not be echoed through UI/results/logs; follow
[secret recipes](../development/secrets.md).

When a public capability is missing, document the limitation and coordinate a
host change. Do not solve it by copying host code into a plugin.
