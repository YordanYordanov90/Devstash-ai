import Link from "next/link";
import { authServer } from "@/lib/auth/server";
import { getUserTags } from "@/lib/db/queries";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default async function TagsPage() {
  const { data: session } = await authServer.getSession();
  const userId = session?.user?.id ?? null;

  if (!userId) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Please sign in.</p>
        <Link href="/auth/sign-in" className="text-primary hover:underline">
          Sign in
        </Link>
      </div>
    );
  }

  const tags = await getUserTags(userId, { limit: 250 });

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Tags</h1>
        <p className="text-muted-foreground tabular-nums">{tags.length} tag{tags.length === 1 ? "" : "s"}</p>
      </header>

      {tags.length === 0 ? (
        <Card className="border border-white/10 bg-card/60 ring-0 shadow-sm backdrop-blur">
          <CardHeader className="pb-1">
            <span className="text-sm font-medium text-foreground">No tags yet</span>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Add tags to items to see them here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tags.map((tag) => (
            <Link key={tag.id} href={`/tags/${encodeURIComponent(tag.id)}`}>
              <Card className="border border-white/10 bg-card/60 ring-0 shadow-sm backdrop-blur transition-colors hover:bg-card/70">
                <CardContent className="py-4">
                  <span className="font-medium text-foreground">{tag.name}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

