import { Router } from "express";
import axios from "axios";

import { tmdb } from "../../providers/tmdb";

const router = Router();

router.get("/episodes/tv/:id/seasons/:season_n_query", async (req, res) => {
  try {
    if (!tmdb.key) {
      return res.status(500).json({ error: "TMDB not configured." });
    }

    const tvId = req.params.id;
    const season_n_query = req.params.season_n_query;

    if (season_n_query === "all") {
      const details = await axios
        .get(`${tmdb.url}/3/tv/${tvId}?api_key=${tmdb.key}`)
        .then((r) => r.data);

      const season_details = (details.seasons ?? [])
        .filter((s: { season_number?: number }) => (s.season_number ?? 0) > 0)
        .map((s: { season_number?: number; episode_count?: number }) => ({
          season_number: String(s.season_number ?? 0),
          epstotal: s.episode_count ?? 0,
        }));

      return res.status(200).json({ season_details });
    }

    const seasonNum = parseInt(season_n_query, 10);
    if (!Number.isFinite(seasonNum)) {
      return res.status(400).json({ error: "Invalid season." });
    }

    const season = await axios
      .get(`${tmdb.url}/3/tv/${tvId}/season/${seasonNum}?api_key=${tmdb.key}`)
      .then((r) => r.data);

    const episodes = (season.episodes ?? []).map(
      (ep: { episode_number: number; name?: string }) => ({
        episode_number: String(ep.episode_number),
        title: ep.name ?? "",
      }),
    );

    return res.status(200).json({
      season_number: String(season.season_number ?? seasonNum),
      epstotal: episodes.length,
      episodes,
    });
  } catch {
    return res.status(404).json({ error: "No media source found." });
  }
});

export default router;
