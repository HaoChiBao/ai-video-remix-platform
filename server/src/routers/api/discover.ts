import { Router } from "express";
import axios from "axios";

import { tmdb } from "../../providers/tmdb";

const router = Router();

/** TMDB discover — browse by genre and popularity. */
router.get("/discover/:type", async (req, res) => {
  try {
    const type = req.params.type;
    if (type !== "movie" && type !== "tv") {
      return res.status(400).json({ error: "type must be movie or tv" });
    }

    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
    const withGenres = req.query.with_genres;

    const params: Record<string, string | number> = {
      api_key: tmdb.key,
      page,
      sort_by: "popularity.desc",
    };

    if (typeof withGenres === "string" && withGenres.trim()) {
      params.with_genres = withGenres.trim();
    }

    const data = await axios
      .get(`${tmdb.url}/3/discover/${type}`, { params })
      .then((r) => r.data);

    return res.status(200).json({
      results: data.results ?? [],
      page: data.page ?? page,
      total_pages: data.total_pages ?? 1,
      total_results: data.total_results ?? 0,
    });
  } catch {
    return res.status(404).json({
      error: "discover failed",
      results: [],
      page: 1,
      total_pages: 0,
      total_results: 0,
    });
  }
});

export default router;
