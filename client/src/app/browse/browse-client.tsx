"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PosterCard } from "@/components/content/poster-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { badgeVariants } from "@/components/ui/badge";
import {
  contentTypeOptions,
  genreOptions,
  sortOptions,
} from "@/lib/data";
import type { Movie, Show } from "@/types";
import { cn } from "@/lib/utils";

export function BrowseClient({ initialTitles }: { initialTitles: (Movie | Show)[] }) {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState<string>("all");
  const [year, setYear] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [rating, setRating] = useState<string>("all");
  const [sort, setSort] = useState<string>("featured");

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 420);
    return () => window.clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    let list: (Movie | Show)[] = [...initialTitles];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q),
      );
    }

    if (genre !== "all") {
      list = list.filter((t) => t.genres.includes(genre));
    }

    if (year !== "all") {
      list = list.filter((t) => String(t.year) === year);
    }

    if (type !== "all") {
      list = list.filter((t) => t.kind === type);
    }

    if (rating !== "all") {
      list = list.filter((t) => t.rating === rating);
    }

    if (sort === "newest") {
      list.sort((a, b) => b.year - a.year);
    } else if (sort === "oldest") {
      list.sort((a, b) => a.year - b.year);
    } else if (sort === "title") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      list.sort((a, b) => {
        const at = a.trending ? 1 : 0;
        const bt = b.trending ? 1 : 0;
        return bt - at || b.year - a.year;
      });
    }

    return list;
  }, [genre, rating, search, sort, type, year, initialTitles]);

  const chips = genreOptions.slice(0, 10);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      <PageHeader
        title="Browse"
        description="Filter movies and shows from the catalog loaded from your API server."
      />

      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-white/10 bg-card/50 p-4 backdrop-blur-sm lg:flex-row lg:items-end">
        <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="browse-q">Search</Label>
            <Input
              id="browse-q"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Title or keyword"
              className="border-white/15 bg-white/5"
            />
          </div>
          <div className="space-y-2">
            <Label>Genre</Label>
            <Select value={genre} onValueChange={(v) => setGenre(v ?? "all")}>
              <SelectTrigger className="border-white/15 bg-white/5">
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All genres</SelectItem>
                {genreOptions.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Year</Label>
            <Select value={year} onValueChange={(v) => setYear(v ?? "all")}>
              <SelectTrigger className="border-white/15 bg-white/5">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="all">Any year</SelectItem>
                {Array.from({ length: 26 }, (_, i) => 2025 - i).map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v ?? "all")}>
              <SelectTrigger className="border-white/15 bg-white/5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {contentTypeOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Rating</Label>
            <Select value={rating} onValueChange={(v) => setRating(v ?? "all")}>
              <SelectTrigger className="border-white/15 bg-white/5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any rating</SelectItem>
                {["TV-Y7", "TV-PG", "PG", "PG-13", "TV-14", "R"].map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Sort</Label>
            <Select value={sort} onValueChange={(v) => setSort(v ?? "featured")}>
              <SelectTrigger className="border-white/15 bg-white/5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          className="border-white/20"
          onClick={() => {
            setSearch("");
            setGenre("all");
            setYear("all");
            setType("all");
            setRating("all");
            setSort("featured");
          }}
        >
          Reset filters
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Filter className="size-4 text-[var(--muted-foreground)]" aria-hidden />
        <span className="text-sm text-[var(--muted-foreground)]">Quick genres:</span>
        {chips.map((g) => (
          <button
            key={g}
            type="button"
            className={cn(
              badgeVariants({ variant: genre === g ? "default" : "outline" }),
              "cursor-pointer border-white/15",
            )}
            onClick={() => setGenre((prev) => (prev === g ? "all" : g))}
          >
            {g}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Filter}
          title="No titles match"
          description="Try clearing filters or searching with a different keyword."
          action={
            <Button
              type="button"
              onClick={() => {
                setSearch("");
                setGenre("all");
                setYear("all");
                setType("all");
                setRating("all");
              }}
            >
              Clear all
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((item) => (
            <PosterCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
