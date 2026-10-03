export function activate(context) {
  const { h, ref, reactive, defineComponent } = context.vue;
  let disposed = false;
  const timers = new Set();
  context.onCleanup(() => { disposed = true; for (const timer of timers) clearTimeout(timer); timers.clear(); });
  context.registerComponent("watch", defineComponent({
    props: ["host", "context"],
    setup(props) {
      const result = ref(null);
      props.host.runAction("watch-now").then(value => { if (!disposed) result.value = value; }).catch(() => {
        if (!disposed) result.value = { error: "Jellyfin mapping unavailable. Check your linked identity and permissions." };
      });
      return () => h("div", { class: "jf-watch" }, result.value?.ok
        ? [h("a", { href: result.value.url, target: "_blank", rel: "noopener noreferrer", class: "jf-watch-link" }, "▶ Watch Now"), h("span", "Opens this exact item in Jellyfin")]
        : [h("span", result.value?.error || "Finding your Jellyfin item…")]);
    },
  }));
  context.registerComponent("sync", defineComponent({
    props: ["host"],
    setup(props) {
      const config = ref({ profile: {}, users: [], master: {} });
      const progress = ref({ phase: "idle" });
      const form = reactive({ server_url: "", sync_interval_minutes: 15, user_id: "", background_sync: false, host_user_id: "", approved_user_id: "" });
      const token = ref(""); const mappings = reactive({}); const busy = ref(false); const message = ref("");
      const run = (id, values = {}) => props.host.runAction(id, values);
      async function refresh() {
        const value = await run("get-config");
        if (disposed) return;
        config.value = value;
        Object.assign(form, value.profile || {});
        if (value.master) {
          form.server_url = value.master.server_url || "";
          form.sync_interval_minutes = value.master.sync_interval_minutes || 15;
          Object.assign(mappings, value.master.mappings || {});
        }
      }
      refresh().catch(() => { if (!disposed) message.value = "Configuration unavailable. Check plugin permissions."; });
      async function poll() {
        try { const value = await run("status"); if (!disposed) {
          const changed = progress.value.phase === "syncing" && value.phase !== "syncing";
          progress.value = value;
          if (changed) { const latest = await run("get-config"); if (!disposed) config.value.reviews = latest.reviews || []; }
        } }
        catch { if (!disposed) progress.value = { phase: "unavailable", error: "Status unavailable. Check permissions." }; }
        if (!disposed) { const timer = setTimeout(() => { timers.delete(timer); poll(); }, 5000); timers.add(timer); }
      }
      poll();
      async function perform(id, values) {
        busy.value = true;
        try { const result = await run(id, values); if (!disposed) { message.value = result.message || result.error || "Saved."; await refresh(); } }
        catch { if (!disposed) message.value = "Operation failed. Check configuration, administrator approval and runtime diagnostics."; }
        finally { if (!disposed) busy.value = false; }
      }
      const button = (label, id, values = () => ({})) => h("button", { type: "button", disabled: busy.value, onClick: () => perform(id, values()) }, label);
      const input = (id, label, type = "text") => h("label", [h("span", label), h("input", { id: `jf-${id}`, type, value: form[id], disabled: busy.value, onInput: event => { form[id] = type === "number" ? Number(event.target.value) : event.target.value; } })]);
      const select = (label, value, choices, update) => h("label", [h("span", label), h("select", { value, disabled: busy.value, onChange: event => update(event.target.value) }, [h("option", { value: "" }, "Choose…"), ...choices.map(x => h("option", { value: x.id }, x.name))])]);
      return () => h("section", { class: "jf-sync" }, [
        h("p", { class: "jf-badge" }, "JELLYFIN MEDIA SYNC"), h("h2", "Your films, shows and anime"),
        h("p", "Link your approved Jellyfin identity. Watched episodes and film completion sync into your tracking library; local watch-state changes are reported for review."),
        config.value.is_admin ? h("div", { class: "jf-panel", "data-testid": "jf-admin" }, [
          h("h3", "Installation server"), h("p", "Configure once for everyone. Use a Jellyfin server API key with access to users and libraries."),
          input("server_url", "Jellyfin server URL"), input("sync_interval_minutes", "Sync interval (5–1440 minutes)", "number"),
          h("label", [h("span", "Server credential · blank keeps existing"), h("input", { id: "jf-token", type: "password", autocomplete: "new-password", value: token.value, onInput: e => { token.value = e.target.value; } })]),
          button("Save server", "save-master", () => { const api_key = token.value; token.value = ""; return { server_url: form.server_url, sync_interval_minutes: form.sync_interval_minutes, api_key }; }),
          button("Test connection & discover", "test-connection"), h("p", `Connection: ${config.value.connection || "untested"}`),
          config.value.master?.error ? h("p", { class: "jf-error" }, config.value.master.error) : null,
          h("h3", "Library mapping"), ...(config.value.master?.libraries || []).map(library => select(library.name, mappings[library.id] || "", [
            { id: "movie", name: "Movies" }, { id: "tv_show", name: "TV" }, { id: "anime", name: "Anime" }, { id: "auto", name: "Automatic metadata detection" }, { id: "ignore", name: "Ignore" },
          ], value => { mappings[library.id] = value; })), button("Save library mappings", "save-mappings", () => ({ mappings: { ...mappings } })),
          h("h3", "Approve an account"), h("p", "Give each host user access only to their own Jellyfin identity. They can copy their host user ID from the panel below."),
          input("host_user_id", "Host user ID"), select("Jellyfin identity", form.approved_user_id, config.value.master?.users || [], value => { form.approved_user_id = value; }),
          button("Approve identity", "authorize-identity", () => ({ host_user_id: form.host_user_id, user_id: form.approved_user_id })),
        ]) : null,
        h("div", { class: "jf-panel", "data-testid": "jf-user" }, [h("h3", "Your Jellyfin account"),
          h("p", ["Your host user ID: ", h("code", config.value.host_user_id || "Loading…")]),
          select("Approved Jellyfin identity", form.user_id, config.value.users || [], value => { form.user_id = value; }),
          !config.value.users?.length ? h("p", "Ask your administrator to approve your identity using the host user ID above.") : null,
          h("label", { class: "jf-switch" }, [h("input", { type: "checkbox", checked: form.background_sync, onChange: e => { form.background_sync = e.target.checked; } }), "Enable periodic sync for my account"]),
          button("Link my account", "save-user", () => ({ user_id: form.user_id, background_sync: form.background_sync })), button("Unlink account", "unlink-user"),
        ]),
        h("div", { class: "jf-status", "data-testid": "jf-status", role: "status", "aria-live": "polite" }, [
          h("h3", `Sync: ${progress.value.phase || "idle"}`), h("p", `${progress.value.processed || 0} records checked · ${progress.value.skipped || 0} skipped · ${progress.value.conflicts || 0} conflicts`),
          progress.value.finished_at ? h("p", `Last attempt: ${new Date(progress.value.finished_at * 1000).toLocaleString()}`) : null,
          progress.value.retry_at ? h("p", `Retry: ${new Date(progress.value.retry_at * 1000).toLocaleString()}`) : null,
          progress.value.error ? h("p", { class: "jf-error" }, progress.value.error) : null,
          button("Sync now", "sync-now"),
        ]), (config.value.reviews || []).length ? h("div", { class: "jf-panel" }, [
          h("h3", "Watch-state conflicts"), ...(config.value.reviews || []).map(review => h("div", [
            h("p", `${review.title}: ${review.reason.replaceAll("_", " ")}`),
            review.reason === "local_watch_state_changed" ? button("Use Jellyfin watched state", "resolve-conflict", () => ({ external_id: review.external_id }))
              : h("p", "Review this item in your media library; its category or deletion is protected."),
          ])),
        ]) : null, message.value ? h("p", { role: "status" }, message.value) : null,
        h("p", { class: "jf-limit" }, "Jellyfin supplies watched state and unlocked metadata. Host ratings, notes and local watch changes are preserved. Conflicts need review; playback changes are not sent back to Jellyfin."),
      ]);
    },
  }));
}
