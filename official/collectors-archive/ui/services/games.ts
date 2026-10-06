import { archiveAction } from "../native/host";
import type { Game, Achievement } from "../types/game";

function mapGame(raw: Record<string, unknown>): Game {
  const assets = raw.assets as Record<string, string>;
  const total = Number(raw.achievement_total ?? 0);
  return {
    id: String(raw.id), title: String(raw.title),
    status: String(raw.status).toLowerCase().replaceAll("_", " ") as Game["status"],
    coverImageUrl: assets.key_art, bannerImageUrl: assets.banner, coverColor: "var(--ui-surface-2)",
    ratingOverall: raw.rating_overall == null ? null : Number(raw.rating_overall),
    ratingStory: raw.rating_story == null ? null : Number(raw.rating_story),
    ratingGameplay: raw.rating_gameplay == null ? null : Number(raw.rating_gameplay),
    ratingSound: raw.rating_soundtrack == null ? null : Number(raw.rating_soundtrack),
    achievementTotal: total, achievementPercent: total ? Number(raw.achievement_unlocked) / total * 100 : 0,
    achievements: [], description: raw.description as string | null,
    developer: raw.developer as string | null, publisher: raw.publisher as string | null,
    series: raw.series as string | null, tags: raw.tags as string[], features: raw.features as string[],
    source: raw.source as string | null, platform: raw.platform as string | null,
    collections: (raw.collections ?? []) as string[],
    platforms: [{ platform: String(raw.platform ?? raw.source ?? "PC"),
      source: String(raw.source ?? "manual"), playtimeMinutes: Number(raw.playtime_seconds ?? 0) / 60 }],
    favorite: Boolean(raw.favorite), dateAdded: new Date(Number(raw.created_at) * 1000).toISOString(),
    lastPlayedAt: raw.last_played_at ? new Date(Number(raw.last_played_at) * 1000).toISOString() : null,
    timeToBeatHours: raw.time_to_beat_hours == null ? null : Number(raw.time_to_beat_hours),
    region: raw.region as string | null, language: raw.language as string | null,
    completionDate: raw.completion_date ? new Date(Number(raw.completion_date) * 1000).toISOString() : null,
    releaseDate: raw.release_date as string | null,
  } as Game;
}
export async function fetchGames(): Promise<Game[]> {
  const games: Game[] = [];
  let offset = 0;
  while (true) {
    const result = await archiveAction({ operation: "list", offset }, "games");
    games.push(...(result.games as Record<string, unknown>[]).map(mapGame));
    if (result.complete) return games;
    offset = Number(result.next_offset);
  }
}
async function gameData(id: string) {
  const achievements: Record<string, unknown>[] = [];
  let offset = 0;
  while (true) {
    const result = await archiveAction({ operation: "get", game_id: id, offset }, "games");
    achievements.push(...result.achievements as Record<string, unknown>[]);
    if (result.complete) return { raw: result.game as Record<string, unknown>, achievements };
    offset = Number(result.next_offset);
  }
}
function mapAchievement(raw: Record<string, unknown>): Achievement {
  return { id: String(raw.id), name: String(raw.name), description: raw.description as string | null,
    unlockedAt: raw.unlocked ? new Date(Number(raw.unlocked_at ?? 0) * 1000).toISOString() : null };
}
export async function fetchGame(id: string): Promise<Game> {
  const { raw, achievements } = await gameData(id);
  raw.achievement_total = achievements.length;
  raw.achievement_unlocked = achievements.filter(a => a.unlocked).length;
  return { ...mapGame(raw), achievements: achievements.map(mapAchievement) };
}
export async function fetchGameAchievements(id: string): Promise<Achievement[]> {
  return (await gameData(id)).achievements.map(mapAchievement);
}
