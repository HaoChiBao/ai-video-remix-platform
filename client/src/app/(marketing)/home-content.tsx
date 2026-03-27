import { FeaturedCard } from "@/components/content/featured-card";
import { PosterCard } from "@/components/content/poster-card";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Film } from "lucide-react";
import type { Movie, Show } from "@/types";

type HomeContentProps = {
  featured: Movie | Show | null;
  trending: (Movie | Show)[];
  communityPicks: (Movie | Show)[];
  /** TMDB recommendations (popular movie + popular TV seeds). */
  recommendations: (Movie | Show)[];
};

export function HomeContent({
  featured,
  trending,
  communityPicks,
  recommendations,
}: HomeContentProps) {
  const because =
    featured != null
      ? trending.filter((t) => t.id !== featured.id).slice(0, 8)
      : trending.slice(0, 8);

  return (
    <div className="mx-auto max-w-[1400px] space-y-12 px-4 py-8 sm:px-6">
      {featured ? (
        <FeaturedCard item={featured} />
      ) : (
        <EmptyState
          icon={Film}
          title="Catalog unavailable"
          description="Connect the API server and set TMDB_API_KEY so /api/home can load titles."
        />
      )}

      {recommendations.length > 0 ? (
        <section>
          <SectionHeader
            title="Recommended for you"
            subtitle="From TMDB recommendations (based on popular picks)."
            href="/browse"
          />
          <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 [scrollbar-width:thin]">
            {recommendations.map((item) => (
              <div key={item.id} className="w-[160px] shrink-0 sm:w-[180px]">
                <PosterCard item={item} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <SectionHeader title="Trending now" href="/browse" />
        {trending.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">No trending titles loaded yet.</p>
        ) : (
          <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 [scrollbar-width:thin]">
            {trending.map((item) => (
              <div key={item.id} className="w-[160px] shrink-0 sm:w-[180px]">
                <PosterCard item={item} />
              </div>
            ))}
          </div>
        )}
      </section>

      {featured ? (
        <section>
          <SectionHeader
            title={`Because you watched ${featured.title}`}
            subtitle="More titles from the catalog."
          />
          <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 [scrollbar-width:thin]">
            {because.map((item) => (
              <div key={item.id} className="w-[160px] shrink-0 sm:w-[180px]">
                <PosterCard item={item} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <SectionHeader
          title="Community picks"
          subtitle="Highly rated titles from TMDB-backed lists."
          href="/browse"
        />
        {communityPicks.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">No picks available yet.</p>
        ) : (
          <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 [scrollbar-width:thin]">
            {communityPicks.map((item) => (
              <div key={item.id} className="w-[160px] shrink-0 sm:w-[180px]">
                <PosterCard item={item} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
