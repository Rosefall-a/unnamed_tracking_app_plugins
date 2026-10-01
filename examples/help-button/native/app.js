// Privileged frontend.native example: use the supplied Vue and host APIs.
export function activate(context) {
  const { h, ref, defineComponent } = context.vue;
  let disposed = false;
  const timers = new Set();
  context.onCleanup(() => {
    disposed = true;
    for (const timer of timers) clearTimeout(timer);
    timers.clear();
  });
  const component = defineComponent({
    props: ["pageId", "host"],
    setup(props) {
      const message = ref("");
      const busy = ref(false);
      const output = ref("");
      async function run(id) {
        busy.value = true;
        try {
          const result = await props.host.runAction(id);
          if (!disposed) output.value = JSON.stringify(result, null, 2);
        } catch {
          if (!disposed) output.value = "This capability is unavailable. Check the plugin permissions and runtime diagnostics.";
        } finally {
          if (!disposed) busy.value = false;
        }
      }
      function toast() {
        message.value = "Demo toast: zero helpful advice delivered.";
        const timer = setTimeout(() => {
          timers.delete(timer);
          if (!disposed) message.value = "";
        }, 4000);
        timers.add(timer);
      }
      const button = (label, action) => h("button", { type: "button", disabled: busy.value, onClick: action }, label);
      const open = () => context.host.navigate(`/plugins/${context.pluginId}/showcase`);
      const card = (capability, description, label, action) => h("article", { class: "help-demo-card" }, [
        h("code", capability), h("p", description), button(label, action),
      ]);
      return () => {
        if (props.pageId === "floating") return h("div", { class: "help-demo-floating" }, [
          button("? Help showcase", () => context.host.openDialog("help-modal")),
          button("Explore capabilities", open),
        ]);
        if (props.pageId === "home-card") return h("aside", { class: "help-demo" }, [
          h("strong", "Home extension · intentionally unhelpful"),
          h("p", "frontend.page.extend adds this card beneath your widgets."), button("Explore showcase", open),
        ]);
        return h("section", { class: "help-demo" }, [
          h("p", { class: "help-demo-badge" }, "CAPABILITY SHOWCASE · PRIVILEGED NATIVE FRONTEND"),
          h("h2", "Help, with absolutely no useful advice"),
          h("p", "The floating button, sidebar, Settings section, Home card and game action are separate host contributions. Configuration is available in Plugins → Help Button → Settings."),
          h("div", { class: "help-demo-grid" }, [
            card("frontend.dialog", "A declared modal rendered and managed by the host.", "Open host dialog", () => context.host.openDialog("help-modal")),
            card("frontend.native", "This local toast uses native Vue. It does not send a host notification.", "Show demo toast", toast),
            card("notifications.send", "Send a real notification to the signed-in user.", "Send notification", () => run("notify")),
            card("plugin.storage", "Remember a visit through the gateway, scoped by authenticated action context.", "Remember visit", () => run("remember")),
            card("plugin.storage", "Read the persisted demo visit after a page reload.", "Read visit", () => run("inspect-state")),
            card("events.subscribe", "Inspect current-user activity event types without copying event payloads.", "Poll events", () => run("activity")),
            card("external_navigation", "The host validates the declared action's HTTPS navigation result.", "Open suspicious help video", async () => {
              if (!window.confirm("Open the demo YouTube video in a new tab?")) return;
              // This privileged surface follows the same bounded result contract.
              const tab = window.open("about:blank", "_blank");
              if (tab) tab.opener = null;
              try {
                const result = await props.host.runAction("rickroll");
                if (result.redirect_url !== "https://www.youtube.com/watch?v=dQw4w9WgXcQ") throw new Error("Unexpected destination");
                if (tab) tab.location.href = result.redirect_url;
              } catch { if (tab) tab.close(); output.value = "External navigation failed."; }
            }),
          ]),
          message.value ? h("p", { class: "help-demo-toast", role: "status" }, message.value) : null,
          output.value ? h("pre", { role: "status" }, output.value) : null,
        ]);
      };
    },
  });
  for (const page of ["help", "floating", "home-card"]) context.registerComponent(page, component);
}
