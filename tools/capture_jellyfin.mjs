/** Capture the installed plugin in the actual host frontend during acceptance. */
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const hostRoot = process.env.JELLYFIN_HOST_ROOT;
const work = process.env.INTEGRATION_WORK_ROOT;
const output = process.env.JELLYFIN_SCREENSHOT_DIR;
const config = path.join(work, "screenshots-vite.config.mjs");
const port = Number(process.env.JELLYFIN_FRONTEND_PORT);
await mkdir(output, { recursive: true });
await writeFile(config, `import base from ${JSON.stringify(path.join(hostRoot, "src/frontend/vite.config.ts"))};\nexport default { ...base, root: ${JSON.stringify(path.join(hostRoot, "src/frontend"))}, server: { host: "127.0.0.1", port: ${port}, strictPort: true, proxy: { "/api": { target: ${JSON.stringify(process.env.PLUGIN_GATEWAY_URL)}, changeOrigin: true } } } };\n`);
const frontend = spawn(process.execPath, [path.join(hostRoot, "src/frontend/node_modules/vite/bin/vite.js"), "--config", config], { cwd: path.join(hostRoot, "src/frontend"), stdio: "ignore" });
let browser;
try {
  const base = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(base)).ok) break; } catch { /* starting */ }
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: "dark" });
  const login = await context.request.post(`${base}/api/auth/login`, { data: { username_or_email: process.env.PRIMARY_USER_USERNAME, password: process.env.PRIMARY_USER_PASSWORD } });
  if (!login.ok()) throw new Error("Screenshot authentication failed");
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(`${base}/plugins/example.jellyfin-media-sync/sync`);
  await page.getByRole("heading", { name: "Your films, shows and anime" }).waitFor();
  await page.getByText("Sync: complete", { exact: true }).waitFor();
  const admin = page.getByTestId("jf-admin");
  await admin.screenshot({ path: path.join(output, "jellyfin-admin-settings.png") });
  const heading = admin.getByRole("heading", { name: "Library mapping" });
  await heading.scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(output, "jellyfin-library-mapping.png") });
  await page.getByTestId("jf-user").screenshot({ path: path.join(output, "jellyfin-user-mapping.png") });
  await page.getByTestId("jf-status").screenshot({ path: path.join(output, "jellyfin-sync-status.png") });
  const movies = await context.request.get(`${base}/api/movie/list`);
  const id = (await movies.json()).items[0].id;
  await page.goto(`${base}/movies/${id}`);
  const watch = page.locator(".jf-watch-link");
  await watch.waitFor();
  const href = await watch.getAttribute("href");
  if (!href.endsWith("/web/index.html#!/details?id=" + "4".repeat(32))) throw new Error("Wrong Watch Now destination");
  await page.screenshot({ path: path.join(output, "jellyfin-watch-now.png"), fullPage: true });
  // Navigate within the SPA to an unmapped film, then back, so a cached
  // contribution cannot retain the previous item's Watch Now destination.
  const create = await context.request.post(`${base}/api/movie/create`, { data: { title: "Unmapped acceptance film" } });
  if (!create.ok()) throw new Error("Could not create the unmapped acceptance film");
  const unmapped = (await create.json()).id;
  await page.evaluate(async target => { const router = (await import("/src/router/index.ts")).default; await router.push(`/movies/${target}`); }, unmapped);
  await page.getByText("This media has no available Jellyfin mapping for your linked account.", { exact: true }).waitFor();
  if (await page.locator(".jf-watch-link").count()) throw new Error("Stale Watch Now link survived a media context change");
  await page.evaluate(async target => { const router = (await import("/src/router/index.ts")).default; await router.push(`/movies/${target}`); }, id);
  await watch.waitFor();
  if (await watch.getAttribute("href") !== href) throw new Error("Watch Now failed to return to the mapped item");
  const remove = await context.request.delete(`${base}/api/movie/delete/${unmapped}`);
  if (!remove.ok()) throw new Error("Could not remove the unmapped acceptance film");
  if (errors.length) throw new Error(errors.join("\n"));
  console.log("Actual installed Jellyfin settings, user/library mapping, status and media-page screenshots passed.");
} finally {
  await browser?.close();
  frontend.kill("SIGTERM");
}
