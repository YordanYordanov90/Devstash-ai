"use client";

import Link from "next/link";
import { Star, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  FALLBACK_ITEM_TYPE_ICON,
  itemTypeBorderColors,
  itemTypeIcons,
  itemTypeTextColors,
} from "@/lib/dashboard/item-type-meta";
import type { CollectionInfo, ItemInfo, ItemTypeInfo } from "@/types/dashboard";

interface CollectionsSectionProps {
  collections: CollectionInfo[];
  items: ItemInfo[];
  itemTypes: ItemTypeInfo[];
}

interface TypeIconInfo {
  Icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  key: string;
}

export function CollectionsSection({ collections, items, itemTypes }: CollectionsSectionProps) {
  const recentCollections = [...collections].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
  const typeById = new Map(itemTypes.map((type) => [type.id, type]));
  const itemCountByCollection = new Map<string, number>();
  const typeIdsByCollection = new Map<string, string[]>();
  const dominantTypeIdByCollection = new Map<string, string>();
  const typeCountsByCollection = new Map<string, Map<string, number>>();

  for (const item of items) {
    if (!item.collectionId) {
      continue;
    }

    itemCountByCollection.set(
      item.collectionId,
      (itemCountByCollection.get(item.collectionId) ?? 0) + 1
    );

    if (!typeCountsByCollection.has(item.collectionId)) {
      typeCountsByCollection.set(item.collectionId, new Map<string, number>());
    }

    const typeCounts = typeCountsByCollection.get(item.collectionId);
    if (!typeCounts) {
      continue;
    }
    typeCounts.set(item.typeId, (typeCounts.get(item.typeId) ?? 0) + 1);

    if (!typeIdsByCollection.has(item.collectionId)) {
      typeIdsByCollection.set(item.collectionId, []);
    }

    const typeIds = typeIdsByCollection.get(item.collectionId);
    if (typeIds && !typeIds.includes(item.typeId) && typeIds.length < 3) {
      typeIds.push(item.typeId);
    }
  }

  for (const [collectionId, typeCounts] of typeCountsByCollection.entries()) {
    let dominantTypeId: string | null = null;
    let dominantCount = 0;

    for (const [typeId, count] of typeCounts.entries()) {
      if (count > dominantCount) {
        dominantTypeId = typeId;
        dominantCount = count;
      }
    }

    if (dominantTypeId) {
      dominantTypeIdByCollection.set(collectionId, dominantTypeId);
    }
  }

  if (recentCollections.length === 0) {
    return (
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Collections</h2>
          <Link
            href="/collections"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View all
          </Link>
        </div>
        <Card size="sm" className="border border-border bg-card">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-foreground">No collections yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a collection to start organizing your items.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Collections</h2>
        <Link
          href="/collections"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          View all
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recentCollections.map((col) => {
          const count = itemCountByCollection.get(col.id) ?? 0;
          const dominantTypeId = dominantTypeIdByCollection.get(col.id);
          const dominantType = dominantTypeId ? typeById.get(dominantTypeId) : null;
          const dominantIconKey =
            dominantType?.icon && dominantType.icon in itemTypeBorderColors
              ? dominantType.icon
              : FALLBACK_ITEM_TYPE_ICON;
          const borderColor =
            count > 0 ? itemTypeBorderColors[dominantIconKey] : "border-l-muted-foreground";
          const typeIds = typeIdsByCollection.get(col.id) ?? [];
          const typeIconsList: TypeIconInfo[] = typeIds
            .map((typeId) => {
              const type = typeById.get(typeId);
              if (!type) {
                return null;
              }
              const iconKey = type.icon in itemTypeIcons ? type.icon : FALLBACK_ITEM_TYPE_ICON;
              return {
                Icon: itemTypeIcons[iconKey],
                colorClass: itemTypeTextColors[iconKey] ?? "text-muted-foreground",
                key: typeId,
              };
            })
            .filter((value): value is TypeIconInfo => value !== null);
          
          return (
            <Link key={col.id} href={`/collections/${col.id}`}>
              <Card 
                size="sm" 
                className={cn(
                  "h-full transition-all hover:bg-muted/50 border-l-4",
                  borderColor
                )}
              >
                <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                  <div className="flex min-w-0 items-center gap-2">
                    {col.isFavorite && (
                      <Star className="size-4 shrink-0 fill-amber-500 text-amber-500" />
                    )}
                    <span className="truncate font-medium text-foreground">{col.name}</span>
                  </div>
                  <button 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    onClick={(e) => e.preventDefault()}
                  >
                    <MoreHorizontal className="size-4" />
                  </button>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {count} item{count !== 1 ? "s" : ""}
                  </p>
                  {col.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {col.description}
                    </p>
                  )}
                  {/* Type icons */}
                  {typeIconsList.length > 0 && (
                    <div className="flex items-center gap-2 pt-1">
                      {typeIconsList.map(({ Icon, colorClass, key }) => (
                        <Icon key={key} className={cn("size-4", colorClass)} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
