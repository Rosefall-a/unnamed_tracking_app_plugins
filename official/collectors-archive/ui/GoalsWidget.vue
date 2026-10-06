<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { pluginRequest } from "./native/host";
import { RouterLink } from "./native/router";
import type { Bounty } from "./services/bounties";
const goals = ref<Bounty[]>([]), completed = ref(0), points = ref(0), error = ref("");
let live = true;
onBeforeUnmount(() => { live = false; });
onMounted(async () => {
  try {
    const [goalResponse, pointsResponse] = await Promise.all([pluginRequest("bounties"), pluginRequest("bounties/points/total")]);
    if (!goalResponse.ok || !pointsResponse.ok) throw new Error("Could not load your goals. Open the archive to retry.");
    const [all, total] = await Promise.all([goalResponse.json(), pointsResponse.json()]);
    if (!live) return;
    goals.value = all.bounties.filter((item: Bounty) => item.status === "active").slice(0, 4);
    completed.value = all.bounties.filter((item: Bounty) => item.status === "completed" && Number(item.completed_at) >= Date.now()/1000 - 7*86400).length;
    points.value = total.total;
  } catch (reason) { if (live) error.value = reason instanceof Error ? reason.message : "Could not load goals."; }
});
</script>
<template>
  <div class="archive-goals">
    <p v-if="error" role="status">{{ error }}</p>
    <ul v-else-if="goals.length">
      <li v-for="goal in goals" :key="goal.id"><RouterLink :to="`/bounties?record_id=${goal.id}`">{{ goal.title }}<small v-if="goal.game_title">{{ goal.game_title }}</small></RouterLink></li>
    </ul>
    <p v-else>No active goals. Create a bounty when you want some extra structure.</p>
    <dl><div><dt>Completed this week</dt><dd>{{ completed }}</dd></div><div><dt>Reward points</dt><dd>{{ points }}</dd></div></dl>
    <RouterLink to="/bounties">View your goals and reminders</RouterLink>
  </div>
</template>
<style scoped>
.archive-goals { color: var(--ui-text); }
ul { list-style: none; padding: 0; margin: 0; }
li + li { border-top: 1px solid var(--ui-border-soft); }
li a { display: grid; gap: 4px; padding: 12px 0; min-height: 44px; box-sizing: border-box; color: var(--ui-text); }
small, dt, p { color: var(--ui-dim); }
dl { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0; }
dd { margin: 6px 0 0; font-size: 1.4rem; font-weight: 600; }
a { color: var(--ui-accent-text); }
</style>
