import { BrowseClient } from "./browse-client";
import { browsePoolFromHome, fetchHomeCatalog } from "@/lib/api/home-service";

/** Avoid build-time fetch to the API (unreachable or slow during Vercel build → 60s timeout). */
export const dynamic = "force-dynamic";

export default async function BrowsePage() {
  const home = await fetchHomeCatalog();
  const initialTitles = home ? browsePoolFromHome(home) : [];
  return <BrowseClient initialTitles={initialTitles} />;
}
