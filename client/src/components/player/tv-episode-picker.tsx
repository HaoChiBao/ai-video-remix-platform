"use client";

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Season } from "@/types";
import type { TvSeasonEpisodeRow } from "@/lib/api/episodes-client";

type TvEpisodePickerProps = {
  seasons: Season[];
  resolvedSeason: number;
  onSeasonChange: (season: number) => void;
  episode: number;
  onEpisodeChange: (episode: number) => void;
  /** From TMDB when available; otherwise episode indices are used from metadata counts. */
  apiEpisodes: TvSeasonEpisodeRow[] | null;
  episodesLoading: boolean;
  /** Fallback when API fails — max episode index */
  fallbackEpisodeCount: number;
  className?: string;
};

export function TvEpisodePicker({
  seasons,
  resolvedSeason,
  onSeasonChange,
  episode,
  onEpisodeChange,
  apiEpisodes,
  episodesLoading,
  fallbackEpisodeCount,
  className,
}: TvEpisodePickerProps) {
  const tvSeasons = [...seasons]
    .filter((s) => s.seasonNumber > 0)
    .sort((a, b) => a.seasonNumber - b.seasonNumber);

  const episodeCount = apiEpisodes?.length
    ? apiEpisodes.length
    : Math.max(1, fallbackEpisodeCount);

  const episodeRows =
    apiEpisodes && apiEpisodes.length > 0
      ? apiEpisodes
      : Array.from({ length: episodeCount }, (_, i) => ({
          episode_number: String(i + 1),
          title: "",
        }));

  return (
    <div
      className={cn(
        "rounded-sm border border-white/20 bg-card/40 p-4 backdrop-blur-sm sm:p-5",
        className,
      )}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="font-heading text-sm font-semibold text-white">Watch</p>
        {episodesLoading ? (
          <span className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
            Loading episodes…
          </span>
        ) : (
          <span className="text-xs text-[var(--muted-foreground)]">
            Season {resolvedSeason} · {episodeCount} episode{episodeCount === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="flex min-w-[160px] flex-1 flex-col gap-2">
          <Label className="text-white/80">Season</Label>
          <Select
            value={String(resolvedSeason)}
            onValueChange={(v) => onSeasonChange(Number(v))}
          >
            <SelectTrigger className="border-white/15 bg-white/5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tvSeasons.map((s) => (
                <SelectItem key={s.seasonNumber} value={String(s.seasonNumber)}>
                  Season {s.seasonNumber}
                  {s.episodeCount != null ? ` (${s.episodeCount} eps)` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex min-w-[220px] flex-[1.5] flex-col gap-2">
          <Label className="text-white/80">Episode</Label>
          <Select value={String(episode)} onValueChange={(v) => onEpisodeChange(Number(v))}>
            <SelectTrigger className="border-white/15 bg-white/5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[min(60vh,320px)]">
              {episodeRows.map((row) => {
                const n = Number(row.episode_number);
                const label =
                  row.title?.trim() !== ""
                    ? `E${n} — ${row.title}`
                    : `Episode ${n}`;
                return (
                  <SelectItem key={row.episode_number} value={String(n)}>
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 sm:pb-0.5">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="border-white/15"
            disabled={episode <= 1}
            aria-label="Previous episode"
            onClick={() => onEpisodeChange(Math.max(1, episode - 1))}
          >
            <ChevronLeft className="size-5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="border-white/15"
            disabled={episode >= episodeCount}
            aria-label="Next episode"
            onClick={() => onEpisodeChange(Math.min(episodeCount, episode + 1))}
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
