"use client";

import { useEffect, useState } from "react";
import { Bookmark, Clapperboard, Heart, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { PosterCard } from "@/components/content/poster-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useWatchlist } from "@/hooks/use-watchlist";
import { EmptyState } from "@/components/shared/empty-state";
import { fetchTitleFromApiClient } from "@/lib/api/details-service";
import type { Movie, Show } from "@/types";

export function ProfileClient() {
  const { ids } = useWatchlist();
  const [watchlistTitles, setWatchlistTitles] = useState<(Movie | Show)[]>([]);
  const [loadingWatchlist, setLoadingWatchlist] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const idList = [...ids];
    if (idList.length === 0) {
      setWatchlistTitles([]);
      setLoadingWatchlist(false);
      return;
    }
    setLoadingWatchlist(true);
    void (async () => {
      const results = await Promise.all(idList.map((id) => fetchTitleFromApiClient(id)));
      if (!cancelled) {
        setWatchlistTitles(
          results.filter((r): r is NonNullable<typeof r> => r != null).map((r) => r.title),
        );
      }
      if (!cancelled) setLoadingWatchlist(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [ids]);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6">
      <PageHeader title="Profile" description="Your watch activity and preferences." />
      <div className="mb-10 flex flex-col gap-6 rounded-sm border border-white/20 bg-card/40 p-6 md:flex-row md:items-center">
        <Avatar className="size-24 border-2 border-[var(--electric-aqua)]/40">
          <AvatarFallback className="text-lg">You</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="font-heading text-3xl font-bold text-white">Viewer</h1>
          <p className="text-[var(--aurora-glow)]">Local profile</p>
          <p className="mt-3 max-w-2xl text-sm text-[var(--muted-foreground)]">
            Sign-in and synced continue-watching can be wired here later.
          </p>
        </div>
      </div>

      <Tabs defaultValue="watchlist" className="space-y-8">
        <TabsList className="flex w-full flex-wrap gap-2 bg-white/5 p-1">
          <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
          <TabsTrigger value="recent">Recently watched</TabsTrigger>
          <TabsTrigger value="created">Created clips</TabsTrigger>
          <TabsTrigger value="liked">Liked clips</TabsTrigger>
          <TabsTrigger value="prefs">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="watchlist">
          {loadingWatchlist ? (
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Loading…
            </div>
          ) : watchlistTitles.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              title="Your watchlist is empty"
              description="Add titles from detail pages to see them here."
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {watchlistTitles.map((t) => (
                <PosterCard key={t.id} item={t} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent">
          <EmptyState
            icon={Clapperboard}
            title="No recent activity"
            description="Playback progress will appear here when synced."
          />
        </TabsContent>

        <TabsContent value="created">
          <EmptyState
            icon={Clapperboard}
            title="No clips yet"
            description="Publish community clips from the Create flow to see them here."
          />
        </TabsContent>

        <TabsContent value="liked">
          <EmptyState
            icon={Heart}
            title="No liked clips"
            description="Clips you like will show up here."
          />
        </TabsContent>

        <TabsContent value="prefs">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-white/20 bg-card/50">
              <CardHeader>
                <CardTitle className="font-heading text-lg text-white">Playback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="autoplay">Autoplay next episode</Label>
                  <Switch id="autoplay" defaultChecked />
                </div>
                <Separator className="bg-white/10" />
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="reduce">Reduce motion in UI</Label>
                  <Switch id="reduce" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-white/20 bg-card/50">
              <CardHeader>
                <CardTitle className="font-heading text-lg text-white">Community</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="clips">Show community clips on title pages</Label>
                  <Switch id="clips" defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
