import axios from "axios";

import { vidking } from "../config/vidking";

export type VidkingPlayerOptions = {
  color?: string;
  autoPlay?: boolean;
  nextEpisode?: boolean;
  episodeSelector?: boolean;
  progress?: number;
};

function appendQuery(path: string, opts?: VidkingPlayerOptions): string {
  if (!opts) return path;
  const p = new URLSearchParams();
  if (opts.color !== undefined) {
    p.set("color", opts.color.replace(/^#/, ""));
  }
  if (opts.autoPlay !== undefined) {
    p.set("autoPlay", String(opts.autoPlay));
  }
  if (opts.nextEpisode !== undefined) {
    p.set("nextEpisode", String(opts.nextEpisode));
  }
  if (opts.episodeSelector !== undefined) {
    p.set("episodeSelector", String(opts.episodeSelector));
  }
  if (opts.progress !== undefined) {
    p.set("progress", String(opts.progress));
  }
  const q = p.toString();
  return q ? `${path}?${q}` : path;
}

export function buildVidkingMovieUrl(
  tmdbId: string | number,
  opts?: VidkingPlayerOptions,
  origin: string = vidking.origin,
): string {
  return appendQuery(`${origin}/embed/movie/${tmdbId}`, opts);
}

export function buildVidkingTvUrl(
  tmdbId: string | number,
  season: number,
  episode: number,
  opts?: VidkingPlayerOptions,
  origin: string = vidking.origin,
): string {
  return appendQuery(`${origin}/embed/tv/${tmdbId}/${season}/${episode}`, opts);
}

/**
 * Lightweight availability check for the same embed path the client will load (no query).
 */
export async function probeVidkingEmbed(embedUrl: string): Promise<boolean> {
  const ok = (status: number) => status >= 200 && status < 400;
  try {
    const head = await axios.head(embedUrl, {
      timeout: 10000,
      validateStatus: () => true,
      maxRedirects: 5,
    });
    if (ok(head.status)) return true;
  } catch {
    /* try GET */
  }
  try {
    const res = await axios.get(embedUrl, {
      timeout: 10000,
      responseType: "stream",
      maxContentLength: 65536,
      validateStatus: () => true,
      maxRedirects: 5,
    });
    const stream = res.data as { destroy?: () => void };
    stream.destroy?.();
    return ok(res.status);
  } catch {
    return false;
  }
}
