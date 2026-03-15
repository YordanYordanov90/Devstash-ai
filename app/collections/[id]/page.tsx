import Link from "next/link";

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="p-6">
      <p className="text-muted-foreground">
        Collection: <strong>{id}</strong>. (Placeholder — coming soon.)
      </p>
      <Link href="/dashboard" className="text-primary hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}
