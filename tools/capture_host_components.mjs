// Render the actual host Vue components. API replies are fixtures: these
// screenshots document controls, never authenticated lifecycle enforcement.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [hostArgument, outputArgument] = process.argv.slice(2);
if (!hostArgument) throw new Error("Usage: node tools/capture_host_components.mjs <host-root> [output-directory]");
const host = path.resolve(hostArgument);
const output = path.resolve(outputArgument ?? path.join(root, ".validation/host-component-captures"));
const frontend = path.join(host, "src/frontend");
const hostRequire = createRequire(path.join(frontend, "package.json"));
const require = createRequire(path.join(root, "package.json"));
const { createServer } = await import(pathToFileURL(hostRequire.resolve("vite")));
const { default: vue } = await import(pathToFileURL(hostRequire.resolve("@vitejs/plugin-vue")));
const { chromium } = require("playwright");
const fsUrl = (file) => "/@fs/" + file.replaceAll("\\", "/");
await mkdir(path.join(root, ".validation"), { recursive: true });
await mkdir(output, { recursive: true });
const temporary = await mkdtemp(path.join(root, ".validation/capture-"));
const entry = JSON.parse(await readFile(path.join(root, "list.json"), "utf8")).plugins
  .find((plugin) => plugin.plugin_id === "example.ui-api");
const sourceUi = JSON.parse(await readFile(path.join(root, "examples/ui-api/ui.json"), "utf8"));
// The real host model supplies empty defaults when normalizing a UI document.
const document = { tables: [], dialogs: [], menus: [], ...sourceUi,
  pages: sourceUi.pages.map((page) => ({ settings: [], actions: [], tables: [], dialogs: [], ...page })) };
await writeFile(path.join(temporary, "index.html"), `<!doctype html><html><head><meta charset="utf-8"></head>
<body><p class="capture-label">Actual host component preview · fixture data · no authenticated backend</p>
<main id="app"></main><script type="module" src="/main.js"></script></body></html>`);
await writeFile(path.join(temporary, "main.js"), `import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import Manager from ${JSON.stringify(fsUrl(path.join(frontend, "src/components/settings/PluginManagerSection.vue")))};
import PluginUiHost from ${JSON.stringify(fsUrl(path.join(frontend, "src/components/plugins/PluginUiHost.vue")))};
import ${JSON.stringify(fsUrl(path.join(frontend, "src/style.css")))};
import ${JSON.stringify(fsUrl(path.join(frontend, "src/styles/ui.css")))};
const isUi=location.pathname === "/plugin-ui";
const router=createRouter({history:createWebHistory(),routes:[{path:"/:pathMatch(.*)*",component:Manager}]});
createApp(isUi ? PluginUiHost : Manager, isUi ? {document:${JSON.stringify(document)}} : {}).use(router).mount("#app");
const style=document.createElement("style"); style.textContent="body{padding:32px;max-width:1120px;margin:auto} .capture-label{color:#aaa;border-bottom:1px solid #444;padding-bottom:16px} #app{width:100%}"; document.head.append(style);`);
const installed = {
  plugin_id: entry.plugin_id, name: entry.name, version: entry.version,
  description: entry.description, status: "running", compatible: true,
  compatibility_reason: "", health: "healthy", enabled: true,
  permissions: entry.capabilities.map((cap) => cap.name),
  granted_capabilities: entry.capabilities.map((cap) => cap.name),
  effective_capabilities: entry.capabilities.map((cap) => cap.name),
  publisher: entry.publisher, tags: entry.tags, automatic_updates: "follow", icon: null,
  history: [{ id: "11111111-1111-4111-8111-111111111111", version: "1.0.0", digest: "a".repeat(64) }],
};
const fixtures = new Map([
  ["/api/plugins", [installed]],
  ["/api/plugins/catalogues", [{ id: "official", name: "Official", url: "https://example.invalid/list.json", enabled: true, priority: 1 }]],
  ["/api/plugins/catalog", [{ ...entry, icon: null }]],
  ["/api/plugins/runtime/health", { bubblewrap_available: null, sandbox_available: false, reduced_isolation_allowed: false, mechanism: "fixture", available: false }],
  ["/api/plugins/manager-settings", { automatic_updates: false, retained_versions: 1 }],
  [`/api/plugins/${entry.plugin_id}/ui`, { ...document, values: { display_mode: "compact" } }],
  [`/api/plugins/${entry.plugin_id}/logs`, { plugin_id: entry.plugin_id, status: "running", last_exit_code: null, events: [] }],
  ["/api/plugin-permissions/grants", []], ["/api/plugin-permissions/requests", []],
]);
const server = await createServer({
  configFile: false, root: temporary, plugins: [vue()],
  resolve: { alias: { vue: hostRequire.resolve("vue/dist/vue.esm-bundler.js"),
                       "vue-router": hostRequire.resolve("vue-router/dist/vue-router.mjs") } },
  server: { host: "127.0.0.1", port: 0, fs: { allow: [temporary, frontend] } },
});
let browser;
const captures = [];
try {
  await server.listen();
  const origin = server.resolvedUrls.local[0];
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, colorScheme: "dark" });
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.route("**/api/**", async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    assert.equal(route.request().method(), "GET", "Capture must not mutate lifecycle state");
    assert.ok(fixtures.has(pathname), `Unexpected fixture request ${pathname}`);
    await route.fulfill({ json: fixtures.get(pathname) });
  });
  const capture = async (filename, description) => {
    await page.screenshot({ path: path.join(output, filename), fullPage: true });
    captures.push({ filename, description, sha256: createHash("sha256").update(await readFile(path.join(output, filename))).digest("hex") });
  };
  await page.goto(origin);
  await page.getByRole("heading", { name: entry.name, exact: true }).waitFor();
  await capture("installed-plugin-component.png", "Actual Plugin Manager installed card; status/grants are fixture data.");
  const acquisitionLabel = await page.getByRole("button", { name: "Install package or URL", exact: true }).count() ? "Install package or URL" : "Install a plugin";
  await page.getByRole("button", { name: acquisitionLabel, exact: true }).click();
  await page.getByRole("dialog", { name: acquisitionLabel, exact: true }).waitFor();
  await capture("plugin-install-component.png", "Actual installer source chooser: upload, URL and catalogue; no install executed.");
  await page.getByRole("dialog", { name: acquisitionLabel, exact: true }).getByRole("button", { name: "Close dialog", exact: true }).click();
  await page.getByRole("button", { name: "Settings & access", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: entry.name, exact: true });
  await dialog.getByRole("button", { name: "Stop", exact: true }).waitFor();
  await capture("lifecycle-controls-component.png", "Actual stop/disable/reinstall/purge/uninstall controls; no operation executed.");
  await dialog.getByRole("button", { name: "Settings", exact: true }).click();
  await dialog.getByRole("button", { name: "Roll back", exact: true }).waitFor();
  await capture("retained-versions-component.png", "Actual retained-version and automatic-update controls with fixture history.");
  await page.goto(origin + "plugin-ui");
  await page.getByText("Display mode", { exact: true }).waitFor();
  await capture("plugin-settings-component.png", "Actual declarative UI/API configuration form and action; no save/action executed.");
  assert.deepEqual(errors, [], "Host component runtime errors");
  const provenance = {
    kind: "actual-host-components-with-fixture-api", captured_at: new Date().toISOString(),
    host_revision: execFileSync("git", ["-C", host, "rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
    plugin_revision: execFileSync("git", ["-C", root, "rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
    plugin_id: entry.plugin_id, plugin_version: entry.version, captures,
  };
  await writeFile(path.join(output, "host-components.json"), JSON.stringify(provenance, null, 2) + "\n");
  console.log(`Captured ${captures.length} actual host component views at ${output}`);
} finally {
  await browser?.close();
  await server.close();
  assert.ok(temporary.startsWith(path.join(root, ".validation/capture-")));
  await rm(temporary, { recursive: true, force: true });
}
