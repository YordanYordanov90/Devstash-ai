"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Star, Pin, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  FALLBACK_ITEM_TYPE_ICON,
  itemTypeBgColors,
  itemTypeIcons,
  itemTypeTextColors,
} from "@/lib/dashboard/item-type-meta";
import type { ItemContentType, ItemTypeInfo, TagInfo, ItemTagInfo } from "@/types/dashboard";
import { r2KeyToDownloadPath } from "@/lib/r2/download-path";

export interface ItemForList {
  id: string;
  title: string;
  description: string | null;
  isFavorite: boolean;
  isPinned?: boolean;
  typeId: string;
  createdAt: Date;
  contentType?: ItemContentType;
  fileUrl?: string | null;
  fileName?: string | null;
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

function isImageFileListItem(item: ItemForList, type: ItemTypeInfo | undefined): boolean {
  if (item.contentType !== "file" || !item.fileUrl) return false;
  if (type?.icon === "image") return true;
  const name = item.fileName ?? "";
  return /\.(jpe?g|png|gif|webp|svg)$/i.test(name);
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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedItemId = searchParams.get("item");
  const isSelected = selectedItemId === item.id;
  const type = itemTypes.find((t) => t.id === item.typeId);
  const { Icon, bgColor, iconColor } = getTypeInfo(item.typeId, itemTypes);
  const showImageThumb = isImageFileListItem(item, type);
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
  const href = (() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("item", item.id);
    const qs = params.toString();
    return `${pathname}${qs ? `?${qs}` : ""}`;
  })();

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-4 rounded-xl border border-white/10 bg-card/60 p-4 shadow-sm backdrop-blur transition-colors hover:bg-card/70",
        isSelected && "bg-muted/50 ring-1 ring-primary/35 border-primary/40 shadow-sm",
        className
      )}
      aria-current={isSelected ? "true" : undefined}
    >
      {showImageThumb && item.fileUrl ? (
        <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={r2KeyToDownloadPath(item.fileUrl)}
            alt={item.fileName ?? "Preview"}
            className="size-full object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", bgColor)}>
          <Icon className={cn("size-5", iconColor)} />
        </div>
      )}
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
        {item.contentType === "file" && item.fileName && !showImageThumb && (
          <p className="truncate text-sm text-muted-foreground tabular-nums font-mono">
            {item.fileName}
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
