const container = document.querySelector("#sessions");
const status = document.querySelector("#status");

function pluginRequest(method, payload = {}) {
  return new Promise((resolve, reject) => {
    const requestId = crypto.randomUUID();
    const onMessage = (event) => {
      if (event.source !== window.parent || event.data?.type !== "plugin-api-response" || event.data.requestId !== requestId) return;
      window.removeEventListener("message", onMessage);
      event.data.error ? reject(new Error(event.data.error)) : resolve(event.data.result || {});
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({type: "plugin-api-request", requestId, method, payload}, "*");
  });
}

function when(timestamp) {
  return new Date(Number(timestamp) * 1000).toLocaleString();
}

async function revoke(sessionId) {
  status.textContent = "Waiting for confirmation…";
  try {
    const result = await pluginRequest("plugin.run-action", {actionId: "revoke-session", values: {session_id: sessionId}});
    if (result.cancelled) {
      status.textContent = "Revocation cancelled.";
      return;
    }
    status.textContent = `Session revoked. Audit request ${result.request_id || "recorded"}.`;
    await refresh();
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : "Session could not be revoked.";
  }
}

async function refresh() {
  status.textContent = "Loading sessions…";
  container.replaceChildren();
  try {
    const result = await pluginRequest("plugin.run-action", {actionId: "list-sessions", values: {limit: 200}});
    for (const session of result.sessions || []) {
      const card = document.createElement("section");
      const title = document.createElement("h2");
      title.textContent = session.active ? "Active session" : "Expired session";
      const details = document.createElement("p");
      details.textContent = `Created ${when(session.created_at)} · Expires ${when(session.expires_at)}`;
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Revoke";
      button.disabled = !session.active;
      button.addEventListener("click", () => revoke(session.id));
      card.append(title, details, button);
      container.append(card);
    }
    if (!container.children.length) container.innerHTML = '<p class="empty">No sessions were returned.</p>';
    status.textContent = `${(result.sessions || []).length} session(s). Audit request ${result.request_id || "recorded"}.`;
  } catch (error) {
    container.innerHTML = '<p class="error">Sessions are unavailable. Check that access is still granted.</p>';
    status.textContent = error instanceof Error ? error.message : "Sessions unavailable.";
  }
}

document.querySelector("#refresh").addEventListener("click", refresh);
refresh();
