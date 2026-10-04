// Supplemental screenshots from the actual acceptance deployment. All API
// traffic is proxied to the real host; no response or installed state is seeded.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { createServer, request as httpRequest } from "node:http";
import { createRequire } from "node:module";
import path from "node:path";

const [hostArgument, pluginsArgument, workArgument, backend, cookieFile] = process.argv.slice(2);
assert.ok(cookieFile, "Usage: capture_host_workflow.mjs <host> <plugins> <work> <backend> <temporary-cookies>");
const host = path.resolve(hostArgument);
const plugins = path.resolve(pluginsArgument);
const work = path.resolve(workArgument);
const frontend = path.join(host, "src/frontend/dist");
const require = createRequire(path.join(plugins, "package.json"));
const { chromium } = require("playwright");
const mime = { ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".html": "text/html" };
const server = createServer(async (incoming, outgoing) => {
  if (incoming.url.startsWith("/api/")) {
    const upstream = httpRequest(new URL(incoming.url, backend), {
      // This supplemental proxy reuses the backend's authenticated session.
      // Keep its canonical Host: session cookies are scoped to host and port.
      method: incoming.method, headers: { ...incoming.headers, host: new URL(backend).host },
    }, (response) => { outgoing.writeHead(response.statusCode, response.headers); response.pipe(outgoing); });
    upstream.on("error", () => { outgoing.writeHead(502); outgoing.end("Host unavailable"); });
    incoming.pipe(upstream);
    return;
  }
  let relative = decodeURIComponent(new URL(incoming.url, "http://localhost").pathname).replace(/^\//, "");
  if (!relative.startsWith("assets/")) relative = "index.html";
  const file = path.resolve(frontend, relative);
  if (!file.startsWith(frontend + path.sep)) { outgoing.writeHead(403); outgoing.end(); return; }
  try {
    outgoing.setHeader("Content-Type", mime[path.extname(file)] ?? "application/octet-stream");
    outgoing.end(await readFile(file));
  } catch { outgoing.writeHead(404); outgoing.end(); }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
const captures = [];
try {
  browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1050 } });
  const cookies = JSON.parse(await readFile(cookieFile, "utf8"));
  assert.ok(cookies.length, "Authenticated acceptance cookies are required");
  await context.addCookies(cookies.map(({ name, value }) => ({ name, value, url: origin })));
  const authenticated = await context.request.get(origin + "/api/auth/me");
  assert.equal(authenticated.status(), 200, "Capture proxy must retain the actual backend session");
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  const capture = async (filename, description) => {
    const file = path.join(work, filename);
    await page.screenshot({ path: file, fullPage: true });
    captures.push({ filename, description, sha256: createHash("sha256").update(await readFile(file)).digest("hex") });
  };
  await page.goto(origin + "/settings?section=plugins");
  const plugin = page.locator("article.plugin").filter({ has: page.getByRole("heading", { name: /^Jellyfin Media Sync(?: \(Demo\))?$/ }) });
  await plugin.getByText("running", { exact: true }).waitFor();
  await capture("installed-plugin.png", "Authenticated installed Jellyfin predecessor after denying a newly requested update scope.");
  await page.getByRole("button", { name: "Install a plugin", exact: true }).click();
  const install = page.getByRole("dialog", { name: "Install a plugin", exact: true });
  await install.waitFor();
  await capture("plugin-install.png", "Actual authenticated installer source chooser with live catalogue data.");
  await install.getByRole("button", { name: "Close", exact: true }).click();
  await plugin.getByRole("button", { name: "Manage plugin", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: /^Jellyfin Media Sync(?: \(Demo\))?$/ });
  await dialog.getByRole("button", { name: "Stop", exact: true }).waitFor();
  await capture("lifecycle-controls.png", "Actual authenticated lifecycle controls; predecessor remains enabled and healthy.");
  await dialog.getByRole("button", { name: "Settings", exact: true }).click();
  await dialog.getByRole("button", { name: "Roll back", exact: true }).first().waitFor();
  await capture("retained-versions.png", "Actual retained predecessors and automatic-update controls from real lifecycle acceptance.");
  await dialog.getByRole("button", { name: "Close plugin settings", exact: true }).click();
  await page.goto(origin + "/plugins/example.jellyfin-media-sync");
  await page.getByText("Jellyfin server URL", { exact: true }).waitFor();
  // Native configuration loads asynchronously through a real plugin action.
  // Capture the persisted response rather than the initial empty form.
  await page.waitForFunction(() => [...document.querySelectorAll("input")]
    .some((input) => input.value.startsWith("http://127.0.0.1:")));
  const masterCredential = page.getByLabel("Server credential · blank keeps existing");
  const legacyCredential = page.getByLabel("API key or access token (blank keeps existing token)");
  const credential = await masterCredential.count() ? masterCredential : legacyCredential;
  assert.equal(await credential.getAttribute("type"), "password");
  assert.equal(await credential.inputValue(), "");
  await capture("plugin-settings.png", "Actual configured Jellyfin native settings/UI; saved token is not returned to the input.");
  assert.deepEqual(errors, [], "Authenticated host browser errors");
  const revision = (repository) => {
    // A Windows worktree's gitdir cannot resolve inside a Linux bind mount.
    // Use only an explicit, valid revision read by the caller on that host.
    if (repository === host && /^[a-f0-9]{40}$/.test(process.env.JELLYFIN_HOST_REVISION || "")) return process.env.JELLYFIN_HOST_REVISION;
    return execFileSync("git", ["-C", repository, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  };
  await writeFile(path.join(work, "workflow-captures.json"), JSON.stringify({
    kind: "authenticated-real-host", captured_at: new Date().toISOString(),
    host_revision: revision(host), plugin_revision: revision(plugins),
    plugin_id: "example.jellyfin-media-sync", signing_identity: "integration-disposable", captures,
  }, null, 2) + "\n");
  console.log("Authenticated installer/installed/settings/UI/lifecycle/retained-version screenshots captured");
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
