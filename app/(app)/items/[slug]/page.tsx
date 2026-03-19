import Link from "next/link";

export default async function ItemsByTypePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <div className="p-6">
      <p className="text-muted-foreground">
        Items by type: <strong>{slug}</strong>. (Placeholder — coming soon.)
      </p>
      <Link href="/dashboard" className="text-primary hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}

