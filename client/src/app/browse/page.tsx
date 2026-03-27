import { BrowseClient } from "./browse-client";
import { browsePoolFromHome, fetchHomeCatalog } from "@/lib/api/home-service";

export default async function BrowsePage() {
  const home = await fetchHomeCatalog();
  const initialTitles = home ? browsePoolFromHome(home) : [];
  return <BrowseClient initialTitles={initialTitles} />;
}
