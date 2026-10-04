// Public native Plugin API v1.1 SDK. Document rendering remains in its opaque iframe.
export function activate(context) {
  const { defineComponent, h, ref, onBeforeUnmount } = context.vue;
  context.registerComponent("reader-settings", defineComponent({
    setup() {
      const limit = ref(0), busy = ref(true), message = ref(""), error = ref("");
      let disposed = false;
      onBeforeUnmount(() => { disposed = true; });
      async function load() {
        busy.value = true; error.value = "";
        try {
          const result = await context.host.runAction("load-settings");
          if (!disposed) limit.value = Number(result.value) || 0;
        } catch { if (!disposed) error.value = "Viewer settings could not load. Try again."; }
        finally { if (!disposed) busy.value = false; }
      }
      async function save(event) {
        event.preventDefault(); error.value = ""; message.value = "";
        const value = Number(limit.value);
        if (!Number.isSafeInteger(value) || value < 0) { error.value = "Use a whole number of MiB, or 0 for unlimited."; return; }
        busy.value = true;
        try {
          await context.host.saveSettings({ max_preview_mb: value });
          if (!disposed) message.value = "Viewer settings saved.";
        } catch { if (!disposed) error.value = "Viewer settings could not save. Try again."; }
        finally { if (!disposed) busy.value = false; }
      }
      void load();
      return () => h("section", { class: "document-reader-settings", "data-native-document-settings": "true", "aria-label": "Document reader settings" }, [
        h("h2", "Document reader settings"),
        h("p", "Choose the server preview limit. Original downloads remain available; unsupported active content stays blocked."),
        h("form", { onSubmit: save }, [
          h("label", ["Maximum preview size (MiB)", h("input", { type: "number", min: 0, step: 1,
            value: limit.value, disabled: busy.value, onInput: event => { limit.value = event.target.value; } })]),
          h("p", { class: "document-reader-hint" }, "0 means unlimited. Browser memory and renderer limits still apply."),
          h("div", { class: "document-reader-actions" }, [
            h("button", { type: "submit", class: "ui-btn ui-btn-primary", disabled: busy.value }, busy.value ? "Saving…" : "Save viewer settings"),
            h("button", { type: "button", class: "ui-btn ui-btn-ghost", disabled: busy.value, onClick: load }, "Reload settings"),
            h("button", { type: "button", class: "ui-btn ui-btn-ghost", onClick: () => context.host.navigate(`/plugins/${context.pluginId}/documents`) }, "Open document browser"),
          ]),
        ]),
        error.value ? h("p", { role: "alert", class: "document-reader-error" }, error.value) : null,
        message.value ? h("p", { role: "status" }, message.value) : null,
      ]);
    },
  }));
}
