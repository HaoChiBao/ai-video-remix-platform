import { Router } from "express";
import axios from "axios";

import { tmdb } from "../../providers/tmdb";

const router = Router();

router.get("/home", async (_req, res) => {
  try {
     const trending_movies = await axios.get(
        `${tmdb.url}/3/trending/movie/day?api_key=${tmdb.key}`
      ).then((res) => res.data.results);
      
      const trending_tv = await axios.get(
        `${tmdb.url}/3/trending/tv/day?api_key=${tmdb.key}`
      ).then((res) => res.data.results);

      const popular_movies = await axios.get(
        `${tmdb.url}/3/movie/popular?api_key=${tmdb.key}`
      ).then((res) => res.data.results);

      const popular_tv = await axios.get(
        `${tmdb.url}/3/tv/popular?api_key=${tmdb.key}`
      ).then((res) => res.data.results);

      const top_movies = await axios.get(
        `${tmdb.url}/3/movie/top_rated?api_key=${tmdb.key}`
      ).then((res) => res.data.results);

      const top_tv = await axios.get(
        `${tmdb.url}/3/tv/top_rated?api_key=${tmdb.key}`
      ).then((res) => res.data.results);

      const movieRecP =
        popular_movies[0]?.id != null
          ? axios
              .get(`${tmdb.url}/3/movie/${popular_movies[0].id}/recommendations`, {
                params: { api_key: tmdb.key, page: 1 },
              })
              .then((r) => r.data.results ?? [])
              .catch(() => [])
          : Promise.resolve([]);

      const tvRecP =
        popular_tv[0]?.id != null
          ? axios
              .get(`${tmdb.url}/3/tv/${popular_tv[0].id}/recommendations`, {
                params: { api_key: tmdb.key, page: 1 },
              })
              .then((r) => r.data.results ?? [])
              .catch(() => [])
          : Promise.resolve([]);

      const [movie_recommendations, tv_recommendations] = await Promise.all([
        movieRecP,
        tvRecP,
      ]);

      return res.status(200).json({
        trending_movies,
        trending_tv,
        popular_movies,
        popular_tv,
        top_movies,
        top_tv,
        movie_recommendations,
        tv_recommendations,
      });

  } catch (err) {
    return res.status(404).json({ error: "incorrect api parameter" });
  }
});

export default router;
