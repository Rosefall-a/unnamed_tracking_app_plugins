// Public v1.1 native SDK only. The host supplies Vue and scoped action access.
export function activate(context) {
  const { defineComponent, h, ref, computed, onBeforeUnmount } = context.vue;
  const glance = (mobile) => defineComponent({
    props: { widgetConfig: { type: Object, default: () => ({}) } },
    setup(props) {
      const games = ref([]);
      const busy = ref(false);
      const error = ref("");
      let disposed = false;
      onBeforeUnmount(() => { disposed = true; });
      async function refresh() {
        if (busy.value) return;
        busy.value = true; error.value = "";
        try {
          const result = await context.host.runAction("library-glance");
          if (!disposed) games.value = result.games || [];
        } catch {
          if (!disposed) error.value = "Your library could not load. Try again.";
        } finally { if (!disposed) busy.value = false; }
      }
      const visible = computed(() => games.value.slice(0, Math.max(1, Math.min(8, Number(props.widgetConfig.limit) || 4))));
      void refresh();
      return () => h("div", { class: ["home-demo", mobile ? "home-demo-phone" : "home-demo-desktop"], "data-widget-layout": mobile ? "phone" : "desktop" }, [
        h("p", { class: "home-demo-hint" }, "A few picks from your library, sorted by title."),
        error.value ? h("p", { role: "alert" }, error.value) : busy.value ? h("p", { role: "status" }, "Loading your library…") :
          visible.value.length ? h("ul", { class: "home-demo-games" }, visible.value.map(game => h("li", { key: game.id }, [
            h("button", { type: "button", class: "home-demo-game", onClick: () => context.host.navigate(`/games/${encodeURIComponent(game.id)}`) }, game.title),
          ]))) : h("p", { class: "home-demo-hint" }, "Add a game to start your library."),
        h("div", { class: "home-demo-actions" }, [
          h("button", { type: "button", class: "ui-btn ui-btn-primary", onClick: () => context.host.navigate("/games") }, "Open library"),
          h("button", { type: "button", class: "ui-btn ui-btn-ghost", disabled: busy.value, onClick: refresh }, busy.value ? "Refreshing…" : "Refresh"),
        ]),
      ]);
    },
  });
  context.registerComponent("library-glance", glance(false));
  context.registerComponent("library-glance-mobile", glance(true));
  context.registerComponent("embedded-media", defineComponent({
    setup() {
      return () => h("div", { class: "home-demo-media" }, [
        h("iframe", { src: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0",
          title: "Embedded media player", allow: "autoplay; encrypted-media; fullscreen; picture-in-picture",
          allowFullscreen: true, referrerPolicy: "strict-origin-when-cross-origin" }),
      ]);
    },
  }));
}
