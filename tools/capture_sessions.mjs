// Verify the installed native Session Manager through a real local host.
// Creates and revokes only its own disposable member accounts and sessions.
import assert from "node:assert/strict";
import { createHash, randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer, request as httpRequest } from "node:http";
import { createRequire } from "node:module";
import path from "node:path";

const [hostArgument, workArgument, backend, cookieFile] = process.argv.slice(2);
assert(
  cookieFile,
  "Usage: capture_sessions.mjs <host> <evidence> <local-backend> <temporary-admin-cookies>",
);
assert(
  ["localhost", "127.0.0.1", "[::1]"].includes(new URL(backend).hostname),
  "Use a disposable local acceptance host",
);
const host = path.resolve(hostArgument),
  work = path.resolve(workArgument);
const frontend = path.join(host, "src/frontend/dist");
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
await mkdir(work, { recursive: true });
const server = createServer(async (incoming, outgoing) => {
  if (incoming.url.startsWith("/api/")) {
    const upstream = httpRequest(
      new URL(incoming.url, backend),
      {
        method: incoming.method,
        headers: { ...incoming.headers, host: new URL(backend).host },
      },
      (response) => {
        outgoing.writeHead(response.statusCode, response.headers);
        response.pipe(outgoing);
      },
    );
    upstream.on("error", () => {
      outgoing.writeHead(502);
      outgoing.end("Host unavailable");
    });
    incoming.pipe(upstream);
    return;
  }
  let relative = decodeURIComponent(
    new URL(incoming.url, "http://localhost").pathname,
  ).replace(/^\//, "");
  if (!relative.startsWith("assets/")) relative = "index.html";
  const file = path.resolve(frontend, relative);
  if (!file.startsWith(frontend + path.sep)) {
    outgoing.writeHead(403);
    outgoing.end();
    return;
  }
  try {
    outgoing.setHeader(
      "Content-Type",
      {
        ".js": "text/javascript",
        ".css": "text/css",
        ".svg": "image/svg+xml",
        ".html": "text/html",
      }[path.extname(file)] ?? "application/octet-stream",
    );
    outgoing.end(await readFile(file));
  } catch {
    outgoing.writeHead(404);
    outgoing.end();
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = "http://127.0.0.1:" + server.address().port;
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox"],
});
const admin = await browser.newContext();
const cookies = JSON.parse(await readFile(cookieFile, "utf8"));
await admin.addCookies(
  cookies.map(({ name, value }) => ({ name, value, url: origin })),
);
const api = async (client, method, route, data, expected = 200) => {
  const response = await client.request.fetch(origin + "/api" + route, {
    method,
    ...(data ? { data } : {}),
  });
  assert.equal(
    response.status(),
    expected,
    route +
      ": " +
      (response.status() === expected ? "" : await response.text()),
  );
  return expected === 204 ? null : response.json();
};
const identity = await api(admin, "GET", "/auth/me");
assert.equal(
  identity.is_admin,
  true,
  "Administrator-owned acceptance session required",
);
const preferences = await api(admin, "GET", "/preferences");
const pluginId = "example.self-service-session-manager";
const users = [],
  contexts = [],
  errors = [];
const password = "Session-fixture-" + randomBytes(16).toString("hex") + "-1!A";
const report = {
  kind: "authenticated-real-host",
  captured_at: new Date().toISOString(),
  passed: [],
  captures: [],
};
if (process.env.SESSION_PACKAGE_SHA256) {
  assert.match(process.env.SESSION_PACKAGE_SHA256, /^[a-f0-9]{64}$/);
  report.package_sha256 = process.env.SESSION_PACKAGE_SHA256;
}
const layouts = [
  { width: 320, height: 720, theme: "light" },
  { width: 390, height: 800, theme: "dark" },
  { width: 1440, height: 1050, theme: "light" },
  { width: 1920, height: 1080, theme: "dark" },
];
const passed = (value) => {
  report.passed.push(value);
  console.log(value);
};
async function action(
  client,
  name,
  values = {},
  expected = 200,
  confirmed = false,
) {
  return api(
    client,
    "POST",
    "/plugins/" + pluginId + "/actions/" + name,
    { values, confirmed },
    expected,
  );
}
async function login(user) {
  const context = await browser.newContext();
  contexts.push(context);
  await api(context, "POST", "/auth/login", {
    username_or_email: user.username,
    password,
  });
  await api(context, "PATCH", "/preferences", { ui_welcome_completed: true });
  return context;
}
async function capture(page, filename, description) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(150);
  const dimensions = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
    sidebar: [...document.querySelectorAll(".sidebar-nav")]
      .filter((e) => e.getBoundingClientRect().width)
      .map((e) => ({
        client: e.clientWidth,
        scroll: e.scrollWidth,
        overflow: getComputedStyle(e).overflowX,
      })),
  }));
  assert(
    dimensions.scroll <= dimensions.client + 1,
    filename + " page overflow: " + JSON.stringify(dimensions),
  );
  assert(
    dimensions.sidebar.every((e) => e.scroll <= e.client + 1),
    filename + " sidebar overflow",
  );
  const file = path.join(work, filename);
  await page.screenshot({
    path: file,
    fullPage: page.viewportSize().width < 760,
  });
  report.captures.push({
    filename,
    description,
    sha256: createHash("sha256")
      .update(await readFile(file))
      .digest("hex"),
  });
}
try {
  for (const suffix of ["owner", "foreign"]) {
    const username = "session-review-" + Date.now() + "-" + suffix;
    users.push(
      await api(
        admin,
        "POST",
        "/auth/users",
        {
          username,
          email: username + "@example.invalid",
          password,
          is_admin: false,
        },
        201,
      ),
    );
  }
  const owner = await login(users[0]),
    extra = await login(users[0]),
    foreign = await login(users[1]);
  const mine = await action(owner, "list-sessions");
  assert.equal(mine.sessions.length, 2);
  assert.equal(mine.sessions.filter((s) => s.is_current).length, 1);
  assert(mine.sessions.every((s) => s.user_id === users[0].id));
  const other = await action(foreign, "list-sessions");
  assert.match(
    (await action(owner, "list-admin-sessions", {}, 403)).detail,
    /admin/i,
  );
  assert.match(
    (
      await action(
        owner,
        "revoke-session",
        { session_id: other.sessions[0].id },
        400,
        true,
      )
    ).detail,
    /session.*not.*found/i,
  );
  await api(foreign, "GET", "/auth/me");
  passed(
    "Owner lists, administrator denial and foreign-session rejection retain clear errors and ownership",
  );
  const memberPage = await owner.newPage(),
    adminPage = await admin.newPage();
  for (const page of [memberPage, adminPage])
    page.on("pageerror", (error) => errors.push(String(error)));
  for (const layout of layouts) {
    const suffix = layout.width + "-" + layout.theme;
    await memberPage.setViewportSize({
      width: layout.width,
      height: layout.height,
    });
    await api(owner, "PATCH", "/preferences", { ui_theme: layout.theme });
    await memberPage.goto(origin + "/settings?area=account&section=sessions");
    await memberPage
      .getByRole("heading", { name: "Current session", exact: true })
      .waitFor();
    assert.equal(await memberPage.locator(".ssm article").count(), 2);
    await capture(
      memberPage,
      "session-owner-loaded-" + suffix + ".png",
      "Installed native account sessions with current and other disposable browser sessions.",
    );
    await adminPage.setViewportSize({
      width: layout.width,
      height: layout.height,
    });
    await api(admin, "PATCH", "/preferences", { ui_theme: layout.theme });
    await adminPage.goto(
      origin + "/settings?area=administration&section=admin-sessions",
    );
    const native = adminPage.locator(".ssm");
    await native.locator("tbody tr").first().waitFor();
    assert.equal(await native.getByRole("alert").count(), 0);
    await native.getByLabel("Search", { exact: true }).fill(users[0].username);
    await native
      .getByRole("button", { name: "Apply filters", exact: true })
      .click();
    await adminPage.waitForFunction(
      () =>
        document.querySelector(".ssm tbody")?.children.length === 2 &&
        !document
          .querySelector('.ssm [role="status"]')
          ?.textContent.includes("Working"),
    );
    const rows = await native.locator("tbody tr").allTextContents();
    assert(rows.every((value) => value.includes(users[0].username)));
    await capture(
      adminPage,
      "session-admin-loaded-" + suffix + ".png",
      "Installed administrator filters and session table; horizontal table scrolling remains within its panel.",
    );
    await native
      .getByRole("button", { name: "Compact table", exact: true })
      .click();
    assert(await native.evaluate((e) => e.classList.contains("ssm-compact")));
    passed("Native settings layout and filters: " + suffix);
  }
  passed(
    "Account and administrator native settings fit all four light/dark phone and desktop layouts",
  );
  const native = adminPage.locator(".ssm");
  await native.getByLabel("User", { exact: true }).selectOption(users[0].id);
  const revokeUser = native.getByRole("button", {
    name: "Revoke all for selected user",
    exact: true,
  });
  adminPage.once("dialog", (dialog) => dialog.dismiss());
  await revokeUser.click();
  await api(owner, "GET", "/auth/me");
  await api(extra, "GET", "/auth/me");
  passed(
    "Cancelling administrator revocation preserves both selected-user sessions",
  );
  adminPage.once("dialog", (dialog) => dialog.accept());
  await revokeUser.click();
  await native
    .getByRole("status")
    .filter({ hasText: "2 sessions revoked." })
    .waitFor();
  await api(owner, "GET", "/auth/me", null, 401);
  await api(extra, "GET", "/auth/me", null, 401);
  await api(foreign, "GET", "/auth/me");
  await api(admin, "GET", "/auth/me");
  passed(
    "Administrator user revocation invalidates only selected-user cookies and preserves unrelated users",
  );
  const ownerAgain = await login(users[0]),
    otherAgain = await login(users[0]);
  const page = await ownerAgain.newPage();
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("dialog", (dialog) => dialog.accept());
  await page.goto(origin + "/settings?area=account&section=sessions");
  await page
    .getByRole("heading", { name: "Current session", exact: true })
    .waitFor();
  await page
    .locator(".ssm article")
    .filter({
      has: page.getByRole("heading", { name: "active session", exact: true }),
    })
    .getByRole("button", { name: "Revoke", exact: true })
    .click();
  await page
    .locator('.ssm [role="status"]')
    .filter({ hasText: "Session revoked." })
    .waitFor();
  await api(otherAgain, "GET", "/auth/me", null, 401);
  await page
    .getByRole("button", { name: "Revoke all my sessions", exact: true })
    .click();
  await page.getByLabel("Password", { exact: true }).waitFor();
  assert.match(page.url(), /\/login|\/auth\/local/);
  await api(ownerAgain, "GET", "/auth/me", null, 401);
  passed(
    "Native owner single/all revocation signs out the correct browsers without a page refresh",
  );
  assert.deepEqual(errors, []);
  report.status = "passed";
  await writeFile(
    path.join(work, "session-native-conformance.json"),
    JSON.stringify(report, null, 2) + "\n",
  );
} catch (error) {
  for (const page of [admin, ...contexts].flatMap((context) =>
    context.pages(),
  )) {
    await page.screenshot({
      path: path.join(work, "session-native-failure.png"),
    });
    console.error(
      JSON.stringify({
        url: page.url(),
        headings: await page.getByRole("heading").allTextContents(),
        alerts: await page.getByRole("alert").allTextContents(),
        settings: await page.locator(".settings-links").allTextContents(),
      }),
    );
  }
  throw error;
} finally {
  for (const context of contexts) await context.close();
  for (const user of users)
    await api(admin, "DELETE", "/auth/users/" + user.id);
  await api(admin, "PATCH", "/preferences", preferences);
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
