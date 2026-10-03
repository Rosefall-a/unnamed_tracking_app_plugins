const input = document.querySelector("#webhook");
const status = document.querySelector("#status");
const destination = /^https:\/\/(?:discord\.com|discordapp\.com)\/api\/webhooks\/[A-Za-z0-9._~!$&'()*+,;=:@%/-]+$/;

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

document.querySelector("#save").addEventListener("click", async () => {
  status.className = "";
  if (!destination.test(input.value)) {
    status.className = "error";
    status.textContent = "Enter a supported HTTPS Discord webhook URL.";
    return;
  }
  try {
    await pluginRequest("plugin.save-secret", {key: "discord_webhook", value: input.value});
    input.value = "";
    status.textContent = "Webhook saved in private runtime storage.";
  } catch (error) {
    status.className = "error";
    status.textContent = error instanceof Error ? error.message : "Webhook could not be saved.";
  }
});

document.querySelector("#check").addEventListener("click", async () => {
  status.className = "";
  try {
    const result = await pluginRequest("plugin.run-action", {actionId: "check-configuration", values: {}});
    status.textContent = result.configured && result.valid_destination
      ? "A valid write-only Discord destination is configured."
      : result.configured
        ? "A stored destination exists but is not valid. Replace it before delivery."
        : "No destination is configured.";
  } catch (error) {
    status.className = "error";
    status.textContent = error instanceof Error ? error.message : "Configuration could not be checked.";
  }
});
