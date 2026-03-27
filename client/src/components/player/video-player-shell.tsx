"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Maximize2, Pause, Play, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getVidkingOrigin } from "@/lib/api/vidking-embed";

type VideoPlayerShellProps = {
  posterUrl: string;
  title: string;
  durationLabel?: string;
  /** Server probe of the same embed path used in the iframe (Vidking). */
  embedAvailable?: boolean;
  /** When set (TMDB-backed titles), loads Vidking in an iframe — same path as server probe. */
  embedUrl?: string | null;
  className?: string;
};

export function VideoPlayerShell({
  posterUrl,
  title,
  durationLabel = "0:00 / 0:00",
  embedAvailable,
  embedUrl,
  className,
}: VideoPlayerShellProps) {
  const [playing, setPlaying] = useState(false);
  const hasEmbed = Boolean(embedUrl);

  useEffect(() => {
    if (!embedUrl) return;
    let expectedOrigin: string;
    try {
      expectedOrigin = new URL(embedUrl).origin;
    } catch {
      expectedOrigin = getVidkingOrigin();
    }

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== expectedOrigin) return;
      const data = event.data;
      if (data == null || typeof data !== "object") return;
      if ((data as { type?: string }).type === "PLAYER_EVENT" && process.env.NODE_ENV === "development") {
        void console.debug("[Vidking PLAYER_EVENT]", data);
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [embedUrl]);

  if (hasEmbed && embedUrl) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-sm border border-white/20 bg-black shadow-lg shadow-[#0047AB]/25",
          className,
        )}
      >
        <div className="relative aspect-video w-full">
          {/*
            No `sandbox` on the Vidking iframe: a locked-down sandbox blocks popups/modals the
            player uses and breaks playback. CORS errors between Vidking and third-party stream
            hosts are controlled by those servers, not this app.
          */}
          <iframe
            title={`Watch ${title}`}
            sandbox="allow-scripts allow-forms allow-same-origin"
            src={embedUrl}
            className="absolute inset-0 h-full w-full rounded-sm border-0"
            allow="fullscreen; autoplay; encrypted-media; picture-in-picture; accelerometer; gyroscope"
            allowFullScreen
            loading="lazy"
            referrerPolicy="origin-when-cross-origin"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-sm border border-white/20 bg-black shadow-lg shadow-[#0047AB]/25",
        className,
      )}
    >
      <div className="relative aspect-video w-full">
        <Image
          src={posterUrl}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 960px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-3 p-4 sm:p-6">
          <p className="text-sm font-medium text-white/90 line-clamp-2">{title}</p>
          {embedAvailable === false ? (
            <p className="text-xs text-amber-200/90">
              No Vidking embed was reachable for this title (poster-only preview). TMDB catalog
              titles use an iframe embed when available.
            </p>
          ) : embedAvailable === true ? (
            <p className="text-xs text-[var(--aurora-glow)]">
              Embed check passed on the API server; full player requires a TMDB-backed title id.
            </p>
          ) : null}
          <div
            className="flex h-1.5 w-full cursor-pointer rounded-full bg-white/20"
            role="slider"
            aria-label="Playback position"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={0}
            tabIndex={0}
          >
            <div className="h-full w-[32%] rounded-full bg-[var(--electric-aqua)]" />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="rounded-full border-white/20 bg-white/10 text-white hover:bg-white/20"
                aria-label={playing ? "Pause" : "Play"}
                onClick={() => setPlaying((p) => !p)}
              >
                {playing ? <Pause className="size-5" /> : <Play className="size-5 ml-0.5" />}
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/10"
                aria-label="Volume"
              >
                <Volume2 className="size-5" />
              </Button>
              <span className="text-xs tabular-nums text-[var(--muted-foreground)]">
                {durationLabel}
              </span>
            </div>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/10"
              aria-label="Fullscreen"
            >
              <Maximize2 className="size-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
