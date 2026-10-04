// Public cosmetic Plugin API v1.1 bridge. Sandboxed plugins remain opaque origins.
(() => {
  let navigationKeys = new Set();
  function apply(appearance) {
    if (!appearance || appearance.api_contract_version !== "1.1.0" ||
        !["light", "dark"].includes(appearance.mode) || !appearance.tokens) return;
    const root = document.documentElement;
    navigationKeys = new Set(Array.isArray(appearance.navigation_shortcuts)
      ? appearance.navigation_shortcuts.filter(key => typeof key === "string" && /^[a-z]$/.test(key)) : []);
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
  window.addEventListener("keydown", event => {
    if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
        event.isComposing || event.repeat || event.defaultPrevented || event.getModifierState("AltGraph")) return;
    if (event.target?.closest?.("input, textarea, select, [role=combobox]") || event.target?.isContentEditable) return;
    const key = /^[a-z]$/i.test(event.key) ? event.key.toLowerCase()
      : /^Key[A-Z]$/.test(event.code) ? event.code.slice(3).toLowerCase() : "";
    if (!navigationKeys.has(key)) return;
    event.preventDefault();
    window.parent.postMessage({ type: "plugin-api-request", requestId: identifier(),
      method: "plugin.shortcut", payload: { key } }, "*");
  });
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
