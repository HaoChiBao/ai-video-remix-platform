import { Suspense } from "react";
import { SearchPageClient } from "./search-client";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1400px] px-4 py-16 text-center text-sm text-[var(--muted-foreground)]">
          Loading search…
        </div>
      }
    >
      <SearchPageClient />
    </Suspense>
  );
}
