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

async function fixture(name, respond = () => ({}), entry = "app.js", ui = {}) {
  const source = await readFile(new URL(`../examples/${name}/native/${entry}`, import.meta.url), "utf8");
  const { activate } = await import("data:text/javascript;base64," + Buffer.from(source).toString("base64"));
  const components = {}, cleanup = [], calls = [], timers = new Map();
  const originalTimeout = global.setTimeout, originalClear = global.clearTimeout;
  global.setTimeout = fn => { const id = timers.size + 1; timers.set(id, fn); return id; };
  global.clearTimeout = id => timers.delete(id);
  const host = {
    async runAction(id, values = {}) { calls.push([id, values]); return respond(id, values); },
    async saveSettings(values) { calls.push(["settings", values]); return respond("settings", values); },
    async navigate(path) { calls.push(["navigate", path]); },
    openDialog(id) { calls.push(["dialog", id]); },
  };
  activate({ pluginId: `example.${name}`, ui, vue: { h, ref: value => ({ value }), reactive: x => x, defineComponent: x => x,
    onBeforeUnmount: fn => cleanup.push(fn) },
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

test("Jellyfin administrator configuration clears credential and keeps profile separate", async () => {
  const f = await fixture("jellyfin-media-sync", id => id === "get-config"
    ? { is_admin: true, host_user_id: "host-user", master: { server_url: "https://jf.example", sync_interval_minutes: 30, libraries: [], users: [] }, profile: { user_id: "a".repeat(32) }, users: [] }
    : id === "status" ? { phase: "syncing", processed: 100, conflicts: 2 }
    : { ok: true, message: "Saved" });
  try {
    const render = f.components.sync.setup({ host: f.host });
    await flush();
    const find = id => all(render()).find(x => x.props.id === id);
    assert.equal(find("jf-server_url").props.value, "https://jf.example");
    find("jf-token").props.onInput({ target: { value: "SECRET-token" } });
    await all(render()).find(x => x.tag === "button" && x.children === "Save server").props.onClick();
    const saved = f.calls.find(x => x[0] === "save-master")[1];
    assert.equal(saved.api_key, "SECRET-token");
    assert(!("user_id" in saved));
    assert.equal(find("jf-token").props.value, "");
    assert(JSON.stringify(render()).includes("2 conflicts"));
    f.close(); assert.equal(f.timers.size, 0);
  } finally { f.close(); }
});

test("Jellyfin regular user has identity controls and no server credential input", async () => {
  const f = await fixture("jellyfin-media-sync", id => id === "get-config" ? { is_admin: false, profile: {}, users: [], host_user_id: "host-user" } : {});
  try {
    const render = f.components.sync.setup({ host: f.host }); await flush();
    assert(!all(render()).some(x => x.props.id === "jf-token" || x.props.id === "jf-server_url"));
    assert(JSON.stringify(render()).includes("approve your identity"));
  } finally { f.close(); }
});

test("Jellyfin Watch Now renders exact token-free destination and handles missing mapping", async () => {
  const f = await fixture("jellyfin-media-sync", () => ({ ok: true, url: "https://jf.example/web/index.html#!/details?id=123" }));
  try {
    const render = f.components.watch.setup({ host: f.host }); await flush();
    const link = all(render()).find(x => x.tag === "a");
    assert.equal(link.props.href, "https://jf.example/web/index.html#!/details?id=123");
    assert.equal(link.props.rel, "noopener noreferrer");
  } finally { f.close(); }
  const missing = await fixture("jellyfin-media-sync", () => ({ ok: false, error: "No mapping" }));
  try {
    const render = missing.components.watch.setup({ host: missing.host }); await flush();
    assert(!all(render()).some(x => x.tag === "a"));
    assert(JSON.stringify(render()).includes("No mapping"));
  } finally { missing.close(); }
});

test("Jellyfin denied operation shows useful failure and cleans up timers", async () => {
  const f = await fixture("jellyfin-media-sync", () => { throw new Error("denied"); });
  try {
    const render = f.components.sync.setup({ host: f.host }); await flush();
    await all(render()).find(x => x.tag === "button" && x.children === "Sync now").props.onClick();
    assert(all(render()).some(x => x.props.role === "status" && String(x.children).includes("Operation failed")));
    f.close(); assert.equal(f.timers.size, 0);
  } finally { f.close(); }
});

test("Document settings load, validate and save through the public native SDK", async () => {
  const f = await fixture("scoped-document-viewer", id => id === "load-settings" ? { value: 8 } : {}, "settings.js");
  try {
    const render = f.components["reader-settings"].setup();
    await flush();
    const input = () => all(render()).find(x => x.tag === "input");
    const submit = () => all(render()).find(x => x.tag === "form").props.onSubmit({ preventDefault() {} });
    assert.equal(input().props.value, 8);
    input().props.onInput({ target: { value: "-1" } });
    await submit();
    assert(all(render()).some(x => x.props.role === "alert" && String(x.children).includes("whole number")));
    assert(!f.calls.some(x => x[0] === "settings"));
    input().props.onInput({ target: { value: "12" } });
    await submit();
    assert.deepEqual(f.calls.find(x => x[0] === "settings"), ["settings", { max_preview_mb: 12 }]);
    assert(all(render()).some(x => x.props.role === "status" && x.children === "Viewer settings saved."));
    await all(render()).find(x => x.tag === "button" && x.children === "Open document browser").props.onClick();
    assert(f.calls.some(x => x[0] === "navigate" && x[1].endsWith("/documents")));
  } finally { f.close(); }
});

test("Document settings recover from errors and ignore responses after unmount", async () => {
  let fail = true, release;
  const f = await fixture("scoped-document-viewer", id => {
    if (fail) throw new Error("unavailable");
    if (id === "load-settings") return new Promise(resolve => { release = resolve; });
    return {};
  }, "settings.js");
  try {
    const render = f.components["reader-settings"].setup();
    await flush();
    assert(all(render()).some(x => x.props.role === "alert" && String(x.children).includes("could not load")));
    await all(render()).find(x => x.tag === "form").props.onSubmit({ preventDefault() {} });
    assert(all(render()).some(x => x.props.role === "alert" && String(x.children).includes("could not save")));
    fail = false;
    const pending = all(render()).find(x => x.tag === "button" && x.children === "Reload settings").props.onClick();
    f.close(); release({ value: 99 }); await pending;
    assert.equal(all(render()).find(x => x.tag === "input").props.value, 0);
    assert(!all(render()).some(x => x.props.role === "status"));
  } finally { f.close(); }
});


test("Demo Jellyfin uses the shared replacement password box and clears saved credentials", async () => {
  const PasswordInput = { name: "PasswordInput" };
  const f = await fixture("jellyfin-media-sync", id => id === "get-config" ? {is_admin: true, master: {}, profile: {}, users: []} : {}, "app.js", {PasswordInput});
  try {
    const render = f.components.sync.setup({host: f.host}); await flush();
    const password = () => all(render()).find(x => x.tag === PasswordInput);
    assert.equal(password().props.mode, "replace");
    password().props["onUpdate:modelValue"]("DisposableCredential");
    await all(render()).find(x => x.tag === "button" && x.children === "Save server").props.onClick();
    assert.equal(f.calls.find(x => x[0] === "save-master")[1].api_key, "DisposableCredential");
    assert.equal(password().props.modelValue, "");
  } finally { f.close(); }
});
