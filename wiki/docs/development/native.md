# Native frontend

## Goal and prerequisites

Render a reviewed Vue component with the supplied public context. Use a complete
plugin with `frontend.native` v1 approval, a declared `help` page, and any scoped
contribution grants needed for where it appears.

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

## Minimal module and manifest fragment

Save `native/hello.js` in your plugin:

```javascript
export function activate(context) {
  const { h, defineComponent } = context.vue;
  const component = defineComponent({
    setup() { return () => h("p", { class: "hello-plugin" }, "Hello from my plugin"); }
  });
  context.registerComponent("help", component);
  context.onCleanup(() => { /* Clear any listeners/timers you create here. */ });
}
```

```json
{"native_frontend": {"entry": "native/hello.js", "styles": []}}
```

The host owns mounting/unmounting declared surfaces. Your cleanup handles
resources you create. Help Button demonstrates timer disposal and guards against
updates after disposal. Scope CSS and avoid private application imports.

The context supplies the installed package `version`. Use it for version badges
instead of hard-coding a release number. `context.vue.onBeforeUnmount` disposes
component resources when a user leaves a page; `context.onCleanup` disposes
activation resources when the plugin is disabled or replaced. The official
Jellyfin preview uses both so account polling cannot survive either transition.

## Test command

```sh
node --test tests/native_frontends.test.mjs
python -m pytest tests/test_native_frontends.py tests/test_native_packages.py
```

## Expected result

Tests load actual maintained modules using the public context, exercise actions
and cleanup, and verify packaged declarations/assets. In an approved host the
page renders; disable removes the component and its resources.

## Common mistakes

Inventing context methods; omitting contribution/domain grants; requesting native
authority for a simple form; leaving timers alive; assuming DOM authority bypasses
backend ownership checks.
