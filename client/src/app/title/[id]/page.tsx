import { notFound } from "next/navigation";
import { resolveTitle } from "@/lib/api/resolve-title";
import { TitleDetailClient } from "./title-detail-client";

/** Title resolution hits the details API; keep on-demand so builds do not depend on it. */
export const dynamic = "force-dynamic";

export default async function TitlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const resolved = await resolveTitle(decodeURIComponent(id));
  if (!resolved) notFound();
  return (
    <TitleDetailClient
      title={resolved.title}
      isSrcAvailable={resolved.isSrcAvailable}
      embedUrl={resolved.embedUrl}
    />
  );
}
