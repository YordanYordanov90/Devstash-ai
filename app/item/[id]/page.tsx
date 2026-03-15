import Link from "next/link";

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="p-6">
      <p className="text-muted-foreground">
        Item: <strong>{id}</strong>. (Placeholder — coming soon.)
      </p>
      <Link href="/dashboard" className="text-primary hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}
