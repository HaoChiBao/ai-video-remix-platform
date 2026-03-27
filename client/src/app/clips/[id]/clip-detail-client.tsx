"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Flag, ThumbsDown, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import type { Clip } from "@/types";
import { VideoPlayerShell } from "@/components/player/video-player-shell";
import { AiGeneratedBadge } from "@/components/shared/badge-variants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ClipCard } from "@/components/clips/clip-card";
import { getCommentsForClip } from "@/lib/data";
import { fetchTitleFromApiClient, parseTmdbTitleId } from "@/lib/api/details-service";

export function ClipDetailClient({
  clip,
  related,
}: {
  clip: Clip;
  related: Clip[];
}) {
  const [linkedTitle, setLinkedTitle] = useState<string | null>(null);
  const comments = getCommentsForClip(clip.id);
  const canLinkTitle = parseTmdbTitleId(clip.contentId) != null;

  useEffect(() => {
    if (!canLinkTitle) return;
    let cancelled = false;
    void fetchTitleFromApiClient(clip.contentId).then((r) => {
      if (!cancelled && r) setLinkedTitle(r.title.title);
    });
    return () => {
      cancelled = true;
    };
  }, [clip.contentId, canLinkTitle]);

  return (
    <div className="mx-auto max-w-[1200px] space-y-10 px-4 py-8 sm:px-6">
      <VideoPlayerShell
        posterUrl={clip.thumbnailUrl}
        title={clip.title}
        durationLabel={`0:00 / ${formatDur(clip.durationSeconds)}`}
      />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-3xl font-bold text-white md:text-4xl">{clip.title}</h1>
            {clip.aiGenerated ? <AiGeneratedBadge /> : null}
          </div>
          <p className="text-[var(--muted-foreground)]">{clip.description}</p>
          {canLinkTitle ? (
            <p className="text-sm">
              <span className="text-[var(--muted-foreground)]">From </span>
              <Link
                href={`/title/${encodeURIComponent(clip.contentId)}`}
                className="font-medium text-[var(--aurora-glow)] hover:underline"
              >
                {linkedTitle ?? "Title page"}
              </Link>
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="secondary"
              className="gap-2"
              onClick={() => toast.success("Thanks — like recorded (demo)")}
            >
              <ThumbsUp className="size-4" />
              {clip.stats.likes.toLocaleString()}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="gap-2 border-white/20"
              onClick={() => toast.message("Feedback noted (demo)")}
            >
              <ThumbsDown className="size-4" />
              {clip.stats.dislikes.toLocaleString()}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="text-[var(--muted-foreground)]"
              onClick={() => toast.message("Report submitted (demo)")}
            >
              <Flag className="size-4" />
              Report
            </Button>
          </div>

          <div className="rounded-sm border border-white/20 bg-card/40 p-4">
            <h2 className="font-heading text-sm font-semibold text-white">AI-generated labeling</h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              When a clip uses our assisted workflow, we show an{" "}
              <span className="text-[var(--electric-aqua)]">AI-Generated</span> badge. Creators
              remain responsible for rights-cleared source material.
            </p>
          </div>
        </div>

        <Card className="w-full border-white/20 bg-card/60 lg:max-w-sm">
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
              Creator
            </p>
            <div className="mt-4 flex items-center gap-3">
              <Avatar className="size-12 border border-white/20">
                <AvatarImage src={clip.creatorAvatarUrl} alt="" />
                <AvatarFallback>{clip.creatorName.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-white">{clip.creatorName}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {clip.stats.views.toLocaleString()} views
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <h2 className="font-heading text-xl font-semibold text-white">Comments</h2>
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">No comments yet.</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="rounded-sm border border-white/20 bg-white/5 p-4">
                <p className="text-sm font-medium text-white">{c.authorName}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">{c.body}</p>
              </div>
            ))
          )}
          <Separator className="bg-white/10" />
          <Textarea
            placeholder="Add a comment (demo — not saved)"
            className="min-h-[100px] border-white/15 bg-white/5"
            disabled
          />
          <Button type="button" disabled variant="secondary">
            Post (demo)
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-xl font-semibold text-white">Related clips</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((c) => (
            <ClipCard key={c.id} clip={c} />
          ))}
        </div>
      </section>
    </div>
  );
}

function formatDur(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
