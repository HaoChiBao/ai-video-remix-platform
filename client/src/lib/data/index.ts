import type { Clip, Comment } from "@/types";

export * from "./filters";

export function getCommentsForClip(_clipId: string): Comment[] {
  return [];
}

export function getClipsByTitleId(_contentId: string): Clip[] {
  return [];
}

export function getClipById(_id: string): Clip | undefined {
  return undefined;
}

export function getRelatedClips(_clipId: string, _limit = 6): Clip[] {
  return [];
}
