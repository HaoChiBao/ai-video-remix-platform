"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { ContentItem } from "@/types";
import { NewBadge, TrendingBadge } from "@/components/shared/badge-variants";
import { cn } from "@/lib/utils";

type PosterCardProps = {
  item: ContentItem;
  className?: string;
};

export function PosterCard({ item, className }: PosterCardProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      whileHover={
        reduce
          ? undefined
          : { y: -6, transition: { type: "spring", stiffness: 400, damping: 28 } }
      }
      className={cn("group relative", className)}
    >
      <Link
        href={`/title/${item.id}`}
        className="block overflow-hidden rounded-sm border border-white/20 bg-card shadow-lg outline-none ring-offset-2 ring-offset-black transition focus-visible:ring-2 focus-visible:ring-[var(--electric-aqua)]"
      >
        <div className="relative aspect-[2/3] w-full overflow-hidden">
          <Image
            src={item.posterUrl}
            alt={item.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 180px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-90 transition group-hover:opacity-100" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="font-heading text-sm font-semibold leading-snug text-white line-clamp-2">
              {item.title}
            </p>
            <p className="mt-1 text-xs text-[var(--aurora-glow)]">
              {item.year}
              {item.genres.length ? ` · ${item.genres.slice(0, 2).join(" · ")}` : ""}
            </p>
          </div>
          <div className="absolute left-2 top-2 flex flex-wrap gap-1">
            {item.trending ? <TrendingBadge className="text-[10px]" /> : null}
            {item.isNew ? <NewBadge className="text-[10px]" /> : null}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
