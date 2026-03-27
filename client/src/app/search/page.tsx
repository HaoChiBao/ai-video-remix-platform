import { PageHeader } from "@/components/shared/page-header";
import { PosterCard } from "@/components/content/poster-card";
import { searchCatalog } from "@/lib/api/search-service";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const sp = await searchParams;
  const raw = sp.q;
  const q = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] ?? "" : "";

  let results = q.trim() ? await searchCatalog(q).catch(() => []) : [];

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      <PageHeader
        title={q ? `Results for “${q}”` : "Search"}
        description={
          q
            ? `${results.length} title${results.length === 1 ? "" : "s"} found (TMDB via API server).`
            : "Enter a query in the navigation bar to search titles."
        }
      />
      {results.length === 0 ? (
        <p className="text-[var(--muted-foreground)]">No titles matched your search.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {results.map((item) => (
            <PosterCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
