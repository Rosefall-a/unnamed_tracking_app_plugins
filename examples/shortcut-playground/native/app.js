// Requires Plugin API/SDK v1.1.x and explicit frontend.native + frontend.shortcuts consent.
export function activate(context) {
  const { h, ref, defineComponent } = context.vue;
  const bindings = ref([]), message = ref("Try adding a random shortcut.");
  const stops = new Map();
  let nextId = 1;
  const path = `/plugins/${context.pluginId}/playground`;
  const conflictStop = context.host.registerShortcut({
    id: "search-conflict", label: "Intentional Search conflict", group: "Shortcut playground", keys: ["CtrlOrMeta+K"],
  }, async () => { message.value = "You resolved the Search conflict and ran the example binding."; await context.host.navigate(path); });
  function add() {
    if (bindings.value.length >= 5) return;
    const unused = [..."ABCDEFGHILMOQRSUVWXYZ"].filter(letter => !bindings.value.some(item => item.letter === letter));
    const letter = unused[Math.floor(Math.random() * unused.length)];
    const id = `random-${nextId++}`, keys = [`Alt+Shift+${letter}`];
    const stop = context.host.registerShortcut({ id, label: `Random shortcut ${letter}`, group: "Shortcut playground", keys }, async () => {
      message.value = `Random shortcut ${letter} ran. Any personal remapping is handled by the host.`;
      await context.host.navigate(path);
    });
    stops.set(id, stop);
    bindings.value = [...bindings.value, { id, keys, letter }];
    message.value = "The new binding is available in shortcut help and settings.";
  }
  function remove(id) {
    stops.get(id)?.(); stops.delete(id);
    bindings.value = bindings.value.filter(item => item.id !== id);
    message.value = "The binding was removed from dispatch, help and settings.";
  }
  context.onCleanup(() => { conflictStop(); for (const stop of stops.values()) stop(); stops.clear(); });
  context.registerComponent("playground", defineComponent({ setup() {
    return () => h("section", { class: "shortcut-playground" }, [
      h(context.ui.PageHeader, { title: "Shortcut playground", subtitle: "EXAMPLE PLUGIN · API v1.1.x" }),
      h("p", "These are host-managed shortcuts, not private key listeners. You can enable, disable and remap them in your personal settings."),
      h("aside", { class: "shortcut-demo-conflict" }, [
        h("strong", "Intentional Ctrl/Cmd + K conflict"),
        h("p", "The oldest enabled shortcut keeps these keys. This example starts disabled when Search owns them, with a notice linking to its key editor. Remap it, or disable Search and enable this binding. Re-enabling Search later cannot take the keys back."),
      ]),
      h("div", { class: "shortcut-demo-actions" }, [
        h("button", { type: "button", class: "ui-btn ui-btn-primary", disabled: bindings.value.length >= 5, onClick: add }, "Add random shortcut"),
        h("button", { type: "button", class: "ui-btn ui-btn-ghost", onClick: () => context.host.navigate("/settings?section=shortcuts") }, "Edit shortcut settings"),
      ]),
      h("ul", bindings.value.map(item => h("li", { key: item.id }, [
        h("span", [h("strong", `Random shortcut ${item.letter}`), h("kbd", item.keys[0].replaceAll("+", " + "))]),
        h("button", { type: "button", class: "ui-btn ui-btn-ghost", onClick: () => remove(item.id), "aria-label": `Remove random shortcut ${item.letter}` }, "Remove"),
      ]))),
      h("p", { role: "status" }, message.value),
      h("p", { class: "shortcut-demo-hint" }, "Removing or disabling this plugin removes every binding. No shortcut runs while you type or use a dialog."),
    ]);
  } }));
}
