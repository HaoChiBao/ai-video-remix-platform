"use client";

import Image from "next/image";
import Link from "next/link";
import { Info, Play } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { ContentItem } from "@/types";
import { buttonVariants } from "@/components/ui/button";
import { NewBadge, TrendingBadge } from "@/components/shared/badge-variants";
import { cn } from "@/lib/utils";

type FeaturedCardProps = {
  item: ContentItem;
  className?: string;
};

export function FeaturedCard({ item, className }: FeaturedCardProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={cn("relative overflow-hidden rounded-sm border border-white/20 shadow-xl shadow-black/50", className)}
    >
      <div className="relative aspect-[21/9] min-h-[280px] w-full sm:min-h-[320px]">
        <Image
          src={item.backdropUrl}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 flex flex-col justify-end gap-4 p-6 sm:p-10 md:max-w-[60%]">
          <div className="flex flex-wrap gap-2">
            {item.trending ? <TrendingBadge /> : null}
            {item.isNew ? <NewBadge /> : null}
          </div>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            {item.title}
          </h2>
          {item.tagline ? (
            <p className="text-lg text-[var(--aurora-glow)] sm:text-xl">{item.tagline}</p>
          ) : null}
          <p className="line-clamp-3 text-sm text-white/85 sm:text-base">{item.description}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href={`/title/${item.id}`}
              className={cn(
                buttonVariants({ size: "lg" }),
                "gap-2 bg-gradient-to-r from-[#0047AB] to-[#4169E1] text-white shadow-lg shadow-[#0047AB]/30 hover:opacity-95",
              )}
            >
              <Play className="size-5" aria-hidden />
              Play
            </Link>
            <Link
              href={`/title/${item.id}`}
              className={cn(
                buttonVariants({ size: "lg", variant: "secondary" }),
                "gap-2 border-white/20 bg-white/10 text-white hover:bg-white/20",
              )}
            >
              <Info className="size-5" aria-hidden />
              More info
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
