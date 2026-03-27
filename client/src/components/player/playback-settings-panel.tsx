"use client";

import { Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VidkingPlayerOptions } from "@/lib/api/vidking-embed";

const COLOR_PRESETS: { label: string; hex: string }[] = [
  { label: "Cobalt", hex: "0047ab" },
  { label: "Royal", hex: "4169e1" },
  { label: "Netflix", hex: "e50914" },
  { label: "YouTube", hex: "ff0000" },
  { label: "Violet", hex: "9146ff" },
];

type PlaybackSettingsPanelProps = {
  kind: "movie" | "tv";
  /** Fully merged options (defaults + user overrides). */
  value: VidkingPlayerOptions;
  onChange: (patch: Partial<VidkingPlayerOptions>) => void;
  onReset?: () => void;
  className?: string;
};

/**
 * Controls that map to Vidking **URL query parameters** (iframe `src`).
 * Audio track and subtitle language are **not** exposed in their public API — users
 * choose those inside the embedded player ([Vidking docs](https://www.vidking.net/#documentation)).
 */
export function PlaybackSettingsPanel({
  kind,
  value,
  onChange,
  onReset,
  className,
}: PlaybackSettingsPanelProps) {
  return (
    <Card className={cn("border-white/10 bg-card/50", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-base text-white">Playback & appearance</CardTitle>
        <CardDescription>
          These settings update the embed URL. They are the options Vidking documents publicly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm text-white/85">
          <Info className="mt-0.5 size-4 shrink-0 text-[var(--electric-aqua)]" aria-hidden />
          <p>
            <span className="font-medium text-white">Audio & subtitles:</span> the player runs on
            Vidking&apos;s domain. Use the <strong className="font-medium">in-player menus</strong>{" "}
            to change language and captions. This page cannot drive those from outside the iframe
            unless Vidking adds URL parameters for them.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-white/60">Accent color</p>
          <div className="flex flex-wrap gap-2">
            {COLOR_PRESETS.map((p) => (
              <Button
                key={p.hex}
                type="button"
                size="sm"
                variant={value.color === p.hex ? "default" : "outline"}
                className={cn(
                  "border-white/15",
                  value.color === p.hex && "bg-[#0047AB] hover:bg-[#0047AB]/90",
                )}
                onClick={() => onChange({ color: p.hex })}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label htmlFor="vk-autoplay">Autoplay</Label>
            <p className="text-xs text-[var(--muted-foreground)]">Start playback after load (when allowed by the browser).</p>
          </div>
          <Switch
            id="vk-autoplay"
            checked={Boolean(value.autoPlay)}
            onCheckedChange={(c) => onChange({ autoPlay: c })}
          />
        </div>

        {kind === "tv" ? (
          <>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label htmlFor="vk-next">Next episode button</Label>
                <p className="text-xs text-[var(--muted-foreground)]">Shown inside the Vidking player (TV).</p>
              </div>
              <Switch
                id="vk-next"
                checked={value.nextEpisode !== false}
                onCheckedChange={(c) => onChange({ nextEpisode: c })}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label htmlFor="vk-ep-sel">Vidking episode menu</Label>
                <p className="text-xs text-[var(--muted-foreground)]">
                  In-player episode selector. You can turn this off and use only the controls below.
                </p>
              </div>
              <Switch
                id="vk-ep-sel"
                checked={value.episodeSelector !== false}
                onCheckedChange={(c) => onChange({ episodeSelector: c })}
              />
            </div>
          </>
        ) : null}

        {onReset ? (
          <Button type="button" variant="ghost" size="sm" className="text-white/70" onClick={onReset}>
            Reset playback options
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
