import { Suspense } from "react";
import { CreateClient } from "./create-client";
import { Skeleton } from "@/components/ui/skeleton";
import { browsePoolFromHome, fetchHomeCatalog } from "@/lib/api/home-service";

/** Avoid build-time fetch to the API (unreachable or slow during Vercel build → 60s timeout). */
export const dynamic = "force-dynamic";

async function CreatePageInner() {
  const home = await fetchHomeCatalog();
  const catalogTitles = home ? browsePoolFromHome(home) : [];
  return <CreateClient catalogTitles={catalogTitles} />;
}

function Fallback() {
  return (
    <div className="mx-auto max-w-[960px] space-y-6 px-4 py-8 sm:px-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-[400px] w-full rounded-sm" />
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<Fallback />}>
      <CreatePageInner />
    </Suspense>
  );
}
