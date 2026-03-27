"use client";

import { useEffect, useState } from "react";
import { Bookmark, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PosterCard } from "@/components/content/poster-card";
import { useWatchlist } from "@/hooks/use-watchlist";
import { fetchTitleFromApiClient } from "@/lib/api/details-service";
import type { Movie, Show } from "@/types";

export function WatchlistClient() {
  const { ids } = useWatchlist();
  const [items, setItems] = useState<(Movie | Show)[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const idList = [...ids];
    if (idList.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    void (async () => {
      const results = await Promise.all(idList.map((id) => fetchTitleFromApiClient(id)));
      if (!cancelled) {
        setItems(results.filter((r): r is NonNullable<typeof r> => r != null).map((r) => r.title));
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [ids]);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      <PageHeader
        title="Watchlist"
        description="Titles you have saved for later. Stored in this browser."
      />
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading titles…
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Nothing saved yet"
          description="Browse titles and tap Add to watchlist to build your queue."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((t) => (
            <PosterCard key={t.id} item={t} />
          ))}
        </div>
      )}
    </div>
  );
}
