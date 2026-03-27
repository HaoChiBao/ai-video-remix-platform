"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageCircle, ThumbsUp, Eye } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { Clip } from "@/types";
import { AiGeneratedBadge } from "@/components/shared/badge-variants";
import { cn } from "@/lib/utils";

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

type ClipCardProps = {
  clip: Clip;
  className?: string;
};

export function ClipCard({ clip, className }: ClipCardProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      whileHover={reduce ? undefined : { y: -4 }}
      className={cn("group", className)}
    >
      <Link
        href={`/clips/${clip.id}`}
        className="block overflow-hidden rounded-sm border border-white/20 bg-card/80 shadow-md outline-none ring-offset-2 ring-offset-black transition hover:border-[var(--electric-aqua)]/50 focus-visible:ring-2 focus-visible:ring-[var(--electric-aqua)]"
      >
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={clip.thumbnailUrl}
            alt=""
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 320px"
          />
          <div className="absolute right-2 top-2 flex flex-wrap justify-end gap-1">
            {clip.aiGenerated ? <AiGeneratedBadge className="text-[10px] px-2 py-0.5" /> : null}
          </div>
          <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-xs tabular-nums text-white">
            {formatDuration(clip.durationSeconds)}
          </span>
        </div>
        <div className="space-y-2 p-3">
          <h3 className="font-heading text-sm font-semibold leading-snug text-white line-clamp-2">
            {clip.title}
          </h3>
          <p className="text-xs text-[var(--muted-foreground)]">{clip.creatorName}</p>
          <div className="flex flex-wrap gap-3 text-xs text-[var(--aurora-glow)]">
            <span className="inline-flex items-center gap-1">
              <Eye className="size-3.5" aria-hidden />
              {formatCount(clip.stats.views)}
            </span>
            <span className="inline-flex items-center gap-1">
              <ThumbsUp className="size-3.5" aria-hidden />
              {formatCount(clip.stats.likes)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="size-3.5" aria-hidden />
              {clip.stats.comments}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
