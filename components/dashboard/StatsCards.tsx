import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { CollectionInfo, ItemInfo } from "@/types/dashboard";

interface StatsCardsProps {
  items: ItemInfo[];
  collections: CollectionInfo[];
}

export function StatsCards({ items, collections }: StatsCardsProps) {
  const stats = {
    totalItems: items.length,
    totalCollections: collections.length,
    favoriteItems: items.filter((item) => item.isFavorite).length,
    favoriteCollections: collections.filter((collection) => collection.isFavorite)
      .length,
  };

  const statLabels: Record<string, string> = {
    totalItems: "Items",
    totalCollections: "Collections",
    favoriteItems: "Favorite items",
    favoriteCollections: "Favorite collections",
  };

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
        <Card
          key={key}
          size="sm"
          className="border border-white/10 bg-card/60 ring-0 shadow-sm backdrop-blur"
        >
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
