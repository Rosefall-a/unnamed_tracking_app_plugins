import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const h = (tag, props, children) => children === undefined && (typeof props === "string" || Array.isArray(props))
  ? { tag, props: {}, children: props } : { tag, props: props || {}, children };
const all = tree => !tree || typeof tree !== "object" ? [] : [tree, ...[tree.children].flat(Infinity).flatMap(all)];

test("native example registers, invokes and removes shortcuts only through the public host", async () => {
  const source = await readFile(new URL("../examples/shortcut-playground/native/app.js", import.meta.url), "utf8");
  const { activate } = await import("data:text/javascript;base64," + Buffer.from(source).toString("base64"));
  const components = {}, bindings = new Map(), cleanup = [], navigation = [];
  activate({ pluginId: "example.shortcut-playground", vue: { h, ref: value => ({ value }), defineComponent: value => value },
    ui: { PageHeader: "PageHeader" }, onCleanup: callback => cleanup.push(callback),
    registerComponent: (id, component) => { components[id] = component; }, host: {
      registerShortcut(binding, callback) { bindings.set(binding.id, { binding, callback }); return () => bindings.delete(binding.id); },
      async navigate(path) { navigation.push(path); },
    } });
  assert.deepEqual(bindings.get("search-conflict").binding.keys, ["CtrlOrMeta+K"]);
  const render = components.playground.setup();
  const add = () => all(render()).find(item => item.children === "Add random shortcut").props.onClick();
  for (let index = 0; index < 6; index++) add();
  assert.equal(bindings.size, 6);
  assert.equal(new Set([...bindings.values()].map(item => item.binding.keys[0])).size, 6);
  assert.equal(all(render()).find(item => item.children === "Add random shortcut").props.disabled, true);
  await bindings.get("random-1").callback();
  assert.equal(navigation.at(-1), "/plugins/example.shortcut-playground/playground");
  assert(all(render()).some(item => item.props.role === "status" && item.children.includes("ran")));
  all(render()).find(item => item.props["aria-label"]?.startsWith("Remove random shortcut")).props.onClick();
  assert.equal(bindings.has("random-1"), false);
  assert.equal(bindings.size, 5);
  for (const stop of cleanup) stop();
  assert.equal(bindings.size, 0);
  assert(!source.includes("addEventListener"));
});
