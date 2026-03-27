import { Router } from "express";

import { buildVidkingMovieUrl, buildVidkingTvUrl } from "../../lib/vidking-embed";

const router = Router();

// ex. /api/get_source/tv?id=37854&s=1&e=1  |  /api/get_source/movie?id=550
router.get("/get_source/:type", async (req, res) => {
  try {
    const media = req.params.type === "tv" ? "tv" : "movie";
    const id = String(req.query.id ?? "");
    if (!id) {
      return res.status(400).json({ error: "Missing id." });
    }

    if (media === "tv") {
      const s = parseInt(String(req.query.s ?? "1"), 10) || 1;
      const e = parseInt(String(req.query.e ?? "1"), 10) || 1;
      const embedUrl = buildVidkingTvUrl(id, s, e);
      return res.status(200).json({ embedUrl, provider: "vidking" as const });
    }

    const embedUrl = buildVidkingMovieUrl(id);
    return res.status(200).json({ embedUrl, provider: "vidking" as const });
  } catch {
    return res.status(404).json({ error: "there is no sources available." });
  }
});

export default router;
