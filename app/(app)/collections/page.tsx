import Link from "next/link";

export default function CollectionsPage() {
  return (
    <div className="p-6">
      <p className="text-muted-foreground">All collections. (Placeholder — coming soon.)</p>
      <Link href="/dashboard" className="text-primary hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}

