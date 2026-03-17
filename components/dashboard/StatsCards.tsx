import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { items, collections } from "@/lib/mock-data";

function getStats() {
  const totalItems = items.length;
  const totalCollections = collections.length;
  const favoriteItems = items.filter((i) => i.isFavorite).length;
  const favoriteCollections = collections.filter((c) => c.isFavorite).length;
  return { totalItems, totalCollections, favoriteItems, favoriteCollections };
}

const statLabels: Record<string, string> = {
  totalItems: "Items",
  totalCollections: "Collections",
  favoriteItems: "Favorite items",
  favoriteCollections: "Favorite collections",
};

export function StatsCards() {
  const stats = getStats();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {(
        [
          "totalItems",
          "totalCollections",
          "favoriteItems",
          "favoriteCollections",
        ] as const
      ).map((key) => (
        <Card key={key} size="sm">
          <CardHeader className="pb-1">
            <span className="text-sm font-medium text-muted-foreground">
              {statLabels[key]}
            </span>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-semibold">{stats[key]}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
