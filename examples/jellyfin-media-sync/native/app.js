export function activate(context) {
  const { h, ref, reactive, defineComponent } = context.vue;
  let disposed = false;
  const timers = new Set();
  const progress = ref({ phase: "idle" });
  context.onCleanup(() => {
    disposed = true;
    for (const timer of timers) clearTimeout(timer);
    timers.clear();
  });
  async function poll() {
    try {
      const result = await context.host.runAction("status");
      if (!disposed) progress.value = result;
    } catch {
      if (!disposed) progress.value = { phase: "unavailable", error: "Progress unavailable. Check plugin permissions and runtime diagnostics." };
    }
    if (disposed) return;
    const timer = setTimeout(() => { timers.delete(timer); poll(); }, 5000);
    timers.add(timer);
  }
  poll();
  context.registerComponent("sync", defineComponent({
    props: ["host"],
    setup(props) {
      const form = reactive({ server_url: "", user_id: "", sync_interval_minutes: 15, background_sync: false });
      const token = ref("");
      const busy = ref(false);
      const message = ref("");
      const movies = ref([]);
      const run = (id, values = {}) => props.host.runAction(id, values);
      run("get-config").then(result => {
        if (!disposed) Object.assign(form, result);
      }).catch(() => { if (!disposed) message.value = "Configuration unavailable. Check plugin.settings permission."; });
      async function perform(callback) {
        busy.value = true;
        try { await callback(); }
        catch { if (!disposed) message.value = "Operation failed. Check plugin grants and runtime diagnostics."; }
        finally { if (!disposed) busy.value = false; }
      }
      async function save() {
        let url;
        try { url = new URL(form.server_url); }
        catch { message.value = "Enter a valid Jellyfin server URL."; return; }
        if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
          message.value = "Use an HTTP(S) server URL without credentials, query or fragment.";
          return;
        }
        if (!/^[a-f0-9]{32}$/i.test(form.user_id.replaceAll("-", ""))) {
          message.value = "Use the Jellyfin user's 32-character ID, not a username.";
          return;
        }
        if (!Number.isFinite(form.sync_interval_minutes) || form.sync_interval_minutes < 5 || form.sync_interval_minutes > 1440) {
          message.value = "Choose a sync interval between 5 and 1440 minutes.";
          return;
        }
        await context.host.saveSettings({ ...form });
        message.value = "Configuration saved.";
        if (token.value) {
          const value = token.value;
          token.value = "";
          const result = await run("save-token", { api_key: value });
          message.value = result.ok ? result.message : result.error;
        }
      }
      const button = (label, action) => h("button", { type: "button", disabled: busy.value, onClick: () => perform(action) }, label);
      const input = (id, label, type = "text") => h("label", { for: `jf-${id}` }, [
        h("span", label), h("input", {
          id: `jf-${id}`, type, value: form[id], disabled: busy.value,
          ...(type === "number" ? { min: 5, max: 1440, step: 1 } : {}),
          onInput: event => { form[id] = type === "number" ? Number(event.target.value) : event.target.value; },
        }),
      ]);
      return () => h("section", { class: "jf-sync" }, [
        h("p", { class: "jf-badge" }, "JELLYFIN · NATIVE PLUGIN INTEGRATION"),
        h("h2", "Your movie library, in sync"),
        h("p", "Imports into the host account that enabled this installation. Use that same account to configure it. Tokens are write-only and bound to the saved server and Jellyfin user."),
        h("form", { onSubmit: event => { event.preventDefault(); perform(save); } }, [
          input("server_url", "Jellyfin server URL"),
          input("user_id", "Jellyfin user ID (32 hexadecimal characters)"),
          input("sync_interval_minutes", "Sync interval in minutes", "number"),
          h("label", { for: "jf-token" }, [h("span", "API key or access token (blank keeps existing token)"), h("input", {
            id: "jf-token", type: "password", autocomplete: "new-password", value: token.value, disabled: busy.value,
            onInput: event => { token.value = event.target.value; },
          })]),
          h("label", { class: "jf-switch" }, [h("input", {
            type: "checkbox", checked: form.background_sync, disabled: busy.value,
            onChange: event => { form.background_sync = event.target.checked; },
          }), "Enable periodic sync"]),
          button("Save configuration and token", save),
        ]),
        h("div", { class: "jf-status", role: "status", "aria-live": "polite" }, [
          h("strong", `Sync: ${progress.value.phase || "idle"}`),
          h("p", `${progress.value.processed || 0} / ${progress.value.total || 0} movies processed · ${progress.value.skipped || 0} skipped`),
          h("progress", { value: progress.value.processed || 0, max: Math.max(progress.value.total || 0, 1), "aria-label": "Movies processed" }),
          progress.value.finished_at ? h("p", `Last attempt: ${new Date(progress.value.finished_at * 1000).toLocaleString()}`) : null,
          progress.value.error ? h("p", { class: "jf-error" }, progress.value.error) : null,
        ]),
        h("div", { class: "jf-actions" }, [
          button("Queue sync now", async () => { const result = await run("sync-now"); message.value = result.message; }),
          button("Poll host activity", async () => { const result = await run("refresh-status"); message.value = `${result.event_count} host activity events observed. This is independent of Jellyfin polling.`; }),
          button("Preview your host movies", async () => { const result = await run("list-media"); movies.value = result.media || []; }),
        ]),
        message.value ? h("p", { role: "status" }, message.value) : null,
        movies.value.length ? h("ul", movies.value.map(movie => h("li", { key: movie.id }, `${movie.title} · ${movie.status}`))) : null,
        h("p", { class: "jf-limit" }, "Current platform limits: default sandbox HTTP requires a generic broker; movie imports match titles, apply watched flags, and do not yet persist full Jellyfin playback history. Artwork URLs contain no token and may require public server access."),
      ]);
    },
  }));
}
