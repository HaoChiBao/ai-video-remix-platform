import type { ContentRating, Episode, Movie, Show } from "@/types";
import type {
  TmdbMovieDetails,
  TmdbMovieListItem,
  TmdbTvDetails,
} from "./tmdb-types";

/** Common TMDB genre ids → labels (movies + TV). */
const TMDB_GENRE_MAP: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
  10759: "Action & Adventure",
  10765: "Sci-Fi & Fantasy",
  10768: "War & Politics",
};

export const TMDB_IMAGE = "https://image.tmdb.org/t/p";

export function tmdbPoster(path: string | null | undefined, size = "w500"): string {
  if (!path) {
    return "https://placehold.co/500x750/002060/87CEEB?text=No+poster";
  }
  return `${TMDB_IMAGE}/${size}${path}`;
}

export function tmdbBackdrop(path: string | null | undefined, size = "w1280"): string {
  if (!path) {
    return "https://placehold.co/1280x720/002060/4169E1?text=No+backdrop";
  }
  return `${TMDB_IMAGE}/${size}${path}`;
}

function mapRating(adult?: boolean): ContentRating {
  if (adult) return "R";
  return "PG-13";
}

function yearFromDate(d?: string): number {
  if (!d) return new Date().getFullYear();
  const y = parseInt(d.slice(0, 4), 10);
  return Number.isFinite(y) ? y : new Date().getFullYear();
}

function castNames(credits?: { cast?: { name: string }[] }): string[] {
  return (credits?.cast ?? []).slice(0, 8).map((c) => c.name);
}

function genresFromListItem(item: TmdbMovieListItem): string[] {
  const ids = item.genre_ids;
  if (!ids?.length) return [];
  return ids.map((id) => TMDB_GENRE_MAP[id]).filter(Boolean);
}

export function tmdbListItemToMovie(
  m: TmdbMovieListItem,
  opts?: { trending?: boolean; isNew?: boolean },
): Movie {
  const id = `movie-${m.id}`;
  return {
    id,
    kind: "movie",
    title: m.title ?? "Untitled",
    description: m.overview ?? "",
    genres: genresFromListItem(m),
    year: yearFromDate(m.release_date),
    rating: mapRating(m.adult),
    posterUrl: tmdbPoster(m.poster_path),
    backdropUrl: tmdbBackdrop(m.backdrop_path),
    cast: [],
    durationMinutes: 0,
    trending: opts?.trending,
    isNew: opts?.isNew,
  };
}

export function tmdbListItemToShow(
  t: TmdbMovieListItem,
  opts?: { trending?: boolean; isNew?: boolean },
): Show {
  const id = `tv-${t.id}`;
  return {
    id,
    kind: "show",
    title: t.name ?? t.title ?? "Untitled",
    description: t.overview ?? "",
    genres: genresFromListItem(t),
    year: yearFromDate(t.first_air_date ?? t.release_date),
    rating: mapRating(t.adult),
    posterUrl: tmdbPoster(t.poster_path),
    backdropUrl: tmdbBackdrop(t.backdrop_path),
    cast: [],
    seasons: [],
    trending: opts?.trending,
    isNew: opts?.isNew,
  };
}

export function tmdbDetailsToMovie(d: TmdbMovieDetails): Movie {
  const id = `movie-${d.id}`;
  return {
    id,
    kind: "movie",
    title: d.title,
    tagline: d.tagline || undefined,
    description: d.overview ?? "",
    genres: (d.genres ?? []).map((g) => g.name),
    year: yearFromDate(d.release_date),
    rating: mapRating(d.adult),
    posterUrl: tmdbPoster(d.poster_path),
    backdropUrl: tmdbBackdrop(d.backdrop_path),
    cast: castNames(d.credits),
    durationMinutes: d.runtime && d.runtime > 0 ? d.runtime : 0,
    trending: undefined,
    isNew: undefined,
  };
}

export function tmdbDetailsToShow(d: TmdbTvDetails): Show {
  const id = `tv-${d.id}`;
  const seasons = (d.seasons ?? []).map((s) => {
    const episodes: Episode[] = [];
    return {
      seasonNumber: s.season_number,
      episodeCount: s.episode_count,
      episodes,
    };
  });

  return {
    id,
    kind: "show",
    title: d.name,
    tagline: d.tagline || undefined,
    description: d.overview ?? "",
    genres: (d.genres ?? []).map((g) => g.name),
    year: yearFromDate(d.first_air_date),
    rating: mapRating(d.adult),
    posterUrl: tmdbPoster(d.poster_path),
    backdropUrl: tmdbBackdrop(d.backdrop_path),
    cast: castNames(d.credits),
    seasons,
  };
}
