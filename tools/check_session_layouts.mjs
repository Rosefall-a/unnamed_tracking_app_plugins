// Native UI acceptance against an installed CI package and local production host.
// Cosmetic preferences and optional demo enablement are restored; session data is unchanged.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const [outputArgument, origin, cookieFile, packageFile] = process.argv.slice(2);
assert(
  packageFile,
  "Usage: check_session_layouts.mjs <output> <local-host> <admin-cookies> <installed-utp>",
);
assert(["localhost", "127.0.0.1", "[::1]"].includes(new URL(origin).hostname));
const output = path.resolve(outputArgument);
await mkdir(output, { recursive: true });
const { chromium, webkit } = createRequire(import.meta.url)("playwright");
const engines = process.env.SESSION_BROWSER
  ? [process.env.SESSION_BROWSER]
  : ["chromium", "webkit"];
assert(engines.every((name) => ["chromium", "webkit"].includes(name)));
const digest = createHash("sha256")
  .update(await readFile(packageFile))
  .digest("hex");
const manifest = JSON.parse(
  execFileSync(
    process.env.PYTHON ?? "python3",
    [
      "-c",
      "import sys,zipfile; print(zipfile.ZipFile(sys.argv[1]).read('manifest.json').decode())",
      packageFile,
    ],
    { encoding: "utf8" },
  ),
);
const report = {
  status: "running",
  real_production_host: true,
  source_head: process.env.SESSION_SOURCE_HEAD ?? null,
  host_image: process.env.SESSION_HOST_IMAGE ?? null,
  artifact_id: process.env.SESSION_ARTIFACT_ID ?? null,
  package_sha256: digest,
  package_version: null,
  browser_only_stress:
    "Expanded GeoIP controls and a long account label inserted into the rendered selector; no account or GeoIP data is changed",
  navigation:
    "Fresh initial document per viewport/color, then the actual Administration and Session Manager settings buttons",
  passed: [],
  captures: [],
  measurements: [],
};
const identity = "example.self-service-session-manager";
for (const engineName of engines) {
  const engine = engineName === "webkit" ? webkit : chromium;
  const browser = await engine.launch({
    headless: true,
    ...(engine === chromium ? { args: ["--no-sandbox"] } : {}),
  });
  const context = await browser.newContext({ serviceWorkers: "block" });
  await context.addCookies(
    JSON.parse(await readFile(cookieFile, "utf8")).map(({ name, value }) => ({
      name,
      value,
      url: origin,
    })),
  );
  const api = async (method, route, data) => {
    const response = await context.request.fetch(origin + "/api" + route, {
      method,
      ...(data ? { data } : {}),
    });
    assert.equal(response.status(), 200, route + ": HTTP " + response.status());
    return response.json();
  };
  const original = await api("GET", "/preferences");
  const errors = [],
    disabledDemos = [];
  let page = await context.newPage();
  try {
    assert.equal((await api("GET", "/auth/me")).is_admin, true);
    const plugins = await api("GET", "/plugins");
    const plugin = plugins.find((item) => item.plugin_id === identity);
    assert(
      plugin?.enabled &&
        plugin.status === "running" &&
        plugin.health === "healthy",
    );
    report.package_version = plugin.version;
    assert.equal(
      plugin.digest,
      manifest.integrity.sha256,
      "The installed payload must match the supplied CI archive",
    );
    assert.equal(plugin.version, manifest.version);
    assert.equal(manifest.plugin_id, identity);
    for (const item of plugins)
      if (
        [
          "example.help-button",
          "example.ui-playground",
          "example.shortcut-playground",
        ].includes(item.plugin_id) &&
        item.enabled
      ) {
        await api("POST", `/plugins/${item.plugin_id}/disable`);
        disabledDemos.push(item.plugin_id);
      }
    for (const width of [320, 390, 768, 1440]) {
      for (const mode of ["light", "dark"]) {
        await page.close();
        page = await context.newPage();
        page.on("pageerror", (error) => errors.push(String(error)));
        await page.setViewportSize({ width, height: 1000 });
        await api("PATCH", "/preferences", {
          ui_theme: mode,
          ui_theme_package: "native",
          ui_palette: "green",
          ui_welcome_completed: true,
        });
        for (const [area, section] of [
          ["account", "sessions"],
          ["administration", "admin-sessions"],
        ]) {
          const action = page
            .waitForResponse(
              (response) =>
                response.request().method() === "POST" &&
                response.url().includes(`/plugins/${identity}/actions/list-`),
            )
            .catch((error) => ({ failure: String(error) }));
          if (section === "sessions")
            await page.goto(
              `${origin}/settings?area=${area}&section=${section}`,
              { waitUntil: "commit" },
            );
          else {
            await page
              .getByRole("navigation", { name: "Settings areas" })
              .getByRole("button", { name: "Administration", exact: true })
              .click();
            await page
              .locator(".settings-links")
              .getByRole("button", { name: "Session Manager", exact: true })
              .click();
            await page.waitForURL(
              (url) => url.searchParams.get("section") === section,
            );
          }
          const response = await action;
          assert.equal(response.failure, undefined);
          assert.equal(response.status(), 200);
          await page.waitForFunction(
            (expected) => document.documentElement.dataset.theme === expected,
            mode,
          );
          await page.waitForFunction(
            () =>
              document.querySelector(".ssm header button")?.disabled === false,
          );
          await page
            .locator(
              section === "sessions"
                ? ".ssm article"
                : ".ssm-table-wrap tbody tr",
            )
            .first()
            .waitFor();
          if (section === "admin-sessions") {
            await page
              .getByText("Configure GeoIP databases", { exact: true })
              .click();
            await page.evaluate(() => {
              const select = document.querySelector(
                'select[aria-label="User"]',
              );
              const option = document.createElement("option");
              option.textContent =
                "Session review user with a long but valid account name";
              option.value = "browser-only-label-stress";
              select.append(option);
              select.value = option.value;
            });
          }
          await page.waitForFunction(() =>
            document
              .getAnimations()
              .every(
                (animation) =>
                  !Number.isFinite(
                    animation.effect?.getComputedTiming().endTime,
                  ) || animation.playState !== "running",
              ),
          );
          const select = page.locator(".ssm select").first();
          assert.equal(await select.getAttribute("class"), "ui-field");
          await select.focus();
          assert.equal(
            await select.evaluate(
              (control) => control === document.activeElement,
            ),
            true,
          );
          const dimensions = await page.evaluate(() => {
            const root = document.querySelector(".ssm"),
              parent = root.parentElement;
            const box = (element) => {
              const rect = element.getBoundingClientRect();
              return {
                left: rect.left,
                right: rect.right,
                width: rect.width,
                client: element.clientWidth,
                scroll: element.scrollWidth,
              };
            };
            const bounds = box(root),
              host = box(parent),
              style = getComputedStyle(parent);
            const outside = [...root.querySelectorAll("*")]
              .filter((element) => !element.closest(".ssm-table-wrap,.ssm-map"))
              .map((element) => ({
                tag: element.tagName,
                class: element.className,
                ...box(element),
              }))
              .filter(
                (element) =>
                  element.width > 0 &&
                  (element.left < bounds.left - 1 ||
                    element.right > bounds.right + 1),
              );
            const table = root.querySelector(".ssm-table-wrap");
            return {
              viewport: innerWidth,
              document: document.documentElement.scrollWidth,
              root: bounds,
              host,
              hostContentLeft: host.left + parseFloat(style.paddingLeft),
              hostContentRight: host.right - parseFloat(style.paddingRight),
              outside,
              selectAppearance: getComputedStyle(root.querySelector("select"))
                .appearance,
              table: table
                ? { ...box(table), overflow: getComputedStyle(table).overflowX }
                : null,
            };
          });
          const name = `${engine.name()}/${width}/${mode}/${section}`;
          assert(
            dimensions.document <= width + 1,
            name + ": document overflow",
          );
          assert(
            dimensions.root.scroll <= dimensions.root.client + 1,
            name + ": native panel overflow",
          );
          assert(
            dimensions.root.left >= dimensions.hostContentLeft - 1 &&
              dimensions.root.right <= dimensions.hostContentRight + 1,
            name + ": host content overflow",
          );
          assert.deepEqual(
            dimensions.outside,
            [],
            name + ": controls outside panel",
          );
          assert.equal(
            dimensions.selectAppearance,
            "none",
            name + ": native combobox painting must not overflow",
          );
          if (dimensions.table) {
            assert.equal(dimensions.table.overflow, "auto");
            assert(dimensions.table.width <= dimensions.root.width + 1);
            if (dimensions.table.scroll > dimensions.table.client + 1)
              assert(
                await page.locator(".ssm-table-wrap").evaluate((table) => {
                  table.scrollLeft = 20;
                  const scrolled = table.scrollLeft > 0;
                  table.scrollLeft = 0;
                  return scrolled;
                }),
                name + ": wide table must remain scrollable",
              );
          }
          report.measurements.push({
            browser: engine.name(),
            width,
            mode,
            section,
            ...dimensions,
          });
          if (
            (width === 390 && mode === "dark" && section === "sessions") ||
            (width === 320 &&
              mode === "light" &&
              section === "admin-sessions") ||
            (width === 1440 && mode === "light")
          ) {
            const filename = `session-fit-${engine.name()}-${section}-${width}-${mode}.png`;
            await select.evaluate((control) => control.blur());
            await page.evaluate(() =>
              window.scrollTo({ top: 0, left: 0, behavior: "instant" }),
            );
            await page.screenshot({ path: path.join(output, filename) });
            report.captures.push(filename);
          }
        }
      }
    }
    assert.deepEqual(errors, []);
    const message = `${engine.name()}: 16 loaded owner/admin layouts fit their real panels; expanded GeoIP controls, long account labels, focus and table scrolling pass`;
    report.passed.push(message);
    console.log(message);
  } catch (error) {
    report.status = "failed";
    report.failure = String(error);
    await page.screenshot({
      path: path.join(output, "session-fit-private-failure.png"),
    });
    await writeFile(
      path.join(output, "session-layout-conformance.json"),
      JSON.stringify(report, null, 2) + "\n",
    );
    throw error;
  } finally {
    await api("PATCH", "/preferences", original);
    for (const id of disabledDemos.reverse())
      await api("POST", `/plugins/${id}/enable`);
    await browser.close();
  }
}
report.status = "passed";
await writeFile(
  path.join(output, "session-layout-conformance.json"),
  JSON.stringify(report, null, 2) + "\n",
);
