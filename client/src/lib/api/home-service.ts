import type { Movie, Show } from "@/types";
import { apiGetCached } from "./http-server";
import type { HomeApiResponse } from "./tmdb-types";
import { tmdbListItemToMovie, tmdbListItemToShow } from "./mappers";

export async function fetchHomeCatalog(): Promise<HomeApiResponse | null> {
  try {
    return await apiGetCached<HomeApiResponse>("/api/home", 180);
  } catch {
    return null;
  }
}

export function catalogFromHome(data: HomeApiResponse): {
  featured: Movie | Show | null;
  trending: (Movie | Show)[];
  popular: (Movie | Show)[];
  communityPicks: (Movie | Show)[];
  recommendations: (Movie | Show)[];
} {
  const trending = [
    ...data.trending_movies.map((m) => tmdbListItemToMovie(m, { trending: true })),
    ...data.trending_tv.map((t) => tmdbListItemToShow(t, { trending: true })),
  ].slice(0, 16);

  const popular = [
    ...data.popular_movies.map((m) => tmdbListItemToMovie(m)),
    ...data.popular_tv.map((t) => tmdbListItemToShow(t)),
  ].slice(0, 24);

  const communityPicks = [
    ...(data.top_movies ?? []).slice(0, 8).map((m) => tmdbListItemToMovie(m)),
    ...(data.top_tv ?? []).slice(0, 8).map((t) => tmdbListItemToShow(t)),
  ];

  const featured: Movie | Show | null =
    data.popular_movies[0] != null
      ? tmdbListItemToMovie(data.popular_movies[0], { isNew: true })
      : trending[0] ?? popular[0] ?? null;

  const movieRecs = (data.movie_recommendations ?? []).map((m) => tmdbListItemToMovie(m));
  const tvRecs = (data.tv_recommendations ?? []).map((t) => tmdbListItemToShow(t));
  const seenRec = new Set<string>();
  const recommendations: (Movie | Show)[] = [];
  for (const item of [...movieRecs, ...tvRecs]) {
    if (seenRec.has(item.id)) continue;
    seenRec.add(item.id);
    if (featured && item.id === featured.id) continue;
    recommendations.push(item);
    if (recommendations.length >= 24) break;
  }

  return {
    featured,
    trending,
    popular,
    communityPicks,
    recommendations,
  };
}

export function browsePoolFromHome(data: HomeApiResponse): (Movie | Show)[] {
  const merged = [
    ...data.popular_movies.map((m) => tmdbListItemToMovie(m)),
    ...data.popular_tv.map((t) => tmdbListItemToShow(t)),
    ...data.trending_movies.map((m) => tmdbListItemToMovie(m, { trending: true })),
    ...data.trending_tv.map((t) => tmdbListItemToShow(t, { trending: true })),
    ...data.top_movies.map((m) => tmdbListItemToMovie(m)),
    ...data.top_tv.map((t) => tmdbListItemToShow(t)),
  ];
  const seen = new Set<string>();
  return merged.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}
