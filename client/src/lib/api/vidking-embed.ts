const DEFAULT_ORIGIN = "https://www.vidking.net";

export function getVidkingOrigin(): string {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_VIDKING_ORIGIN?.trim()) {
    return process.env.NEXT_PUBLIC_VIDKING_ORIGIN.trim().replace(/\/$/, "");
  }
  return DEFAULT_ORIGIN;
}

export type VidkingPlayerOptions = {
  color?: string;
  autoPlay?: boolean;
  nextEpisode?: boolean;
  episodeSelector?: boolean;
  /** Start position in seconds */
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
  tmdbId: number,
  opts?: VidkingPlayerOptions,
  origin: string = getVidkingOrigin(),
): string {
  return appendQuery(`${origin}/embed/movie/${tmdbId}`, opts);
}

export function buildVidkingTvUrl(
  tmdbId: number,
  season: number,
  episode: number,
  opts?: VidkingPlayerOptions,
  origin: string = getVidkingOrigin(),
): string {
  return appendQuery(`${origin}/embed/tv/${tmdbId}/${season}/${episode}`, opts);
}
