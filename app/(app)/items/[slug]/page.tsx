import Link from "next/link";
import { z } from "zod";

const itemSlugParamSchema = z.object({
  slug: z.string().min(1).max(128).regex(/^[a-z0-9-]+$/),
});

export default async function ItemsByTypePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const parsedParams = itemSlugParamSchema.safeParse(await params);
  if (!parsedParams.success) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Invalid item type slug.</p>
        <Link href="/dashboard" className="text-primary hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }
  const { slug } = parsedParams.data;
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

