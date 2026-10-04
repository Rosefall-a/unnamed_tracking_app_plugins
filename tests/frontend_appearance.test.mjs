import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";

test("opaque frontend appearance bridge trusts only its parent and versioned cosmetic snapshots", () => {
  const values = new Map();
  const classes = new Set();
  let listener;
  const parent = { postMessage: message => assert.equal(message.method, "plugin.theme") };
  const root = { style: { setProperty: (key, value) => values.set(key, value) }, dataset: {},
    classList: { toggle: (key, value) => value ? classes.add(key) : classes.delete(key) } };
  vm.runInNewContext(readFileSync(new URL("../sdk/frontend_appearance.js", import.meta.url), "utf8"), {
    crypto: { randomUUID: () => "request" }, document: { documentElement: root },
    window: { parent, addEventListener: (type, callback) => { listener = callback; } },
  });
  const appearance = { api_contract_version: "1.1.0", mode: "dark", high_contrast: true,
    tokens: { "--ui-bg": "#123456", "unrelated": "hidden" } };
  listener({ source: {}, data: { type: "plugin-appearance-changed", appearance } });
  assert.equal(values.size, 0);
  listener({ source: parent, data: { type: "plugin-appearance-changed", appearance: { ...appearance, api_contract_version: "1.0.0" } } });
  assert.equal(values.size, 0);
  listener({ source: parent, data: { type: "plugin-appearance-changed", appearance } });
  assert.equal(values.get("--ui-bg"), "#123456");
  assert.equal(values.has("unrelated"), false);
  assert.equal(root.dataset.theme, "dark");
  assert.equal(classes.has("high-contrast"), true);
  listener({ source: parent, data: { type: "plugin-api-response", requestId: "request", result: { ...appearance, mode: "light" } } });
  assert.equal(root.dataset.theme, "light");
});

test("opaque frame reports intrinsic content sizing without repeating unchanged requests", () => {
  const messages = [];
  let measure, height = 1200;
  const body = { getBoundingClientRect: () => ({ height }) };
  vm.runInNewContext(readFileSync(new URL("../sdk/frontend_appearance.js", import.meta.url), "utf8"), {
    crypto: { randomUUID: () => "request" }, document: { body },
    ResizeObserver: class { constructor(callback) { measure = callback; } observe(value) { assert.equal(value, body); } },
    window: { parent: { postMessage: message => messages.push(message) }, addEventListener() {} },
  });
  measure(); measure(); height = 800.3; measure();
  assert.equal(messages.filter(message => message.method === "plugin.resize").length, 2);
  assert.equal(messages.at(-1).payload.height, 801);
});

test("inline delivery starts frame measurement after the body is ready", () => {
  const events = new Map(), document = {}, messages = [];
  let measure;
  vm.runInNewContext(readFileSync(new URL("../sdk/frontend_appearance.js", import.meta.url), "utf8"), {
    crypto: { randomUUID: () => "request" }, document,
    ResizeObserver: class { constructor(callback) { measure = callback; } observe(value) { assert.equal(value, document.body); } },
    window: { parent: { postMessage: message => messages.push(message) }, addEventListener: (type, callback) => events.set(type, callback) },
  });
  assert.equal(measure, undefined);
  document.body = { getBoundingClientRect: () => ({ height: 1000 }) };
  events.get("DOMContentLoaded")(); measure();
  assert.equal(messages.at(-1).method, "plugin.resize"); assert.equal(messages.at(-1).payload.height, 1000);
});

test("HTTP previews without randomUUID still correlate cosmetic responses", () => {
  const messages = [], values = new Map();
  const parent = { postMessage: message => messages.push(message) };
  let listener;
  vm.runInNewContext(readFileSync(new URL("../sdk/frontend_appearance.js", import.meta.url), "utf8"), {
    crypto: {}, document: { documentElement: { style: { setProperty: (key, value) => values.set(key, value) }, dataset: {}, classList: { toggle() {} } } },
    window: { parent, addEventListener: (type, callback) => { listener = callback; } },
  });
  assert.match(messages[0].requestId, /^appearance-/);
  listener({ source: parent, data: { type: "plugin-api-response", requestId: messages[0].requestId,
    result: { api_contract_version: "1.1.0", mode: "light", tokens: { "--ui-bg": "#ffffff" } } } });
  assert.equal(values.get("--ui-bg"), "#ffffff");
});
