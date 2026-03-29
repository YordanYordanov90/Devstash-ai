import { redirect } from "next/navigation";

export default async function FavoriteCollectionRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/collections/${encodeURIComponent(id)}`);
}