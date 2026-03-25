import Link from "next/link";
import { z } from "zod";

const collectionIdParamSchema = z.object({
  id: z.string().min(1).max(128).regex(/^[a-zA-Z0-9_-]+$/),
});

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const parsedParams = collectionIdParamSchema.safeParse(await params);
  if (!parsedParams.success) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Invalid collection id.</p>
        <Link href="/dashboard" className="text-primary hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }
  const { id } = parsedParams.data;
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

