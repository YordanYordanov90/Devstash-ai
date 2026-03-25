import Link from "next/link";
import { Star, Pin, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  FALLBACK_ITEM_TYPE_ICON,
  itemTypeBgColors,
  itemTypeIcons,
  itemTypeTextColors,
} from "@/lib/dashboard/item-type-meta";
import type { ItemTypeInfo, TagInfo, ItemTagInfo } from "@/types/dashboard";

export interface ItemForList {
  id: string;
  title: string;
  description: string | null;
  isFavorite: boolean;
  isPinned?: boolean;
  typeId: string;
  createdAt: Date;
}

interface ItemListRowProps {
  item: ItemForList;
  showFavorite?: boolean;
  className?: string;
  itemTypes: ItemTypeInfo[];
  tags?: TagInfo[];
  itemTags?: ItemTagInfo[];
  tagNamesByItemId?: Map<string, string[]>;
}

function getTypeInfo(typeId: string, itemTypes: ItemTypeInfo[]) {
  const type = itemTypes.find((t) => t.id === typeId);
  const iconName = type?.icon ?? FALLBACK_ITEM_TYPE_ICON;
  return {
    Icon: itemTypeIcons[iconName] ?? FileText,
    bgColor: itemTypeBgColors[iconName] ?? "bg-muted",
    iconColor: itemTypeTextColors[iconName] ?? "text-muted-foreground",
  };
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function ItemListRow({
  item,
  showFavorite = true,
  className,
  itemTypes,
  tags = [],
  itemTags = [],
  tagNamesByItemId,
}: ItemListRowProps) {
  const { Icon, bgColor, iconColor } = getTypeInfo(item.typeId, itemTypes);
  const computedTagNamesByItemId = tagNamesByItemId ?? (() => {
    const namesByTagId = new Map(tags.map((tag) => [tag.id, tag.name]));
    const result = new Map<string, string[]>();
    for (const itemTag of itemTags) {
      const tagName = namesByTagId.get(itemTag.tagId);
      if (!tagName) {
        continue;
      }
      const names = result.get(itemTag.itemId) ?? [];
      names.push(tagName);
      result.set(itemTag.itemId, names);
    }
    return result;
  })();
  const tagNames = computedTagNamesByItemId.get(item.id) ?? [];

  return (
    <Link
      href={`/item/${item.id}`}
      className={cn(
        "flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:bg-muted/50",
        className
      )}
    >
      <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", bgColor)}>
        <Icon className={cn("size-5", iconColor)} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium text-foreground">{item.title}</span>
          {item.isPinned && (
            <Pin className="size-3.5 shrink-0 text-muted-foreground fill-muted-foreground" />
          )}
          {showFavorite && item.isFavorite && (
            <Star className="size-3.5 shrink-0 fill-amber-500 text-amber-500" />
          )}
        </div>
        {item.description && (
          <p className="truncate text-sm text-muted-foreground">
            {item.description}
          </p>
        )}
        {tagNames.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tagNames.map((name) => (
              <Badge key={name} variant="secondary" className="text-xs bg-muted hover:bg-muted/80">
                {name}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
        {formatDate(item.createdAt)}
      </span>
    </Link>
  );
}
