"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Info, Play, Share2 } from "lucide-react";
import { toast } from "sonner";
import type { Movie, Show } from "@/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClipCard } from "@/components/clips/clip-card";
import { useWatchlist } from "@/hooks/use-watchlist";
import { getClipsByTitleId } from "@/lib/data";
import type { Clip } from "@/types";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { VideoPlayerShell } from "@/components/player/video-player-shell";
import { TvEpisodePicker } from "@/components/player/tv-episode-picker";
import { defaultVidkingOptions } from "@/config/player";
import { parseTmdbTitleId } from "@/lib/api/details-service";
import { fetchTvSeasonEpisodes, type TvSeasonEpisodeRow } from "@/lib/api/episodes-client";
import { buildVidkingMovieUrl, buildVidkingTvUrl } from "@/lib/api/vidking-embed";

function sortClips(list: Clip[], sort: string) {
  const next = [...list];
  if (sort === "views") next.sort((a, b) => b.stats.views - a.stats.views);
  else if (sort === "likes") next.sort((a, b) => b.stats.likes - a.stats.likes);
  else if (sort === "newest")
    next.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  else next.sort((a, b) => a.title.localeCompare(b.title));
  return next;
}

export function TitleDetailClient({
  title,
  isSrcAvailable,
  embedUrl,
}: {
  title: Movie | Show;
  isSrcAvailable?: boolean;
  embedUrl?: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { toggle, isInWatchlist } = useWatchlist();
  const clips = getClipsByTitleId(title.id);
  const [clipSort, setClipSort] = useState("views");
  const [clipFilter, setClipFilter] = useState<"all" | "ai" | "human">("all");

  const playbackParsed = useMemo(() => parseTmdbTitleId(title.id), [title.id]);
  const tvSeasons = useMemo(() => {
    if (title.kind !== "show") return [];
    return [...title.seasons]
      .filter((s) => s.seasonNumber > 0)
      .sort((a, b) => a.seasonNumber - b.seasonNumber);
  }, [title]);
  const [pickedSeason, setPickedSeason] = useState<number | null>(null);
  const [episode, setEpisode] = useState(1);

  const [apiEpisodes, setApiEpisodes] = useState<TvSeasonEpisodeRow[] | null>(null);
  const [episodesLoading, setEpisodesLoading] = useState(false);

  const resolvedSeason = pickedSeason ?? tvSeasons[0]?.seasonNumber ?? 1;
  const episodeCount = useMemo(() => {
    const meta = tvSeasons.find((s) => s.seasonNumber === resolvedSeason);
    return Math.max(
      1,
      meta?.episodeCount ?? meta?.episodes.length ?? 1,
    );
  }, [tvSeasons, resolvedSeason]);

  const syncTvQuery = useCallback(
    (s: number, e: number) => {
      const params = new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : "",
      );
      params.set("s", String(s));
      params.set("e", String(e));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router],
  );

  useEffect(() => {
    if (title.kind !== "show" || playbackParsed?.media !== "tv") return;
    const params = new URLSearchParams(window.location.search);
    const s = params.get("s");
    const e = params.get("e");
    if (s) {
      const n = parseInt(s, 10);
      if (Number.isFinite(n) && tvSeasons.some((x) => x.seasonNumber === n)) {
        setPickedSeason(n);
      }
    }
    if (e) {
      const n = parseInt(e, 10);
      if (Number.isFinite(n) && n >= 1) setEpisode(n);
    }
  }, [title.id, title.kind, playbackParsed?.media, tvSeasons]);

  useEffect(() => {
    if (!playbackParsed || playbackParsed.media !== "tv") return;
    let cancelled = false;
    setEpisodesLoading(true);
    void fetchTvSeasonEpisodes(playbackParsed.tmdbId, resolvedSeason).then((data) => {
      if (cancelled) return;
      const rows = data?.episodes ?? null;
      setApiEpisodes(rows);
      setEpisodesLoading(false);
      if (rows?.length) {
        const maxEp = rows.length;
        setEpisode((prev) => (prev > maxEp ? maxEp : prev));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [playbackParsed, resolvedSeason, title.id]);

  useEffect(() => {
    if (episode > episodeCount) setEpisode(episodeCount);
  }, [episodeCount, episode]);

  const handleSeasonChange = (s: number) => {
    setPickedSeason(s);
    setEpisode(1);
    syncTvQuery(s, 1);
  };

  const handleEpisodeChange = (e: number) => {
    setEpisode(e);
    syncTvQuery(resolvedSeason, e);
  };

  const effectiveEmbedUrl = useMemo(() => {
    if (!playbackParsed) return embedUrl ?? null;
    if (playbackParsed.media === "movie") {
      return buildVidkingMovieUrl(playbackParsed.tmdbId, defaultVidkingOptions);
    }
    return buildVidkingTvUrl(
      playbackParsed.tmdbId,
      resolvedSeason,
      episode,
      defaultVidkingOptions,
    );
  }, [playbackParsed, embedUrl, resolvedSeason, episode]);

  const visibleClips = useMemo(() => {
    let list = clips;
    if (clipFilter === "ai") list = list.filter((c) => c.aiGenerated);
    if (clipFilter === "human") list = list.filter((c) => !c.aiGenerated);
    return sortClips(list, clipSort);
  }, [clipFilter, clipSort, clips]);

  const metaLine = [
    title.genres.length ? title.genres.join(" · ") : null,
    String(title.year),
    title.kind === "movie" && title.durationMinutes > 0
      ? `${title.durationMinutes} min`
      : null,
    title.rating,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div>
      <div className="relative min-h-[420px] w-full overflow-hidden border-b border-white/20">
        <Image
          src={title.backdropUrl}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
        <div className="relative mx-auto flex max-w-[1400px] flex-col gap-6 px-4 pb-12 pt-24 sm:px-6 md:flex-row md:items-end md:gap-10">
          <div className="relative h-64 w-48 shrink-0 overflow-hidden rounded-sm border border-white/25 shadow-xl shadow-black/50 sm:h-80 sm:w-52">
            <Image
              src={title.posterUrl}
              alt={title.title}
              fill
              className="object-cover"
              sizes="208px"
            />
          </div>
          <div className="flex-1 space-y-4 pb-2">
            <h1 className="font-heading text-4xl font-bold tracking-tight text-white drop-shadow md:text-5xl">
              {title.title}
            </h1>
            {title.tagline ? (
              <p className="text-lg text-[var(--aurora-glow)]">{title.tagline}</p>
            ) : null}
            <p className="text-sm text-white/80">{metaLine}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="#player"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "gap-2 bg-gradient-to-r from-[#0047AB] to-[#4169E1] text-white",
                )}
              >
                <Play className="size-5" />
                Play
              </Link>
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 border-white/20 bg-white/10 text-white hover:bg-white/20"
                type="button"
                onClick={() => {
                  toggle(title.id);
                  toast.success(
                    isInWatchlist(title.id)
                      ? "Removed from watchlist"
                      : "Added to watchlist",
                  );
                }}
              >
                {isInWatchlist(title.id) ? "In watchlist" : "Add to watchlist"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-white/25 bg-transparent text-white hover:bg-white/10"
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText(window.location.href);
                  toast.success("Link copied");
                }}
              >
                <Share2 className="size-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div
        id="player"
        className="mx-auto max-w-[1400px] scroll-mt-24 space-y-4 px-4 pb-6 sm:px-6"
      >
        {playbackParsed && playbackParsed.media === "tv" && tvSeasons.length > 0 ? (
          <TvEpisodePicker
            seasons={title.kind === "show" ? title.seasons : []}
            resolvedSeason={resolvedSeason}
            onSeasonChange={handleSeasonChange}
            episode={episode}
            onEpisodeChange={handleEpisodeChange}
            apiEpisodes={apiEpisodes}
            episodesLoading={episodesLoading}
            fallbackEpisodeCount={episodeCount}
          />
        ) : null}

        <VideoPlayerShell
          posterUrl={title.backdropUrl}
          title={title.title}
          durationLabel={
            title.kind === "movie" && title.durationMinutes > 0
              ? `0:00 / ${title.durationMinutes} min`
              : "0:00 / —"
          }
          embedAvailable={isSrcAvailable}
          embedUrl={effectiveEmbedUrl}
        />
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="flex w-full flex-wrap justify-start gap-2 bg-white/5 p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="episodes">
              {title.kind === "show" ? "Episodes" : "Related"}
            </TabsTrigger>
            <TabsTrigger value="clips">Community clips</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 text-[var(--muted-foreground)]">
            <p className="max-w-3xl text-base leading-relaxed text-white/90">{title.description}</p>
            <Separator className="bg-white/10" />
            <div>
              <h3 className="mb-2 font-heading text-sm font-semibold text-white">Cast</h3>
              <p>{title.cast.join(", ")}</p>
            </div>
          </TabsContent>

          <TabsContent value="episodes">
            {title.kind === "show" ? (
              title.seasons.some((s) => s.episodes.length > 0) ? (
                <ul className="space-y-4">
                  {title.seasons.flatMap((s) =>
                    s.episodes.map((ep) => (
                      <li
                        key={ep.id}
                        className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-white/20 bg-card/40 px-4 py-3"
                      >
                        <div>
                          <p className="font-medium text-white">
                            S{s.seasonNumber} E{ep.episodeNumber} — {ep.title}
                          </p>
                          <p className="text-sm text-[var(--muted-foreground)]">{ep.synopsis}</p>
                        </div>
                        <span className="text-sm tabular-nums text-[var(--aurora-glow)]">
                          {ep.durationMinutes} min
                        </span>
                      </li>
                    )),
                  )}
                </ul>
              ) : title.seasons.length > 0 ? (
                <ul className="space-y-3">
                  {title.seasons.map((s) => (
                    <li
                      key={s.seasonNumber}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-white/20 bg-card/40 px-4 py-3"
                    >
                      <p className="font-medium text-white">Season {s.seasonNumber}</p>
                      <span className="text-sm text-[var(--aurora-glow)]">
                        {s.episodeCount ?? "—"} episodes
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[var(--muted-foreground)]">No season data for this title.</p>
              )
            ) : (
              <div className="flex items-start gap-3 rounded-sm border border-white/20 bg-card/30 p-4">
                <Info className="mt-0.5 size-5 shrink-0 text-[var(--electric-aqua)]" />
                <p className="text-sm text-[var(--muted-foreground)]">
                  This is a feature film. Explore related community clips in the Community clips
                  tab, or browse more titles from the same genres in{" "}
                  <Link href="/browse" className="text-[var(--aurora-glow)] underline-offset-2 hover:underline">
                    Browse
                  </Link>
                  .
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="clips" className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-heading text-lg font-semibold text-white">Community clips</h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Thumbnails and stats are illustrative. AI-assisted clips are labeled.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Select
                  value={clipFilter}
                  onValueChange={(v) => setClipFilter((v ?? "all") as typeof clipFilter)}
                >
                  <SelectTrigger className="w-[160px] border-white/15 bg-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All clips</SelectItem>
                    <SelectItem value="ai">AI-generated</SelectItem>
                    <SelectItem value="human">Creator edits</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={clipSort} onValueChange={(v) => setClipSort(v ?? "views")}>
                  <SelectTrigger className="w-[160px] border-white/15 bg-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="views">Most viewed</SelectItem>
                    <SelectItem value="likes">Most liked</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="title">Title A–Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {visibleClips.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">
                No clips match this filter yet.
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visibleClips.map((c) => (
                  <ClipCard key={c.id} clip={c} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-3 text-sm text-[var(--muted-foreground)]">
            <p>
              <span className="text-white">Content ID:</span> {title.id}
            </p>
            <p>
              <span className="text-white">Kind:</span> {title.kind}
            </p>
            <p>
              <span className="text-white">Rating:</span> {title.rating}
            </p>
            <p>
              <span className="text-white">Year:</span> {title.year}
            </p>
            {title.kind === "movie" ? (
              <p>
                <span className="text-white">Runtime:</span>{" "}
                {title.durationMinutes > 0 ? `${title.durationMinutes} minutes` : "—"}
              </p>
            ) : null}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
