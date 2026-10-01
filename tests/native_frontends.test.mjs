import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

function h(tag, props, children) {
  if (children === undefined && (Array.isArray(props) || typeof props === "string")) return { tag, props: {}, children: props };
  return { tag, props: props || {}, children };
}
function all(tree) {
  if (!tree || typeof tree !== "object") return [];
  return [tree, ...[tree.children].flat(Infinity).flatMap(all)];
}
const flush = () => new Promise(resolve => setImmediate(resolve));

async function fixture(name, respond = () => ({})) {
  const source = await readFile(new URL(`../examples/${name}/native/app.js`, import.meta.url), "utf8");
  const { activate } = await import("data:text/javascript;base64," + Buffer.from(source).toString("base64"));
  const components = {}, cleanup = [], calls = [], timers = new Map();
  const originalTimeout = global.setTimeout, originalClear = global.clearTimeout;
  global.setTimeout = fn => { const id = timers.size + 1; timers.set(id, fn); return id; };
  global.clearTimeout = id => timers.delete(id);
  const host = {
    async runAction(id, values = {}) { calls.push([id, values]); return respond(id, values); },
    async saveSettings(values) { calls.push(["settings", values]); },
    async navigate(path) { calls.push(["navigate", path]); },
    openDialog(id) { calls.push(["dialog", id]); },
  };
  activate({ pluginId: `example.${name}`, vue: { h, ref: value => ({ value }), reactive: x => x, defineComponent: x => x },
    host, registerComponent: (id, component) => { components[id] = component; }, onCleanup: fn => cleanup.push(fn) });
  await flush();
  return { components, calls, timers, host, close() {
    for (const fn of cleanup) fn();
    global.setTimeout = originalTimeout; global.clearTimeout = originalClear;
  } };
}

test("Help surfaces, actions, toast and lifecycle cleanup", async () => {
  const f = await fixture("help-button", id => ({ sent: id === "notify" }));
  try {
    assert.deepEqual(Object.keys(f.components), ["help", "floating", "home-card"]);
    const render = f.components.help.setup({ pageId: "help", host: f.host });
    const buttons = () => all(render()).filter(x => x.tag === "button");
    buttons().find(x => x.children === "Open host dialog").props.onClick();
    assert.deepEqual(f.calls[0], ["dialog", "help-modal"]);
    buttons().find(x => x.children === "Show demo toast").props.onClick();
    assert(all(render()).some(x => x.props.role === "status" && String(x.children).includes("Demo toast")));
    await buttons().find(x => x.children === "Send notification").props.onClick();
    assert(f.calls.some(x => x[0] === "notify"));
    const home = f.components["home-card"].setup({ pageId: "home-card", host: f.host });
    all(home()).find(x => x.tag === "button").props.onClick();
    assert(f.calls.some(x => x[1] === "/plugins/example.help-button/showcase"));
    f.close(); assert.equal(f.timers.size, 0);
  } finally { f.close(); }
});

test("Jellyfin loads settings, saves typed values and clears the secret", async () => {
  const f = await fixture("jellyfin-media-sync", id => id === "get-config"
    ? { server_url: "https://jf.example", user_id: "a".repeat(32), background_sync: true, sync_interval_minutes: 30 }
    : id === "status" ? { phase: "syncing", processed: 100, total: 205 }
    : { ok: true, message: "Saved", media: [] });
  try {
    const render = f.components.sync.setup({ host: f.host });
    await flush();
    const find = id => all(render()).find(x => x.props.id === id);
    assert.equal(find("jf-server_url").props.value, "https://jf.example");
    find("jf-token").props.onInput({ target: { value: "SECRET-token" } });
    await all(render()).find(x => x.tag === "button" && x.children === "Save configuration and token").props.onClick();
    assert.deepEqual(f.calls.find(x => x[0] === "save-token"), ["save-token", { api_key: "SECRET-token" }]);
    assert(!("api_key" in f.calls.find(x => x[0] === "settings")[1]));
    assert.equal(find("jf-token").props.value, "");
    const progress = all(render()).find(x => x.tag === "progress");
    assert.equal(progress.props.value, 100); assert.equal(progress.props.max, 205);
    assert.equal(progress.props["aria-label"], "Movies processed");
    f.close(); assert.equal(f.timers.size, 0);
  } finally { f.close(); }
});

test("Jellyfin denied gateway operation shows useful UI failure", async () => {
  const f = await fixture("jellyfin-media-sync", () => { throw new Error("denied"); });
  try {
    const render = f.components.sync.setup({ host: f.host });
    await flush();
    const queue = all(render()).find(x => x.tag === "button" && x.children === "Queue sync now");
    await queue.props.onClick();
    assert(all(render()).some(x => x.props.role === "status" && String(x.children).includes("Operation failed")));
    f.close(); assert.equal(f.timers.size, 0);
  } finally { f.close(); }
});
