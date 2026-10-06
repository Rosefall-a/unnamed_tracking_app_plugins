import { archiveAction } from "../native/host";
export interface MediaItem {
  id: string; filename: string; kind: string; url: string; tags: string[];
  note: string | null; linked_achievement_id: string | null; profile_id: string | null; created_at: number;
}
export async function listGameScreenshots(gameId: string): Promise<MediaItem[]> {
  const media: MediaItem[] = [];
  let offset = 0;
  while (true) {
    const result = await archiveAction({ game_id: gameId, offset }, "game-media");
    media.push(...result.media as MediaItem[]);
    if (result.complete) return media.filter(item => item.kind === "screenshot");
    offset = Number(result.next_offset);
  }
}
