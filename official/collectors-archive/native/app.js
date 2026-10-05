var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// public-runtime:@unnamed/plugin-vue
function configure(context2) {
  ({ BaseTransition, BaseTransitionPropsValidators, Comment, DeprecationTypes, EffectScope, ErrorCodes, ErrorTypeStrings, Fragment, KeepAlive, ReactiveEffect, Static, Suspense, Teleport, Text, TrackOpTypes, Transition, TransitionGroup, TriggerOpTypes, VueElement, __esModule, assertNumber, callWithAsyncErrorHandling, callWithErrorHandling, camelize, capitalize, cloneVNode, compatUtils, compile, computed, createApp, createBlock, createCommentVNode, createElementBlock, createElementVNode, createHydrationRenderer, createPropsRestProxy, createRenderer, createSSRApp, createSlots, createStaticVNode, createTextVNode, createVNode, customRef, defineAsyncComponent, defineComponent, defineCustomElement, defineEmits, defineExpose, defineModel, defineOptions, defineProps, defineSSRCustomElement, defineSlots, devtools, effect, effectScope, getCurrentInstance, getCurrentScope, getCurrentWatcher, getTransitionRawChildren, guardReactiveProps, h, handleError, hasInjectionContext, hydrate, hydrateOnIdle, hydrateOnInteraction, hydrateOnMediaQuery, hydrateOnVisible, initCustomFormatter, initDirectivesForSSR, inject, isMemoSame, isProxy, isReactive, isReadonly, isRef, isRuntimeOnly, isShallow, isVNode, markRaw, mergeDefaults, mergeModels, mergeProps, nextTick, nodeOps, normalizeClass, normalizeProps, normalizeStyle, onActivated, onBeforeMount, onBeforeUnmount, onBeforeUpdate, onDeactivated, onErrorCaptured, onMounted, onRenderTracked, onRenderTriggered, onScopeDispose, onServerPrefetch, onUnmounted, onUpdated, onWatcherCleanup, openBlock, patchProp, popScopeId, provide, proxyRefs, pushScopeId, queuePostFlushCb, reactive, readonly, ref, registerRuntimeCompiler, render, renderList, renderSlot, resolveComponent, resolveDirective, resolveDynamicComponent, resolveFilter, resolveTransitionHooks, setBlockTracking, setDevtoolsHook, setTransitionHooks, shallowReactive, shallowReadonly, shallowRef, ssrContextKey, ssrUtils, stop, toDisplayString, toHandlerKey, toHandlers, toRaw, toRef, toRefs, toValue, transformVNodeArgs, triggerRef, unref, useAttrs, useCssModule, useCssVars, useHost, useId, useModel, useSSRContext, useShadowRoot, useSlots, useTemplateRef, useTransitionState, vModelCheckbox, vModelDynamic, vModelRadio, vModelSelect, vModelText, vShow, version, warn, watch, watchEffect, watchPostEffect, watchSyncEffect, withAsyncContext, withCtx, withDefaults, withDirectives, withKeys, withMemo, withModifiers, withScopeId } = context2.vue);
}
var BaseTransition, BaseTransitionPropsValidators, Comment, DeprecationTypes, EffectScope, ErrorCodes, ErrorTypeStrings, Fragment, KeepAlive, ReactiveEffect, Static, Suspense, Teleport, Text, TrackOpTypes, Transition, TransitionGroup, TriggerOpTypes, VueElement, __esModule, assertNumber, callWithAsyncErrorHandling, callWithErrorHandling, camelize, capitalize, cloneVNode, compatUtils, compile, computed, createApp, createBlock, createCommentVNode, createElementBlock, createElementVNode, createHydrationRenderer, createPropsRestProxy, createRenderer, createSSRApp, createSlots, createStaticVNode, createTextVNode, createVNode, customRef, defineAsyncComponent, defineComponent, defineCustomElement, defineEmits, defineExpose, defineModel, defineOptions, defineProps, defineSSRCustomElement, defineSlots, devtools, effect, effectScope, getCurrentInstance, getCurrentScope, getCurrentWatcher, getTransitionRawChildren, guardReactiveProps, h, handleError, hasInjectionContext, hydrate, hydrateOnIdle, hydrateOnInteraction, hydrateOnMediaQuery, hydrateOnVisible, initCustomFormatter, initDirectivesForSSR, inject, isMemoSame, isProxy, isReactive, isReadonly, isRef, isRuntimeOnly, isShallow, isVNode, markRaw, mergeDefaults, mergeModels, mergeProps, nextTick, nodeOps, normalizeClass, normalizeProps, normalizeStyle, onActivated, onBeforeMount, onBeforeUnmount, onBeforeUpdate, onDeactivated, onErrorCaptured, onMounted, onRenderTracked, onRenderTriggered, onScopeDispose, onServerPrefetch, onUnmounted, onUpdated, onWatcherCleanup, openBlock, patchProp, popScopeId, provide, proxyRefs, pushScopeId, queuePostFlushCb, reactive, readonly, ref, registerRuntimeCompiler, render, renderList, renderSlot, resolveComponent, resolveDirective, resolveDynamicComponent, resolveFilter, resolveTransitionHooks, setBlockTracking, setDevtoolsHook, setTransitionHooks, shallowReactive, shallowReadonly, shallowRef, ssrContextKey, ssrUtils, stop, toDisplayString, toHandlerKey, toHandlers, toRaw, toRef, toRefs, toValue, transformVNodeArgs, triggerRef, unref, useAttrs, useCssModule, useCssVars, useHost, useId, useModel, useSSRContext, useShadowRoot, useSlots, useTemplateRef, useTransitionState, vModelCheckbox, vModelDynamic, vModelRadio, vModelSelect, vModelText, vShow, version, warn, watch, watchEffect, watchPostEffect, watchSyncEffect, withAsyncContext, withCtx, withDefaults, withDirectives, withKeys, withMemo, withModifiers, withScopeId;
var init_plugin_vue = __esm({
  "public-runtime:@unnamed/plugin-vue"() {
  }
});

// public-runtime:@unnamed/plugin-ui
function configure2(context2) {
  ({ PageHeader, UiModal, AppIcon, AccountChip, PasswordInput } = context2.ui);
}
var PageHeader, UiModal, AppIcon, AccountChip, PasswordInput;
var init_plugin_ui = __esm({
  "public-runtime:@unnamed/plugin-ui"() {
  }
});

// .validation/companion-plugins/official/collectors-archive/ui/native/host.ts
function configureHost(value) {
  context = value;
}
function host() {
  return context.host;
}
async function archiveAction(values, action = "api") {
  const encoded = JSON.stringify(values).replace(
    /[\u0080-\uffff]/g,
    (character) => "\\u" + character.charCodeAt(0).toString(16).padStart(4, "0")
  );
  let request = values;
  let token;
  try {
    if (new TextEncoder().encode(encoded).length > 32e3) {
      token = crypto.randomUUID();
      const count = Math.ceil(encoded.length / 8e3);
      for (let start = 0; start < count; start += 4) {
        await Promise.all(Array.from({ length: Math.min(4, count - start) }, (_, offset) => {
          const index = start + offset;
          return host().runAction("transport-write", { token, count, index, content: encoded.slice(index * 8e3, (index + 1) * 8e3) });
        }));
      }
      request = { request_id: token };
    }
    const result = await host().runAction(action, request);
    const transfer = result.transfer;
    if (!transfer) return result;
    try {
      const chunks = [];
      for (let start = 0; start < transfer.count; start += 4) {
        const batch = await Promise.all(Array.from(
          { length: Math.min(4, transfer.count - start) },
          (_, offset) => host().runAction("transport-read", { token: transfer.token, index: start + offset })
        ));
        chunks.push(...batch.map((chunk) => String(chunk.content)));
      }
      return JSON.parse(chunks.join(""));
    } finally {
      await host().runAction("transport-drop", { token: transfer.token });
    }
  } finally {
    if (token) await host().runAction("transport-drop", { token });
  }
}
async function pluginRequest(path, options = {}) {
  let result = await archiveAction({
    path,
    method: options.method ?? "GET",
    body: options.body ? JSON.parse(String(options.body)) : {}
  });
  const body = result.body;
  while (result.next_offset != null) {
    const [pathname, query] = path.split("?");
    const params = new URLSearchParams(query);
    params.set("offset", String(result.next_offset));
    result = await archiveAction({ path: pathname + "?" + params, method: "GET" });
    if (Number(result.status_code) >= 400) return new Response(JSON.stringify(result.body), { status: Number(result.status_code) });
    if (Array.isArray(body)) body.push(...result.body);
    else for (const key of ["bounties", "transactions"]) {
      const aggregate = body;
      const page = result.body;
      if (Array.isArray(aggregate[key])) aggregate[key].push(...page[key]);
    }
  }
  const status = Number(result.status_code ?? 200);
  return new Response(status === 204 ? null : JSON.stringify(body), { status });
}
var context;
var init_host = __esm({
  ".validation/companion-plugins/official/collectors-archive/ui/native/host.ts"() {
  }
});

// .validation/companion-plugins/official/collectors-archive/ui/native/router.ts
function archivePath(path) {
  const [pathname, query] = path.split("?");
  const match = pathname.match(/^\/(cards|sets)(?:\/([^/]+))?$/);
  if (match) {
    const page = match[2] ? match[1] === "cards" ? "card-detail" : "set-detail" : match[1];
    const params = new URLSearchParams(query);
    if (match[2]) params.set("record_id", match[2]);
    const suffix = params.toString();
    return `/plugins/official.collectors-archive/${page}${suffix ? "?" + suffix : ""}`;
  }
  if (pathname === "/bounties") return "/plugins/official.collectors-archive/bounties" + (query ? "?" + query : "");
  return path;
}
function useRouter() {
  return { push: (path) => host().navigate(archivePath(path)) };
}
function useRoute() {
  return inject("collector-route", { params: { cardId: "", setId: "", id: "" }, query: {} });
}
var RouterLink;
var init_router = __esm({
  ".validation/companion-plugins/official/collectors-archive/ui/native/router.ts"() {
    init_plugin_vue();
    init_host();
    RouterLink = defineComponent({
      props: { to: { type: String, required: true } },
      setup(props, { slots, attrs }) {
        return () => h("a", { ...attrs, href: archivePath(props.to), onClick(event) {
          if (event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          void host().navigate(archivePath(props.to));
        } }, slots.default?.());
      }
    });
  }
});

// .validation/companion-plugins/official/collectors-archive/ui/services/cards.ts
function toIso(seconds) {
  return new Date(seconds * 1e3).toISOString();
}
function mapBackendCard(raw) {
  return {
    id: raw.id,
    gameId: raw.game_id,
    archiveNumber: raw.archive_number,
    setId: raw.set_id,
    rarity: raw.rarity,
    bountyId: raw.bounty_id,
    cardCustomization: raw.card_customization,
    status: raw.status,
    createdAt: toIso(raw.created_at),
    updatedAt: toIso(raw.updated_at)
  };
}
async function handle(response, action) {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Failed to ${action}: ${response.status} ${message}`);
  }
  return response.json();
}
async function listCards(filters) {
  const params = new URLSearchParams();
  if (filters?.gameId) params.set("game_id", filters.gameId);
  if (filters?.setId) params.set("set_id", filters.setId);
  const query = params.toString() ? `?${params.toString()}` : "";
  const response = await pluginRequest(`cards${query}`, {
    credentials: "include"
  });
  const raw = await handle(response, "list cards");
  return raw.map(mapBackendCard);
}
async function getCard(id) {
  const response = await pluginRequest(`cards/${id}`, { credentials: "include" });
  const raw = await handle(response, `fetch card ${id}`);
  return mapBackendCard(raw);
}
async function createCard(input) {
  const response = await pluginRequest("cards", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      game_id: input.gameId,
      set_id: input.setId ?? null,
      rarity: input.rarity ?? null,
      card_customization: input.cardCustomization ?? null
    })
  });
  const raw = await handle(response, "create card");
  return mapBackendCard(raw);
}
async function updateCard(id, fields) {
  const body = {};
  if ("setId" in fields) body.set_id = fields.setId;
  if ("rarity" in fields) body.rarity = fields.rarity;
  if ("cardCustomization" in fields)
    body.card_customization = fields.cardCustomization;
  if ("status" in fields) body.status = fields.status;
  const response = await pluginRequest(`cards/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const raw = await handle(response, `update card ${id}`);
  return mapBackendCard(raw);
}
async function generatePrestigeChallenge(id) {
  const response = await pluginRequest(`cards/${id}/prestige-challenge`, {
    method: "POST",
    credentials: "include"
  });
  const raw = await handle(
    response,
    `generate prestige challenge for card ${id}`
  );
  return mapBackendCard(raw);
}
var init_cards = __esm({
  ".validation/companion-plugins/official/collectors-archive/ui/services/cards.ts"() {
    init_host();
  }
});

// .validation/companion-plugins/official/collectors-archive/ui/services/games.ts
function mapGame(raw) {
  const assets = raw.assets;
  const total = Number(raw.achievement_total ?? 0);
  return {
    id: String(raw.id),
    title: String(raw.title),
    status: String(raw.status).toLowerCase().replaceAll("_", " "),
    coverImageUrl: assets.key_art,
    bannerImageUrl: assets.banner,
    coverColor: "var(--ui-surface-2)",
    ratingOverall: raw.rating_overall == null ? null : Number(raw.rating_overall),
    ratingStory: raw.rating_story == null ? null : Number(raw.rating_story),
    ratingGameplay: raw.rating_gameplay == null ? null : Number(raw.rating_gameplay),
    ratingSound: raw.rating_soundtrack == null ? null : Number(raw.rating_soundtrack),
    achievementTotal: total,
    achievementPercent: total ? Number(raw.achievement_unlocked) / total * 100 : 0,
    achievements: [],
    description: raw.description,
    developer: raw.developer,
    publisher: raw.publisher,
    series: raw.series,
    tags: raw.tags,
    features: raw.features,
    source: raw.source,
    platform: raw.platform,
    collections: raw.collections ?? [],
    platforms: [{
      platform: String(raw.platform ?? raw.source ?? "PC"),
      source: String(raw.source ?? "manual"),
      playtimeMinutes: Number(raw.playtime_seconds ?? 0) / 60
    }],
    favorite: Boolean(raw.favorite),
    dateAdded: new Date(Number(raw.created_at) * 1e3).toISOString(),
    lastPlayedAt: raw.last_played_at ? new Date(Number(raw.last_played_at) * 1e3).toISOString() : null,
    timeToBeatHours: raw.time_to_beat_hours == null ? null : Number(raw.time_to_beat_hours),
    region: raw.region,
    language: raw.language,
    completionDate: raw.completion_date ? new Date(Number(raw.completion_date) * 1e3).toISOString() : null,
    releaseDate: raw.release_date
  };
}
async function fetchGames() {
  const games = [];
  let offset = 0;
  while (true) {
    const result = await archiveAction({ operation: "list", offset }, "games");
    games.push(...result.games.map(mapGame));
    if (result.complete) return games;
    offset = Number(result.next_offset);
  }
}
async function gameData(id) {
  const achievements = [];
  let offset = 0;
  while (true) {
    const result = await archiveAction({ operation: "get", game_id: id, offset }, "games");
    achievements.push(...result.achievements);
    if (result.complete) return { raw: result.game, achievements };
    offset = Number(result.next_offset);
  }
}
function mapAchievement(raw) {
  return {
    id: String(raw.id),
    name: String(raw.name),
    description: raw.description,
    unlockedAt: raw.unlocked ? new Date(Number(raw.unlocked_at ?? 0) * 1e3).toISOString() : null
  };
}
async function fetchGame(id) {
  const { raw, achievements } = await gameData(id);
  raw.achievement_total = achievements.length;
  raw.achievement_unlocked = achievements.filter((a) => a.unlocked).length;
  return { ...mapGame(raw), achievements: achievements.map(mapAchievement) };
}
async function fetchGameAchievements(id) {
  return (await gameData(id)).achievements.map(mapAchievement);
}
var init_games = __esm({
  ".validation/companion-plugins/official/collectors-archive/ui/services/games.ts"() {
    init_host();
  }
});

// .validation/companion-plugins/official/collectors-archive/ui/services/bounties.ts
async function handle2(response, action) {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.detail || `Failed to ${action}: ${response.status} ${response.statusText}`
    );
  }
  return response.json();
}
async function fetchBounties(filters) {
  if (false) return [];
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.type) params.set("type", filters.type);
  const query = params.toString() ? `?${params.toString()}` : "";
  const response = await pluginRequest(`bounties${query}`, {
    credentials: "include"
  });
  const body = await handle2(response, "fetch bounties");
  return body.bounties;
}
async function fetchBounty(id) {
  const response = await pluginRequest(`bounties/${id}`, {
    credentials: "include"
  });
  const body = await handle2(response, "fetch bounty");
  return body.bounty;
}
async function createBounty(input) {
  const response = await pluginRequest("bounties", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  const body = await handle2(response, "create bounty");
  return body.bounty;
}
async function updateBounty(id, input) {
  const response = await pluginRequest(`bounties/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  const body = await handle2(response, "update bounty");
  return body.bounty;
}
async function completeBounty(id) {
  await handle2(
    await pluginRequest(`bounties/${id}/complete`, {
      method: "POST",
      credentials: "include"
    }),
    "complete bounty"
  );
}
async function pauseBounty(id) {
  await handle2(
    await pluginRequest(`bounties/${id}/pause`, {
      method: "POST",
      credentials: "include"
    }),
    "pause bounty"
  );
}
async function resumeBounty(id) {
  await handle2(
    await pluginRequest(`bounties/${id}/resume`, {
      method: "POST",
      credentials: "include"
    }),
    "resume bounty"
  );
}
async function abandonBounty(id) {
  await handle2(
    await pluginRequest(`bounties/${id}/abandon`, {
      method: "POST",
      credentials: "include"
    }),
    "abandon bounty"
  );
}
async function deleteBounty(id) {
  await handle2(
    await pluginRequest(`bounties/${id}`, {
      method: "DELETE",
      credentials: "include"
    }),
    "delete bounty"
  );
}
async function fetchPointsTotal() {
  const response = await pluginRequest("bounties/points/total", {
    credentials: "include"
  });
  const body = await handle2(response, "fetch points total");
  return body.total;
}
async function fetchPointsHistory() {
  const response = await pluginRequest("bounties/points/history", {
    credentials: "include"
  });
  const body = await handle2(
    response,
    "fetch points history"
  );
  return body.transactions;
}
async function createObjective(bountyId, input) {
  const response = await pluginRequest(`bounties/${bountyId}/objectives`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  const body = await handle2(response, "create objective");
  return body.bounty;
}
async function updateObjective(bountyId, objectiveId, input) {
  const response = await pluginRequest(
    `bounties/${bountyId}/objectives/${objectiveId}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    }
  );
  const body = await handle2(response, "update objective");
  return body.bounty;
}
async function deleteObjective(bountyId, objectiveId) {
  await handle2(
    await pluginRequest(`bounties/${bountyId}/objectives/${objectiveId}`, {
      method: "DELETE",
      credentials: "include"
    }),
    "delete objective"
  );
}
async function createEvidence(bountyId, input) {
  const response = await pluginRequest(`bounties/${bountyId}/evidence`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  const body = await handle2(
    response,
    "create evidence"
  );
  return body.evidence;
}
async function deleteEvidence(bountyId, evidenceId) {
  await handle2(
    await pluginRequest(`bounties/${bountyId}/evidence/${evidenceId}`, {
      method: "DELETE",
      credentials: "include"
    }),
    "delete evidence"
  );
}
async function createJournalEntry(bountyId, text) {
  const response = await pluginRequest(`bounties/${bountyId}/journal`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });
  const body = await handle2(
    response,
    "add journal entry"
  );
  return body.entry;
}
async function deleteJournalEntry(bountyId, entryId) {
  await handle2(
    await pluginRequest(`bounties/${bountyId}/journal/${entryId}`, {
      method: "DELETE",
      credentials: "include"
    }),
    "delete journal entry"
  );
}
async function fetchRandomBountyProposal() {
  const response = await pluginRequest("bounties/random", {
    credentials: "include"
  });
  const body = await handle2(
    response,
    "fetch random bounty"
  );
  return body.proposal;
}
var init_bounties = __esm({
  ".validation/companion-plugins/official/collectors-archive/ui/services/bounties.ts"() {
    init_host();
  }
});

// .validation/companion-plugins/official/collectors-archive/ui/views/CardCollection.vue
var CardCollection_exports = {};
__export(CardCollection_exports, {
  default: () => CardCollection_default
});
var _hoisted_1, _hoisted_2, _hoisted_3, _hoisted_4, _hoisted_5, _hoisted_6, _hoisted_7, _hoisted_8, _hoisted_9, _hoisted_10, _hoisted_11, _hoisted_12, _hoisted_13, component, CardCollection_default;
var init_CardCollection = __esm({
  ".validation/companion-plugins/official/collectors-archive/ui/views/CardCollection.vue"() {
    init_plugin_vue();
    init_plugin_vue();
    init_plugin_ui();
    init_plugin_ui();
    init_plugin_ui();
    init_plugin_vue();
    init_router();
    init_cards();
    init_games();
    init_bounties();
    _hoisted_1 = { class: "cards-page" };
    _hoisted_2 = {
      key: 0,
      class: "empty-state"
    };
    _hoisted_3 = {
      key: 1,
      class: "picker-list"
    };
    _hoisted_4 = ["disabled", "onClick"];
    _hoisted_5 = {
      key: 1,
      class: "empty-state"
    };
    _hoisted_6 = {
      key: 2,
      class: "empty-state error"
    };
    _hoisted_7 = {
      key: 3,
      class: "empty-state"
    };
    _hoisted_8 = {
      key: 4,
      class: "cards-grid"
    };
    _hoisted_9 = ["onClick"];
    _hoisted_10 = {
      key: 0,
      class: "rarity-chip"
    };
    _hoisted_11 = {
      key: 1,
      class: "prestige-chip"
    };
    _hoisted_12 = { class: "card-tile-title" };
    _hoisted_13 = { class: "card-tile-num" };
    component = /* @__PURE__ */ defineComponent({
      __name: "CardCollection",
      setup(__props) {
        const router = useRouter();
        const cards = ref([]);
        const games = ref([]);
        const bounties = ref([]);
        const loading = ref(true);
        const error = ref(null);
        const showPicker = ref(false);
        const pickerQuery = ref("");
        const creating = ref(false);
        const RARITY_LETTER = {
          common: "C",
          uncommon: "U",
          rare: "R",
          legendary: "L",
          mythic: "M"
        };
        const gameById = computed(() => new Map(games.value.map((g) => [g.id, g])));
        const bountyById = computed(
          () => new Map(bounties.value.map((b) => [b.id, b]))
        );
        function isCardPrestiged(c) {
          return !!c.bountyId && bountyById.value.get(c.bountyId)?.status === "completed";
        }
        const eligibleGames = computed(() => {
          const cardedGameIds = new Set(cards.value.map((c) => c.gameId));
          return games.value.filter(
            (g) => (g.status === "beaten" || g.status === "mastered") && !cardedGameIds.has(g.id) && g.title.toLowerCase().includes(pickerQuery.value.toLowerCase())
          );
        });
        async function load() {
          loading.value = true;
          try {
            const [c, g, b] = await Promise.all([
              listCards(),
              fetchGames(),
              fetchBounties()
            ]);
            cards.value = c;
            games.value = g;
            bounties.value = b;
          } catch (e) {
            error.value = e instanceof Error ? e.message : "Failed to load cards.";
          } finally {
            loading.value = false;
          }
        }
        async function handleCreate(gameId) {
          creating.value = true;
          try {
            const card = await createCard({ gameId });
            router.push(`/cards/${card.id}`);
          } catch (e) {
            error.value = e instanceof Error ? e.message : "Failed to create card.";
          } finally {
            creating.value = false;
          }
        }
        onMounted(load);
        return (_ctx, _cache) => {
          return openBlock(), createElementBlock("main", _hoisted_1, [
            createVNode(unref(AccountChip), { fixed: "" }),
            createVNode(unref(PageHeader), {
              title: "Cards",
              description: "Every Collector Card you've generated, front-face up."
            }, {
              actions: withCtx(() => [
                createElementVNode("button", {
                  type: "button",
                  class: "ui-btn ui-btn-primary",
                  onClick: _cache[0] || (_cache[0] = ($event) => showPicker.value = true),
                  "data-shortcut": "create"
                }, " New card ")
              ]),
              _: 1
              /* STABLE */
            }),
            showPicker.value ? (openBlock(), createBlock(unref(UiModal), {
              key: 0,
              title: "New card",
              description: "Choose a Beaten or Mastered game that doesn't already have a card.",
              dismissible: !creating.value,
              onClose: _cache[2] || (_cache[2] = ($event) => showPicker.value = false)
            }, {
              default: withCtx(() => [
                withDirectives(createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => pickerQuery.value = $event),
                    type: "text",
                    class: "text-input",
                    placeholder: "Search Beaten/Mastered games\u2026",
                    "aria-label": "Search eligible games"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vModelText, pickerQuery.value]
                ]),
                !eligibleGames.value.length ? (openBlock(), createElementBlock("p", _hoisted_2, " No eligible games. A card can only be made for a game marked Beaten or Mastered that doesn't already have one. ")) : (openBlock(), createElementBlock("ul", _hoisted_3, [
                  (openBlock(true), createElementBlock(
                    Fragment,
                    null,
                    renderList(eligibleGames.value, (g) => {
                      return openBlock(), createElementBlock("li", {
                        key: g.id,
                        class: "picker-item"
                      }, [
                        createElementVNode(
                          "span",
                          null,
                          toDisplayString(g.title),
                          1
                          /* TEXT */
                        ),
                        createElementVNode("button", {
                          type: "button",
                          class: "secondary-button",
                          disabled: creating.value,
                          onClick: ($event) => handleCreate(g.id)
                        }, " Create ", 8, _hoisted_4)
                      ]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ]))
              ]),
              _: 1
              /* STABLE */
            }, 8, ["dismissible"])) : createCommentVNode("v-if", true),
            loading.value ? (openBlock(), createElementBlock("p", _hoisted_5, "Loading\u2026")) : error.value ? (openBlock(), createElementBlock(
              "p",
              _hoisted_6,
              toDisplayString(error.value),
              1
              /* TEXT */
            )) : !cards.value.length ? (openBlock(), createElementBlock("p", _hoisted_7, "No cards yet.")) : (openBlock(), createElementBlock("div", _hoisted_8, [
              (openBlock(true), createElementBlock(
                Fragment,
                null,
                renderList(cards.value, (c) => {
                  return openBlock(), createElementBlock("button", {
                    key: c.id,
                    type: "button",
                    class: "card-tile",
                    onClick: ($event) => unref(router).push(`/cards/${c.id}`)
                  }, [
                    c.rarity ? (openBlock(), createElementBlock(
                      "span",
                      _hoisted_10,
                      toDisplayString(RARITY_LETTER[c.rarity]),
                      1
                      /* TEXT */
                    )) : createCommentVNode("v-if", true),
                    isCardPrestiged(c) ? (openBlock(), createElementBlock("span", _hoisted_11, "P")) : createCommentVNode("v-if", true),
                    createElementVNode(
                      "span",
                      _hoisted_12,
                      toDisplayString(gameById.value.get(c.gameId)?.title ?? "Unknown game"),
                      1
                      /* TEXT */
                    ),
                    createElementVNode(
                      "span",
                      _hoisted_13,
                      "#" + toDisplayString(String(c.archiveNumber ?? 0).padStart(3, "0")),
                      1
                      /* TEXT */
                    )
                  ], 8, _hoisted_9);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ]))
          ]);
        };
      }
    });
    component.__scopeId = "data-v-562daa07";
    CardCollection_default = component;
  }
});

// .validation/companion-plugins/official/collectors-archive/ui/services/set.ts
function toIso2(seconds) {
  return new Date(seconds * 1e3).toISOString();
}
function mapBackendSet(raw) {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    targetTotal: raw.target_total,
    cardCount: raw.card_count,
    isComplete: raw.is_complete,
    createdAt: toIso2(raw.created_at),
    updatedAt: toIso2(raw.updated_at)
  };
}
function mapBackendSetDetail(raw) {
  return {
    ...mapBackendSet(raw),
    cards: raw.cards.map(mapBackendCard)
  };
}
async function handle3(response, action) {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Failed to ${action}: ${response.status} ${message}`);
  }
  return response.json();
}
async function fetchSets() {
  const response = await pluginRequest("sets", { credentials: "include" });
  const raw = await handle3(response, "fetch sets");
  return raw.map(mapBackendSet);
}
async function fetchSet(id) {
  const response = await pluginRequest(`sets/${id}`, { credentials: "include" });
  const raw = await handle3(response, `fetch set ${id}`);
  return mapBackendSetDetail(raw);
}
async function createSet(input) {
  const response = await pluginRequest("sets", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: input.name,
      description: input.description ?? null,
      target_total: input.targetTotal ?? null
    })
  });
  const raw = await handle3(response, "create set");
  return mapBackendSet(raw);
}
async function updateSet(id, input) {
  const body = {};
  if (input.name !== void 0) body.name = input.name;
  if (input.description !== void 0) body.description = input.description;
  if (input.targetTotal !== void 0) body.target_total = input.targetTotal;
  const response = await pluginRequest(`sets/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const raw = await handle3(response, `update set ${id}`);
  return mapBackendSet(raw);
}
async function deleteSet(id) {
  const response = await pluginRequest(`sets/${id}`, {
    method: "DELETE",
    credentials: "include"
  });
  if (!response.ok && response.status !== 204) {
    throw new Error(`Failed to delete set ${id}: ${response.status}`);
  }
}
var init_set = __esm({
  ".validation/companion-plugins/official/collectors-archive/ui/services/set.ts"() {
    init_host();
    init_cards();
  }
});

// .validation/companion-plugins/official/collectors-archive/ui/types/card.ts
var DEFAULT_CARD_CUSTOMIZATION, CARD_SYMBOLS, CARD_SYMBOL_ORDER;
var init_card = __esm({
  ".validation/companion-plugins/official/collectors-archive/ui/types/card.ts"() {
    DEFAULT_CARD_CUSTOMIZATION = {
      frontTemplate: "classic",
      backTemplate: "emblem",
      titlePosition: "top",
      accent: "gold",
      borderColor: "black",
      cardFace: "dark",
      prestigeVariant: "foil",
      symbol: "star",
      symbol2: "none",
      symbolRotation: 0,
      customSymbol: null,
      customArt: null,
      memorableAchievement: "",
      personalNote: ""
    };
    CARD_SYMBOLS = {
      star: '<path d="M12 2l3.5 8.5L22 12l-6.5 1.5L12 22l-3.5-8.5L2 12l6.5-1.5z"/>',
      diamond: '<path d="M12 2l7 9-7 11-7-11z"/>',
      hex: '<path d="M12 2l8 5v10l-8 5-8-5V7z"/>',
      compass: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15 9l-2 6-6 2 2-6z"/>',
      shield: '<path d="M12 2l8 3.5v6c0 5-3.4 8.4-8 10.5-4.6-2.1-8-5.5-8-10.5v-6z"/>',
      circle: '<circle cx="12" cy="12" r="8.5"/>',
      crown: '<path d="M3 18h18l-1.5-9-4.5 3.5L12 5l-3 7.5L4.5 12.5z"/>',
      dagger: '<path d="M11 2h2v11h3l-4 9-4-9h3z"/>',
      laurel: '<path d="M12 3c5 2 7 7 5 13-6-1-9-6-8-11 1-1 2-2 3-2z"/>',
      flame: '<path d="M12 2c3 5 6 7 6 12a6 6 0 0 1-12 0c0-2 1-4 2-5-.3 2 .6 3 1.3 3 .9 0 1.2-1 .6-2.2C9 7.5 11 5 12 2z"/>',
      mountain: '<path d="M2 19L9 6l4 7 2-3 7 9z"/>',
      moon: '<path d="M19.5 14.5A8 8 0 1 1 9.5 4.5a6.5 6.5 0 0 0 10 10z"/>',
      feather: '<path d="M19 3C9 5 4 12 4 21c9-1 15-8 15-18z"/>',
      key: '<path d="M9 2a5 5 0 1 0 0 10 5 5 0 0 0 4.9-6H21v4h-2v3h-3v-3h-1.1A5 5 0 0 0 9 2zM9 5a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/>',
      book: '<path d="M4 4h7v16H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM13 4h7a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-7z"/>',
      anchor: '<circle cx="12" cy="5" r="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v13M6 12H2a10 10 0 0 0 8 9M18 12h4a10 10 0 0 1-8 9M6 15h12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
      banner: '<path d="M6 2h13l-3 5 3 5H6v10H4V2z"/>',
      helm: '<path d="M12 2C7.6 2 4 5.4 4 9.6v2.5c0 1.3.5 2.5 1.3 3.4L6.4 21h2.1l.6-2.6h5.8l.6 2.6h2.1l1.1-5.5c.8-.9 1.3-2.1 1.3-3.4V9.6C20 5.4 16.4 2 12 2z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 11h8M9 14h6" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/>',
      swordscross: '<path d="M4 4l16 16M20 4L4 20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M8.5 8.5l2 2M15.5 8.5l-2 2M8.5 15.5l2-2M15.5 15.5l-2-2" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/>'
    };
    CARD_SYMBOL_ORDER = [
      "star",
      "diamond",
      "hex",
      "compass",
      "shield",
      "circle",
      "crown",
      "dagger",
      "laurel",
      "flame",
      "mountain",
      "moon",
      "feather",
      "key",
      "book",
      "anchor",
      "banner",
      "helm",
      "swordscross"
    ];
  }
});

// .validation/companion-plugins/official/collectors-archive/ui/views/CardDetail.vue
var CardDetail_exports = {};
__export(CardDetail_exports, {
  default: () => CardDetail_default
});
var _hoisted_14, _hoisted_22, _hoisted_32, _hoisted_42, _hoisted_52, _hoisted_62, _hoisted_72, _hoisted_82, _hoisted_92, _hoisted_102, _hoisted_112, _hoisted_122, _hoisted_132, _hoisted_142, _hoisted_15, _hoisted_16, _hoisted_17, _hoisted_18, _hoisted_19, _hoisted_20, _hoisted_21, _hoisted_222, _hoisted_23, _hoisted_24, _hoisted_25, _hoisted_26, _hoisted_27, _hoisted_28, _hoisted_29, _hoisted_30, _hoisted_31, _hoisted_322, _hoisted_33, _hoisted_34, _hoisted_35, _hoisted_36, _hoisted_37, _hoisted_38, _hoisted_39, _hoisted_40, _hoisted_41, _hoisted_422, _hoisted_43, _hoisted_44, _hoisted_45, _hoisted_46, _hoisted_47, _hoisted_48, _hoisted_49, _hoisted_50, _hoisted_51, _hoisted_522, _hoisted_53, _hoisted_54, _hoisted_55, _hoisted_56, _hoisted_57, _hoisted_58, _hoisted_59, _hoisted_60, _hoisted_61, _hoisted_622, _hoisted_63, _hoisted_64, _hoisted_65, _hoisted_66, _hoisted_67, _hoisted_68, _hoisted_69, _hoisted_70, _hoisted_71, _hoisted_722, _hoisted_73, _hoisted_74, _hoisted_75, _hoisted_76, _hoisted_77, _hoisted_78, _hoisted_79, _hoisted_80, _hoisted_81, _hoisted_822, _hoisted_83, _hoisted_84, _hoisted_85, _hoisted_86, _hoisted_87, _hoisted_88, _hoisted_89, _hoisted_90, _hoisted_91, _hoisted_922, _hoisted_93, _hoisted_94, _hoisted_95, _hoisted_96, _hoisted_97, _hoisted_98, _hoisted_99, _hoisted_100, _hoisted_101, _hoisted_1022, _hoisted_103, _hoisted_104, _hoisted_105, _hoisted_106, _hoisted_107, _hoisted_108, _hoisted_109, _hoisted_110, _hoisted_111, _hoisted_1122, _hoisted_113, _hoisted_114, _hoisted_115, _hoisted_116, _hoisted_117, _hoisted_118, _hoisted_119, _hoisted_120, _hoisted_121, _hoisted_1222, _hoisted_123, _hoisted_124, _hoisted_125, _hoisted_126, _hoisted_127, _hoisted_128, _hoisted_129, _hoisted_130, _hoisted_131, _hoisted_1322, _hoisted_133, _hoisted_134, _hoisted_135, _hoisted_136, _hoisted_137, _hoisted_138, _hoisted_139, _hoisted_140, _hoisted_141, _hoisted_1422, _hoisted_143, _hoisted_144, _hoisted_145, _hoisted_146, _hoisted_147, _hoisted_148, _hoisted_149, _hoisted_150, _hoisted_151, _hoisted_152, _hoisted_153, _hoisted_154, _hoisted_155, _hoisted_156, _hoisted_157, _hoisted_158, MAX_TILT, component2, CardDetail_default;
var init_CardDetail = __esm({
  ".validation/companion-plugins/official/collectors-archive/ui/views/CardDetail.vue"() {
    init_plugin_vue();
    init_plugin_vue();
    init_router();
    init_plugin_vue();
    init_router();
    init_cards();
    init_games();
    init_set();
    init_bounties();
    init_card();
    _hoisted_14 = { class: "designer-page" };
    _hoisted_22 = { class: "designer-header" };
    _hoisted_32 = { key: 0 };
    _hoisted_42 = { class: "archive-num" };
    _hoisted_52 = {
      key: 0,
      class: "empty-state"
    };
    _hoisted_62 = {
      key: 1,
      class: "empty-state error"
    };
    _hoisted_72 = {
      key: 2,
      class: "designer-layout"
    };
    _hoisted_82 = { class: "stage" };
    _hoisted_92 = ["data-template", "data-border-color", "data-face", "data-prestige", "data-prestige-variant", "data-title-pos"];
    _hoisted_102 = { class: "card-inner" };
    _hoisted_112 = { class: "art-layer" };
    _hoisted_122 = ["src"];
    _hoisted_132 = {
      key: 1,
      class: "art-fallback"
    };
    _hoisted_142 = { class: "content" };
    _hoisted_15 = {
      class: "row row-title plate",
      id: "rowTitleBar"
    };
    _hoisted_16 = { class: "title-name" };
    _hoisted_17 = { class: "title-meta" };
    _hoisted_18 = { class: "bottom-stack" };
    _hoisted_19 = { class: "rules-box plate" };
    _hoisted_20 = { class: "row row-type" };
    _hoisted_21 = { class: "type-title" };
    _hoisted_222 = ["src"];
    _hoisted_23 = ["innerHTML"];
    _hoisted_24 = { class: "row row-text" };
    _hoisted_25 = {
      key: 0,
      class: "stat-line"
    };
    _hoisted_26 = {
      key: 1,
      class: "stat-line"
    };
    _hoisted_27 = {
      key: 2,
      class: "stat-line"
    };
    _hoisted_28 = { class: "flavor-line" };
    _hoisted_29 = { class: "row row-collector plate" };
    _hoisted_30 = { class: "collector-left" };
    _hoisted_31 = ["src"];
    _hoisted_322 = ["innerHTML"];
    _hoisted_33 = {
      key: 0,
      class: "set-complete-tag"
    };
    _hoisted_34 = { class: "collector-right" };
    _hoisted_35 = ["data-face"];
    _hoisted_36 = { class: "back-emblem" };
    _hoisted_37 = { class: "medallion" };
    _hoisted_38 = ["src"];
    _hoisted_39 = ["innerHTML"];
    _hoisted_40 = {
      key: 0,
      class: "medallion-badge"
    };
    _hoisted_41 = { class: "icon-slot" };
    _hoisted_422 = ["innerHTML"];
    _hoisted_43 = { class: "back-setname" };
    _hoisted_44 = { class: "back-num" };
    _hoisted_45 = { class: "back-collector" };
    _hoisted_46 = { class: "medallion" };
    _hoisted_47 = ["src"];
    _hoisted_48 = ["innerHTML"];
    _hoisted_49 = { class: "bc-panel" };
    _hoisted_50 = { class: "bc-title" };
    _hoisted_51 = { class: "bc-stat-grid" };
    _hoisted_522 = { class: "bc-stat" };
    _hoisted_53 = { class: "val" };
    _hoisted_54 = { class: "bc-stat" };
    _hoisted_55 = { class: "val" };
    _hoisted_56 = { class: "bc-stat" };
    _hoisted_57 = { class: "val" };
    _hoisted_58 = { class: "bc-stat" };
    _hoisted_59 = { class: "val" };
    _hoisted_60 = { class: "bc-pills" };
    _hoisted_61 = { class: "bc-pill" };
    _hoisted_622 = {
      key: 0,
      class: "bc-pill bc-pill-prestige"
    };
    _hoisted_63 = {
      key: 0,
      class: "bc-section"
    };
    _hoisted_64 = { class: "val" };
    _hoisted_65 = {
      key: 1,
      class: "bc-section"
    };
    _hoisted_66 = { class: "val bc-note" };
    _hoisted_67 = {
      key: 2,
      class: "bc-section"
    };
    _hoisted_68 = { class: "val bc-note" };
    _hoisted_69 = { class: "back-record" };
    _hoisted_70 = { class: "record-top" };
    _hoisted_71 = { class: "icon-slot" };
    _hoisted_722 = ["src"];
    _hoisted_73 = ["innerHTML"];
    _hoisted_74 = { class: "record-top-num" };
    _hoisted_75 = { class: "record-main" };
    _hoisted_76 = { class: "record-title" };
    _hoisted_77 = { class: "record-completed" };
    _hoisted_78 = { class: "record-stats" };
    _hoisted_79 = {
      key: 0,
      class: "record-moment"
    };
    _hoisted_80 = { class: "record-moment-name" };
    _hoisted_81 = {
      key: 0,
      class: "record-moment-desc"
    };
    _hoisted_822 = { class: "record-bottom" };
    _hoisted_83 = { class: "stage-actions" };
    _hoisted_84 = { class: "panel" };
    _hoisted_85 = { class: "tabs" };
    _hoisted_86 = { class: "tab-panels" };
    _hoisted_87 = { class: "tab-panel" };
    _hoisted_88 = { class: "field" };
    _hoisted_89 = { class: "tpl-grid" };
    _hoisted_90 = ["onClick"];
    _hoisted_91 = {
      key: 0,
      class: "field"
    };
    _hoisted_922 = { class: "tpl-grid" };
    _hoisted_93 = ["onClick"];
    _hoisted_94 = { class: "field" };
    _hoisted_95 = { class: "tpl-grid" };
    _hoisted_96 = ["onClick"];
    _hoisted_97 = { class: "field" };
    _hoisted_98 = { class: "tpl-grid" };
    _hoisted_99 = ["onClick"];
    _hoisted_100 = { class: "field" };
    _hoisted_101 = { class: "tpl-grid" };
    _hoisted_1022 = ["onClick"];
    _hoisted_103 = { class: "field" };
    _hoisted_104 = { class: "accent-grid" };
    _hoisted_105 = ["onClick"];
    _hoisted_106 = { class: "tab-panel" };
    _hoisted_107 = {
      key: 0,
      class: "field"
    };
    _hoisted_108 = { class: "field-hint" };
    _hoisted_109 = {
      key: 1,
      class: "field"
    };
    _hoisted_110 = { class: "field-hint" };
    _hoisted_111 = ["disabled"];
    _hoisted_1122 = {
      key: 0,
      class: "field-hint error"
    };
    _hoisted_113 = { class: "field" };
    _hoisted_114 = { class: "prestige-status" };
    _hoisted_115 = { class: "prestige-status-title" };
    _hoisted_116 = { class: "field-hint" };
    _hoisted_117 = {
      key: 0,
      class: "field"
    };
    _hoisted_118 = { class: "tpl-grid" };
    _hoisted_119 = ["onClick"];
    _hoisted_120 = { class: "tab-panel" };
    _hoisted_121 = { class: "field" };
    _hoisted_1222 = ["src"];
    _hoisted_123 = ["innerHTML"];
    _hoisted_124 = { class: "tab-panel" };
    _hoisted_125 = { class: "field" };
    _hoisted_126 = { class: "upload-btn" };
    _hoisted_127 = { class: "field" };
    _hoisted_128 = { class: "field" };
    _hoisted_129 = { class: "tab-panel" };
    _hoisted_130 = { class: "field" };
    _hoisted_131 = { class: "rarity-grid" };
    _hoisted_1322 = ["onClick"];
    _hoisted_133 = { class: "field" };
    _hoisted_134 = ["value"];
    _hoisted_135 = { class: "panel-actions" };
    _hoisted_136 = ["disabled"];
    _hoisted_137 = {
      class: "modal",
      role: "dialog",
      "aria-label": "Symbol"
    };
    _hoisted_138 = { class: "modal-head" };
    _hoisted_139 = { class: "modal-body" };
    _hoisted_140 = { class: "field" };
    _hoisted_141 = { class: "icon-picker-grid" };
    _hoisted_1422 = ["onClick"];
    _hoisted_143 = { class: "icon-slot" };
    _hoisted_144 = ["innerHTML"];
    _hoisted_145 = { class: "field" };
    _hoisted_146 = { class: "slider-field" };
    _hoisted_147 = { class: "sf-head" };
    _hoisted_148 = { class: "field" };
    _hoisted_149 = { class: "icon-picker-grid" };
    _hoisted_150 = ["onClick"];
    _hoisted_151 = { class: "icon-slot" };
    _hoisted_152 = ["innerHTML"];
    _hoisted_153 = { class: "field" };
    _hoisted_154 = { class: "custom-icon-row" };
    _hoisted_155 = {
      key: 0,
      class: "icon-slot"
    };
    _hoisted_156 = ["src"];
    _hoisted_157 = { class: "small-upload-btn" };
    _hoisted_158 = { class: "modal-foot" };
    MAX_TILT = 12;
    component2 = /* @__PURE__ */ defineComponent({
      __name: "CardDetail",
      setup(__props) {
        const route = useRoute();
        const router = useRouter();
        const cardId = route.params.cardId;
        const card = ref(null);
        const game = ref(null);
        const sets = ref([]);
        const loading = ref(true);
        const error = ref(null);
        const saving = ref(false);
        const saved = ref(false);
        const flipped = ref(false);
        const artFailed = ref(false);
        const customization = ref({ ...DEFAULT_CARD_CUSTOMIZATION });
        const rarity = ref(null);
        const setId = ref(null);
        const activeTab = ref(
          "template"
        );
        const symbolModalOpen = ref(false);
        const bounty = ref(null);
        const generatingPrestige = ref(false);
        const prestigeError = ref(null);
        onMounted(async () => {
          try {
            const c = await getCard(cardId);
            card.value = c;
            customization.value = {
              ...DEFAULT_CARD_CUSTOMIZATION,
              ...c.cardCustomization ?? {}
            };
            rarity.value = c.rarity;
            setId.value = c.setId;
            const [g, s] = await Promise.all([fetchGame(c.gameId), fetchSets()]);
            game.value = g;
            sets.value = s;
            if (c.bountyId) {
              bounty.value = await fetchBounty(c.bountyId);
            }
          } catch (e) {
            error.value = e instanceof Error ? e.message : "Failed to load card.";
          } finally {
            loading.value = false;
          }
        });
        const isPrestige = computed(() => bounty.value?.status === "completed");
        const achievements100 = computed(() => {
          const g = game.value;
          return !!g && g.achievementTotal > 0 && g.achievementPercent >= 100;
        });
        async function generatePrestige() {
          if (!card.value) return;
          generatingPrestige.value = true;
          prestigeError.value = null;
          try {
            card.value = await generatePrestigeChallenge(card.value.id);
            if (card.value.bountyId) {
              bounty.value = await fetchBounty(card.value.bountyId);
            }
          } catch (e) {
            prestigeError.value = e instanceof Error ? e.message : "Failed to generate a prestige challenge.";
          } finally {
            generatingPrestige.value = false;
          }
        }
        const RARITY_LABEL = {
          common: "Common",
          uncommon: "Uncommon",
          rare: "Rare",
          legendary: "Legendary",
          mythic: "Mythic"
        };
        const ACCENTS = {
          gold: { gold: "#c8a35f", dim: "#8f7648", soft: "rgba(200,163,95,0.32)" },
          silver: { gold: "#c9ccd6", dim: "#8c8f99", soft: "rgba(201,204,214,0.32)" },
          bronze: { gold: "#b8793f", dim: "#8a5c33", soft: "rgba(184,121,63,0.32)" },
          copper: { gold: "#c17a52", dim: "#8f5b3d", soft: "rgba(193,122,82,0.32)" },
          rose: { gold: "#c99383", dim: "#93695d", soft: "rgba(201,147,131,0.32)" }
        };
        const accentVars = computed(() => {
          const a = ACCENTS[customization.value.accent];
          return { "--gold": a.gold, "--gold-dim": a.dim, "--gold-soft": a.soft };
        });
        function symbolInner(which) {
          const key = which || customization.value.symbol;
          return CARD_SYMBOLS[key] || "";
        }
        const rotStyle = computed(
          () => `rotate(${customization.value.symbolRotation}deg)`
        );
        const hasSecondarySymbol = computed(
          () => customization.value.symbol2 !== "none" && !customization.value.customSymbol
        );
        function onCustomSymbolUpload(e) {
          const input = e.target;
          const file = input.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (ev) => {
            customization.value.customSymbol = ev.target?.result;
          };
          reader.readAsDataURL(file);
        }
        function clearCustomSymbol() {
          customization.value.customSymbol = null;
        }
        const artSrc = computed(
          () => customization.value.customArt || game.value?.coverImageUrl || null
        );
        function onArtUpload(e) {
          const input = e.target;
          const file = input.files?.[0];
          if (!file) return;
          artFailed.value = false;
          const reader = new FileReader();
          reader.onload = (ev) => {
            customization.value.customArt = ev.target?.result;
          };
          reader.readAsDataURL(file);
        }
        function resetArt() {
          customization.value.customArt = null;
          artFailed.value = false;
        }
        const tiltX = ref(0);
        const tiltY = ref(0);
        function onCardMouseMove(e) {
          const rect = e.currentTarget.getBoundingClientRect();
          const px = (e.clientX - rect.left) / rect.width - 0.5;
          const py = (e.clientY - rect.top) / rect.height - 0.5;
          tiltY.value = px * MAX_TILT * 2;
          tiltX.value = -py * MAX_TILT * 2;
        }
        function onCardMouseLeave() {
          tiltX.value = 0;
          tiltY.value = 0;
        }
        const rarityLetter = computed(
          () => rarity.value ? rarity.value.charAt(0).toUpperCase() : "?"
        );
        const platformLabel = computed(
          () => game.value?.platforms[0]?.platform ?? game.value?.source ?? "PC"
        );
        const playtimeLabel = computed(() => {
          const minutes = game.value?.platforms[0]?.playtimeMinutes ?? 0;
          if (!minutes) return null;
          const hrs = Math.floor(minutes / 60);
          const mins = minutes % 60;
          return hrs >= 1e3 ? `${hrs.toLocaleString()}h` : `${hrs}h ${mins}m`;
        });
        const achievementLabel = computed(() => {
          const g = game.value;
          if (!g || !g.achievementTotal) return null;
          const unlocked = g.achievements.filter((a) => a.unlockedAt).length || Math.round(g.achievementPercent / 100 * g.achievementTotal);
          return `${unlocked} / ${g.achievementTotal} achievements unlocked.`;
        });
        const statusWord = computed(
          () => game.value?.status === "mastered" ? "Mastered" : "Beaten"
        );
        const completionYear = computed(() => {
          const d = game.value?.completionDate;
          return d ? new Date(d).getFullYear() : null;
        });
        const currentSet = computed(
          () => sets.value.find((s) => s.id === setId.value) ?? null
        );
        const setPositionLabel = computed(() => {
          if (!currentSet.value || !card.value) return null;
          return currentSet.value.targetTotal ? `${String(currentSet.value.cardCount).padStart(2, "0")}/${currentSet.value.targetTotal}` : null;
        });
        const setComplete = computed(() => currentSet.value?.isComplete ?? false);
        async function saveCard() {
          if (!card.value) return;
          saving.value = true;
          saved.value = false;
          try {
            card.value = await updateCard(card.value.id, {
              setId: setId.value,
              rarity: rarity.value,
              cardCustomization: customization.value
            });
            saved.value = true;
            sets.value = await fetchSets();
          } catch (e) {
            error.value = e instanceof Error ? e.message : "Failed to save card.";
          } finally {
            saving.value = false;
          }
        }
        watch(
          [customization, rarity, setId],
          () => {
            saved.value = false;
          },
          { deep: true }
        );
        function printCard() {
          window.print();
        }
        const frontTemplates = [
          { value: "classic", label: "Classic", hint: "Full art, thin gold ring" },
          { value: "borderless", label: "Borderless", hint: "Art to the very edge" },
          { value: "ornate", label: "Ornate", hint: "Corner flourishes" },
          { value: "minimal", label: "Minimal", hint: "Title & collector line only" },
          {
            value: "bordered",
            label: "Bordered",
            hint: "Solid frame, art inset inside it"
          }
        ];
        const backTemplates = [
          { value: "emblem", label: "Emblem", hint: "Medallion" },
          { value: "collector", label: "Collector", hint: "Compact detail" },
          { value: "record", label: "Record", hint: "Completion record" }
        ];
        const accents = ["gold", "silver", "bronze", "copper", "rose"];
        const accentSwatch = {
          gold: "#c8a35f",
          silver: "#c9ccd6",
          bronze: "#b8793f",
          copper: "#c17a52",
          rose: "#c99383"
        };
        const borderColors = [
          { value: "black", label: "Black", hint: "The standard border color" },
          { value: "white", label: "White", hint: "The alternate print color" },
          { value: "accent", label: "Accent", hint: "Matches the metal accent" }
        ];
        const cardFaces = [
          { value: "dark", label: "Dark", hint: "The default look" },
          { value: "parchment", label: "Parchment", hint: "Real parchment, dark ink" }
        ];
        const titlePositions = [
          { value: "top", label: "Top of card", hint: "The usual spot" },
          {
            value: "bottom",
            label: "Merged into stats",
            hint: "For art with its own logo up top"
          }
        ];
        const prestigeVariants = [
          { value: "foil", label: "Foil", hint: "Reflective sheen" },
          { value: "engraved", label: "Engraved", hint: "Etched, restrained" },
          { value: "ceremonial", label: "Ceremonial", hint: "Heavier ornate frame" },
          { value: "minimal", label: "Minimal", hint: "Barely there" }
        ];
        const rarities = [
          "common",
          "uncommon",
          "rare",
          "legendary",
          "mythic"
        ];
        return (_ctx, _cache) => {
          return openBlock(), createElementBlock("main", _hoisted_14, [
            createElementVNode("div", _hoisted_22, [
              createElementVNode("button", {
                type: "button",
                class: "back-btn",
                onClick: _cache[0] || (_cache[0] = ($event) => unref(router).push("/cards"))
              }, " \u2190 All cards "),
              game.value && card.value ? (openBlock(), createElementBlock("h1", _hoisted_32, [
                createTextVNode(
                  toDisplayString(game.value.title) + " ",
                  1
                  /* TEXT */
                ),
                createElementVNode(
                  "span",
                  _hoisted_42,
                  "#" + toDisplayString(String(card.value.archiveNumber ?? 0).padStart(3, "0")),
                  1
                  /* TEXT */
                )
              ])) : createCommentVNode("v-if", true)
            ]),
            loading.value ? (openBlock(), createElementBlock("p", _hoisted_52, "Loading\u2026")) : error.value ? (openBlock(), createElementBlock(
              "p",
              _hoisted_62,
              toDisplayString(error.value),
              1
              /* TEXT */
            )) : game.value && card.value ? (openBlock(), createElementBlock("div", _hoisted_72, [
              createElementVNode("div", _hoisted_82, [
                createElementVNode(
                  "div",
                  {
                    class: "flip-scene",
                    style: normalizeStyle(accentVars.value),
                    onMousemove: onCardMouseMove,
                    onMouseleave: onCardMouseLeave,
                    onClick: _cache[2] || (_cache[2] = ($event) => flipped.value = !flipped.value)
                  },
                  [
                    createElementVNode(
                      "div",
                      {
                        class: normalizeClass(["flip-card", { flipped: flipped.value }])
                      },
                      [
                        createElementVNode(
                          "div",
                          {
                            class: "tilt-layer",
                            style: normalizeStyle({
                              transform: `rotateX(${flipped.value ? -tiltX.value : tiltX.value}deg) rotateY(${tiltY.value}deg)`
                            })
                          },
                          [
                            createCommentVNode(" ============ FRONT ============ "),
                            createElementVNode("div", {
                              class: "card-face card-front",
                              "data-template": customization.value.frontTemplate,
                              "data-border-color": customization.value.borderColor,
                              "data-face": customization.value.cardFace,
                              "data-prestige": isPrestige.value,
                              "data-prestige-variant": customization.value.prestigeVariant,
                              "data-title-pos": customization.value.titlePosition
                            }, [
                              createElementVNode("div", _hoisted_102, [
                                createElementVNode("div", _hoisted_112, [
                                  artSrc.value && !artFailed.value ? (openBlock(), createElementBlock("img", {
                                    key: 0,
                                    src: artSrc.value,
                                    alt: "",
                                    onError: _cache[1] || (_cache[1] = ($event) => artFailed.value = true)
                                  }, null, 40, _hoisted_122)) : (openBlock(), createElementBlock("div", _hoisted_132))
                                ]),
                                _cache[21] || (_cache[21] = createElementVNode(
                                  "div",
                                  { class: "corner tl" },
                                  null,
                                  -1
                                  /* CACHED */
                                )),
                                _cache[22] || (_cache[22] = createElementVNode(
                                  "div",
                                  { class: "corner br" },
                                  null,
                                  -1
                                  /* CACHED */
                                )),
                                createElementVNode("div", _hoisted_142, [
                                  createElementVNode("div", _hoisted_15, [
                                    createElementVNode(
                                      "span",
                                      _hoisted_16,
                                      toDisplayString(game.value.title),
                                      1
                                      /* TEXT */
                                    ),
                                    createElementVNode(
                                      "span",
                                      _hoisted_17,
                                      toDisplayString(platformLabel.value) + " \xB7 #" + toDisplayString(String(card.value.archiveNumber ?? 0).padStart(3, "0")),
                                      1
                                      /* TEXT */
                                    )
                                  ]),
                                  createElementVNode("div", _hoisted_18, [
                                    createElementVNode("div", _hoisted_19, [
                                      createElementVNode("div", _hoisted_20, [
                                        _cache[18] || (_cache[18] = createElementVNode(
                                          "span",
                                          { class: "type-text" },
                                          "Achievement",
                                          -1
                                          /* CACHED */
                                        )),
                                        createElementVNode(
                                          "span",
                                          _hoisted_21,
                                          toDisplayString(game.value.title),
                                          1
                                          /* TEXT */
                                        ),
                                        createElementVNode(
                                          "span",
                                          {
                                            class: "type-sym icon-slot",
                                            style: normalizeStyle({ transform: rotStyle.value })
                                          },
                                          [
                                            customization.value.customSymbol ? (openBlock(), createElementBlock("img", {
                                              key: 0,
                                              src: customization.value.customSymbol,
                                              alt: ""
                                            }, null, 8, _hoisted_222)) : (openBlock(), createElementBlock("svg", {
                                              key: 1,
                                              viewBox: "0 0 24 24",
                                              fill: "currentColor",
                                              innerHTML: symbolInner()
                                            }, null, 8, _hoisted_23))
                                          ],
                                          4
                                          /* STYLE */
                                        )
                                      ]),
                                      createElementVNode("div", _hoisted_24, [
                                        achievementLabel.value ? (openBlock(), createElementBlock(
                                          "p",
                                          _hoisted_25,
                                          toDisplayString(achievementLabel.value),
                                          1
                                          /* TEXT */
                                        )) : createCommentVNode("v-if", true),
                                        playtimeLabel.value ? (openBlock(), createElementBlock(
                                          "p",
                                          _hoisted_26,
                                          toDisplayString(playtimeLabel.value) + " played. ",
                                          1
                                          /* TEXT */
                                        )) : createCommentVNode("v-if", true),
                                        game.value.ratingOverall ? (openBlock(), createElementBlock(
                                          "p",
                                          _hoisted_27,
                                          " Rated " + toDisplayString(game.value.ratingOverall.toFixed(1)) + " / 10. ",
                                          1
                                          /* TEXT */
                                        )) : createCommentVNode("v-if", true),
                                        _cache[19] || (_cache[19] = createElementVNode(
                                          "div",
                                          { class: "stat-rule" },
                                          null,
                                          -1
                                          /* CACHED */
                                        )),
                                        createElementVNode("p", _hoisted_28, [
                                          createTextVNode(
                                            toDisplayString(statusWord.value),
                                            1
                                            /* TEXT */
                                          ),
                                          completionYear.value ? (openBlock(), createElementBlock(
                                            Fragment,
                                            { key: 0 },
                                            [
                                              createTextVNode(
                                                " \xB7 " + toDisplayString(completionYear.value),
                                                1
                                                /* TEXT */
                                              )
                                            ],
                                            64
                                            /* STABLE_FRAGMENT */
                                          )) : createCommentVNode("v-if", true)
                                        ])
                                      ])
                                    ]),
                                    createElementVNode("div", _hoisted_29, [
                                      createElementVNode("span", _hoisted_30, [
                                        createElementVNode(
                                          "span",
                                          {
                                            class: "collector-sym icon-slot",
                                            style: normalizeStyle({ transform: rotStyle.value })
                                          },
                                          [
                                            customization.value.customSymbol ? (openBlock(), createElementBlock("img", {
                                              key: 0,
                                              src: customization.value.customSymbol,
                                              alt: ""
                                            }, null, 8, _hoisted_31)) : (openBlock(), createElementBlock("svg", {
                                              key: 1,
                                              viewBox: "0 0 24 24",
                                              fill: "currentColor",
                                              innerHTML: symbolInner()
                                            }, null, 8, _hoisted_322))
                                          ],
                                          4
                                          /* STYLE */
                                        ),
                                        setPositionLabel.value ? (openBlock(), createElementBlock(
                                          Fragment,
                                          { key: 0 },
                                          [
                                            createTextVNode(
                                              toDisplayString(setPositionLabel.value) + " ",
                                              1
                                              /* TEXT */
                                            ),
                                            setComplete.value ? (openBlock(), createElementBlock("span", _hoisted_33, "COMPLETE")) : createCommentVNode("v-if", true),
                                            _cache[20] || (_cache[20] = createTextVNode(
                                              " \xB7 ",
                                              -1
                                              /* CACHED */
                                            ))
                                          ],
                                          64
                                          /* STABLE_FRAGMENT */
                                        )) : createCommentVNode("v-if", true),
                                        createTextVNode(
                                          " " + toDisplayString(rarityLetter.value),
                                          1
                                          /* TEXT */
                                        )
                                      ]),
                                      createElementVNode(
                                        "span",
                                        _hoisted_34,
                                        toDisplayString(game.value.developer || ""),
                                        1
                                        /* TEXT */
                                      )
                                    ])
                                  ])
                                ])
                              ]),
                              _cache[23] || (_cache[23] = createElementVNode(
                                "div",
                                { class: "prestige-shine" },
                                null,
                                -1
                                /* CACHED */
                              )),
                              _cache[24] || (_cache[24] = createElementVNode(
                                "div",
                                { class: "grain" },
                                null,
                                -1
                                /* CACHED */
                              ))
                            ], 8, _hoisted_92),
                            createCommentVNode(" ============ BACK ============ "),
                            createElementVNode("div", {
                              class: "card-face card-back-inner",
                              "data-face": customization.value.cardFace
                            }, [
                              withDirectives(createElementVNode(
                                "div",
                                _hoisted_36,
                                [
                                  _cache[25] || (_cache[25] = createElementVNode(
                                    "div",
                                    { class: "back-corner tl" },
                                    null,
                                    -1
                                    /* CACHED */
                                  )),
                                  _cache[26] || (_cache[26] = createElementVNode(
                                    "div",
                                    { class: "back-corner br" },
                                    null,
                                    -1
                                    /* CACHED */
                                  )),
                                  createElementVNode("div", _hoisted_37, [
                                    createElementVNode(
                                      "span",
                                      {
                                        class: "icon-slot",
                                        style: normalizeStyle({ transform: rotStyle.value })
                                      },
                                      [
                                        customization.value.customSymbol ? (openBlock(), createElementBlock("img", {
                                          key: 0,
                                          src: customization.value.customSymbol,
                                          alt: ""
                                        }, null, 8, _hoisted_38)) : (openBlock(), createElementBlock("svg", {
                                          key: 1,
                                          viewBox: "0 0 24 24",
                                          fill: "currentColor",
                                          innerHTML: symbolInner()
                                        }, null, 8, _hoisted_39))
                                      ],
                                      4
                                      /* STYLE */
                                    ),
                                    hasSecondarySymbol.value ? (openBlock(), createElementBlock("div", _hoisted_40, [
                                      createElementVNode("span", _hoisted_41, [
                                        (openBlock(), createElementBlock("svg", {
                                          viewBox: "0 0 24 24",
                                          fill: "currentColor",
                                          innerHTML: symbolInner(customization.value.symbol2)
                                        }, null, 8, _hoisted_422))
                                      ])
                                    ])) : createCommentVNode("v-if", true)
                                  ]),
                                  _cache[27] || (_cache[27] = createElementVNode(
                                    "div",
                                    { class: "back-wordmark" },
                                    "ARCHIVE",
                                    -1
                                    /* CACHED */
                                  )),
                                  createElementVNode(
                                    "div",
                                    _hoisted_43,
                                    toDisplayString(currentSet.value?.name || "No set"),
                                    1
                                    /* TEXT */
                                  ),
                                  createElementVNode(
                                    "div",
                                    _hoisted_44,
                                    " #" + toDisplayString(String(card.value.archiveNumber ?? 0).padStart(3, "0")),
                                    1
                                    /* TEXT */
                                  )
                                ],
                                512
                                /* NEED_PATCH */
                              ), [
                                [vShow, customization.value.backTemplate === "emblem"]
                              ]),
                              withDirectives(createElementVNode(
                                "div",
                                _hoisted_45,
                                [
                                  _cache[35] || (_cache[35] = createElementVNode(
                                    "div",
                                    { class: "back-corner tl" },
                                    null,
                                    -1
                                    /* CACHED */
                                  )),
                                  _cache[36] || (_cache[36] = createElementVNode(
                                    "div",
                                    { class: "back-corner br" },
                                    null,
                                    -1
                                    /* CACHED */
                                  )),
                                  createElementVNode("div", _hoisted_46, [
                                    createElementVNode(
                                      "span",
                                      {
                                        class: "icon-slot",
                                        style: normalizeStyle({ transform: rotStyle.value })
                                      },
                                      [
                                        customization.value.customSymbol ? (openBlock(), createElementBlock("img", {
                                          key: 0,
                                          src: customization.value.customSymbol,
                                          alt: ""
                                        }, null, 8, _hoisted_47)) : (openBlock(), createElementBlock("svg", {
                                          key: 1,
                                          viewBox: "0 0 24 24",
                                          fill: "currentColor",
                                          innerHTML: symbolInner()
                                        }, null, 8, _hoisted_48))
                                      ],
                                      4
                                      /* STYLE */
                                    )
                                  ]),
                                  createElementVNode("div", _hoisted_49, [
                                    createElementVNode(
                                      "div",
                                      _hoisted_50,
                                      toDisplayString(game.value.title),
                                      1
                                      /* TEXT */
                                    ),
                                    createElementVNode("div", _hoisted_51, [
                                      createElementVNode("div", _hoisted_522, [
                                        _cache[28] || (_cache[28] = createElementVNode(
                                          "span",
                                          { class: "lbl" },
                                          "Set",
                                          -1
                                          /* CACHED */
                                        )),
                                        createElementVNode(
                                          "span",
                                          _hoisted_53,
                                          toDisplayString(setPositionLabel.value || "\u2013"),
                                          1
                                          /* TEXT */
                                        )
                                      ]),
                                      createElementVNode("div", _hoisted_54, [
                                        _cache[29] || (_cache[29] = createElementVNode(
                                          "span",
                                          { class: "lbl" },
                                          "Platform",
                                          -1
                                          /* CACHED */
                                        )),
                                        createElementVNode(
                                          "span",
                                          _hoisted_55,
                                          toDisplayString(platformLabel.value),
                                          1
                                          /* TEXT */
                                        )
                                      ]),
                                      createElementVNode("div", _hoisted_56, [
                                        _cache[30] || (_cache[30] = createElementVNode(
                                          "span",
                                          { class: "lbl" },
                                          "Completed",
                                          -1
                                          /* CACHED */
                                        )),
                                        createElementVNode(
                                          "span",
                                          _hoisted_57,
                                          toDisplayString(completionYear.value || "\u2013"),
                                          1
                                          /* TEXT */
                                        )
                                      ]),
                                      createElementVNode("div", _hoisted_58, [
                                        _cache[31] || (_cache[31] = createElementVNode(
                                          "span",
                                          { class: "lbl" },
                                          "Playtime",
                                          -1
                                          /* CACHED */
                                        )),
                                        createElementVNode(
                                          "span",
                                          _hoisted_59,
                                          toDisplayString(playtimeLabel.value || "\u2013"),
                                          1
                                          /* TEXT */
                                        )
                                      ])
                                    ]),
                                    createElementVNode("div", _hoisted_60, [
                                      createElementVNode(
                                        "span",
                                        _hoisted_61,
                                        toDisplayString(rarity.value ? RARITY_LABEL[rarity.value] : "Unrated"),
                                        1
                                        /* TEXT */
                                      ),
                                      isPrestige.value ? (openBlock(), createElementBlock("span", _hoisted_622, "Prestiged")) : createCommentVNode("v-if", true)
                                    ]),
                                    customization.value.memorableAchievement ? (openBlock(), createElementBlock("div", _hoisted_63, [
                                      _cache[32] || (_cache[32] = createElementVNode(
                                        "span",
                                        { class: "lbl" },
                                        "Memorable achievement",
                                        -1
                                        /* CACHED */
                                      )),
                                      createElementVNode(
                                        "div",
                                        _hoisted_64,
                                        toDisplayString(customization.value.memorableAchievement),
                                        1
                                        /* TEXT */
                                      )
                                    ])) : createCommentVNode("v-if", true),
                                    customization.value.personalNote ? (openBlock(), createElementBlock("div", _hoisted_65, [
                                      _cache[33] || (_cache[33] = createElementVNode(
                                        "span",
                                        { class: "lbl" },
                                        "Personal note",
                                        -1
                                        /* CACHED */
                                      )),
                                      createElementVNode(
                                        "div",
                                        _hoisted_66,
                                        toDisplayString(customization.value.personalNote),
                                        1
                                        /* TEXT */
                                      )
                                    ])) : createCommentVNode("v-if", true),
                                    isPrestige.value && bounty.value ? (openBlock(), createElementBlock("div", _hoisted_67, [
                                      _cache[34] || (_cache[34] = createElementVNode(
                                        "span",
                                        { class: "lbl" },
                                        "The challenge",
                                        -1
                                        /* CACHED */
                                      )),
                                      createElementVNode(
                                        "div",
                                        _hoisted_68,
                                        toDisplayString(bounty.value.title),
                                        1
                                        /* TEXT */
                                      )
                                    ])) : createCommentVNode("v-if", true)
                                  ])
                                ],
                                512
                                /* NEED_PATCH */
                              ), [
                                [vShow, customization.value.backTemplate === "collector"]
                              ]),
                              withDirectives(createElementVNode(
                                "div",
                                _hoisted_69,
                                [
                                  _cache[39] || (_cache[39] = createElementVNode(
                                    "div",
                                    { class: "back-corner tl" },
                                    null,
                                    -1
                                    /* CACHED */
                                  )),
                                  _cache[40] || (_cache[40] = createElementVNode(
                                    "div",
                                    { class: "back-corner br" },
                                    null,
                                    -1
                                    /* CACHED */
                                  )),
                                  createElementVNode("div", _hoisted_70, [
                                    createElementVNode("span", _hoisted_71, [
                                      customization.value.customSymbol ? (openBlock(), createElementBlock("img", {
                                        key: 0,
                                        src: customization.value.customSymbol,
                                        alt: ""
                                      }, null, 8, _hoisted_722)) : (openBlock(), createElementBlock("svg", {
                                        key: 1,
                                        viewBox: "0 0 24 24",
                                        fill: "currentColor",
                                        innerHTML: symbolInner()
                                      }, null, 8, _hoisted_73))
                                    ]),
                                    _cache[37] || (_cache[37] = createElementVNode(
                                      "span",
                                      { class: "record-top-label" },
                                      "Archive Card",
                                      -1
                                      /* CACHED */
                                    )),
                                    createElementVNode(
                                      "span",
                                      _hoisted_74,
                                      "#" + toDisplayString(String(card.value.archiveNumber ?? 0).padStart(3, "0")),
                                      1
                                      /* TEXT */
                                    )
                                  ]),
                                  createElementVNode("div", _hoisted_75, [
                                    createElementVNode(
                                      "div",
                                      _hoisted_76,
                                      toDisplayString(game.value.title),
                                      1
                                      /* TEXT */
                                    ),
                                    createElementVNode("div", _hoisted_77, [
                                      createTextVNode(
                                        toDisplayString(statusWord.value),
                                        1
                                        /* TEXT */
                                      ),
                                      completionYear.value ? (openBlock(), createElementBlock(
                                        Fragment,
                                        { key: 0 },
                                        [
                                          createTextVNode(
                                            toDisplayString(completionYear.value),
                                            1
                                            /* TEXT */
                                          )
                                        ],
                                        64
                                        /* STABLE_FRAGMENT */
                                      )) : createCommentVNode("v-if", true)
                                    ]),
                                    createElementVNode("div", _hoisted_78, [
                                      createTextVNode(
                                        toDisplayString(platformLabel.value),
                                        1
                                        /* TEXT */
                                      ),
                                      playtimeLabel.value ? (openBlock(), createElementBlock(
                                        Fragment,
                                        { key: 0 },
                                        [
                                          createTextVNode(
                                            " \xB7 " + toDisplayString(playtimeLabel.value),
                                            1
                                            /* TEXT */
                                          )
                                        ],
                                        64
                                        /* STABLE_FRAGMENT */
                                      )) : createCommentVNode("v-if", true)
                                    ])
                                  ]),
                                  customization.value.memorableAchievement ? (openBlock(), createElementBlock("div", _hoisted_79, [
                                    _cache[38] || (_cache[38] = createElementVNode(
                                      "div",
                                      { class: "record-moment-label" },
                                      " Most memorable achievement ",
                                      -1
                                      /* CACHED */
                                    )),
                                    createElementVNode(
                                      "div",
                                      _hoisted_80,
                                      toDisplayString(customization.value.memorableAchievement),
                                      1
                                      /* TEXT */
                                    ),
                                    customization.value.personalNote ? (openBlock(), createElementBlock(
                                      "div",
                                      _hoisted_81,
                                      toDisplayString(customization.value.personalNote),
                                      1
                                      /* TEXT */
                                    )) : createCommentVNode("v-if", true)
                                  ])) : createCommentVNode("v-if", true),
                                  createElementVNode("div", _hoisted_822, [
                                    createElementVNode(
                                      "span",
                                      null,
                                      toDisplayString(currentSet.value ? currentSet.value.name : "No set"),
                                      1
                                      /* TEXT */
                                    ),
                                    createElementVNode(
                                      "span",
                                      null,
                                      toDisplayString(rarity.value ? RARITY_LABEL[rarity.value] : "Unrated"),
                                      1
                                      /* TEXT */
                                    )
                                  ])
                                ],
                                512
                                /* NEED_PATCH */
                              ), [
                                [vShow, customization.value.backTemplate === "record"]
                              ]),
                              _cache[41] || (_cache[41] = createElementVNode(
                                "div",
                                { class: "grain" },
                                null,
                                -1
                                /* CACHED */
                              ))
                            ], 8, _hoisted_35)
                          ],
                          4
                          /* STYLE */
                        )
                      ],
                      2
                      /* CLASS */
                    )
                  ],
                  36
                  /* STYLE, NEED_HYDRATION */
                ),
                createElementVNode("div", _hoisted_83, [
                  createElementVNode("button", {
                    type: "button",
                    class: "flip-btn",
                    onClick: _cache[3] || (_cache[3] = withModifiers(($event) => flipped.value = !flipped.value, ["stop"]))
                  }, " Flip card "),
                  createElementVNode("button", {
                    type: "button",
                    class: "flip-btn",
                    onClick: withModifiers(printCard, ["stop"])
                  }, " Print ")
                ]),
                _cache[42] || (_cache[42] = createElementVNode(
                  "p",
                  { class: "print-note" },
                  " Prints both faces at true 2.5\xD73.5in size. Foil is simulated, not real foil. ",
                  -1
                  /* CACHED */
                ))
              ]),
              createElementVNode("aside", _hoisted_84, [
                createElementVNode("div", _hoisted_85, [
                  createElementVNode(
                    "button",
                    {
                      type: "button",
                      class: normalizeClass(["tab", { active: activeTab.value === "template" }]),
                      onClick: _cache[4] || (_cache[4] = ($event) => activeTab.value = "template")
                    },
                    " Template ",
                    2
                    /* CLASS */
                  ),
                  createElementVNode(
                    "button",
                    {
                      type: "button",
                      class: normalizeClass(["tab", { active: activeTab.value === "prestige" }]),
                      onClick: _cache[5] || (_cache[5] = ($event) => activeTab.value = "prestige")
                    },
                    " Prestige ",
                    2
                    /* CLASS */
                  ),
                  createElementVNode(
                    "button",
                    {
                      type: "button",
                      class: normalizeClass(["tab", { active: activeTab.value === "symbol" }]),
                      onClick: _cache[6] || (_cache[6] = ($event) => activeTab.value = "symbol")
                    },
                    " Symbol ",
                    2
                    /* CLASS */
                  ),
                  createElementVNode(
                    "button",
                    {
                      type: "button",
                      class: normalizeClass(["tab", { active: activeTab.value === "data" }]),
                      onClick: _cache[7] || (_cache[7] = ($event) => activeTab.value = "data")
                    },
                    " Data ",
                    2
                    /* CLASS */
                  ),
                  createElementVNode(
                    "button",
                    {
                      type: "button",
                      class: normalizeClass(["tab", { active: activeTab.value === "set" }]),
                      onClick: _cache[8] || (_cache[8] = ($event) => activeTab.value = "set")
                    },
                    " Rarity & Set ",
                    2
                    /* CLASS */
                  )
                ]),
                createElementVNode("div", _hoisted_86, [
                  withDirectives(createElementVNode(
                    "div",
                    _hoisted_87,
                    [
                      createElementVNode("div", _hoisted_88, [
                        _cache[43] || (_cache[43] = createElementVNode(
                          "label",
                          null,
                          "Front template",
                          -1
                          /* CACHED */
                        )),
                        createElementVNode("div", _hoisted_89, [
                          (openBlock(), createElementBlock(
                            Fragment,
                            null,
                            renderList(frontTemplates, (t) => {
                              return createElementVNode("button", {
                                key: t.value,
                                type: "button",
                                class: normalizeClass(["tpl-btn", { active: customization.value.frontTemplate === t.value }]),
                                onClick: ($event) => customization.value.frontTemplate = t.value
                              }, [
                                createTextVNode(
                                  toDisplayString(t.label),
                                  1
                                  /* TEXT */
                                ),
                                createElementVNode(
                                  "span",
                                  null,
                                  toDisplayString(t.hint),
                                  1
                                  /* TEXT */
                                )
                              ], 10, _hoisted_90);
                            }),
                            64
                            /* STABLE_FRAGMENT */
                          ))
                        ])
                      ]),
                      customization.value.frontTemplate === "bordered" ? (openBlock(), createElementBlock("div", _hoisted_91, [
                        _cache[44] || (_cache[44] = createElementVNode(
                          "label",
                          null,
                          "Border color",
                          -1
                          /* CACHED */
                        )),
                        createElementVNode("div", _hoisted_922, [
                          (openBlock(), createElementBlock(
                            Fragment,
                            null,
                            renderList(borderColors, (b) => {
                              return createElementVNode("button", {
                                key: b.value,
                                type: "button",
                                class: normalizeClass(["tpl-btn", { active: customization.value.borderColor === b.value }]),
                                onClick: ($event) => customization.value.borderColor = b.value
                              }, [
                                createTextVNode(
                                  toDisplayString(b.label),
                                  1
                                  /* TEXT */
                                ),
                                createElementVNode(
                                  "span",
                                  null,
                                  toDisplayString(b.hint),
                                  1
                                  /* TEXT */
                                )
                              ], 10, _hoisted_93);
                            }),
                            64
                            /* STABLE_FRAGMENT */
                          ))
                        ])
                      ])) : createCommentVNode("v-if", true),
                      createElementVNode("div", _hoisted_94, [
                        _cache[45] || (_cache[45] = createElementVNode(
                          "label",
                          null,
                          "Title position",
                          -1
                          /* CACHED */
                        )),
                        createElementVNode("div", _hoisted_95, [
                          (openBlock(), createElementBlock(
                            Fragment,
                            null,
                            renderList(titlePositions, (t) => {
                              return createElementVNode("button", {
                                key: t.value,
                                type: "button",
                                class: normalizeClass(["tpl-btn", { active: customization.value.titlePosition === t.value }]),
                                onClick: ($event) => customization.value.titlePosition = t.value
                              }, [
                                createTextVNode(
                                  toDisplayString(t.label),
                                  1
                                  /* TEXT */
                                ),
                                createElementVNode(
                                  "span",
                                  null,
                                  toDisplayString(t.hint),
                                  1
                                  /* TEXT */
                                )
                              ], 10, _hoisted_96);
                            }),
                            64
                            /* STABLE_FRAGMENT */
                          ))
                        ])
                      ]),
                      createElementVNode("div", _hoisted_97, [
                        _cache[46] || (_cache[46] = createElementVNode(
                          "label",
                          null,
                          "Back template",
                          -1
                          /* CACHED */
                        )),
                        createElementVNode("div", _hoisted_98, [
                          (openBlock(), createElementBlock(
                            Fragment,
                            null,
                            renderList(backTemplates, (t) => {
                              return createElementVNode("button", {
                                key: t.value,
                                type: "button",
                                class: normalizeClass(["tpl-btn", { active: customization.value.backTemplate === t.value }]),
                                onClick: ($event) => customization.value.backTemplate = t.value
                              }, [
                                createTextVNode(
                                  toDisplayString(t.label),
                                  1
                                  /* TEXT */
                                ),
                                createElementVNode(
                                  "span",
                                  null,
                                  toDisplayString(t.hint),
                                  1
                                  /* TEXT */
                                )
                              ], 10, _hoisted_99);
                            }),
                            64
                            /* STABLE_FRAGMENT */
                          ))
                        ])
                      ]),
                      createElementVNode("div", _hoisted_100, [
                        _cache[47] || (_cache[47] = createElementVNode(
                          "label",
                          null,
                          "Card face",
                          -1
                          /* CACHED */
                        )),
                        createElementVNode("div", _hoisted_101, [
                          (openBlock(), createElementBlock(
                            Fragment,
                            null,
                            renderList(cardFaces, (f) => {
                              return createElementVNode("button", {
                                key: f.value,
                                type: "button",
                                class: normalizeClass(["tpl-btn", { active: customization.value.cardFace === f.value }]),
                                onClick: ($event) => customization.value.cardFace = f.value
                              }, [
                                createTextVNode(
                                  toDisplayString(f.label),
                                  1
                                  /* TEXT */
                                ),
                                createElementVNode(
                                  "span",
                                  null,
                                  toDisplayString(f.hint),
                                  1
                                  /* TEXT */
                                )
                              ], 10, _hoisted_1022);
                            }),
                            64
                            /* STABLE_FRAGMENT */
                          ))
                        ])
                      ]),
                      createElementVNode("div", _hoisted_103, [
                        _cache[48] || (_cache[48] = createElementVNode(
                          "label",
                          null,
                          "Metal accent",
                          -1
                          /* CACHED */
                        )),
                        createElementVNode("div", _hoisted_104, [
                          (openBlock(), createElementBlock(
                            Fragment,
                            null,
                            renderList(accents, (a) => {
                              return createElementVNode("button", {
                                key: a,
                                type: "button",
                                class: normalizeClass(["accent-btn", { active: customization.value.accent === a }]),
                                style: normalizeStyle({ background: accentSwatch[a] }),
                                onClick: ($event) => customization.value.accent = a
                              }, null, 14, _hoisted_105);
                            }),
                            64
                            /* STABLE_FRAGMENT */
                          ))
                        ])
                      ])
                    ],
                    512
                    /* NEED_PATCH */
                  ), [
                    [vShow, activeTab.value === "template"]
                  ]),
                  withDirectives(createElementVNode(
                    "div",
                    _hoisted_106,
                    [
                      !achievements100.value ? (openBlock(), createElementBlock("div", _hoisted_107, [
                        _cache[49] || (_cache[49] = createElementVNode(
                          "label",
                          null,
                          "Prestige",
                          -1
                          /* CACHED */
                        )),
                        createElementVNode(
                          "div",
                          _hoisted_108,
                          " Earn every achievement in " + toDisplayString(game.value?.title) + " to unlock a prestige challenge. There's nothing to pick here. The system generates the challenge itself once you're at 100%. ",
                          1
                          /* TEXT */
                        )
                      ])) : !bounty.value ? (openBlock(), createElementBlock("div", _hoisted_109, [
                        _cache[50] || (_cache[50] = createElementVNode(
                          "label",
                          null,
                          "Prestige",
                          -1
                          /* CACHED */
                        )),
                        createElementVNode(
                          "div",
                          _hoisted_110,
                          " 100% complete. Generate the one prestige challenge for this card, a real goal built from " + toDisplayString(game.value?.title) + "'s own data, tracked and verified through Bounties. ",
                          1
                          /* TEXT */
                        ),
                        createElementVNode("button", {
                          type: "button",
                          class: "primary-btn",
                          disabled: generatingPrestige.value,
                          onClick: generatePrestige
                        }, toDisplayString(generatingPrestige.value ? "Generating\u2026" : "Generate prestige challenge"), 9, _hoisted_111),
                        prestigeError.value ? (openBlock(), createElementBlock(
                          "div",
                          _hoisted_1122,
                          toDisplayString(prestigeError.value),
                          1
                          /* TEXT */
                        )) : createCommentVNode("v-if", true)
                      ])) : (openBlock(), createElementBlock(
                        Fragment,
                        { key: 2 },
                        [
                          createElementVNode("div", _hoisted_113, [
                            _cache[52] || (_cache[52] = createElementVNode(
                              "label",
                              null,
                              "Prestige challenge",
                              -1
                              /* CACHED */
                            )),
                            createElementVNode("div", _hoisted_114, [
                              createElementVNode(
                                "div",
                                _hoisted_115,
                                toDisplayString(bounty.value.title),
                                1
                                /* TEXT */
                              ),
                              createElementVNode(
                                "span",
                                {
                                  class: normalizeClass(["bc-pill", {
                                    "bc-pill-prestige": bounty.value.status === "completed"
                                  }])
                                },
                                toDisplayString(bounty.value.status.replace("_", " ")),
                                3
                                /* TEXT, CLASS */
                              )
                            ]),
                            createElementVNode(
                              "div",
                              _hoisted_116,
                              toDisplayString(bounty.value.description),
                              1
                              /* TEXT */
                            ),
                            createVNode(unref(RouterLink), {
                              class: "reset-link",
                              to: "/bounties"
                            }, {
                              default: withCtx(() => [..._cache[51] || (_cache[51] = [
                                createTextVNode(
                                  "Manage in Bounties \u2192",
                                  -1
                                  /* CACHED */
                                )
                              ])]),
                              _: 1
                              /* STABLE */
                            })
                          ]),
                          isPrestige.value ? (openBlock(), createElementBlock("div", _hoisted_117, [
                            _cache[53] || (_cache[53] = createElementVNode(
                              "label",
                              null,
                              "Prestige treatment",
                              -1
                              /* CACHED */
                            )),
                            createElementVNode("div", _hoisted_118, [
                              (openBlock(), createElementBlock(
                                Fragment,
                                null,
                                renderList(prestigeVariants, (v) => {
                                  return createElementVNode("button", {
                                    key: v.value,
                                    type: "button",
                                    class: normalizeClass(["tpl-btn", {
                                      active: customization.value.prestigeVariant === v.value
                                    }]),
                                    onClick: ($event) => customization.value.prestigeVariant = v.value
                                  }, [
                                    createTextVNode(
                                      toDisplayString(v.label),
                                      1
                                      /* TEXT */
                                    ),
                                    createElementVNode(
                                      "span",
                                      null,
                                      toDisplayString(v.hint),
                                      1
                                      /* TEXT */
                                    )
                                  ], 10, _hoisted_119);
                                }),
                                64
                                /* STABLE_FRAGMENT */
                              ))
                            ])
                          ])) : createCommentVNode("v-if", true)
                        ],
                        64
                        /* STABLE_FRAGMENT */
                      ))
                    ],
                    512
                    /* NEED_PATCH */
                  ), [
                    [vShow, activeTab.value === "prestige"]
                  ]),
                  withDirectives(createElementVNode(
                    "div",
                    _hoisted_120,
                    [
                      createElementVNode("div", _hoisted_121, [
                        _cache[55] || (_cache[55] = createElementVNode(
                          "label",
                          null,
                          "Primary symbol",
                          -1
                          /* CACHED */
                        )),
                        createElementVNode("button", {
                          type: "button",
                          class: "symbol-trigger",
                          onClick: _cache[9] || (_cache[9] = ($event) => symbolModalOpen.value = true)
                        }, [
                          createElementVNode(
                            "span",
                            {
                              class: "icon-slot",
                              style: normalizeStyle({ transform: rotStyle.value })
                            },
                            [
                              customization.value.customSymbol ? (openBlock(), createElementBlock("img", {
                                key: 0,
                                src: customization.value.customSymbol,
                                alt: ""
                              }, null, 8, _hoisted_1222)) : (openBlock(), createElementBlock("svg", {
                                key: 1,
                                viewBox: "0 0 24 24",
                                fill: "currentColor",
                                innerHTML: symbolInner()
                              }, null, 8, _hoisted_123))
                            ],
                            4
                            /* STYLE */
                          ),
                          _cache[54] || (_cache[54] = createElementVNode(
                            "span",
                            { class: "symbol-trigger-text" },
                            "Choose symbol\u2026",
                            -1
                            /* CACHED */
                          ))
                        ])
                      ])
                    ],
                    512
                    /* NEED_PATCH */
                  ), [
                    [vShow, activeTab.value === "symbol"]
                  ]),
                  withDirectives(createElementVNode(
                    "div",
                    _hoisted_124,
                    [
                      createElementVNode("div", _hoisted_125, [
                        _cache[56] || (_cache[56] = createElementVNode(
                          "label",
                          null,
                          "Card art",
                          -1
                          /* CACHED */
                        )),
                        createElementVNode("label", _hoisted_126, [
                          createElementVNode(
                            "span",
                            null,
                            toDisplayString(customization.value.customArt ? "Replace card art" : "Upload card art"),
                            1
                            /* TEXT */
                          ),
                          createElementVNode(
                            "input",
                            {
                              type: "file",
                              accept: "image/*",
                              onChange: onArtUpload
                            },
                            null,
                            32
                            /* NEED_HYDRATION */
                          )
                        ]),
                        _cache[57] || (_cache[57] = createElementVNode(
                          "div",
                          { class: "field-hint" },
                          " Uses the game's own cover art by default. Nothing leaves your browser. ",
                          -1
                          /* CACHED */
                        )),
                        customization.value.customArt ? (openBlock(), createElementBlock("button", {
                          key: 0,
                          type: "button",
                          class: "reset-link",
                          onClick: resetArt
                        }, " Reset to game cover ")) : createCommentVNode("v-if", true)
                      ]),
                      createElementVNode("div", _hoisted_127, [
                        _cache[58] || (_cache[58] = createElementVNode(
                          "label",
                          null,
                          "Memorable achievement",
                          -1
                          /* CACHED */
                        )),
                        withDirectives(createElementVNode(
                          "input",
                          {
                            "onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => customization.value.memorableAchievement = $event),
                            type: "text",
                            maxlength: "80",
                            class: "text-input",
                            placeholder: "The one you actually want remembered"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [vModelText, customization.value.memorableAchievement]
                        ])
                      ]),
                      createElementVNode("div", _hoisted_128, [
                        _cache[59] || (_cache[59] = createElementVNode(
                          "label",
                          null,
                          "Personal note (back only)",
                          -1
                          /* CACHED */
                        )),
                        withDirectives(createElementVNode(
                          "textarea",
                          {
                            "onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => customization.value.personalNote = $event),
                            maxlength: "300",
                            class: "text-input textarea-input",
                            placeholder: "Why it mattered"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [vModelText, customization.value.personalNote]
                        ])
                      ])
                    ],
                    512
                    /* NEED_PATCH */
                  ), [
                    [vShow, activeTab.value === "data"]
                  ]),
                  withDirectives(createElementVNode(
                    "div",
                    _hoisted_129,
                    [
                      createElementVNode("div", _hoisted_130, [
                        _cache[60] || (_cache[60] = createElementVNode(
                          "label",
                          null,
                          "Rarity",
                          -1
                          /* CACHED */
                        )),
                        createElementVNode("div", _hoisted_131, [
                          (openBlock(), createElementBlock(
                            Fragment,
                            null,
                            renderList(rarities, (r) => {
                              return createElementVNode("button", {
                                key: r,
                                type: "button",
                                class: normalizeClass(["rarity-btn", { active: rarity.value === r }]),
                                onClick: ($event) => rarity.value = r
                              }, toDisplayString(RARITY_LABEL[r]), 11, _hoisted_1322);
                            }),
                            64
                            /* STABLE_FRAGMENT */
                          ))
                        ])
                      ]),
                      createElementVNode("div", _hoisted_133, [
                        _cache[62] || (_cache[62] = createElementVNode(
                          "label",
                          null,
                          "Set",
                          -1
                          /* CACHED */
                        )),
                        withDirectives(createElementVNode(
                          "select",
                          {
                            "onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => setId.value = $event),
                            class: "select-input"
                          },
                          [
                            _cache[61] || (_cache[61] = createElementVNode(
                              "option",
                              { value: null },
                              "No set",
                              -1
                              /* CACHED */
                            )),
                            (openBlock(true), createElementBlock(
                              Fragment,
                              null,
                              renderList(sets.value, (s) => {
                                return openBlock(), createElementBlock("option", {
                                  key: s.id,
                                  value: s.id
                                }, toDisplayString(s.name), 9, _hoisted_134);
                              }),
                              128
                              /* KEYED_FRAGMENT */
                            ))
                          ],
                          512
                          /* NEED_PATCH */
                        ), [
                          [vModelSelect, setId.value]
                        ]),
                        _cache[63] || (_cache[63] = createElementVNode(
                          "div",
                          { class: "field-hint" },
                          "Manage sets from the Sets page.",
                          -1
                          /* CACHED */
                        ))
                      ])
                    ],
                    512
                    /* NEED_PATCH */
                  ), [
                    [vShow, activeTab.value === "set"]
                  ])
                ]),
                createElementVNode("div", _hoisted_135, [
                  createElementVNode("button", {
                    type: "button",
                    class: "save-btn",
                    disabled: saving.value,
                    onClick: saveCard
                  }, toDisplayString(saving.value ? "Saving\u2026" : saved.value ? "Saved" : "Save"), 9, _hoisted_136)
                ])
              ])
            ])) : createCommentVNode("v-if", true),
            createCommentVNode(" ============ SYMBOL MODAL ============ "),
            symbolModalOpen.value ? (openBlock(), createElementBlock("div", {
              key: 3,
              class: "modal-backdrop",
              onClick: _cache[17] || (_cache[17] = withModifiers(($event) => symbolModalOpen.value = false, ["self"]))
            }, [
              createElementVNode("div", _hoisted_137, [
                createElementVNode("div", _hoisted_138, [
                  _cache[64] || (_cache[64] = createElementVNode(
                    "h2",
                    null,
                    "Symbol",
                    -1
                    /* CACHED */
                  )),
                  createElementVNode("button", {
                    type: "button",
                    class: "modal-close",
                    onClick: _cache[13] || (_cache[13] = ($event) => symbolModalOpen.value = false)
                  }, " \xD7 ")
                ]),
                createElementVNode("div", _hoisted_139, [
                  createElementVNode("div", _hoisted_140, [
                    _cache[65] || (_cache[65] = createElementVNode(
                      "label",
                      null,
                      "Primary symbol",
                      -1
                      /* CACHED */
                    )),
                    createElementVNode("div", _hoisted_141, [
                      (openBlock(true), createElementBlock(
                        Fragment,
                        null,
                        renderList(unref(CARD_SYMBOL_ORDER), (key) => {
                          return openBlock(), createElementBlock("button", {
                            key,
                            type: "button",
                            class: normalizeClass(["icon-btn", { active: customization.value.symbol === key }]),
                            onClick: ($event) => customization.value.symbol = key
                          }, [
                            createElementVNode("span", _hoisted_143, [
                              (openBlock(), createElementBlock("svg", {
                                viewBox: "0 0 24 24",
                                fill: "currentColor",
                                innerHTML: symbolInner(key)
                              }, null, 8, _hoisted_144))
                            ])
                          ], 10, _hoisted_1422);
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])
                  ]),
                  createElementVNode("div", _hoisted_145, [
                    _cache[67] || (_cache[67] = createElementVNode(
                      "label",
                      null,
                      "Rotation",
                      -1
                      /* CACHED */
                    )),
                    createElementVNode("div", _hoisted_146, [
                      createElementVNode("div", _hoisted_147, [
                        _cache[66] || (_cache[66] = createElementVNode(
                          "span",
                          null,
                          "Tilts the primary symbol wherever it's shown",
                          -1
                          /* CACHED */
                        )),
                        createElementVNode(
                          "b",
                          null,
                          toDisplayString(customization.value.symbolRotation) + "\xB0",
                          1
                          /* TEXT */
                        )
                      ]),
                      withDirectives(createElementVNode(
                        "input",
                        {
                          "onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => customization.value.symbolRotation = $event),
                          type: "range",
                          min: "-45",
                          max: "45"
                        },
                        null,
                        512
                        /* NEED_PATCH */
                      ), [
                        [
                          vModelText,
                          customization.value.symbolRotation,
                          void 0,
                          { number: true }
                        ]
                      ])
                    ])
                  ]),
                  createElementVNode("div", _hoisted_148, [
                    _cache[68] || (_cache[68] = createElementVNode(
                      "label",
                      null,
                      "Combine with a second symbol (back medallion badge only)",
                      -1
                      /* CACHED */
                    )),
                    createElementVNode("div", _hoisted_149, [
                      createElementVNode(
                        "button",
                        {
                          type: "button",
                          class: normalizeClass(["icon-btn none-btn", { active: customization.value.symbol2 === "none" }]),
                          onClick: _cache[15] || (_cache[15] = ($event) => customization.value.symbol2 = "none")
                        },
                        " None ",
                        2
                        /* CLASS */
                      ),
                      (openBlock(true), createElementBlock(
                        Fragment,
                        null,
                        renderList(unref(CARD_SYMBOL_ORDER), (key) => {
                          return openBlock(), createElementBlock("button", {
                            key,
                            type: "button",
                            class: normalizeClass(["icon-btn", { active: customization.value.symbol2 === key }]),
                            onClick: ($event) => customization.value.symbol2 = key
                          }, [
                            createElementVNode("span", _hoisted_151, [
                              (openBlock(), createElementBlock("svg", {
                                viewBox: "0 0 24 24",
                                fill: "currentColor",
                                innerHTML: symbolInner(key)
                              }, null, 8, _hoisted_152))
                            ])
                          ], 10, _hoisted_150);
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])
                  ]),
                  createElementVNode("div", _hoisted_153, [
                    _cache[70] || (_cache[70] = createElementVNode(
                      "label",
                      null,
                      "Or upload your own icon",
                      -1
                      /* CACHED */
                    )),
                    createElementVNode("div", _hoisted_154, [
                      customization.value.customSymbol ? (openBlock(), createElementBlock("span", _hoisted_155, [
                        createElementVNode("img", {
                          src: customization.value.customSymbol,
                          alt: ""
                        }, null, 8, _hoisted_156)
                      ])) : createCommentVNode("v-if", true),
                      createElementVNode("label", _hoisted_157, [
                        _cache[69] || (_cache[69] = createElementVNode(
                          "span",
                          null,
                          "Upload icon",
                          -1
                          /* CACHED */
                        )),
                        createElementVNode(
                          "input",
                          {
                            type: "file",
                            accept: "image/*",
                            onChange: onCustomSymbolUpload
                          },
                          null,
                          32
                          /* NEED_HYDRATION */
                        )
                      ]),
                      customization.value.customSymbol ? (openBlock(), createElementBlock("button", {
                        key: 1,
                        class: "reset-link",
                        type: "button",
                        onClick: clearCustomSymbol
                      }, " Remove ")) : createCommentVNode("v-if", true)
                    ]),
                    _cache[71] || (_cache[71] = createElementVNode(
                      "div",
                      { class: "field-hint" },
                      " Tinted to match the metal accent, replaces the built-in symbol everywhere. ",
                      -1
                      /* CACHED */
                    ))
                  ])
                ]),
                createElementVNode("div", _hoisted_158, [
                  createElementVNode("button", {
                    type: "button",
                    class: "primary-btn",
                    onClick: _cache[16] || (_cache[16] = ($event) => symbolModalOpen.value = false)
                  }, " Done ")
                ])
              ])
            ])) : createCommentVNode("v-if", true)
          ]);
        };
      }
    });
    component2.__scopeId = "data-v-0c063e59";
    CardDetail_default = component2;
  }
});

// .validation/companion-plugins/official/collectors-archive/ui/views/SetList.vue
var SetList_exports = {};
__export(SetList_exports, {
  default: () => SetList_default
});
var _hoisted_159, _hoisted_210, _hoisted_310, _hoisted_410, _hoisted_510, _hoisted_610, _hoisted_710, _hoisted_810, _hoisted_910, _hoisted_1010, component3, SetList_default;
var init_SetList = __esm({
  ".validation/companion-plugins/official/collectors-archive/ui/views/SetList.vue"() {
    init_plugin_vue();
    init_plugin_vue();
    init_plugin_ui();
    init_plugin_ui();
    init_plugin_vue();
    init_router();
    init_set();
    _hoisted_159 = { class: "sets-page" };
    _hoisted_210 = ["disabled"];
    _hoisted_310 = {
      key: 0,
      class: "error"
    };
    _hoisted_410 = {
      key: 1,
      class: "empty-state"
    };
    _hoisted_510 = {
      key: 2,
      class: "empty-state error"
    };
    _hoisted_610 = {
      key: 3,
      class: "empty-state"
    };
    _hoisted_710 = {
      key: 4,
      class: "sets-grid"
    };
    _hoisted_810 = ["onClick"];
    _hoisted_910 = {
      key: 0,
      class: "complete-badge"
    };
    _hoisted_1010 = { class: "progress" };
    component3 = /* @__PURE__ */ defineComponent({
      __name: "SetList",
      setup(__props) {
        const router = useRouter();
        const sets = ref([]);
        const loading = ref(true);
        const error = ref(null);
        const newName = ref("");
        const newTarget = ref(null);
        const creating = ref(false);
        const createError = ref(null);
        async function load() {
          loading.value = true;
          try {
            sets.value = await fetchSets();
          } catch (e) {
            error.value = e instanceof Error ? e.message : "Failed to load sets.";
          } finally {
            loading.value = false;
          }
        }
        async function handleCreate() {
          if (creating.value) return;
          const name = newName.value.trim();
          if (!name) return;
          creating.value = true;
          createError.value = null;
          try {
            await createSet({ name, targetTotal: newTarget.value });
            newName.value = "";
            newTarget.value = null;
            await load();
          } catch (e) {
            createError.value = e instanceof Error ? e.message : "Failed to create set.";
          } finally {
            creating.value = false;
          }
        }
        onMounted(load);
        return (_ctx, _cache) => {
          return openBlock(), createElementBlock("main", _hoisted_159, [
            createVNode(unref(AccountChip), { fixed: "" }),
            createVNode(unref(PageHeader), {
              title: "Sets",
              description: "Group cards with a position and total. Assign a card to a set from the card's detail page. When every expected card is in, the set shows as complete."
            }),
            createElementVNode(
              "form",
              {
                class: "create-row",
                onSubmit: withModifiers(handleCreate, ["prevent"])
              },
              [
                withDirectives(createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => newName.value = $event),
                    type: "text",
                    class: "text-input",
                    placeholder: "New set name",
                    "aria-label": "New set name",
                    "data-shortcut": "create"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vModelText, newName.value]
                ]),
                withDirectives(createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => newTarget.value = $event),
                    type: "number",
                    min: "1",
                    class: "text-input target-input",
                    placeholder: "Total (optional)",
                    "aria-label": "Expected card total (optional)"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [
                    vModelText,
                    newTarget.value,
                    void 0,
                    { number: true }
                  ]
                ]),
                createElementVNode("button", {
                  type: "submit",
                  class: "add-button",
                  disabled: creating.value || !newName.value.trim()
                }, " + Create Set ", 8, _hoisted_210)
              ],
              32
              /* NEED_HYDRATION */
            ),
            createError.value ? (openBlock(), createElementBlock(
              "p",
              _hoisted_310,
              toDisplayString(createError.value),
              1
              /* TEXT */
            )) : createCommentVNode("v-if", true),
            loading.value ? (openBlock(), createElementBlock("p", _hoisted_410, "Loading\u2026")) : error.value ? (openBlock(), createElementBlock(
              "p",
              _hoisted_510,
              toDisplayString(error.value),
              1
              /* TEXT */
            )) : !sets.value.length ? (openBlock(), createElementBlock("p", _hoisted_610, "No sets yet.")) : (openBlock(), createElementBlock("div", _hoisted_710, [
              (openBlock(true), createElementBlock(
                Fragment,
                null,
                renderList(sets.value, (s) => {
                  return openBlock(), createElementBlock("button", {
                    key: s.id,
                    type: "button",
                    class: normalizeClass(["set-card", { complete: s.isComplete }]),
                    onClick: ($event) => unref(router).push(`/sets/${s.id}`)
                  }, [
                    s.isComplete ? (openBlock(), createElementBlock("span", _hoisted_910, "COMPLETE")) : createCommentVNode("v-if", true),
                    createElementVNode(
                      "h3",
                      null,
                      toDisplayString(s.name),
                      1
                      /* TEXT */
                    ),
                    createElementVNode(
                      "p",
                      _hoisted_1010,
                      toDisplayString(s.targetTotal ? `${s.cardCount} / ${s.targetTotal}` : `${s.cardCount} card${s.cardCount === 1 ? "" : "s"}`),
                      1
                      /* TEXT */
                    )
                  ], 10, _hoisted_810);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ]))
          ]);
        };
      }
    });
    component3.__scopeId = "data-v-0ce1d780";
    SetList_default = component3;
  }
});

// .validation/companion-plugins/official/collectors-archive/ui/native/dialog.ts
var useConfirm, usePrompt;
var init_dialog = __esm({
  ".validation/companion-plugins/official/collectors-archive/ui/native/dialog.ts"() {
    init_host();
    useConfirm = () => (options) => host().confirm(options);
    usePrompt = () => (options) => host().prompt(options);
  }
});

// .validation/companion-plugins/official/collectors-archive/ui/views/SetDetail.vue
var SetDetail_exports = {};
__export(SetDetail_exports, {
  default: () => SetDetail_default
});
var _hoisted_160, _hoisted_211, _hoisted_311, _hoisted_411, _hoisted_511, _hoisted_611, _hoisted_711, _hoisted_811, _hoisted_911, _hoisted_1011, _hoisted_1110, component4, SetDetail_default;
var init_SetDetail = __esm({
  ".validation/companion-plugins/official/collectors-archive/ui/views/SetDetail.vue"() {
    init_plugin_vue();
    init_plugin_vue();
    init_plugin_vue();
    init_router();
    init_set();
    init_games();
    init_dialog();
    _hoisted_160 = { class: "set-detail-page" };
    _hoisted_211 = {
      key: 0,
      class: "empty-state"
    };
    _hoisted_311 = {
      key: 1,
      class: "empty-state error"
    };
    _hoisted_411 = { class: "header-row" };
    _hoisted_511 = { class: "progress" };
    _hoisted_611 = {
      key: 0,
      class: "complete-banner"
    };
    _hoisted_711 = {
      key: 1,
      class: "empty-state"
    };
    _hoisted_811 = {
      key: 2,
      class: "cards-grid"
    };
    _hoisted_911 = ["onClick"];
    _hoisted_1011 = { class: "card-tile-title" };
    _hoisted_1110 = { class: "card-tile-num" };
    component4 = /* @__PURE__ */ defineComponent({
      __name: "SetDetail",
      setup(__props) {
        const confirm = useConfirm();
        const prompt = usePrompt();
        const route = useRoute();
        const router = useRouter();
        const setId = route.params.id;
        const set = ref(null);
        const games = ref([]);
        const loading = ref(true);
        const error = ref(null);
        const gameById = computed(() => new Map(games.value.map((g) => [g.id, g])));
        async function load() {
          loading.value = true;
          try {
            const [s, g] = await Promise.all([fetchSet(setId), fetchGames()]);
            set.value = s;
            games.value = g;
          } catch (e) {
            error.value = e instanceof Error ? e.message : "Failed to load set.";
          } finally {
            loading.value = false;
          }
        }
        async function handleDelete() {
          if (!set.value) return;
          const ok = await confirm({
            title: "Delete set",
            message: `Delete set "${set.value.name}"? Cards in it are just unassigned, not deleted.`,
            confirmLabel: "Delete",
            danger: true
          });
          if (!ok) return;
          await deleteSet(setId);
          router.push("/sets");
        }
        async function editTarget() {
          if (!set.value) return;
          const input = await prompt({
            title: "Cards in this set",
            message: "Total cards expected for this set (blank for unknown).",
            defaultValue: String(set.value.targetTotal ?? "")
          });
          if (input === null) return;
          const target = input.trim() === "" ? null : Number(input);
          await updateSet(setId, {
            targetTotal: Number.isFinite(target) ? target : null
          });
          await load();
        }
        onMounted(load);
        return (_ctx, _cache) => {
          return openBlock(), createElementBlock("main", _hoisted_160, [
            createElementVNode("button", {
              type: "button",
              class: "back-btn",
              onClick: _cache[0] || (_cache[0] = ($event) => unref(router).push("/sets"))
            }, " \u2190 Sets "),
            loading.value ? (openBlock(), createElementBlock("p", _hoisted_211, "Loading\u2026")) : error.value ? (openBlock(), createElementBlock(
              "p",
              _hoisted_311,
              toDisplayString(error.value),
              1
              /* TEXT */
            )) : set.value ? (openBlock(), createElementBlock(
              Fragment,
              { key: 2 },
              [
                createElementVNode("div", _hoisted_411, [
                  createElementVNode("div", null, [
                    createElementVNode(
                      "h1",
                      null,
                      toDisplayString(set.value.name),
                      1
                      /* TEXT */
                    ),
                    createElementVNode("p", _hoisted_511, [
                      createTextVNode(
                        toDisplayString(set.value.targetTotal ? `${set.value.cardCount} / ${set.value.targetTotal} cards` : `${set.value.cardCount} cards`) + " ",
                        1
                        /* TEXT */
                      ),
                      createElementVNode("button", {
                        type: "button",
                        class: "link-btn",
                        onClick: editTarget
                      }, " edit target ")
                    ])
                  ]),
                  createElementVNode("button", {
                    type: "button",
                    class: "danger-button",
                    onClick: handleDelete
                  }, " Delete set ")
                ]),
                set.value.isComplete ? (openBlock(), createElementBlock("div", _hoisted_611, [
                  _cache[1] || (_cache[1] = createElementVNode(
                    "span",
                    { class: "complete-glow" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  createElementVNode(
                    "span",
                    null,
                    "SET COMPLETE \u2014 " + toDisplayString(set.value.cardCount) + " / " + toDisplayString(set.value.targetTotal),
                    1
                    /* TEXT */
                  )
                ])) : createCommentVNode("v-if", true),
                !set.value.cards.length ? (openBlock(), createElementBlock("p", _hoisted_711, " No cards in this set yet. Assign one from a card's own detail page. ")) : (openBlock(), createElementBlock("div", _hoisted_811, [
                  (openBlock(true), createElementBlock(
                    Fragment,
                    null,
                    renderList(set.value.cards, (c) => {
                      return openBlock(), createElementBlock("button", {
                        key: c.id,
                        type: "button",
                        class: "card-tile",
                        onClick: ($event) => unref(router).push(`/cards/${c.id}`)
                      }, [
                        createElementVNode(
                          "span",
                          _hoisted_1011,
                          toDisplayString(gameById.value.get(c.gameId)?.title ?? "Unknown game"),
                          1
                          /* TEXT */
                        ),
                        createElementVNode(
                          "span",
                          _hoisted_1110,
                          "#" + toDisplayString(String(c.archiveNumber ?? 0).padStart(3, "0")),
                          1
                          /* TEXT */
                        )
                      ], 8, _hoisted_911);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ]))
              ],
              64
              /* STABLE_FRAGMENT */
            )) : createCommentVNode("v-if", true)
          ]);
        };
      }
    });
    component4.__scopeId = "data-v-f5867ad9";
    SetDetail_default = component4;
  }
});

// .validation/companion-plugins/official/collectors-archive/ui/services/media.ts
async function listGameScreenshots(gameId) {
  const media = [];
  let offset = 0;
  while (true) {
    const result = await archiveAction({ game_id: gameId, offset }, "game-media");
    media.push(...result.media);
    if (result.complete) return media.filter((item) => item.kind === "screenshot");
    offset = Number(result.next_offset);
  }
}
var init_media = __esm({
  ".validation/companion-plugins/official/collectors-archive/ui/services/media.ts"() {
    init_host();
  }
});

// .validation/companion-plugins/official/collectors-archive/ui/views/Bounties.vue
var Bounties_exports = {};
__export(Bounties_exports, {
  default: () => Bounties_default
});
var _hoisted_161, _hoisted_212, _hoisted_312, _hoisted_412, _hoisted_512, _hoisted_612, _hoisted_712, _hoisted_812, _hoisted_912, _hoisted_1012, _hoisted_1111, _hoisted_1210, _hoisted_1310, _hoisted_1410, _hoisted_1510, _hoisted_162, _hoisted_172, _hoisted_182, _hoisted_192, _hoisted_202, _hoisted_213, _hoisted_223, _hoisted_232, _hoisted_242, _hoisted_252, _hoisted_262, _hoisted_272, _hoisted_282, _hoisted_292, _hoisted_302, _hoisted_313, _hoisted_323, _hoisted_332, _hoisted_342, _hoisted_352, _hoisted_362, _hoisted_372, _hoisted_382, _hoisted_392, _hoisted_402, _hoisted_413, _hoisted_423, _hoisted_432, _hoisted_442, _hoisted_452, _hoisted_462, _hoisted_472, _hoisted_482, _hoisted_492, _hoisted_502, _hoisted_513, _hoisted_523, _hoisted_532, _hoisted_542, _hoisted_552, _hoisted_562, _hoisted_572, _hoisted_582, _hoisted_592, _hoisted_602, _hoisted_613, _hoisted_623, _hoisted_632, _hoisted_642, _hoisted_652, _hoisted_662, _hoisted_672, _hoisted_682, _hoisted_692, _hoisted_702, _hoisted_713, _hoisted_723, _hoisted_732, _hoisted_742, _hoisted_752, _hoisted_762, _hoisted_772, _hoisted_782, _hoisted_792, _hoisted_802, _hoisted_813, _hoisted_823, _hoisted_832, _hoisted_842, _hoisted_852, _hoisted_862, _hoisted_872, _hoisted_882, _hoisted_892, _hoisted_902, _hoisted_913, _hoisted_923, _hoisted_932, _hoisted_942, _hoisted_952, _hoisted_962, _hoisted_972, _hoisted_982, _hoisted_992, _hoisted_1002, _hoisted_1013, _hoisted_1023, _hoisted_1032, _hoisted_1042, _hoisted_1052, _hoisted_1062, _hoisted_1072, _hoisted_1082, _hoisted_1092, _hoisted_1102, _hoisted_1112, _hoisted_1123, _hoisted_1132, _hoisted_1142, _hoisted_1152, _hoisted_1162, _hoisted_1172, _hoisted_1182, _hoisted_1192, _hoisted_1202, _hoisted_1212, _hoisted_1223, _hoisted_1232, _hoisted_1242, _hoisted_1252, _hoisted_1262, _hoisted_1272, _hoisted_1282, _hoisted_1292, component5, Bounties_default;
var init_Bounties = __esm({
  ".validation/companion-plugins/official/collectors-archive/ui/views/Bounties.vue"() {
    init_plugin_vue();
    init_plugin_vue();
    init_router();
    init_plugin_ui();
    init_plugin_ui();
    init_plugin_ui();
    init_plugin_vue();
    init_games();
    init_media();
    init_bounties();
    _hoisted_161 = { class: "bounties-page" };
    _hoisted_212 = ["title"];
    _hoisted_312 = ["aria-pressed"];
    _hoisted_412 = {
      key: 0,
      class: "ui-alert",
      role: "alert"
    };
    _hoisted_512 = ["disabled"];
    _hoisted_612 = {
      key: 1,
      class: "points-panel"
    };
    _hoisted_712 = { class: "points-total" };
    _hoisted_812 = {
      key: 0,
      class: "empty-state"
    };
    _hoisted_912 = {
      key: 1,
      class: "points-list"
    };
    _hoisted_1012 = { class: "points-amount" };
    _hoisted_1111 = { class: "points-reason" };
    _hoisted_1210 = { class: "points-date" };
    _hoisted_1310 = {
      key: 2,
      class: "random-bounty-card"
    };
    _hoisted_1410 = { class: "random-bounty-main" };
    _hoisted_1510 = { class: "random-bounty-body" };
    _hoisted_162 = { class: "random-bounty-title" };
    _hoisted_172 = { class: "random-bounty-sub" };
    _hoisted_182 = { class: "random-bounty-actions" };
    _hoisted_192 = ["disabled"];
    _hoisted_202 = ["disabled"];
    _hoisted_213 = {
      key: 0,
      class: "random-bounty-alts"
    };
    _hoisted_223 = ["disabled", "onClick"];
    _hoisted_232 = { class: "random-bounty-alt-pts" };
    _hoisted_242 = { class: "filter-row" };
    _hoisted_252 = ["value"];
    _hoisted_262 = ["value"];
    _hoisted_272 = ["value"];
    _hoisted_282 = { class: "status-tabs" };
    _hoisted_292 = ["aria-pressed", "onClick"];
    _hoisted_302 = {
      key: 3,
      class: "empty-state"
    };
    _hoisted_313 = {
      key: 4,
      class: "empty-state"
    };
    _hoisted_323 = {
      key: 5,
      class: "bounty-list"
    };
    _hoisted_332 = { class: "bounty-main" };
    _hoisted_342 = { class: "bounty-meta-row" };
    _hoisted_352 = { class: "bounty-type-pill" };
    _hoisted_362 = {
      key: 2,
      class: "bounty-auto-pill",
      title: "Proposed automatically"
    };
    _hoisted_372 = { class: "bounty-title" };
    _hoisted_382 = {
      key: 0,
      class: "bounty-description"
    };
    _hoisted_392 = {
      key: 1,
      class: "bounty-target-note"
    };
    _hoisted_402 = {
      key: 2,
      class: "bounty-target-note"
    };
    _hoisted_413 = {
      key: 3,
      class: "bounty-target-note"
    };
    _hoisted_423 = { class: "progress-row" };
    _hoisted_432 = { class: "progress-track" };
    _hoisted_442 = { class: "progress-label" };
    _hoisted_452 = {
      key: 4,
      class: "manual-progress"
    };
    _hoisted_462 = ["disabled", "onClick"];
    _hoisted_472 = ["onClick"];
    _hoisted_482 = { class: "bounty-footer-row" };
    _hoisted_492 = {
      key: 0,
      class: "bounty-points"
    };
    _hoisted_502 = {
      key: 1,
      class: "bounty-deadline"
    };
    _hoisted_513 = { class: "bounty-date" };
    _hoisted_523 = ["onClick"];
    _hoisted_532 = { class: "bounty-actions" };
    _hoisted_542 = ["disabled", "onClick"];
    _hoisted_552 = ["disabled", "onClick"];
    _hoisted_562 = ["disabled", "onClick"];
    _hoisted_572 = ["disabled", "onClick"];
    _hoisted_582 = ["disabled", "onClick"];
    _hoisted_592 = ["onClick"];
    _hoisted_602 = ["disabled", "onClick"];
    _hoisted_613 = {
      key: 0,
      class: "bounty-details"
    };
    _hoisted_623 = { class: "details-section" };
    _hoisted_632 = { class: "details-header" };
    _hoisted_642 = ["onClick"];
    _hoisted_652 = {
      key: 0,
      class: "empty-state small"
    };
    _hoisted_662 = {
      key: 1,
      class: "objective-list"
    };
    _hoisted_672 = ["checked", "disabled", "onChange"];
    _hoisted_682 = {
      key: 2,
      class: "objective-progress"
    };
    _hoisted_692 = {
      key: 3,
      class: "objective-progress"
    };
    _hoisted_702 = ["disabled", "onClick"];
    _hoisted_713 = {
      key: 2,
      class: "inline-form"
    };
    _hoisted_723 = ["value"];
    _hoisted_732 = ["disabled"];
    _hoisted_742 = ["value"];
    _hoisted_752 = {
      key: 2,
      class: "form-error small"
    };
    _hoisted_762 = { class: "inline-form-actions" };
    _hoisted_772 = ["disabled", "onClick"];
    _hoisted_782 = { class: "details-section" };
    _hoisted_792 = { class: "details-header" };
    _hoisted_802 = ["onClick"];
    _hoisted_813 = {
      key: 0,
      class: "empty-state small"
    };
    _hoisted_823 = {
      key: 1,
      class: "evidence-list"
    };
    _hoisted_832 = { class: "evidence-kind" };
    _hoisted_842 = ["href"];
    _hoisted_852 = ["href"];
    _hoisted_862 = {
      key: 2,
      class: "evidence-text"
    };
    _hoisted_872 = ["disabled", "onClick"];
    _hoisted_882 = {
      key: 2,
      class: "inline-form"
    };
    _hoisted_892 = ["value"];
    _hoisted_902 = ["disabled"];
    _hoisted_913 = { value: "" };
    _hoisted_923 = ["value"];
    _hoisted_932 = {
      key: 3,
      class: "form-error small"
    };
    _hoisted_942 = { class: "inline-form-actions" };
    _hoisted_952 = ["disabled", "onClick"];
    _hoisted_962 = { class: "details-section" };
    _hoisted_972 = {
      key: 0,
      class: "empty-state small"
    };
    _hoisted_982 = {
      key: 1,
      class: "journal-list"
    };
    _hoisted_992 = { class: "journal-date" };
    _hoisted_1002 = { class: "journal-text" };
    _hoisted_1013 = ["disabled", "onClick"];
    _hoisted_1023 = {
      key: 2,
      class: "inline-form"
    };
    _hoisted_1032 = ["onUpdate:modelValue"];
    _hoisted_1042 = { class: "inline-form-actions" };
    _hoisted_1052 = ["disabled", "onClick"];
    _hoisted_1062 = { class: "add-form" };
    _hoisted_1072 = { class: "field-label" };
    _hoisted_1082 = { class: "field-label" };
    _hoisted_1092 = ["value"];
    _hoisted_1102 = {
      key: 0,
      class: "field-label"
    };
    _hoisted_1112 = ["value"];
    _hoisted_1123 = {
      key: 1,
      class: "field-label"
    };
    _hoisted_1132 = ["disabled"];
    _hoisted_1142 = { value: "" };
    _hoisted_1152 = ["value"];
    _hoisted_1162 = {
      key: 2,
      class: "field-label"
    };
    _hoisted_1172 = { id: "collection-names" };
    _hoisted_1182 = ["value"];
    _hoisted_1192 = {
      key: 3,
      class: "field-label"
    };
    _hoisted_1202 = { class: "field-label" };
    _hoisted_1212 = ["value"];
    _hoisted_1223 = { class: "field-label" };
    _hoisted_1232 = { class: "field-hint" };
    _hoisted_1242 = ["onClick"];
    _hoisted_1252 = { class: "field-label" };
    _hoisted_1262 = { class: "field-label" };
    _hoisted_1272 = {
      key: 4,
      class: "form-error"
    };
    _hoisted_1282 = { class: "dialog-actions" };
    _hoisted_1292 = ["disabled"];
    component5 = /* @__PURE__ */ defineComponent({
      __name: "Bounties",
      setup(__props) {
        const TYPE_LABELS = {
          completion: "Completion",
          mastery: "Mastery",
          achievement: "Achievement",
          collection: "Collection",
          challenge: "Challenge",
          watch: "Watch",
          custom: "Custom"
        };
        const DIFFICULTY_LABELS = {
          easy: "Easy",
          normal: "Normal",
          hard: "Hard",
          extreme: "Extreme"
        };
        const AUTOMATIC_TYPES = [
          "completion",
          "mastery",
          "achievement",
          "collection"
        ];
        const SUGGESTED_POINTS = {
          easy: 50,
          normal: 100,
          hard: 200,
          extreme: 400
        };
        const OBJECTIVE_KIND_LABELS = {
          checkbox: "Checkbox",
          numeric: "Numeric",
          achievement: "Achievement"
        };
        const EVIDENCE_KIND_LABELS = {
          screenshot: "\u{1F4F8} Screenshot",
          clip: "\u{1F3AC} Clip",
          document: "\u{1F4C4} Document",
          note: "\u{1F4DD} Note",
          link: "\u{1F517} Link"
        };
        const bounties = ref([]);
        const games = ref([]);
        const loading = ref(true);
        const loadError = ref("");
        const actionPending = ref(null);
        const statusFilter = ref(
          "active"
        );
        const typeFilter = ref("");
        const difficultyFilter = ref("");
        const gameFilter = ref("");
        const searchQuery = ref("");
        const route = useRoute();
        async function loadAll() {
          loading.value = true;
          loadError.value = "";
          try {
            const [b, g] = await Promise.all([fetchBounties(), fetchGames()]);
            bounties.value = b;
            const requested = b.find((item) => item.id === route.query.record_id);
            if (requested) {
              searchQuery.value = requested.title;
              statusFilter.value = requested.status;
            }
            games.value = g.slice().sort((a, c) => a.title.localeCompare(c.title));
          } catch (reason) {
            loadError.value = reason instanceof Error ? reason.message : "Could not load your bounties.";
          } finally {
            loading.value = false;
          }
        }
        onMounted(loadAll);
        onMounted(loadRandomProposal);
        const filteredBounties = computed(
          () => bounties.value.filter((b) => {
            if (b.status !== statusFilter.value) return false;
            if (typeFilter.value && b.type !== typeFilter.value) return false;
            if (difficultyFilter.value && b.difficulty !== difficultyFilter.value)
              return false;
            if (gameFilter.value && b.game_id !== gameFilter.value) return false;
            if (searchQuery.value.trim() && !b.title.toLowerCase().includes(searchQuery.value.trim().toLowerCase()))
              return false;
            return true;
          })
        );
        const activeCount = computed(
          () => bounties.value.filter((b) => b.status === "active").length
        );
        const gamesWithBounties = computed(() => {
          const ids = new Set(
            bounties.value.map((b) => b.game_id).filter((id) => !!id)
          );
          return games.value.filter((g) => ids.has(g.id));
        });
        function progressPercent(b) {
          if (b.progress_mode === "binary") return b.progress_value >= 100 ? 100 : 0;
          if (!b.progress_target || b.progress_target <= 0) return 0;
          return Math.min(
            100,
            Math.round(b.progress_value / b.progress_target * 100)
          );
        }
        function progressLabel(b) {
          if (b.progress_mode === "binary")
            return b.status === "completed" ? "Complete" : "Not complete";
          if (b.progress_mode === "percentage")
            return `${Math.round(b.progress_value)}%`;
          return `${b.progress_value} / ${b.progress_target ?? "?"}`;
        }
        function formatDate(epochSeconds) {
          return new Date(epochSeconds * 1e3).toLocaleDateString(void 0, {
            month: "short",
            day: "numeric",
            year: "numeric"
          });
        }
        function deadlineLabel(b) {
          if (!b.target_date) return null;
          const daysLeft = Math.ceil((b.target_date - Date.now() / 1e3) / 86400);
          if (daysLeft < 0) return `Overdue, was due ${formatDate(b.target_date)}`;
          if (daysLeft === 0) return "Due today";
          return `${daysLeft} day${daysLeft === 1 ? "" : "s"} remaining`;
        }
        function weekStart(unixSeconds) {
          const d = new Date(unixSeconds * 1e3);
          const isoDay = (d.getDay() + 6) % 7;
          d.setHours(0, 0, 0, 0);
          d.setDate(d.getDate() - isoDay);
          return d.getTime();
        }
        const bountyStreakWeeks = computed(() => {
          const weeks = new Set(
            bounties.value.filter((b) => b.completed_at !== null).map((b) => weekStart(b.completed_at))
          );
          if (!weeks.size) return 0;
          const oneWeek = 7 * 864e5;
          let cursor = weekStart(Math.floor(Date.now() / 1e3));
          let streak = 0;
          while (weeks.has(cursor)) {
            streak++;
            cursor -= oneWeek;
          }
          return streak;
        });
        function shareBountyCard(b) {
          const canvas = document.createElement("canvas");
          canvas.width = 1e3;
          canvas.height = 560;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          bg.addColorStop(0, "#1a1408");
          bg.addColorStop(1, "#121212");
          ctx.fillStyle = bg;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.strokeStyle = "#d68a34";
          ctx.lineWidth = 3;
          ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);
          ctx.fillStyle = "#d68a34";
          ctx.font = "700 22px system-ui, sans-serif";
          ctx.fillText("BOUNTY COMPLETE", 64, 110);
          ctx.fillStyle = "#ffffff";
          ctx.font = "700 52px system-ui, sans-serif";
          wrapText(ctx, b.title, 64, 200, canvas.width - 128, 60);
          const metaY = 360;
          ctx.fillStyle = "#d68a34";
          ctx.font = "600 26px system-ui, sans-serif";
          const metaParts = [TYPE_LABELS[b.type]];
          if (b.difficulty) metaParts.push(DIFFICULTY_LABELS[b.difficulty]);
          if (b.game_title) metaParts.push(b.game_title);
          ctx.fillText(metaParts.join("   \xB7   "), 64, metaY);
          if (b.points_reward) {
            ctx.fillStyle = "#ffffff";
            ctx.font = "700 26px system-ui, sans-serif";
            ctx.fillText(`+${b.points_reward} pts`, 64, metaY + 50);
          }
          ctx.fillStyle = "#999999";
          ctx.font = "400 18px system-ui, sans-serif";
          const completedLabel = b.completed_at ? formatDate(b.completed_at) : formatDate(b.created_at);
          ctx.fillText(`Completed ${completedLabel}`, 64, canvas.height - 60);
          const link = document.createElement("a");
          link.download = `${b.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-bounty.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
        }
        function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
          const words = text.split(" ");
          let line = "";
          let curY = y;
          for (const word of words) {
            const test = line ? `${line} ${word}` : word;
            if (ctx.measureText(test).width > maxWidth && line) {
              ctx.fillText(line, x, curY);
              line = word;
              curY += lineHeight;
            } else {
              line = test;
            }
          }
          ctx.fillText(line, x, curY);
        }
        const randomProposal = ref(null);
        const randomLoading = ref(false);
        const randomAccepting = ref(false);
        function proposalKey(p) {
          return `${p.type}:${p.game_id}:${p.title}`;
        }
        const suggestionAlternatives = ref([]);
        async function loadSuggestionAlternatives() {
          const seen = new Set(
            randomProposal.value ? [proposalKey(randomProposal.value)] : []
          );
          const results = [];
          for (let i = 0; i < 5 && results.length < 2; i++) {
            const p = await fetchRandomBountyProposal();
            if (!p) break;
            const key = proposalKey(p);
            if (!seen.has(key)) {
              seen.add(key);
              results.push(p);
            }
          }
          suggestionAlternatives.value = results;
        }
        async function loadRandomProposal() {
          randomLoading.value = true;
          try {
            randomProposal.value = await fetchRandomBountyProposal();
          } catch {
            randomProposal.value = null;
          } finally {
            randomLoading.value = false;
          }
          void loadSuggestionAlternatives();
        }
        async function acceptAlternative(proposal) {
          randomAccepting.value = true;
          try {
            const created = await createBounty({
              title: proposal.title,
              type: proposal.type,
              game_id: proposal.game_id,
              points_reward: proposal.points_reward
            });
            bounties.value = [created, ...bounties.value];
            suggestionAlternatives.value = suggestionAlternatives.value.filter(
              (p) => proposalKey(p) !== proposalKey(proposal)
            );
            statusFilter.value = "active";
          } finally {
            randomAccepting.value = false;
          }
        }
        async function acceptRandomProposal() {
          if (!randomProposal.value) return;
          randomAccepting.value = true;
          try {
            const created = await createBounty({
              title: randomProposal.value.title,
              type: randomProposal.value.type,
              game_id: randomProposal.value.game_id,
              points_reward: randomProposal.value.points_reward
            });
            bounties.value = [created, ...bounties.value];
            randomProposal.value = null;
            statusFilter.value = "active";
            await loadRandomProposal();
          } finally {
            randomAccepting.value = false;
          }
        }
        const showAddForm = ref(false);
        const newType = ref("custom");
        const newTitle = ref("");
        const newDescription = ref("");
        const newDifficulty = ref("");
        const newGameId = ref("");
        const newAchievementId = ref("");
        const newCollectionName = ref("");
        const newProgressTarget = ref(null);
        const newPoints = ref(0);
        const newDeadline = ref("");
        const saving = ref(false);
        const formError = ref("");
        const gameAchievements = ref([]);
        const loadingAchievements = ref(false);
        watch([newType, newGameId], async ([type, gameId]) => {
          if (type !== "achievement" || !gameId) {
            gameAchievements.value = [];
            return;
          }
          loadingAchievements.value = true;
          try {
            gameAchievements.value = await fetchGameAchievements(gameId);
          } finally {
            loadingAchievements.value = false;
          }
        });
        const knownCollections = computed(() => {
          const names = /* @__PURE__ */ new Set();
          for (const g of games.value) {
            for (const c of g.collections ?? []) names.add(c);
          }
          return [...names].sort();
        });
        const needsGame = computed(
          () => ["completion", "mastery", "achievement"].includes(newType.value)
        );
        const isAutomatic = computed(() => AUTOMATIC_TYPES.includes(newType.value));
        function openAddForm() {
          newType.value = "custom";
          newTitle.value = "";
          newDescription.value = "";
          newDifficulty.value = "";
          newGameId.value = "";
          newAchievementId.value = "";
          newCollectionName.value = "";
          newProgressTarget.value = null;
          newPoints.value = 0;
          newDeadline.value = "";
          formError.value = "";
          showAddForm.value = true;
        }
        async function submitNewBounty() {
          if (!newTitle.value.trim()) {
            formError.value = "Give the goal a title.";
            return;
          }
          if (needsGame.value && !newGameId.value) {
            formError.value = "Pick a target game.";
            return;
          }
          if (newType.value === "achievement" && !newAchievementId.value) {
            formError.value = "Pick a target achievement.";
            return;
          }
          if (newType.value === "collection" && !newCollectionName.value.trim()) {
            formError.value = "Name the target collection.";
            return;
          }
          saving.value = true;
          formError.value = "";
          try {
            const created = await createBounty({
              title: newTitle.value.trim(),
              description: newDescription.value.trim() || null,
              type: newType.value,
              difficulty: newDifficulty.value || null,
              game_id: newType.value === "collection" ? null : newGameId.value || null,
              target_achievement_id: newType.value === "achievement" ? newAchievementId.value : null,
              target_collection_name: newType.value === "collection" ? newCollectionName.value.trim() : null,
              progress_mode: newType.value === "challenge" || newType.value === "watch" || newType.value === "custom" ? "numeric" : void 0,
              progress_target: !isAutomatic.value ? newProgressTarget.value : null,
              points_reward: newPoints.value,
              target_date: newDeadline.value ? Math.floor(new Date(newDeadline.value).getTime() / 1e3) : null
            });
            bounties.value = [created, ...bounties.value];
            showAddForm.value = false;
            statusFilter.value = created.status === "completed" ? "completed" : "active";
          } catch (err) {
            formError.value = err instanceof Error ? err.message : "Failed to create bounty.";
          } finally {
            saving.value = false;
          }
        }
        async function doAction(bounty, action) {
          actionPending.value = bounty.id;
          try {
            if (action === "complete") await completeBounty(bounty.id);
            else if (action === "pause") await pauseBounty(bounty.id);
            else if (action === "resume") await resumeBounty(bounty.id);
            else if (action === "abandon") await abandonBounty(bounty.id);
            else if (action === "delete") {
              await deleteBounty(bounty.id);
              bounties.value = bounties.value.filter((b) => b.id !== bounty.id);
              return;
            }
            bounties.value = await fetchBounties();
          } finally {
            actionPending.value = null;
          }
        }
        const editingProgressId = ref(null);
        const progressDraft = ref(0);
        function startEditProgress(b) {
          editingProgressId.value = b.id;
          progressDraft.value = b.progress_value;
        }
        async function saveProgress(b) {
          actionPending.value = b.id;
          try {
            const updated = await updateBounty(b.id, {
              progress_value: progressDraft.value
            });
            const idx = bounties.value.findIndex((x) => x.id === b.id);
            if (idx !== -1) bounties.value[idx] = updated;
            editingProgressId.value = null;
          } finally {
            actionPending.value = null;
          }
        }
        const expandedId = ref(null);
        function toggleExpand(b) {
          expandedId.value = expandedId.value === b.id ? null : b.id;
        }
        function replaceBounty(updated) {
          const idx = bounties.value.findIndex((x) => x.id === updated.id);
          if (idx !== -1) bounties.value[idx] = updated;
        }
        const showObjectiveForm = ref(null);
        const objTitle = ref("");
        const objKind = ref("checkbox");
        const objTarget = ref(null);
        const objAchievementId = ref("");
        const objAchievements = ref([]);
        const objSaving = ref(false);
        const objError = ref("");
        function openObjectiveForm(b) {
          showObjectiveForm.value = b.id;
          objTitle.value = "";
          objKind.value = "checkbox";
          objTarget.value = null;
          objAchievementId.value = "";
          objError.value = "";
          objAchievements.value = [];
          if (b.game_id)
            fetchGameAchievements(b.game_id).then((a) => objAchievements.value = a);
        }
        async function submitObjective(b) {
          if (!objTitle.value.trim()) {
            objError.value = "Give the objective a title.";
            return;
          }
          if (objKind.value === "achievement" && !objAchievementId.value) {
            objError.value = "Pick an achievement.";
            return;
          }
          objSaving.value = true;
          objError.value = "";
          try {
            const updated = await createObjective(b.id, {
              title: objTitle.value.trim(),
              kind: objKind.value,
              progress_target: objKind.value === "numeric" ? objTarget.value : null,
              target_achievement_id: objKind.value === "achievement" ? objAchievementId.value : null
            });
            replaceBounty(updated);
            showObjectiveForm.value = null;
          } catch (err) {
            objError.value = err instanceof Error ? err.message : "Failed to add objective.";
          } finally {
            objSaving.value = false;
          }
        }
        async function toggleObjectiveDone(b, objectiveId, done) {
          actionPending.value = objectiveId;
          try {
            const updated = await updateObjective(b.id, objectiveId, { done });
            replaceBounty(updated);
          } finally {
            actionPending.value = null;
          }
        }
        async function removeObjective(b, objectiveId) {
          actionPending.value = objectiveId;
          try {
            await deleteObjective(b.id, objectiveId);
            const updated = await fetchBounties();
            const fresh = updated.find((x) => x.id === b.id);
            if (fresh) replaceBounty(fresh);
          } finally {
            actionPending.value = null;
          }
        }
        const showEvidenceForm = ref(null);
        const evKind = ref("note");
        const evText = ref("");
        const evUrl = ref("");
        const evMediaId = ref("");
        const evMediaOptions = ref([]);
        const evSaving = ref(false);
        const evError = ref("");
        function openEvidenceForm(b) {
          showEvidenceForm.value = b.id;
          evKind.value = "note";
          evText.value = "";
          evUrl.value = "";
          evMediaId.value = "";
          evError.value = "";
          evMediaOptions.value = [];
          if (b.game_id)
            listGameScreenshots(b.game_id).then((m) => evMediaOptions.value = m);
        }
        async function submitEvidence(b) {
          if (evKind.value === "note" && !evText.value.trim()) {
            evError.value = "Write a note.";
            return;
          }
          if (evKind.value === "link" && !evUrl.value.trim()) {
            evError.value = "Enter a URL.";
            return;
          }
          if ((evKind.value === "screenshot" || evKind.value === "clip" || evKind.value === "document") && !evMediaId.value) {
            evError.value = "Pick a file from the game gallery.";
            return;
          }
          evSaving.value = true;
          evError.value = "";
          try {
            await createEvidence(b.id, {
              kind: evKind.value,
              text: evKind.value === "note" ? evText.value.trim() : null,
              url: evKind.value === "link" ? evUrl.value.trim() : null,
              media_item_id: ["screenshot", "clip", "document"].includes(evKind.value) ? evMediaId.value : null
            });
            const fresh = await fetchBounties();
            const updatedBounty = fresh.find((x) => x.id === b.id);
            if (updatedBounty) replaceBounty(updatedBounty);
            showEvidenceForm.value = null;
          } catch (err) {
            evError.value = err instanceof Error ? err.message : "Failed to add evidence.";
          } finally {
            evSaving.value = false;
          }
        }
        async function removeEvidence(b, evidenceId) {
          actionPending.value = evidenceId;
          try {
            await deleteEvidence(b.id, evidenceId);
            const fresh = await fetchBounties();
            const updatedBounty = fresh.find((x) => x.id === b.id);
            if (updatedBounty) replaceBounty(updatedBounty);
          } finally {
            actionPending.value = null;
          }
        }
        const journalDraft = ref({});
        async function addJournalEntry(b) {
          const text = (journalDraft.value[b.id] ?? "").trim();
          if (!text) return;
          actionPending.value = `journal-${b.id}`;
          try {
            await createJournalEntry(b.id, text);
            journalDraft.value[b.id] = "";
            const fresh = await fetchBounties();
            const updatedBounty = fresh.find((x) => x.id === b.id);
            if (updatedBounty) replaceBounty(updatedBounty);
          } finally {
            actionPending.value = null;
          }
        }
        async function removeJournalEntry(b, entryId) {
          actionPending.value = entryId;
          try {
            await deleteJournalEntry(b.id, entryId);
            const fresh = await fetchBounties();
            const updatedBounty = fresh.find((x) => x.id === b.id);
            if (updatedBounty) replaceBounty(updatedBounty);
          } finally {
            actionPending.value = null;
          }
        }
        const showPoints = ref(false);
        const pointsTotal = ref(0);
        const pointsHistory = ref([]);
        const pointsLoaded = ref(false);
        async function togglePoints() {
          showPoints.value = !showPoints.value;
          if (showPoints.value && !pointsLoaded.value) {
            const [total, history] = await Promise.all([
              fetchPointsTotal(),
              fetchPointsHistory()
            ]);
            pointsTotal.value = total;
            pointsHistory.value = history;
            pointsLoaded.value = true;
          }
        }
        return (_ctx, _cache) => {
          return openBlock(), createElementBlock("main", _hoisted_161, [
            createVNode(unref(AccountChip), { fixed: "" }),
            createVNode(unref(PageHeader), {
              title: "Bounties",
              description: "Personal goals and challenges. Points are there if you want them."
            }, {
              actions: withCtx(() => [
                bountyStreakWeeks.value > 0 ? (openBlock(), createElementBlock("span", {
                  key: 0,
                  class: "streak-pill",
                  title: `${bountyStreakWeeks.value} consecutive week${bountyStreakWeeks.value === 1 ? "" : "s"} with a bounty completed`
                }, " \u{1F525} " + toDisplayString(bountyStreakWeeks.value) + " week" + toDisplayString(bountyStreakWeeks.value === 1 ? "" : "s"), 9, _hoisted_212)) : createCommentVNode("v-if", true),
                createElementVNode("button", {
                  type: "button",
                  class: "points-toggle",
                  "aria-pressed": showPoints.value,
                  onClick: togglePoints
                }, " \u{1F3C5} " + toDisplayString(showPoints.value ? "Hide" : "Points"), 9, _hoisted_312),
                createElementVNode("button", {
                  type: "button",
                  class: "add-button",
                  "data-shortcut": "create",
                  onClick: openAddForm
                }, " + New Bounty ")
              ]),
              _: 1
              /* STABLE */
            }),
            loadError.value ? (openBlock(), createElementBlock("div", _hoisted_412, [
              createTextVNode(
                toDisplayString(loadError.value) + " ",
                1
                /* TEXT */
              ),
              createElementVNode("button", {
                type: "button",
                class: "ui-btn ui-btn-ghost",
                disabled: loading.value,
                onClick: loadAll
              }, "Retry", 8, _hoisted_512)
            ])) : createCommentVNode("v-if", true),
            showPoints.value ? (openBlock(), createElementBlock("div", _hoisted_612, [
              createElementVNode("div", _hoisted_712, [
                _cache[28] || (_cache[28] = createTextVNode(
                  " Total ",
                  -1
                  /* CACHED */
                )),
                createElementVNode(
                  "strong",
                  null,
                  toDisplayString(pointsTotal.value),
                  1
                  /* TEXT */
                )
              ]),
              pointsHistory.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_812, " No points earned yet. ")) : (openBlock(), createElementBlock("div", _hoisted_912, [
                (openBlock(true), createElementBlock(
                  Fragment,
                  null,
                  renderList(pointsHistory.value, (t) => {
                    return openBlock(), createElementBlock("div", {
                      key: t.id,
                      class: "points-row"
                    }, [
                      createElementVNode(
                        "span",
                        _hoisted_1012,
                        "+" + toDisplayString(t.amount),
                        1
                        /* TEXT */
                      ),
                      createElementVNode(
                        "span",
                        _hoisted_1111,
                        toDisplayString(t.reason),
                        1
                        /* TEXT */
                      ),
                      createElementVNode(
                        "span",
                        _hoisted_1210,
                        toDisplayString(formatDate(t.created_at)),
                        1
                        /* TEXT */
                      )
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ]))
            ])) : createCommentVNode("v-if", true),
            randomProposal.value ? (openBlock(), createElementBlock("div", _hoisted_1310, [
              createElementVNode("div", _hoisted_1410, [
                _cache[29] || (_cache[29] = createElementVNode(
                  "div",
                  { class: "random-bounty-label" },
                  "\u{1F3B2} RANDOM BOUNTY",
                  -1
                  /* CACHED */
                )),
                createElementVNode("div", _hoisted_1510, [
                  createElementVNode(
                    "span",
                    _hoisted_162,
                    toDisplayString(randomProposal.value.title),
                    1
                    /* TEXT */
                  ),
                  createElementVNode(
                    "span",
                    _hoisted_172,
                    toDisplayString(TYPE_LABELS[randomProposal.value.type]) + " \xB7 " + toDisplayString(randomProposal.value.game_title) + " \xB7 +" + toDisplayString(randomProposal.value.points_reward) + " pts",
                    1
                    /* TEXT */
                  )
                ]),
                createElementVNode("div", _hoisted_182, [
                  createElementVNode("button", {
                    type: "button",
                    class: "save-btn",
                    disabled: randomAccepting.value,
                    onClick: acceptRandomProposal
                  }, " Accept ", 8, _hoisted_192),
                  createElementVNode("button", {
                    type: "button",
                    class: "cancel-btn",
                    disabled: randomLoading.value,
                    onClick: loadRandomProposal
                  }, " Reroll ", 8, _hoisted_202)
                ])
              ]),
              suggestionAlternatives.value.length ? (openBlock(), createElementBlock("div", _hoisted_213, [
                _cache[30] || (_cache[30] = createElementVNode(
                  "span",
                  { class: "random-bounty-alts-label" },
                  "Or:",
                  -1
                  /* CACHED */
                )),
                (openBlock(true), createElementBlock(
                  Fragment,
                  null,
                  renderList(suggestionAlternatives.value, (alt) => {
                    return openBlock(), createElementBlock("button", {
                      key: proposalKey(alt),
                      type: "button",
                      class: "random-bounty-alt",
                      disabled: randomAccepting.value,
                      onClick: ($event) => acceptAlternative(alt)
                    }, [
                      createTextVNode(
                        toDisplayString(alt.title) + " ",
                        1
                        /* TEXT */
                      ),
                      createElementVNode(
                        "span",
                        _hoisted_232,
                        "+" + toDisplayString(alt.points_reward),
                        1
                        /* TEXT */
                      )
                    ], 8, _hoisted_223);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])) : createCommentVNode("v-if", true)
            ])) : createCommentVNode("v-if", true),
            createElementVNode("div", _hoisted_242, [
              withDirectives(createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => searchQuery.value = $event),
                  type: "text",
                  class: "field-input search-input",
                  placeholder: "Search bounties\u2026",
                  "aria-label": "Search bounties",
                  "data-shortcut": "search"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vModelText, searchQuery.value]
              ]),
              withDirectives(createElementVNode(
                "select",
                {
                  "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => typeFilter.value = $event),
                  class: "field-input",
                  "aria-label": "Filter by type"
                },
                [
                  _cache[31] || (_cache[31] = createElementVNode(
                    "option",
                    { value: "" },
                    "All types",
                    -1
                    /* CACHED */
                  )),
                  (openBlock(), createElementBlock(
                    Fragment,
                    null,
                    renderList(TYPE_LABELS, (label, key) => {
                      return createElementVNode("option", {
                        key,
                        value: key
                      }, toDisplayString(label), 9, _hoisted_252);
                    }),
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ],
                512
                /* NEED_PATCH */
              ), [
                [vModelSelect, typeFilter.value]
              ]),
              withDirectives(createElementVNode(
                "select",
                {
                  "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => difficultyFilter.value = $event),
                  class: "field-input",
                  "aria-label": "Filter by difficulty"
                },
                [
                  _cache[32] || (_cache[32] = createElementVNode(
                    "option",
                    { value: "" },
                    "All difficulties",
                    -1
                    /* CACHED */
                  )),
                  (openBlock(), createElementBlock(
                    Fragment,
                    null,
                    renderList(DIFFICULTY_LABELS, (label, key) => {
                      return createElementVNode("option", {
                        key,
                        value: key
                      }, toDisplayString(label), 9, _hoisted_262);
                    }),
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ],
                512
                /* NEED_PATCH */
              ), [
                [vModelSelect, difficultyFilter.value]
              ]),
              withDirectives(createElementVNode(
                "select",
                {
                  "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => gameFilter.value = $event),
                  class: "field-input",
                  "aria-label": "Filter by game"
                },
                [
                  _cache[33] || (_cache[33] = createElementVNode(
                    "option",
                    { value: "" },
                    "All games",
                    -1
                    /* CACHED */
                  )),
                  (openBlock(true), createElementBlock(
                    Fragment,
                    null,
                    renderList(gamesWithBounties.value, (g) => {
                      return openBlock(), createElementBlock("option", {
                        key: g.id,
                        value: g.id
                      }, toDisplayString(g.title), 9, _hoisted_272);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ],
                512
                /* NEED_PATCH */
              ), [
                [vModelSelect, gameFilter.value]
              ])
            ]),
            createElementVNode("div", _hoisted_282, [
              (openBlock(), createElementBlock(
                Fragment,
                null,
                renderList(["active", "completed", "paused", "abandoned"], (s) => {
                  return createElementVNode("button", {
                    key: s,
                    type: "button",
                    class: normalizeClass(["status-tab", { active: statusFilter.value === s }]),
                    "aria-pressed": statusFilter.value === s,
                    onClick: ($event) => statusFilter.value = s
                  }, toDisplayString(s === "active" ? `Active (${activeCount.value})` : s.charAt(0).toUpperCase() + s.slice(1)), 11, _hoisted_292);
                }),
                64
                /* STABLE_FRAGMENT */
              ))
            ]),
            loading.value ? (openBlock(), createElementBlock("div", _hoisted_302, "Loading\u2026")) : filteredBounties.value.length === 0 ? (openBlock(), createElementBlock(
              "div",
              _hoisted_313,
              toDisplayString(statusFilter.value === "active" ? "No active bounties yet. Set a goal for one of your games." : `No ${statusFilter.value} bounties.`),
              1
              /* TEXT */
            )) : (openBlock(), createElementBlock("div", _hoisted_323, [
              (openBlock(true), createElementBlock(
                Fragment,
                null,
                renderList(filteredBounties.value, (b) => {
                  return openBlock(), createElementBlock("div", {
                    key: b.id,
                    class: "bounty-card-wrapper"
                  }, [
                    createElementVNode(
                      "div",
                      {
                        class: normalizeClass(["bounty-card", { muted: b.status !== "active" }])
                      },
                      [
                        createElementVNode("div", _hoisted_332, [
                          createElementVNode("div", _hoisted_342, [
                            b.game_id ? (openBlock(), createBlock(unref(RouterLink), {
                              key: 0,
                              to: `/games/${b.game_id}`,
                              class: "bounty-game-link"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(
                                  toDisplayString(b.game_title),
                                  1
                                  /* TEXT */
                                )
                              ]),
                              _: 2
                              /* DYNAMIC */
                            }, 1032, ["to"])) : createCommentVNode("v-if", true),
                            createElementVNode(
                              "span",
                              _hoisted_352,
                              toDisplayString(TYPE_LABELS[b.type]),
                              1
                              /* TEXT */
                            ),
                            b.difficulty ? (openBlock(), createElementBlock(
                              "span",
                              {
                                key: 1,
                                class: normalizeClass(["bounty-difficulty-pill", b.difficulty])
                              },
                              toDisplayString(DIFFICULTY_LABELS[b.difficulty]),
                              3
                              /* TEXT, CLASS */
                            )) : createCommentVNode("v-if", true),
                            b.auto_generated ? (openBlock(), createElementBlock("span", _hoisted_362, "\u{1F916} Suggested")) : createCommentVNode("v-if", true)
                          ]),
                          createElementVNode(
                            "span",
                            _hoisted_372,
                            toDisplayString(b.title),
                            1
                            /* TEXT */
                          ),
                          b.description ? (openBlock(), createElementBlock(
                            "p",
                            _hoisted_382,
                            toDisplayString(b.description),
                            1
                            /* TEXT */
                          )) : createCommentVNode("v-if", true),
                          b.type === "achievement" && b.target_achievement_name ? (openBlock(), createElementBlock(
                            "p",
                            _hoisted_392,
                            " Achievement: " + toDisplayString(b.target_achievement_name),
                            1
                            /* TEXT */
                          )) : createCommentVNode("v-if", true),
                          b.type === "collection" && b.target_collection_name ? (openBlock(), createElementBlock(
                            "p",
                            _hoisted_402,
                            " Collection: " + toDisplayString(b.target_collection_name),
                            1
                            /* TEXT */
                          )) : createCommentVNode("v-if", true),
                          b.required_evidence_kinds.length ? (openBlock(), createElementBlock(
                            "p",
                            _hoisted_413,
                            " Suggested evidence: " + toDisplayString(b.required_evidence_kinds.map((k) => EVIDENCE_KIND_LABELS[k]).join(", ")),
                            1
                            /* TEXT */
                          )) : createCommentVNode("v-if", true),
                          createElementVNode("div", _hoisted_423, [
                            createElementVNode("div", _hoisted_432, [
                              createElementVNode(
                                "div",
                                {
                                  class: "progress-fill",
                                  style: normalizeStyle({ width: progressPercent(b) + "%" })
                                },
                                null,
                                4
                                /* STYLE */
                              )
                            ]),
                            createElementVNode(
                              "span",
                              _hoisted_442,
                              toDisplayString(progressLabel(b)),
                              1
                              /* TEXT */
                            )
                          ]),
                          b.status === "active" && b.objectives.length === 0 && !AUTOMATIC_TYPES.includes(b.type) ? (openBlock(), createElementBlock("div", _hoisted_452, [
                            editingProgressId.value === b.id ? (openBlock(), createElementBlock(
                              Fragment,
                              { key: 0 },
                              [
                                withDirectives(createElementVNode(
                                  "input",
                                  {
                                    "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => progressDraft.value = $event),
                                    type: "number",
                                    min: "0",
                                    class: "progress-input"
                                  },
                                  null,
                                  512
                                  /* NEED_PATCH */
                                ), [
                                  [
                                    vModelText,
                                    progressDraft.value,
                                    void 0,
                                    { number: true }
                                  ]
                                ]),
                                createElementVNode("button", {
                                  type: "button",
                                  class: "mini-btn",
                                  disabled: actionPending.value === b.id,
                                  onClick: ($event) => saveProgress(b)
                                }, " Save ", 8, _hoisted_462),
                                createElementVNode("button", {
                                  type: "button",
                                  class: "mini-btn",
                                  onClick: _cache[5] || (_cache[5] = ($event) => editingProgressId.value = null)
                                }, " Cancel ")
                              ],
                              64
                              /* STABLE_FRAGMENT */
                            )) : (openBlock(), createElementBlock("button", {
                              key: 1,
                              type: "button",
                              class: "mini-btn",
                              onClick: ($event) => startEditProgress(b)
                            }, " Update progress ", 8, _hoisted_472))
                          ])) : createCommentVNode("v-if", true),
                          createElementVNode("div", _hoisted_482, [
                            b.points_reward ? (openBlock(), createElementBlock(
                              "span",
                              _hoisted_492,
                              "+" + toDisplayString(b.points_reward) + " pts",
                              1
                              /* TEXT */
                            )) : createCommentVNode("v-if", true),
                            deadlineLabel(b) ? (openBlock(), createElementBlock(
                              "span",
                              _hoisted_502,
                              toDisplayString(deadlineLabel(b)),
                              1
                              /* TEXT */
                            )) : createCommentVNode("v-if", true),
                            createElementVNode(
                              "span",
                              _hoisted_513,
                              "Set " + toDisplayString(formatDate(b.created_at)),
                              1
                              /* TEXT */
                            ),
                            createElementVNode("button", {
                              type: "button",
                              class: "mini-btn",
                              onClick: ($event) => toggleExpand(b)
                            }, toDisplayString(expandedId.value === b.id ? "Hide" : "Objectives & Evidence") + " (" + toDisplayString(b.objectives.length + b.evidence.length) + ") ", 9, _hoisted_523)
                          ])
                        ]),
                        createElementVNode("div", _hoisted_532, [
                          b.status === "active" ? (openBlock(), createElementBlock(
                            Fragment,
                            { key: 0 },
                            [
                              createElementVNode("button", {
                                type: "button",
                                class: "action-btn complete",
                                disabled: actionPending.value === b.id,
                                title: "Mark complete",
                                "aria-label": "Mark bounty complete",
                                onClick: ($event) => doAction(b, "complete")
                              }, " \u2713 ", 8, _hoisted_542),
                              createElementVNode("button", {
                                type: "button",
                                class: "action-btn pause",
                                disabled: actionPending.value === b.id,
                                title: "Pause",
                                "aria-label": "Pause bounty",
                                onClick: ($event) => doAction(b, "pause")
                              }, " \u23F8 ", 8, _hoisted_552),
                              createElementVNode("button", {
                                type: "button",
                                class: "action-btn abandon",
                                disabled: actionPending.value === b.id,
                                title: "Abandon",
                                "aria-label": "Abandon bounty",
                                onClick: ($event) => doAction(b, "abandon")
                              }, " \u2715 ", 8, _hoisted_562)
                            ],
                            64
                            /* STABLE_FRAGMENT */
                          )) : b.status === "paused" ? (openBlock(), createElementBlock(
                            Fragment,
                            { key: 1 },
                            [
                              createElementVNode("button", {
                                type: "button",
                                class: "action-btn resume",
                                disabled: actionPending.value === b.id,
                                title: "Resume",
                                "aria-label": "Resume bounty",
                                onClick: ($event) => doAction(b, "resume")
                              }, " \u25B6 ", 8, _hoisted_572),
                              createElementVNode("button", {
                                type: "button",
                                class: "action-btn abandon",
                                disabled: actionPending.value === b.id,
                                title: "Abandon",
                                "aria-label": "Abandon bounty",
                                onClick: ($event) => doAction(b, "abandon")
                              }, " \u2715 ", 8, _hoisted_582)
                            ],
                            64
                            /* STABLE_FRAGMENT */
                          )) : createCommentVNode("v-if", true),
                          b.status === "completed" ? (openBlock(), createElementBlock("button", {
                            key: 2,
                            type: "button",
                            class: "action-btn share",
                            title: "Save a shareable image",
                            "aria-label": "Save a shareable bounty image",
                            onClick: ($event) => shareBountyCard(b)
                          }, " \u21E9 ", 8, _hoisted_592)) : createCommentVNode("v-if", true),
                          b.status !== "completed" ? (openBlock(), createElementBlock("button", {
                            key: 3,
                            type: "button",
                            class: "action-btn delete",
                            disabled: actionPending.value === b.id,
                            title: "Delete",
                            "aria-label": "Delete bounty",
                            onClick: ($event) => doAction(b, "delete")
                          }, " \u{1F5D1} ", 8, _hoisted_602)) : createCommentVNode("v-if", true)
                        ])
                      ],
                      2
                      /* CLASS */
                    ),
                    expandedId.value === b.id ? (openBlock(), createElementBlock("div", _hoisted_613, [
                      createElementVNode("div", _hoisted_623, [
                        createElementVNode("div", _hoisted_632, [
                          _cache[34] || (_cache[34] = createElementVNode(
                            "h4",
                            null,
                            "Objectives",
                            -1
                            /* CACHED */
                          )),
                          b.status === "active" ? (openBlock(), createElementBlock("button", {
                            key: 0,
                            type: "button",
                            class: "mini-btn",
                            onClick: ($event) => openObjectiveForm(b)
                          }, " + Add ", 8, _hoisted_642)) : createCommentVNode("v-if", true)
                        ]),
                        b.objectives.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_652, " No objectives, this is a simple goal. ")) : (openBlock(), createElementBlock("div", _hoisted_662, [
                          (openBlock(true), createElementBlock(
                            Fragment,
                            null,
                            renderList(b.objectives, (o) => {
                              return openBlock(), createElementBlock("div", {
                                key: o.id,
                                class: "objective-row"
                              }, [
                                o.kind === "checkbox" ? (openBlock(), createElementBlock("input", {
                                  key: 0,
                                  type: "checkbox",
                                  checked: o.done,
                                  disabled: b.status !== "active" || actionPending.value === o.id,
                                  onChange: ($event) => toggleObjectiveDone(
                                    b,
                                    o.id,
                                    $event.target.checked
                                  )
                                }, null, 40, _hoisted_672)) : (openBlock(), createElementBlock(
                                  "span",
                                  {
                                    key: 1,
                                    class: normalizeClass(["objective-status", { done: o.done }])
                                  },
                                  toDisplayString(o.done ? "\u2713" : "\u25CB"),
                                  3
                                  /* TEXT, CLASS */
                                )),
                                createElementVNode(
                                  "span",
                                  {
                                    class: normalizeClass(["objective-title", { done: o.done }])
                                  },
                                  toDisplayString(o.title),
                                  3
                                  /* TEXT, CLASS */
                                ),
                                o.kind === "numeric" ? (openBlock(), createElementBlock(
                                  "span",
                                  _hoisted_682,
                                  toDisplayString(o.progress_value) + " / " + toDisplayString(o.progress_target ?? "?"),
                                  1
                                  /* TEXT */
                                )) : createCommentVNode("v-if", true),
                                o.kind === "achievement" ? (openBlock(), createElementBlock("span", _hoisted_692, "achievement")) : createCommentVNode("v-if", true),
                                b.status === "active" ? (openBlock(), createElementBlock("button", {
                                  key: 4,
                                  type: "button",
                                  class: "mini-btn danger",
                                  disabled: actionPending.value === o.id,
                                  onClick: ($event) => removeObjective(b, o.id)
                                }, " \u2715 ", 8, _hoisted_702)) : createCommentVNode("v-if", true)
                              ]);
                            }),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ])),
                        showObjectiveForm.value === b.id ? (openBlock(), createElementBlock("div", _hoisted_713, [
                          withDirectives(createElementVNode(
                            "input",
                            {
                              "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => objTitle.value = $event),
                              class: "field-input",
                              type: "text",
                              placeholder: "Earn 3 badges",
                              maxlength: "200"
                            },
                            null,
                            512
                            /* NEED_PATCH */
                          ), [
                            [vModelText, objTitle.value]
                          ]),
                          withDirectives(createElementVNode(
                            "select",
                            {
                              "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => objKind.value = $event),
                              class: "field-input"
                            },
                            [
                              (openBlock(), createElementBlock(
                                Fragment,
                                null,
                                renderList(OBJECTIVE_KIND_LABELS, (label, key) => {
                                  return createElementVNode("option", {
                                    key,
                                    value: key
                                  }, toDisplayString(label), 9, _hoisted_723);
                                }),
                                64
                                /* STABLE_FRAGMENT */
                              ))
                            ],
                            512
                            /* NEED_PATCH */
                          ), [
                            [vModelSelect, objKind.value]
                          ]),
                          objKind.value === "numeric" ? withDirectives((openBlock(), createElementBlock(
                            "input",
                            {
                              key: 0,
                              "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => objTarget.value = $event),
                              class: "field-input",
                              type: "number",
                              min: "1",
                              placeholder: "Target (e.g. 10)"
                            },
                            null,
                            512
                            /* NEED_PATCH */
                          )), [
                            [
                              vModelText,
                              objTarget.value,
                              void 0,
                              { number: true }
                            ]
                          ]) : createCommentVNode("v-if", true),
                          objKind.value === "achievement" ? withDirectives((openBlock(), createElementBlock("select", {
                            key: 1,
                            "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => objAchievementId.value = $event),
                            class: "field-input",
                            disabled: !b.game_id
                          }, [
                            _cache[35] || (_cache[35] = createElementVNode(
                              "option",
                              { value: "" },
                              "Select an achievement\u2026",
                              -1
                              /* CACHED */
                            )),
                            (openBlock(true), createElementBlock(
                              Fragment,
                              null,
                              renderList(objAchievements.value, (a) => {
                                return openBlock(), createElementBlock("option", {
                                  key: a.id,
                                  value: a.id
                                }, toDisplayString(a.name), 9, _hoisted_742);
                              }),
                              128
                              /* KEYED_FRAGMENT */
                            ))
                          ], 8, _hoisted_732)), [
                            [vModelSelect, objAchievementId.value]
                          ]) : createCommentVNode("v-if", true),
                          objError.value ? (openBlock(), createElementBlock(
                            "p",
                            _hoisted_752,
                            toDisplayString(objError.value),
                            1
                            /* TEXT */
                          )) : createCommentVNode("v-if", true),
                          createElementVNode("div", _hoisted_762, [
                            createElementVNode("button", {
                              type: "button",
                              class: "mini-btn",
                              onClick: _cache[10] || (_cache[10] = ($event) => showObjectiveForm.value = null)
                            }, " Cancel "),
                            createElementVNode("button", {
                              type: "button",
                              class: "mini-btn primary",
                              disabled: objSaving.value,
                              onClick: ($event) => submitObjective(b)
                            }, toDisplayString(objSaving.value ? "Saving\u2026" : "Add"), 9, _hoisted_772)
                          ])
                        ])) : createCommentVNode("v-if", true)
                      ]),
                      createElementVNode("div", _hoisted_782, [
                        createElementVNode("div", _hoisted_792, [
                          _cache[36] || (_cache[36] = createElementVNode(
                            "h4",
                            null,
                            "Evidence",
                            -1
                            /* CACHED */
                          )),
                          b.status === "active" ? (openBlock(), createElementBlock("button", {
                            key: 0,
                            type: "button",
                            class: "mini-btn",
                            onClick: ($event) => openEvidenceForm(b)
                          }, " + Add ", 8, _hoisted_802)) : createCommentVNode("v-if", true)
                        ]),
                        b.evidence.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_813, " No evidence attached. ")) : (openBlock(), createElementBlock("div", _hoisted_823, [
                          (openBlock(true), createElementBlock(
                            Fragment,
                            null,
                            renderList(b.evidence, (e) => {
                              return openBlock(), createElementBlock("div", {
                                key: e.id,
                                class: "evidence-row"
                              }, [
                                createElementVNode(
                                  "span",
                                  _hoisted_832,
                                  toDisplayString(EVIDENCE_KIND_LABELS[e.kind]),
                                  1
                                  /* TEXT */
                                ),
                                e.media_url ? (openBlock(), createElementBlock("a", {
                                  key: 0,
                                  href: e.media_url,
                                  target: "_blank",
                                  rel: "noopener",
                                  class: "evidence-link"
                                }, toDisplayString(e.media_filename), 9, _hoisted_842)) : e.url ? (openBlock(), createElementBlock("a", {
                                  key: 1,
                                  href: e.url,
                                  target: "_blank",
                                  rel: "noopener",
                                  class: "evidence-link"
                                }, toDisplayString(e.url), 9, _hoisted_852)) : e.text ? (openBlock(), createElementBlock(
                                  "span",
                                  _hoisted_862,
                                  toDisplayString(e.text),
                                  1
                                  /* TEXT */
                                )) : createCommentVNode("v-if", true),
                                createElementVNode("button", {
                                  type: "button",
                                  class: "mini-btn danger",
                                  disabled: actionPending.value === e.id,
                                  onClick: ($event) => removeEvidence(b, e.id)
                                }, " \u2715 ", 8, _hoisted_872)
                              ]);
                            }),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ])),
                        showEvidenceForm.value === b.id ? (openBlock(), createElementBlock("div", _hoisted_882, [
                          withDirectives(createElementVNode(
                            "select",
                            {
                              "onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => evKind.value = $event),
                              class: "field-input"
                            },
                            [
                              (openBlock(), createElementBlock(
                                Fragment,
                                null,
                                renderList(EVIDENCE_KIND_LABELS, (label, key) => {
                                  return createElementVNode("option", {
                                    key,
                                    value: key
                                  }, toDisplayString(label), 9, _hoisted_892);
                                }),
                                64
                                /* STABLE_FRAGMENT */
                              ))
                            ],
                            512
                            /* NEED_PATCH */
                          ), [
                            [vModelSelect, evKind.value]
                          ]),
                          evKind.value === "note" ? withDirectives((openBlock(), createElementBlock(
                            "textarea",
                            {
                              key: 0,
                              "onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => evText.value = $event),
                              class: "field-input",
                              rows: "2",
                              placeholder: "Write a note"
                            },
                            null,
                            512
                            /* NEED_PATCH */
                          )), [
                            [vModelText, evText.value]
                          ]) : createCommentVNode("v-if", true),
                          evKind.value === "link" ? withDirectives((openBlock(), createElementBlock(
                            "input",
                            {
                              key: 1,
                              "onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => evUrl.value = $event),
                              class: "field-input",
                              type: "text",
                              placeholder: "https://\u2026"
                            },
                            null,
                            512
                            /* NEED_PATCH */
                          )), [
                            [vModelText, evUrl.value]
                          ]) : createCommentVNode("v-if", true),
                          ["screenshot", "clip", "document"].includes(evKind.value) ? withDirectives((openBlock(), createElementBlock("select", {
                            key: 2,
                            "onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => evMediaId.value = $event),
                            class: "field-input",
                            disabled: !b.game_id || evMediaOptions.value.length === 0
                          }, [
                            createElementVNode(
                              "option",
                              _hoisted_913,
                              toDisplayString(evMediaOptions.value.length === 0 ? "No media in this game's gallery yet" : "Select a file\u2026"),
                              1
                              /* TEXT */
                            ),
                            (openBlock(true), createElementBlock(
                              Fragment,
                              null,
                              renderList(evMediaOptions.value, (m) => {
                                return openBlock(), createElementBlock("option", {
                                  key: m.id,
                                  value: m.id
                                }, toDisplayString(m.filename), 9, _hoisted_923);
                              }),
                              128
                              /* KEYED_FRAGMENT */
                            ))
                          ], 8, _hoisted_902)), [
                            [vModelSelect, evMediaId.value]
                          ]) : createCommentVNode("v-if", true),
                          evError.value ? (openBlock(), createElementBlock(
                            "p",
                            _hoisted_932,
                            toDisplayString(evError.value),
                            1
                            /* TEXT */
                          )) : createCommentVNode("v-if", true),
                          createElementVNode("div", _hoisted_942, [
                            createElementVNode("button", {
                              type: "button",
                              class: "mini-btn",
                              onClick: _cache[15] || (_cache[15] = ($event) => showEvidenceForm.value = null)
                            }, " Cancel "),
                            createElementVNode("button", {
                              type: "button",
                              class: "mini-btn primary",
                              disabled: evSaving.value,
                              onClick: ($event) => submitEvidence(b)
                            }, toDisplayString(evSaving.value ? "Saving\u2026" : "Add"), 9, _hoisted_952)
                          ])
                        ])) : createCommentVNode("v-if", true)
                      ]),
                      createElementVNode("div", _hoisted_962, [
                        _cache[37] || (_cache[37] = createElementVNode(
                          "div",
                          { class: "details-header" },
                          [
                            createElementVNode("h4", null, "Journal")
                          ],
                          -1
                          /* CACHED */
                        )),
                        b.journal.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_972, " No journal entries yet. ")) : (openBlock(), createElementBlock("div", _hoisted_982, [
                          (openBlock(true), createElementBlock(
                            Fragment,
                            null,
                            renderList(b.journal, (j) => {
                              return openBlock(), createElementBlock("div", {
                                key: j.id,
                                class: "journal-entry"
                              }, [
                                createElementVNode(
                                  "span",
                                  _hoisted_992,
                                  toDisplayString(formatDate(j.created_at)),
                                  1
                                  /* TEXT */
                                ),
                                createElementVNode(
                                  "span",
                                  _hoisted_1002,
                                  toDisplayString(j.text),
                                  1
                                  /* TEXT */
                                ),
                                createElementVNode("button", {
                                  type: "button",
                                  class: "mini-btn danger",
                                  disabled: actionPending.value === j.id,
                                  onClick: ($event) => removeJournalEntry(b, j.id)
                                }, " \u2715 ", 8, _hoisted_1013)
                              ]);
                            }),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ])),
                        b.status === "active" ? (openBlock(), createElementBlock("div", _hoisted_1023, [
                          withDirectives(createElementVNode("textarea", {
                            "onUpdate:modelValue": ($event) => journalDraft.value[b.id] = $event,
                            class: "field-input",
                            rows: "2",
                            placeholder: "What happened today?"
                          }, null, 8, _hoisted_1032), [
                            [vModelText, journalDraft.value[b.id]]
                          ]),
                          createElementVNode("div", _hoisted_1042, [
                            createElementVNode("button", {
                              type: "button",
                              class: "mini-btn primary",
                              disabled: actionPending.value === `journal-${b.id}`,
                              onClick: ($event) => addJournalEntry(b)
                            }, " Add entry ", 8, _hoisted_1052)
                          ])
                        ])) : createCommentVNode("v-if", true)
                      ])
                    ])) : createCommentVNode("v-if", true)
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])),
            showAddForm.value ? (openBlock(), createBlock(unref(UiModal), {
              key: 6,
              title: "New bounty",
              dismissible: !saving.value,
              onClose: _cache[27] || (_cache[27] = ($event) => showAddForm.value = false)
            }, {
              default: withCtx(() => [
                createElementVNode("div", _hoisted_1062, [
                  createElementVNode("label", _hoisted_1072, [
                    _cache[38] || (_cache[38] = createTextVNode(
                      "Title ",
                      -1
                      /* CACHED */
                    )),
                    withDirectives(createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => newTitle.value = $event),
                        class: "field-input",
                        type: "text",
                        placeholder: "Finish Elden Ring",
                        maxlength: "200"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [vModelText, newTitle.value]
                    ])
                  ]),
                  createElementVNode("label", _hoisted_1082, [
                    _cache[39] || (_cache[39] = createTextVNode(
                      "Type ",
                      -1
                      /* CACHED */
                    )),
                    withDirectives(createElementVNode(
                      "select",
                      {
                        "onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => newType.value = $event),
                        class: "field-input",
                        "aria-label": "Bounty type"
                      },
                      [
                        (openBlock(), createElementBlock(
                          Fragment,
                          null,
                          renderList(TYPE_LABELS, (label, key) => {
                            return createElementVNode("option", {
                              key,
                              value: key
                            }, toDisplayString(label), 9, _hoisted_1092);
                          }),
                          64
                          /* STABLE_FRAGMENT */
                        ))
                      ],
                      512
                      /* NEED_PATCH */
                    ), [
                      [vModelSelect, newType.value]
                    ])
                  ]),
                  needsGame.value || newType.value === "challenge" || newType.value === "watch" ? (openBlock(), createElementBlock("label", _hoisted_1102, [
                    createTextVNode(
                      " Target Game" + toDisplayString(needsGame.value ? "" : " (optional)") + " ",
                      1
                      /* TEXT */
                    ),
                    withDirectives(createElementVNode(
                      "select",
                      {
                        "onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => newGameId.value = $event),
                        class: "field-input"
                      },
                      [
                        _cache[40] || (_cache[40] = createElementVNode(
                          "option",
                          { value: "" },
                          "None",
                          -1
                          /* CACHED */
                        )),
                        (openBlock(true), createElementBlock(
                          Fragment,
                          null,
                          renderList(games.value, (g) => {
                            return openBlock(), createElementBlock("option", {
                              key: g.id,
                              value: g.id
                            }, toDisplayString(g.title), 9, _hoisted_1112);
                          }),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ],
                      512
                      /* NEED_PATCH */
                    ), [
                      [vModelSelect, newGameId.value]
                    ])
                  ])) : createCommentVNode("v-if", true),
                  newType.value === "achievement" ? (openBlock(), createElementBlock("label", _hoisted_1123, [
                    _cache[41] || (_cache[41] = createTextVNode(
                      "Target Achievement ",
                      -1
                      /* CACHED */
                    )),
                    withDirectives(createElementVNode("select", {
                      "onUpdate:modelValue": _cache[19] || (_cache[19] = ($event) => newAchievementId.value = $event),
                      class: "field-input",
                      disabled: loadingAchievements.value || gameAchievements.value.length === 0
                    }, [
                      createElementVNode(
                        "option",
                        _hoisted_1142,
                        toDisplayString(loadingAchievements.value ? "Loading\u2026" : "Select one\u2026"),
                        1
                        /* TEXT */
                      ),
                      (openBlock(true), createElementBlock(
                        Fragment,
                        null,
                        renderList(gameAchievements.value, (a) => {
                          return openBlock(), createElementBlock("option", {
                            key: a.id,
                            value: a.id
                          }, toDisplayString(a.name) + toDisplayString(a.unlockedAt ? " (already unlocked)" : ""), 9, _hoisted_1152);
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ], 8, _hoisted_1132), [
                      [vModelSelect, newAchievementId.value]
                    ])
                  ])) : createCommentVNode("v-if", true),
                  newType.value === "collection" ? (openBlock(), createElementBlock("label", _hoisted_1162, [
                    _cache[42] || (_cache[42] = createTextVNode(
                      "Target Collection ",
                      -1
                      /* CACHED */
                    )),
                    withDirectives(createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => newCollectionName.value = $event),
                        class: "field-input",
                        type: "text",
                        list: "collection-names",
                        placeholder: "Souls series"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [vModelText, newCollectionName.value]
                    ]),
                    createElementVNode("datalist", _hoisted_1172, [
                      (openBlock(true), createElementBlock(
                        Fragment,
                        null,
                        renderList(knownCollections.value, (c) => {
                          return openBlock(), createElementBlock("option", {
                            key: c,
                            value: c
                          }, null, 8, _hoisted_1182);
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])
                  ])) : createCommentVNode("v-if", true),
                  !isAutomatic.value ? (openBlock(), createElementBlock("label", _hoisted_1192, [
                    _cache[43] || (_cache[43] = createTextVNode(
                      'Progress Target (optional, numeric goals like "10 games") ',
                      -1
                      /* CACHED */
                    )),
                    withDirectives(createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": _cache[21] || (_cache[21] = ($event) => newProgressTarget.value = $event),
                        class: "field-input",
                        type: "number",
                        min: "1",
                        placeholder: "e.g. 10"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [
                        vModelText,
                        newProgressTarget.value,
                        void 0,
                        { number: true }
                      ]
                    ])
                  ])) : createCommentVNode("v-if", true),
                  createElementVNode("label", _hoisted_1202, [
                    _cache[45] || (_cache[45] = createTextVNode(
                      "Difficulty (optional) ",
                      -1
                      /* CACHED */
                    )),
                    withDirectives(createElementVNode(
                      "select",
                      {
                        "onUpdate:modelValue": _cache[22] || (_cache[22] = ($event) => newDifficulty.value = $event),
                        class: "field-input"
                      },
                      [
                        _cache[44] || (_cache[44] = createElementVNode(
                          "option",
                          { value: "" },
                          "None",
                          -1
                          /* CACHED */
                        )),
                        (openBlock(), createElementBlock(
                          Fragment,
                          null,
                          renderList(DIFFICULTY_LABELS, (label, key) => {
                            return createElementVNode("option", {
                              key,
                              value: key
                            }, toDisplayString(label), 9, _hoisted_1212);
                          }),
                          64
                          /* STABLE_FRAGMENT */
                        ))
                      ],
                      512
                      /* NEED_PATCH */
                    ), [
                      [vModelSelect, newDifficulty.value]
                    ])
                  ]),
                  createElementVNode("label", _hoisted_1223, [
                    _cache[47] || (_cache[47] = createTextVNode(
                      "Points Reward ",
                      -1
                      /* CACHED */
                    )),
                    withDirectives(createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": _cache[23] || (_cache[23] = ($event) => newPoints.value = $event),
                        class: "field-input",
                        type: "number",
                        min: "0"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [
                        vModelText,
                        newPoints.value,
                        void 0,
                        { number: true }
                      ]
                    ]),
                    createElementVNode("span", _hoisted_1232, [
                      _cache[46] || (_cache[46] = createTextVNode(
                        " Points are entirely up to you, a rough scale to stay consistent: ",
                        -1
                        /* CACHED */
                      )),
                      (openBlock(), createElementBlock(
                        Fragment,
                        null,
                        renderList(SUGGESTED_POINTS, (pts, key) => {
                          return createElementVNode("button", {
                            key,
                            type: "button",
                            class: "points-suggestion",
                            onClick: ($event) => newPoints.value = pts
                          }, toDisplayString(DIFFICULTY_LABELS[key]) + " " + toDisplayString(pts), 9, _hoisted_1242);
                        }),
                        64
                        /* STABLE_FRAGMENT */
                      ))
                    ])
                  ]),
                  createElementVNode("label", _hoisted_1252, [
                    _cache[48] || (_cache[48] = createTextVNode(
                      "Deadline (optional) ",
                      -1
                      /* CACHED */
                    )),
                    withDirectives(createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": _cache[24] || (_cache[24] = ($event) => newDeadline.value = $event),
                        class: "field-input",
                        type: "date"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [vModelText, newDeadline.value]
                    ])
                  ]),
                  createElementVNode("label", _hoisted_1262, [
                    _cache[49] || (_cache[49] = createTextVNode(
                      "Description (optional) ",
                      -1
                      /* CACHED */
                    )),
                    withDirectives(createElementVNode(
                      "textarea",
                      {
                        "onUpdate:modelValue": _cache[25] || (_cache[25] = ($event) => newDescription.value = $event),
                        class: "field-input",
                        rows: "2",
                        placeholder: "Any extra detail"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [vModelText, newDescription.value]
                    ])
                  ]),
                  formError.value ? (openBlock(), createElementBlock(
                    "p",
                    _hoisted_1272,
                    toDisplayString(formError.value),
                    1
                    /* TEXT */
                  )) : createCommentVNode("v-if", true),
                  createElementVNode("div", _hoisted_1282, [
                    createElementVNode("button", {
                      type: "button",
                      class: "cancel-btn",
                      onClick: _cache[26] || (_cache[26] = ($event) => showAddForm.value = false)
                    }, " Cancel "),
                    createElementVNode("button", {
                      type: "button",
                      class: "save-btn",
                      disabled: saving.value,
                      onClick: submitNewBounty
                    }, toDisplayString(saving.value ? "Saving\u2026" : "Create"), 9, _hoisted_1292)
                  ])
                ])
              ]),
              _: 1
              /* STABLE */
            }, 8, ["dismissible"])) : createCommentVNode("v-if", true)
          ]);
        };
      }
    });
    component5.__scopeId = "data-v-555f512a";
    Bounties_default = component5;
  }
});

// .validation/companion-plugins/official/collectors-archive/ui/GoalsWidget.vue
var GoalsWidget_exports = {};
__export(GoalsWidget_exports, {
  default: () => GoalsWidget_default
});
var _hoisted_163, _hoisted_214, _hoisted_314, _hoisted_414, _hoisted_514, component6, GoalsWidget_default;
var init_GoalsWidget = __esm({
  ".validation/companion-plugins/official/collectors-archive/ui/GoalsWidget.vue"() {
    init_plugin_vue();
    init_plugin_vue();
    init_plugin_vue();
    init_host();
    init_router();
    _hoisted_163 = { class: "archive-goals" };
    _hoisted_214 = {
      key: 0,
      role: "status"
    };
    _hoisted_314 = { key: 1 };
    _hoisted_414 = { key: 0 };
    _hoisted_514 = { key: 2 };
    component6 = /* @__PURE__ */ defineComponent({
      __name: "GoalsWidget",
      setup(__props) {
        const goals = ref([]), completed = ref(0), points = ref(0), error = ref("");
        let live = true;
        onBeforeUnmount(() => {
          live = false;
        });
        onMounted(async () => {
          try {
            const [goalResponse, pointsResponse] = await Promise.all([pluginRequest("bounties"), pluginRequest("bounties/points/total")]);
            if (!goalResponse.ok || !pointsResponse.ok) throw new Error("Could not load your goals. Open the archive to retry.");
            const [all, total] = await Promise.all([goalResponse.json(), pointsResponse.json()]);
            if (!live) return;
            goals.value = all.bounties.filter((item) => item.status === "active").slice(0, 4);
            completed.value = all.bounties.filter((item) => item.status === "completed" && Number(item.completed_at) >= Date.now() / 1e3 - 7 * 86400).length;
            points.value = total.total;
          } catch (reason) {
            if (live) error.value = reason instanceof Error ? reason.message : "Could not load goals.";
          }
        });
        return (_ctx, _cache) => {
          return openBlock(), createElementBlock("div", _hoisted_163, [
            error.value ? (openBlock(), createElementBlock(
              "p",
              _hoisted_214,
              toDisplayString(error.value),
              1
              /* TEXT */
            )) : goals.value.length ? (openBlock(), createElementBlock("ul", _hoisted_314, [
              (openBlock(true), createElementBlock(
                Fragment,
                null,
                renderList(goals.value, (goal) => {
                  return openBlock(), createElementBlock("li", {
                    key: goal.id
                  }, [
                    createVNode(unref(RouterLink), {
                      to: `/bounties?record_id=${goal.id}`
                    }, {
                      default: withCtx(() => [
                        createTextVNode(
                          toDisplayString(goal.title),
                          1
                          /* TEXT */
                        ),
                        goal.game_title ? (openBlock(), createElementBlock(
                          "small",
                          _hoisted_414,
                          toDisplayString(goal.game_title),
                          1
                          /* TEXT */
                        )) : createCommentVNode("v-if", true)
                      ]),
                      _: 2
                      /* DYNAMIC */
                    }, 1032, ["to"])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])) : (openBlock(), createElementBlock("p", _hoisted_514, "No active goals. Create a bounty when you want some extra structure.")),
            createElementVNode("dl", null, [
              createElementVNode("div", null, [
                _cache[0] || (_cache[0] = createElementVNode(
                  "dt",
                  null,
                  "Completed this week",
                  -1
                  /* CACHED */
                )),
                createElementVNode(
                  "dd",
                  null,
                  toDisplayString(completed.value),
                  1
                  /* TEXT */
                )
              ]),
              createElementVNode("div", null, [
                _cache[1] || (_cache[1] = createElementVNode(
                  "dt",
                  null,
                  "Reward points",
                  -1
                  /* CACHED */
                )),
                createElementVNode(
                  "dd",
                  null,
                  toDisplayString(points.value),
                  1
                  /* TEXT */
                )
              ])
            ]),
            createVNode(unref(RouterLink), { to: "/bounties" }, {
              default: withCtx(() => [..._cache[2] || (_cache[2] = [
                createTextVNode(
                  "View your goals and reminders",
                  -1
                  /* CACHED */
                )
              ])]),
              _: 1
              /* STABLE */
            })
          ]);
        };
      }
    });
    component6.__scopeId = "data-v-cc47efd1";
    GoalsWidget_default = component6;
  }
});

// .validation/companion-plugins/official/collectors-archive/ui/app.ts
init_plugin_vue();
init_plugin_vue();
init_plugin_ui();
init_host();
var TABLES = ["sets", "bounties", "cards", "bounty_objectives", "bounty_evidence", "bounty_journal_entries", "bounty_point_transactions"];
async function activate(context2) {
  configure(context2);
  configure2(context2);
  configureHost(context2);
  context2.host.registerSearchProvider?.(async (query) => {
    if (!(await host().runAction("migration-status")).imported) return [];
    const response = await pluginRequest("bounties");
    if (!response.ok) throw new Error("Archive search unavailable.");
    const body = await response.json();
    return body.bounties.filter((item) => item.title.toLowerCase().includes(query.toLowerCase())).slice(0, 6).map((item) => ({
      id: item.id,
      label: item.title,
      description: `Bounty \xB7 ${item.status}`,
      path: `/plugins/official.collectors-archive/bounties?record_id=${item.id}`
    }));
  });
  context2.host.registerNotificationProvider?.(async () => {
    if (!(await host().runAction("migration-status")).imported) return [];
    const response = await pluginRequest("bounties?status=active");
    if (!response.ok) throw new Error("Archive reminders unavailable.");
    const body = await response.json(), now = Date.now() / 1e3;
    const reminders = [];
    for (const item of body.bounties) {
      const path = `/plugins/official.collectors-archive/bounties?record_id=${item.id}`;
      if (item.target_date !== null && item.target_date - now <= 7 * 86400) {
        const days = Math.ceil((item.target_date - now) / 86400);
        reminders.push({ id: `deadline:${item.id}`, label: item.title, path, description: days < 0 ? `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"}` : days === 0 ? "Due today" : `Due in ${days} day${days === 1 ? "" : "s"}` });
      }
      if (item.auto_generated && now - item.created_at <= 7 * 86400) reminders.push({ id: `suggested:${item.id}`, label: item.title, description: "Suggested for you", path });
    }
    return reminders;
  });
  const [CardCollection, CardDetail, SetList, SetDetail, Bounties, GoalsWidget] = await Promise.all([
    Promise.resolve().then(() => (init_CardCollection(), CardCollection_exports)),
    Promise.resolve().then(() => (init_CardDetail(), CardDetail_exports)),
    Promise.resolve().then(() => (init_SetList(), SetList_exports)),
    Promise.resolve().then(() => (init_SetDetail(), SetDetail_exports)),
    Promise.resolve().then(() => (init_Bounties(), Bounties_exports)),
    Promise.resolve().then(() => (init_GoalsWidget(), GoalsWidget_exports))
  ]).then((modules) => modules.map((module) => module.default));
  const pages = { cards: CardCollection, "card-detail": CardDetail, sets: SetList, "set-detail": SetDetail, bounties: Bounties, goals: GoalsWidget, migration: null };
  for (const [id, View] of Object.entries(pages)) {
    context2.registerComponent(id, defineComponent({
      props: ["context", "host"],
      setup(props) {
        provide("collector-route", { params: { cardId: props.context.record_id, setId: props.context.record_id, id: props.context.record_id }, query: props.context });
        const imported = ref(false), checking = ref(true), pending = ref(false), error = ref(""), progress = ref(""), generation = ref(0);
        let live = true;
        onBeforeUnmount(() => {
          live = false;
        });
        onMounted(async () => {
          try {
            const result = await host().runAction("migration-status");
            if (live) imported.value = Boolean(result.imported);
          } catch (err) {
            if (live) error.value = err instanceof Error ? err.message : "Could not check your archive.";
          } finally {
            if (live) checking.value = false;
          }
        });
        async function importLegacy() {
          pending.value = true;
          error.value = "";
          try {
            for (const table of TABLES) {
              let offset = 0, chunk_offset = 0, sha256;
              while (live) {
                progress.value = `Importing ${table.replaceAll("_", " ")}\u2026`;
                const result = await host().runAction("import-legacy", { table, offset, chunk_offset, sha256 });
                if (result.complete) break;
                offset = Number(result.next_offset);
                chunk_offset = Number(result.next_chunk_offset ?? 0);
                sha256 = result.sha256;
              }
              if (!live) return;
            }
            if (live) {
              imported.value = true;
              generation.value++;
              progress.value = "Your archive is imported. Server originals remain available.";
            }
          } catch (err) {
            if (live) error.value = err instanceof Error ? err.message : "Import interrupted. Retry safely; original records are retained.";
          } finally {
            if (live) pending.value = false;
          }
        }
        return () => h("section", { class: "collector-archive" }, [
          id === "migration" ? h("h1", "Collector's Archive") : null,
          !imported.value || id === "migration" ? h("section", { class: "collector-import ui-panel" }, [
            h("h2", "Bring your existing archive with you"),
            h("p", "Import Cards, Sets and Bounties from older host versions, including prestige, customization, evidence, journals and reward history. The server originals are retained. Retrying an interrupted import preserves records already imported."),
            h("button", { class: "ui-btn ui-btn-primary", disabled: checking.value || pending.value || imported.value, onClick: importLegacy }, checking.value ? "Checking archive\u2026" : imported.value ? "Archive imported" : pending.value ? "Importing\u2026" : "Import legacy records"),
            h("p", "For backups, use the plugin manager's storage backup and restore controls. Keep a database backup until you've verified the import.")
          ]) : null,
          progress.value ? h("p", { role: "status" }, progress.value) : null,
          error.value ? h("p", { role: "alert", class: "collector-error" }, error.value) : null,
          View && imported.value ? h(View, { key: generation.value }) : null
        ]);
      }
    }));
  }
}
export {
  activate
};
