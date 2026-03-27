import { Router } from "express";
import axios from "axios";

import { tmdb } from "../../providers/tmdb";

const router = Router();

//ex. /api/search/tv?query=one%20piece
router.get("/search/:type", async (req, res) => {
  try {
    const q = req.query.query;
    if (typeof q !== "string" || !q.trim()) {
      return res.status(400).json({ error: "Missing query parameter", results: [] });
    }

    const results = await axios
      .get(`${tmdb.url}/3/search/${req.params.type}`, {
        params: {
          api_key: tmdb.key,
          query: q,
        },
      })
      .then((r) => r.data.results ?? []);

    return res.status(200).json({ results, available: true });
  } catch (err) {
    return res.status(404).json({ error: "incorrect request", results: [] });
  }
});

export default router;
