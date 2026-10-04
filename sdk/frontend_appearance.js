// Public cosmetic Plugin API v1.1 bridge. Sandboxed plugins remain opaque origins.
(() => {
  function apply(appearance) {
    if (!appearance || appearance.api_contract_version !== "1.1.0" ||
        !["light", "dark"].includes(appearance.mode) || !appearance.tokens) return;
    const root = document.documentElement;
    root.style.colorScheme = appearance.mode;
    root.dataset.theme = appearance.mode;
    root.classList.toggle("high-contrast", appearance.high_contrast === true);
    root.classList.toggle("reduce-motion", appearance.reduce_motion === true);
    for (const [name, value] of Object.entries(appearance.tokens)) {
      if (/^--ui-[a-z-]+$/.test(name) && typeof value === "string" && value.length < 512)
        root.style.setProperty(name, value);
    }
  }
  // Correlation identifiers are not credentials; HTTP previews may lack randomUUID.
  const identifier = () => typeof crypto.randomUUID === "function"
    ? crypto.randomUUID() : `appearance-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const requestId = identifier();
  window.addEventListener("message", event => {
    if (event.source !== window.parent) return;
    if (event.data?.type === "plugin-appearance-changed") apply(event.data.appearance);
    if (event.data?.type === "plugin-api-response" && event.data.requestId === requestId)
      apply(event.data.result);
  });
  window.parent.postMessage({ type: "plugin-api-request", requestId,
    method: "plugin.theme", payload: {} }, "*");
  if (typeof ResizeObserver === "function") {
    let previous = 0;
    const observe = () => new ResizeObserver(() => {
        const height = Math.ceil(document.body.getBoundingClientRect().height);
        if (height === previous) return;
        previous = height;
        window.parent.postMessage({ type: "plugin-api-request", requestId: identifier(),
          method: "plugin.resize", payload: { height } }, "*");
      }).observe(document.body);
    if (document.body) observe();
    else window.addEventListener("DOMContentLoaded", observe, { once: true });
  }
})();
