import Link from "next/link";
import { authServer } from "@/lib/auth/server";
import { getUserCollections } from "@/lib/db/queries";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default async function FavoriteCollectionsPage() {
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

  const collections = await getUserCollections(userId, { limit: 250 });
  const favorites = collections.filter((c) => c.isFavorite);

  return (
    <div className="space-y-6 p-6">
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Favorite collections
          </h1>
          <p className="text-muted-foreground tabular-nums">
            {favorites.length} collection{favorites.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link href="/dashboard" className="text-sm text-primary hover:underline">
          Back
        </Link>
      </header>

      {favorites.length === 0 ? (
        <Card className="border border-white/10 bg-card/60 ring-0 shadow-sm backdrop-blur">
          <CardHeader className="pb-1">
            <span className="text-sm font-medium text-foreground">No favorites yet</span>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Star a collection in the sidebar to see it here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((col) => (
            <Link key={col.id} href={`/collections/${encodeURIComponent(col.id)}`}>
              <Card className="border border-white/10 bg-card/60 ring-0 shadow-sm backdrop-blur transition-colors hover:bg-card/70">
                <CardContent className="py-4">
                  <p className="font-medium text-foreground">{col.name}</p>
                  {col.description ? (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {col.description}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

