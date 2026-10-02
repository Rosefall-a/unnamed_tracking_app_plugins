# Native frontend

Native modules execute in the host Vue context and require `frontend.native`.
They are a privileged opt-in, classified by the host. Choose this mode only when
reviewed application integration needs it.

1. Declare `native_frontend` with an entry under `native/` and optional local styles.
2. Add `frontend.native` and matching permissions plus the scoped contribution
   grants (for example `frontend.settings`).
3. Export `activate(context)` using the host-supplied Vue/components/bridge APIs.
4. Return cleanup that unmounts components, clears timers and removes listeners.
5. Scope CSS to your plugin classes. Test activation, reactivation, denial and cleanup.

Help Button and Jellyfin show native actions, Settings/navigation and lifecycle
cleanup; Session Manager shows account/admin components, confirmation and maps.
Read their actual `native/` modules before selecting host APIs; do not invent
context methods or import private host frontend files.

Native authority includes DOM/browser access. Scoped backend grants remain
independently enforced. A critical native grant is not a substitute for session,
document or other domain permissions. Where practical, retain a declarative or
sandboxed experience when native permission is declined.
