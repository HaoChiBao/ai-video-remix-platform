"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { PosterCard } from "@/components/content/poster-card";
import { PageHeader } from "@/components/shared/page-header";
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
import { genreNameFromTmdbId, TMDB_GENRE_OPTIONS } from "@/lib/api/mappers";
import {
  discoverCatalog,
  discoverCatalogBoth,
  searchCatalogPaged,
  type PagedCatalogResult,
  type SearchMediaFilter,
} from "@/lib/api/search-service";
import type { Movie, Show } from "@/types";

async function loadCatalog(
  q: string,
  pageNum: number,
  media: SearchMediaFilter,
  genreParam: string,
): Promise<PagedCatalogResult & { genreFiltered?: boolean }> {
  const trimmed = q.trim();
  const withGenres = genreParam.trim() || undefined;

  if (!trimmed) {
    if (media === "movie") return discoverCatalog("movie", pageNum, withGenres);
    if (media === "tv") return discoverCatalog("tv", pageNum, withGenres);
    return discoverCatalogBoth(pageNum, withGenres);
  }

  const gid = Number(genreParam);
  const genreName =
    genreParam.trim() && Number.isFinite(gid) ? genreNameFromTmdbId(gid) : undefined;

  const r = await searchCatalogPaged(trimmed, pageNum, media);
  if (!genreName) return r;

  const filtered = r.results.filter((item) => item.genres.includes(genreName));
  return { ...r, results: filtered, genreFiltered: true };
}

export function SearchPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState(() => searchParams.get("q") ?? "");
  const [page, setPage] = useState(() =>
    Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1),
  );
  const [media, setMedia] = useState<SearchMediaFilter>(() => {
    const m = searchParams.get("media");
    return m === "movie" || m === "tv" || m === "all" ? m : "all";
  });
  const [genre, setGenre] = useState(() => searchParams.get("genre") ?? "");

  const [results, setResults] = useState<(Movie | Show)[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [genreFiltered, setGenreFiltered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initialMedia = ((): SearchMediaFilter => {
    const m = searchParams.get("media");
    return m === "movie" || m === "tv" || m === "all" ? m : "all";
  })();
  const prevFilterSig = useRef(
    `${searchParams.get("q") ?? ""}|${initialMedia}|${searchParams.get("genre") ?? ""}`,
  );

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  const syncUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (page > 1) params.set("page", String(page));
    if (media !== "all") params.set("media", media);
    if (genre) params.set("genre", genre);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [debouncedQuery, page, media, genre, pathname, router]);

  useEffect(() => {
    syncUrl();
  }, [syncUrl]);

  useEffect(() => {
    const filterSig = `${debouncedQuery}|${media}|${genre}`;
    const filterChanged = prevFilterSig.current !== filterSig;
    if (filterChanged) {
      prevFilterSig.current = filterSig;
      setPage(1);
    }
    const pageForFetch = filterChanged ? 1 : page;

    let cancelled = false;
    setLoading(true);
    setError(null);
    void loadCatalog(debouncedQuery, pageForFetch, media, genre)
      .then((r) => {
        if (cancelled) return;
        setResults(r.results);
        setTotalPages(Math.max(1, r.totalPages));
        setTotalResults(r.totalResults);
        setGenreFiltered(Boolean(r.genreFiltered));
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setResults([]);
        setError(e instanceof Error ? e.message : "Search failed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, page, media, genre]);

  const modeLabel = debouncedQuery.trim()
    ? "Search results"
    : genre
      ? "Browse by genre"
      : "Popular on TMDB";

  const description = loading
    ? "Loading…"
    : error
      ? error
      : debouncedQuery.trim()
        ? `${totalResults.toLocaleString()} title${totalResults === 1 ? "" : "s"} matched${
            genreFiltered ? " (filtered by genre on this page)" : ""
          }.`
        : `${totalResults.toLocaleString()} titles — discover movies & TV with filters below.`;

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const genreSelectValue = genre || "__all__";

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      <PageHeader title="Search & discover" description={description} />

      <div className="mb-8 grid gap-4 rounded-sm border border-white/20 bg-card/30 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <Label htmlFor="search-q" className="text-white">
            Search
          </Label>
          <Input
            id="search-q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search — results update as you type"
            className="mt-1.5 h-10 border-white/25 bg-black/40 text-white"
            autoComplete="off"
            aria-label="Search titles"
          />
        </div>
        <div>
          <Label className="text-white">Type</Label>
          <Select
            value={media}
            onValueChange={(v) => setMedia((v ?? "all") as SearchMediaFilter)}
          >
            <SelectTrigger className="mt-1.5 h-10 border-white/25 bg-black/40 text-white">
              <SelectValue placeholder="Media type" />
            </SelectTrigger>
            <SelectContent className="border-white/20 bg-[#050505] text-white">
              <SelectItem value="all">Movies & TV</SelectItem>
              <SelectItem value="movie">Movies only</SelectItem>
              <SelectItem value="tv">TV only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-white">Genre</Label>
          <Select
            value={genreSelectValue}
            onValueChange={(v) => setGenre(!v || v === "__all__" ? "" : v)}
          >
            <SelectTrigger className="mt-1.5 h-10 border-white/25 bg-black/40 text-white">
              <SelectValue placeholder="All genres" />
            </SelectTrigger>
            <SelectContent className="max-h-64 border-white/20 bg-[#050505] text-white">
              <SelectItem value="__all__">All genres</SelectItem>
              {TMDB_GENRE_OPTIONS.map((g) => (
                <SelectItem key={g.id} value={String(g.id)}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="mb-4 text-sm font-medium text-[var(--aurora-glow)]">{modeLabel}</p>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-[var(--muted-foreground)]">
          <Loader2 className="size-5 animate-spin" aria-hidden />
          Loading catalog…
        </div>
      ) : error ? (
        <p className="text-destructive">{error}</p>
      ) : results.length === 0 ? (
        <p className="text-[var(--muted-foreground)]">
          No titles found. Try another keyword, clear the genre filter, or switch type (Movies / TV).
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {results.map((item) => (
              <PosterCard key={item.id} item={item} />
            ))}
          </div>

          {totalPages > 1 ? (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 border-t border-white/15 pt-6">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!canPrev}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="border-white/25 text-white"
              >
                <ChevronLeft className="size-4" aria-hidden />
                Previous
              </Button>
              <span className="tabular-nums text-sm text-[var(--muted-foreground)]">
                Page {page} of {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!canNext}
                onClick={() => setPage((p) => p + 1)}
                className="border-white/25 text-white"
              >
                Next
                <ChevronRight className="size-4" aria-hidden />
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
