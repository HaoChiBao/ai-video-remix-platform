import { Router } from "express";
import axios from "axios";

import { tmdb } from "../../providers/tmdb";

const router = Router();

/** TMDB multi search — movies, TV, people (clients filter people). Pagination: page, total_pages, total_results. */
router.get("/search/multi", async (req, res) => {
  try {
    const q = req.query.query;
    if (typeof q !== "string" || !q.trim()) {
      return res.status(400).json({
        error: "Missing query parameter",
        results: [],
        page: 1,
        total_pages: 0,
        total_results: 0,
      });
    }
    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);

    const data = await axios
      .get(`${tmdb.url}/3/search/multi`, {
        params: {
          api_key: tmdb.key,
          query: q.trim(),
          page,
        },
      })
      .then((r) => r.data);

    return res.status(200).json({
      results: data.results ?? [],
      page: data.page ?? page,
      total_pages: data.total_pages ?? 1,
      total_results: data.total_results ?? 0,
      available: true,
    });
  } catch {
    return res.status(404).json({
      error: "incorrect request",
      results: [],
      page: 1,
      total_pages: 0,
      total_results: 0,
    });
  }
});

// ex. /api/search/tv?query=one%20piece&page=1
router.get("/search/:type", async (req, res) => {
  try {
    const q = req.query.query;
    if (typeof q !== "string" || !q.trim()) {
      return res.status(400).json({
        error: "Missing query parameter",
        results: [],
        page: 1,
        total_pages: 0,
        total_results: 0,
      });
    }

    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
    const type = req.params.type;

    const data = await axios
      .get(`${tmdb.url}/3/search/${type}`, {
        params: {
          api_key: tmdb.key,
          query: q.trim(),
          page,
        },
      })
      .then((r) => r.data);

    return res.status(200).json({
      results: data.results ?? [],
      page: data.page ?? page,
      total_pages: data.total_pages ?? 1,
      total_results: data.total_results ?? 0,
      available: true,
    });
  } catch {
    return res.status(404).json({
      error: "incorrect request",
      results: [],
      page: 1,
      total_pages: 0,
      total_results: 0,
    });
  }
});

export default router;
