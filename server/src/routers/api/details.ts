import { Router } from "express";

import axios from "axios";

import { buildVidkingMovieUrl, buildVidkingTvUrl, probeVidkingEmbed } from "../../lib/vidking-embed";
import { tmdb } from "../../providers/tmdb";

const router = Router();

router.get("/details/:type/:id", async (req, res) => {
  try {
    const details = await axios
      .get(
        `${tmdb.url}/3/${req.params.type}/${req.params.id}?api_key=${tmdb.key}&append_to_response=credits,videos`,
      )
      .then((r) => r.data);

    // Keep seasons for TV; trim payload for large shows
    if (Array.isArray(details.seasons)) {
      details.seasons = details.seasons
        .filter((s: { season_number?: number }) => (s.season_number ?? 0) > 0)
        .slice(0, 30);
    }

    const media = req.params.type === "tv" ? "tv" : "movie";
    const embedUrl =
      media === "tv"
        ? buildVidkingTvUrl(req.params.id, 1, 1)
        : buildVidkingMovieUrl(req.params.id);

    const is_src_available = await probeVidkingEmbed(embedUrl);

    return res.status(200).json({ details, is_src_available });
  } catch (err) {
    return res.status(404).json({ error: "incorrect request." });
  }
});

export default router;
