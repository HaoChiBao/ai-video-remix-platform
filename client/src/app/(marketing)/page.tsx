import { HomeContent } from "./home-content";
import { browsePoolFromHome, catalogFromHome, fetchHomeCatalog } from "@/lib/api/home-service";

/** Home loads TMDB data via the API; do not block `next build` on that network call. */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const home = await fetchHomeCatalog();

  if (!home) {
    return (
      <HomeContent featured={null} trending={[]} communityPicks={[]} recommendations={[]} />
    );
  }

  const { featured, trending, communityPicks, recommendations } = catalogFromHome(home);
  const pool = browsePoolFromHome(home);
  return (
    <HomeContent
      featured={featured}
      trending={trending.length ? trending : pool.slice(0, 16)}
      communityPicks={communityPicks.length ? communityPicks : pool.slice(0, 8)}
      recommendations={recommendations}
    />
  );
}
