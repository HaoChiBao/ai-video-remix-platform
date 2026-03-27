import { apiGet } from "./http";

export type TvSeasonEpisodeRow = {
  episode_number: string;
  title: string;
};

export type TvSeasonEpisodesResponse = {
  season_number: string;
  epstotal: number;
  episodes: TvSeasonEpisodeRow[];
};

/** TMDB season detail via API server (`/api/episodes/tv/...`). */
export async function fetchTvSeasonEpisodes(
  tvTmdbId: number,
  seasonNumber: number,
): Promise<TvSeasonEpisodesResponse | null> {
  try {
    return await apiGet<TvSeasonEpisodesResponse>(
      `/api/episodes/tv/${tvTmdbId}/seasons/${seasonNumber}`,
    );
  } catch {
    return null;
  }
}
