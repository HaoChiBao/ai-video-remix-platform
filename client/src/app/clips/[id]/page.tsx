import { notFound } from "next/navigation";
import { getClipById, getRelatedClips } from "@/lib/data";
import { ClipDetailClient } from "./clip-detail-client";

export default async function ClipPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const clip = getClipById(id);
  if (!clip) notFound();
  const related = getRelatedClips(id, 6);
  return <ClipDetailClient clip={clip} related={related} />;
}
