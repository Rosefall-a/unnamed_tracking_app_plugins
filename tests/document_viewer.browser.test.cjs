const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { chromium } = require("playwright");
const { PDFDocument, StandardFonts } = require("pdf-lib");
const root = path.resolve(
  __dirname,
  "../examples/scoped-document-viewer/frontend",
);
const csp =
  "default-src 'self'; script-src 'self' https://unpkg.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; frame-src 'self' blob:; object-src 'none'; base-uri 'none'; frame-ancestors 'self'";
let server, browser, base;
const id = "c9119470-90d5-477e-97c7-3bd8dba11111";
const gameId = "c9119470-90d5-477e-97c7-3bd8dba22222";
let active;
before(async () => {
  server = http.createServer((req, res) => {
    if (req.url === "/") {
      res.setHeader("Content-Type", "text/html");
      res.end(
        '<!doctype html><iframe title="Plugin" sandbox="allow-scripts" src="/frontend/index.html" style="width:100%;height:950px;border:0"></iframe>',
      );
      return;
    }
    const pathname = decodeURIComponent(
      new URL(req.url, "http://local").pathname,
    );
    const target = path.resolve(
      root,
      "." + pathname.replace(/^\/frontend/, ""),
    );
    if (!target.startsWith(root + path.sep) || !fs.existsSync(target)) {
      res.writeHead(404);
      res.end();
      return;
    }
    res.setHeader("Content-Security-Policy", csp);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader(
      "Content-Type",
      target.endsWith(".js")
        ? "text/javascript"
        : target.endsWith(".css")
          ? "text/css"
          : "text/html",
    );
    res.end(fs.readFileSync(target));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: true });
});
after(async () => {
  await browser?.close();
  await new Promise((resolve) => server?.close(resolve));
});

async function openFixture({
  filename = "abcdefgh_notes.txt",
  bytes = Buffer.from("café <script>literal</script>"),
  mediaType = "text/plain",
  format = "text",
  error = null,
  mutate = null,
  delay = 0,
  empty = false,
  legacyCrypto = false,
  timeout = false,
} = {}) {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 1000 },
    timezoneId: "Australia/Perth",
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const requests = [];
  page.on("request", (req) => requests.push(req.url()));
  const item = {
    id,
    game_id: gameId,
    game_title: "Hollow Knight",
    filename,
    media_type: mediaType,
    size_bytes: bytes.length,
    created_at: Date.parse("2026-10-01T04:00:00Z") / 1000,
  };
  const digest = crypto.createHash("sha256").update(bytes).digest("hex");
  const calls = [];
  await page.exposeFunction("bridge", async (envelope) => {
    calls.push(envelope);
    if (envelope.payload.actionId === "list-documents")
      return { documents: empty ? [] : [item], next_offset: null };
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    if (error) return error;
    const offset = envelope.payload.values.offset;
    let result = {
      document: item,
      encoding: "base64",
      content: bytes.subarray(offset, offset + 24576).toString("base64"),
      format,
      offset,
      next_offset: Math.min(offset + 24576, bytes.length),
      complete: offset + 24576 >= bytes.length,
      content_sha256: digest,
    };
    if (mutate) result = mutate(result);
    return result;
  });
  await page.addInitScript(
    ({ legacyCrypto, timeout }) => {
      if (window === window.top) return;
      if (legacyCrypto) {
        Object.defineProperty(window.crypto, "randomUUID", {
          value: undefined,
        });
        Object.defineProperty(window.crypto, "subtle", { value: undefined });
      }
      if (timeout) {
        const original = window.setTimeout;
        window.setTimeout = (handler, delay, ...args) =>
          original(handler, delay === 30000 ? 100 : delay, ...args);
      }
    },
    { legacyCrypto, timeout },
  );
  await page.addInitScript(() => {
    if (window !== window.top) return;
    window.addEventListener("message", async (event) => {
      if (
        event.data?.type !== "plugin-api-request" ||
        event.source !== document.querySelector("iframe").contentWindow
      )
        return;
      const result = await window.bridge(event.data);
      if (result.ignore) return;
      const response = result.transportError
        ? { error: "Request rejected", status_code: result.transportError }
        : { result };
      event.source.postMessage(
        {
          type: "plugin-api-response",
          requestId: event.data.requestId,
          ...response,
        },
        "*",
      );
    });
  });
  await page.goto(base);
  const frame = page.frameLocator("iframe");
  if (empty) await frame.locator("#documents .state").waitFor();
  else {
    await frame.locator("#documents button").waitFor();
    await frame.locator("#documents button").click();
  }
  active = { page, frame, errors, requests, calls };
  return active;
}

test("text is literal UTF-8; iframe stays opaque and uses only the declared bridge", async () => {
  const { page, frame, errors, calls } = await openFixture();
  await frame.locator("#viewer pre").waitFor();
  assert.equal(
    await frame.locator("#viewer pre").textContent(),
    "café <script>literal</script>",
  );
  assert.equal(await frame.locator("#viewer script").count(), 0);
  assert.equal(
    await frame
      .locator("#documents small")
      .textContent()
      .then((s) => s.includes("text/plain")),
    true,
  );
  const isolated = await page.frames()[1].evaluate(() => {
    try {
      return window.parent.document.title;
    } catch {
      return "isolated";
    }
  });
  assert.equal(isolated, "isolated");
  assert.equal(calls[1].payload.values.chunk_bytes, 24576);
  assert.deepEqual(errors, []);
  await page.close();
});

test("HTTP crypto fallback still verifies complete document integrity", async () => {
  const text = "café\n".repeat(12000);
  const { page, frame, errors } = await openFixture({
    legacyCrypto: true,
    bytes: Buffer.from(text),
  });
  await frame.locator("#viewer pre").waitFor();
  assert.equal(await frame.locator("#viewer pre").textContent(), text);
  assert.deepEqual(errors, []);
  await page.close();
});

test("empty library explains how to add documents", async () => {
  const { page, frame } = await openFixture({ empty: true });
  assert.ok(
    (await frame.locator("#documents .state").textContent()).includes(
      "game's Docs tab",
    ),
  );
  assert.equal(await frame.locator("#more").isVisible(), false);
  await page.close();
});

test("a missing bridge response produces a network timeout state", async () => {
  const { page, frame } = await openFixture({
    timeout: true,
    error: { ignore: true },
  });
  await frame.locator("#viewer .error").waitFor();
  assert.ok(
    (await frame.locator("#viewer .error").textContent()).includes("timed out"),
  );
  await page.close();
});

test("HTML sanitizer removes active HTML/SVG/MathML, forms, images, clobbering and links", async () => {
  const html =
    '<h1>Manual</h1><script>parent.pwned=true</script><img src="https://evil.test/leak" onerror="alert(1)"><svg onload="alert(1)"><a xlink:href="javascript:alert(1)">x</a></svg><math><mtext><img src=x onerror=alert(1)></mtext></math><iframe srcdoc="evil"></iframe><form id="documents"><input name="innerHTML"></form><a href="javascript:alert(1)" onclick="alert(1)" style="color:red">unsafe</a><a href="https://evil.test" ping="https://evil.test">external</a><base href="https://evil.test"><meta http-equiv="refresh" content="0;url=https://evil.test">';
  const { page, frame, requests, errors } = await openFixture({
    filename: "page.xhtml",
    bytes: Buffer.from(html),
    format: "html",
  });
  await frame.locator("#viewer h1").waitFor();
  assert.equal(await frame.locator("#viewer h1").textContent(), "Manual");
  assert.equal(
    await frame
      .locator(
        "#viewer script, #viewer img, #viewer svg, #viewer math, #viewer iframe, #viewer form, #viewer input, #viewer meta, #viewer base",
      )
      .count(),
    0,
  );
  assert.equal(
    await frame
      .locator(
        "#viewer [onclick], #viewer [style], #viewer [href], #viewer [ping]",
      )
      .count(),
    0,
  );
  assert.equal(
    requests.some((url) => url.includes("evil.test")),
    false,
  );
  assert.equal(await page.evaluate(() => window.pwned), undefined);
  await frame.locator("#source-toggle").click();
  assert.equal(await frame.locator("#viewer pre").textContent(), html);
  assert.deepEqual(errors, []);
  await page.close();
});

test("PDF renders real pages in sandbox, with page and zoom controls", async () => {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  for (const text of ["Manual page one", "Manual page two"])
    pdf.addPage([400, 500]).drawText(text, { x: 35, y: 400, font, size: 24 });
  const { page, frame, errors, requests } = await openFixture({
    filename: "abcdefgh_manual.pdf",
    bytes: Buffer.from(await pdf.save()),
    mediaType: "application/pdf",
    format: "pdf",
  });
  await frame
    .locator("#page-label")
    .filter({ hasText: "Page 1 of 2" })
    .waitFor({ timeout: 15000 });
  const pixels = await page.frames()[1].evaluate(() => {
    const c = document.querySelector("canvas");
    return c
      .getContext("2d")
      .getImageData(0, 0, c.width, c.height)
      .data.some((value, index) => index % 4 !== 3 && value < 180);
  });
  assert.equal(pixels, true);
  await frame.locator("#next").click();
  await frame
    .locator("#page-label")
    .filter({ hasText: "Page 2 of 2" })
    .waitFor();
  await frame.locator("#zoom").selectOption("1.5");
  assert.equal(
    await frame
      .locator("#viewer iframe, #viewer object, #viewer embed")
      .count(),
    0,
  );
  assert.deepEqual(errors, []);
  assert.equal(
    requests.every((url) => url.startsWith(base)),
    true,
  );
  if (process.env.DOCUMENT_VIEWER_SCREENSHOT)
    await page.screenshot({
      path: process.env.DOCUMENT_VIEWER_SCREENSHOT,
      fullPage: true,
    });
  await page.close();
});

for (const [label, options, expected] of [
  [
    "missing",
    { error: { error: { kind: "missing", message: "Document not found." } } },
    "Document not found",
  ],
  ["unauthorized", { error: { transportError: 403 } }, "Access denied"],
  ["server", { error: { transportError: 500 } }, "Server error"],
  [
    "oversized",
    { error: { error: { kind: "oversized", message: "5 MiB limit" } } },
    "Document too large",
  ],
  [
    "SVG type",
    { mediaType: "image/svg+xml", format: "html" },
    "unsupported content type",
  ],
  ["invalid UTF-8", { bytes: Buffer.from([255]) }, "Only UTF-8"],
  ["binary text", { bytes: Buffer.from([0]) }, "Binary files"],
  [
    "malformed PDF",
    {
      bytes: Buffer.from("%PDF-broken"),
      mediaType: "application/pdf",
      format: "pdf",
    },
    "malformed or password protected",
  ],
  [
    "unexpected encoding",
    { mutate: (r) => ({ ...r, encoding: "utf-8" }) },
    "malformed",
  ],
  ["bad base64", { mutate: (r) => ({ ...r, content: "!!!!" }) }, "malformed"],
  [
    "wrong document ID",
    { mutate: (r) => ({ ...r, document: { ...r.document, id: "other" } }) },
    "malformed",
  ],
  [
    "bad range",
    { mutate: (r) => ({ ...r, next_offset: 9999 }) },
    "invalid document chunk",
  ],
  [
    "integrity mismatch",
    { mutate: (r) => ({ ...r, content_sha256: "0".repeat(64) }) },
    "integrity check failed",
  ],
])
  test(label + " has an explicit error state", async () => {
    const { page, frame, errors } = await openFixture(options);
    await frame.locator("#viewer .error").waitFor({ timeout: 15000 });
    assert.ok(
      (await frame.locator("#viewer .error").textContent()).includes(expected),
    );
    assert.deepEqual(errors, []);
    await page.close();
  });

test("multiple chunks preserve UTF-8 boundaries; replacement is rejected", async () => {
  const text = "é".repeat(30000);
  const { page, frame, calls } = await openFixture({
    bytes: Buffer.from(text),
  });
  await frame.locator("#viewer pre").waitFor();
  assert.equal(await frame.locator("#viewer pre").textContent(), text);
  assert.equal(
    calls.filter((c) => c.payload.actionId === "read-document").length,
    3,
  );
  await page.close();
  const next = await openFixture({
    bytes: Buffer.from(text),
    mutate: (r) => (r.offset ? { ...r, content_sha256: "f".repeat(64) } : r),
  });
  await next.frame.locator("#viewer .error").waitFor();
  assert.ok(
    (await next.frame.locator("#viewer .error").textContent()).includes(
      "Document changed",
    ),
  );
  await next.page.close();
});

test("refresh cancels a pending open and does not render a stale response", async () => {
  const { page, frame } = await openFixture({ delay: 300 });
  await frame.locator("#refresh").click();
  await frame.locator("#documents button").waitFor();
  await page.waitForTimeout(400);
  assert.equal(await frame.locator("#viewer pre").count(), 0);
  assert.equal(
    await frame.locator("#document-title").textContent(),
    "Your game documents",
  );
  await page.close();
});
