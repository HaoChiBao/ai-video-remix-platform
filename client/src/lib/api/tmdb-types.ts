/** Shapes returned by the Express server (TMDB passthrough + flags). */

export type TmdbGenre = { id: number; name: string };

export type TmdbMovieListItem = {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  vote_average?: number;
  adult?: boolean;
  media_type?: string;
};

export type TmdbCastMember = { name: string };

export type TmdbCredits = { cast?: TmdbCastMember[] };

export type TmdbSeasonSummary = {
  season_number: number;
  episode_count?: number;
  name?: string;
  overview?: string;
};

export type TmdbMovieDetails = TmdbMovieListItem & {
  title: string;
  tagline?: string;
  runtime?: number;
  genres?: TmdbGenre[];
  credits?: TmdbCredits;
  release_date?: string;
};

export type TmdbTvDetails = TmdbMovieListItem & {
  name: string;
  tagline?: string;
  episode_run_time?: number[];
  genres?: TmdbGenre[];
  credits?: TmdbCredits;
  first_air_date?: string;
  number_of_seasons?: number;
  seasons?: TmdbSeasonSummary[];
};

export type HomeApiResponse = {
  trending_movies: TmdbMovieListItem[];
  trending_tv: TmdbMovieListItem[];
  popular_movies: TmdbMovieListItem[];
  popular_tv: TmdbMovieListItem[];
  top_movies: TmdbMovieListItem[];
  top_tv: TmdbMovieListItem[];
  /** TMDB `/movie/{id}/recommendations` for top popular movie. */
  movie_recommendations?: TmdbMovieListItem[];
  /** TMDB `/tv/{id}/recommendations` for top popular TV show. */
  tv_recommendations?: TmdbMovieListItem[];
};

/** TMDB search/multi item (movie, tv, or person). */
export type TmdbMultiSearchItem = TmdbMovieListItem & {
  media_type?: "movie" | "tv" | "person";
};

export type DetailsApiResponse = {
  details: TmdbMovieDetails | TmdbTvDetails;
  is_src_available: boolean;
};

export type SearchApiResponse = {
  results: TmdbMovieListItem[] | TmdbMultiSearchItem[];
  page?: number;
  total_pages?: number;
  total_results?: number;
  available?: boolean;
};

export type DiscoverApiResponse = {
  results: TmdbMovieListItem[];
  page: number;
  total_pages: number;
  total_results: number;
};
