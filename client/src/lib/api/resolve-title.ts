import type { Movie, Show } from "@/types";
import { defaultVidkingOptions } from "@/config/player";
import { fetchTitleFromApi, parseTmdbTitleId } from "./details-service";
import { buildVidkingMovieUrl, buildVidkingTvUrl } from "./vidking-embed";

/** TMDB-backed ids (`movie-*`, `tv-*`) only — resolved via API. */
export async function resolveTitle(id: string): Promise<{
  title: Movie | Show;
  isSrcAvailable?: boolean;
  embedUrl?: string | null;
} | null> {
  const fromApi = await fetchTitleFromApi(id);
  if (fromApi) {
    const parsed = parseTmdbTitleId(id);
    const embedUrl = parsed
      ? parsed.media === "movie"
        ? buildVidkingMovieUrl(parsed.tmdbId, defaultVidkingOptions)
        : buildVidkingTvUrl(parsed.tmdbId, 1, 1, defaultVidkingOptions)
      : null;
    return {
      title: fromApi.title,
      isSrcAvailable: fromApi.isSrcAvailable,
      embedUrl,
    };
  }
  return null;
}
