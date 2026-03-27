import type { Movie, Show } from "@/types";
import { apiGetCached } from "./http-server";
import type { SearchApiResponse, TmdbMovieListItem } from "./tmdb-types";
import { tmdbListItemToMovie, tmdbListItemToShow } from "./mappers";

export async function searchCatalog(query: string): Promise<(Movie | Show)[]> {
  const q = query.trim();
  if (!q) return [];

  const enc = encodeURIComponent(q);

  const [moviesRes, tvRes] = await Promise.allSettled([
    apiGetCached<SearchApiResponse>(`/api/search/movie?query=${enc}`, 60),
    apiGetCached<SearchApiResponse>(`/api/search/tv?query=${enc}`, 60),
  ]);

  const movieItems: TmdbMovieListItem[] =
    moviesRes.status === "fulfilled" ? (moviesRes.value.results ?? []) : [];
  const tvItems: TmdbMovieListItem[] =
    tvRes.status === "fulfilled" ? (tvRes.value.results ?? []) : [];

  const mapped: (Movie | Show)[] = [
    ...movieItems.map((m) => tmdbListItemToMovie(m)),
    ...tvItems.map((t) => tmdbListItemToShow(t)),
  ];

  const seen = new Set<string>();
  return mapped.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}
