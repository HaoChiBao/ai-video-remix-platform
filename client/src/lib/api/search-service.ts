import type { Movie, Show } from "@/types";
import { apiGet } from "./http";
import { apiGetCached } from "./http-server";
import type {
  DiscoverApiResponse,
  SearchApiResponse,
  TmdbMovieListItem,
  TmdbMultiSearchItem,
} from "./tmdb-types";
import {
  tmdbListItemToMovie,
  tmdbListItemToShow,
  tmdbMultiResultToContent,
} from "./mappers";

export type SearchMediaFilter = "all" | "movie" | "tv";

export type PagedCatalogResult = {
  results: (Movie | Show)[];
  page: number;
  totalPages: number;
  totalResults: number;
};

function normalizePaged(r: SearchApiResponse) {
  return {
    results: r.results ?? [],
    page: r.page ?? 1,
    total_pages: r.total_pages ?? 1,
    total_results: r.total_results ?? 0,
  };
}

/** Keyword search with pagination. Uses TMDB multi search when media is `all`. */
export async function searchCatalogPaged(
  query: string,
  page: number,
  media: SearchMediaFilter,
): Promise<PagedCatalogResult> {
  const q = query.trim();
  const enc = encodeURIComponent(q);
  const p = Math.max(1, page);

  if (!q) {
    return { results: [], page: 1, totalPages: 0, totalResults: 0 };
  }

  if (media === "movie") {
    const raw = await apiGet<SearchApiResponse>(`/api/search/movie?query=${enc}&page=${p}`, {
      cache: "no-store",
    });
    const r = normalizePaged(raw);
    return {
      results: (r.results as TmdbMovieListItem[]).map((m) => tmdbListItemToMovie(m)),
      page: r.page,
      totalPages: r.total_pages,
      totalResults: r.total_results,
    };
  }

  if (media === "tv") {
    const raw = await apiGet<SearchApiResponse>(`/api/search/tv?query=${enc}&page=${p}`, {
      cache: "no-store",
    });
    const r = normalizePaged(raw);
    return {
      results: (r.results as TmdbMovieListItem[]).map((t) => tmdbListItemToShow(t)),
      page: r.page,
      totalPages: r.total_pages,
      totalResults: r.total_results,
    };
  }

  const raw = await apiGet<SearchApiResponse>(`/api/search/multi?query=${enc}&page=${p}`, {
    cache: "no-store",
  });
  const r = normalizePaged(raw);
  const results = (r.results as TmdbMultiSearchItem[])
    .map((item) => tmdbMultiResultToContent(item))
    .filter((x): x is Movie | Show => x != null);

  return {
    results,
    page: r.page,
    totalPages: r.total_pages,
    totalResults: r.total_results,
  };
}

/** TMDB discover — popularity order, optional genre id(s) comma-separated. */
export async function discoverCatalog(
  type: "movie" | "tv",
  page: number,
  withGenres?: string,
): Promise<PagedCatalogResult> {
  const p = Math.max(1, page);
  const params = new URLSearchParams({ page: String(p) });
  if (withGenres?.trim()) params.set("with_genres", withGenres.trim());

  const r = await apiGet<DiscoverApiResponse>(`/api/discover/${type}?${params}`, {
    cache: "no-store",
  });

  const results: (Movie | Show)[] =
    type === "movie"
      ? r.results.map((x) => tmdbListItemToMovie(x))
      : r.results.map((x) => tmdbListItemToShow(x));

  return {
    results,
    page: r.page,
    totalPages: r.total_pages,
    totalResults: r.total_results,
  };
}

/** Discover movies and TV in parallel (same page index) and merge uniquely. */
export async function discoverCatalogBoth(
  page: number,
  withGenres?: string,
): Promise<PagedCatalogResult> {
  const [m, t] = await Promise.all([
    discoverCatalog("movie", page, withGenres),
    discoverCatalog("tv", page, withGenres),
  ]);
  const seen = new Set<string>();
  const merged: (Movie | Show)[] = [];
  for (const item of [...m.results, ...t.results]) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    merged.push(item);
  }
  return {
    results: merged,
    page,
    totalPages: Math.max(m.totalPages, t.totalPages),
    totalResults: m.totalResults + t.totalResults,
  };
}

/**
 * Server Components / cached: first page, movies + TV via TMDB multi search.
 * Client code should use {@link searchCatalogPaged} with `cache: 'no-store'`.
 */
export async function searchCatalog(query: string): Promise<(Movie | Show)[]> {
  const q = query.trim();
  if (!q) return [];
  const enc = encodeURIComponent(q);
  const raw = await apiGetCached<SearchApiResponse>(`/api/search/multi?query=${enc}&page=1`, 60);
  const r = normalizePaged(raw);
  return (r.results as TmdbMultiSearchItem[])
    .map((item) => tmdbMultiResultToContent(item))
    .filter((x): x is Movie | Show => x != null);
}
