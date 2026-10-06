// Supplemental screenshots from the actual acceptance deployment. All API
// traffic is proxied to the real host; no response or installed state is seeded.
import assert from "node:assert/strict";
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
let browser, debugPage;
const errors = [], diagnostics = [];
try {
  browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const cookies = JSON.parse(await readFile(cookieFile, "utf8"));
  await context.addCookies(cookies.map(({ name, value }) => ({ name, value, url: origin })));
  assert.equal((await context.request.patch(origin + "/api/preferences", { data: { ui_welcome_completed: true } })).status(), 200);
  const seeds = JSON.parse(await readFile(process.argv[7], "utf8"));
  const page = await context.newPage(); debugPage = page;
  page.on("console", message => { if (["error", "warning"].includes(message.type())) diagnostics.push(message.text().slice(0, 500)); });
  page.on("pageerror", error => errors.push(String(error)));
  const screens = [];
  for (const theme of ["light", "dark"]) {
    assert.equal((await context.request.patch(origin + "/api/preferences", { data: { ui_theme: theme } })).status(), 200);
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
      const routes = [["cards", "Cards"], ["card-detail?record_id=" + seeds[0].card.id, "First Archive Quest"], ["sets", "Sets"], ["set-detail?record_id=" + seeds[0].set.id, "First classics"], ["bounties", "Bounties"], ["migration", "Collector's Archive"]];
      for (const [route, label] of routes) {
        await page.goto(origin + "/plugins/official.collectors-archive/" + route);
        await page.locator(".collector-archive").waitFor();
        await page.getByRole("heading", { name: route.startsWith("card-detail") ? new RegExp("^" + label) : label, exact: true }).first().waitFor({ timeout: 30000 });
        // A heading alone can appear while the library request is still in
        // flight. Capture loaded records, never a transient loading screen.
        await page.getByText(/^Loading(?:\.{3}|…)?$/).first().waitFor({state: "hidden", timeout: 60000});
        assert.equal(await page.locator(".collector-error:visible, .error:visible, .error-state:visible").count(), 0, route + ": visible load failure");
        if (route === "cards") await page.getByText("First Archive Quest", {exact: true}).first().waitFor({timeout: 60000});
        if (route === "sets") await page.getByText("First classics", {exact: true}).first().waitFor({timeout: 60000});
        await page.waitForTimeout(200);
        assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), theme);
        const boundary = await page.evaluate(() => ({ width: innerWidth, document: document.documentElement.scrollWidth }));
        assert.ok(boundary.document <= boundary.width + 1, route + ": overflow " + JSON.stringify(boundary));
        const filename = `${route.split("?")[0]}-${theme}-${width}.png`;
        await page.screenshot({ path: path.join(work, filename), fullPage: false });
        screens.push(filename);
      }
    }
  }
  assert.deepEqual(errors, [], "Native archive pages must have no browser exceptions");
  await writeFile(path.join(work, "native-ui-conformance.json"), JSON.stringify({ status: "passed", backend: "real", screens }, null, 2) + "\n");
  console.log("All six installed native pages passed light/dark desktop/phone and overflow checks");
} catch (error) {
  if (debugPage) { await debugPage.screenshot({ path: path.join(work, "native-ui-failure.png") }); console.error(errors, diagnostics.slice(-12), (await debugPage.locator("body").innerText()).slice(0, 1400)); }
  throw error;
} finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
