import type { Movie, Show } from "@/types";
import { apiGet } from "./http";
import { apiGetCached } from "./http-server";
import type { DetailsApiResponse, TmdbMovieDetails, TmdbTvDetails } from "./tmdb-types";
import { tmdbDetailsToMovie, tmdbDetailsToShow } from "./mappers";

export type ResolvedTitle = {
  title: Movie | Show;
  isSrcAvailable: boolean;
};

export function parseTmdbTitleId(
  id: string,
): { media: "movie" | "tv"; tmdbId: number } | null {
  const movie = /^movie-(\d+)$/.exec(id);
  if (movie) return { media: "movie", tmdbId: Number(movie[1]) };
  const tv = /^tv-(\d+)$/.exec(id);
  if (tv) return { media: "tv", tmdbId: Number(tv[1]) };
  return null;
}

function mapDetailsResponse(parsed: { media: "movie" | "tv"; tmdbId: number }, res: DetailsApiResponse): ResolvedTitle {
  const d = res.details;
  const title =
    parsed.media === "movie"
      ? tmdbDetailsToMovie(d as TmdbMovieDetails)
      : tmdbDetailsToShow(d as TmdbTvDetails);
  return { title, isSrcAvailable: res.is_src_available };
}

export async function fetchTitleFromApi(id: string): Promise<ResolvedTitle | null> {
  const parsed = parseTmdbTitleId(id);
  if (!parsed) return null;
  try {
    const res = await apiGetCached<DetailsApiResponse>(
      `/api/details/${parsed.media}/${parsed.tmdbId}`,
      300,
    );
    return mapDetailsResponse(parsed, res);
  } catch {
    return null;
  }
}

/** Same as `fetchTitleFromApi` but uses `fetch` without Next cache — safe in client components. */
export async function fetchTitleFromApiClient(id: string): Promise<ResolvedTitle | null> {
  const parsed = parseTmdbTitleId(id);
  if (!parsed) return null;
  try {
    const res = await apiGet<DetailsApiResponse>(`/api/details/${parsed.media}/${parsed.tmdbId}`);
    return mapDetailsResponse(parsed, res);
  } catch {
    return null;
  }
}
