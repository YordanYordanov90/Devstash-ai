"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  FALLBACK_ITEM_TYPE_ICON,
  itemTypeBgColors,
  itemTypeIcons,
  itemTypeTextColors,
} from "@/lib/dashboard/item-type-meta";
import { isImageFileListItem } from "@/lib/dashboard/item-image";
import type { ItemTypeInfo } from "@/types/dashboard";
import { r2KeyToDownloadPath } from "@/lib/r2/download-path";
import type { ItemForList } from "@/components/dashboard/ItemList";

interface ItemGalleryCardProps {
  item: ItemForList;
  itemTypes: ItemTypeInfo[];
  className?: string;
  tagNames?: string[];
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

function TagBadgeRow({ tagNames, className }: { tagNames: string[]; className?: string }) {
  if (tagNames.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {tagNames.map((name) => (
        <Badge key={name} variant="secondary" className="text-xs bg-muted hover:bg-muted/80">
          {name}
        </Badge>
      ))}
    </div>
  );
}

export function ItemGalleryCard({
  item,
  itemTypes,
  className,
  tagNames = [],
}: ItemGalleryCardProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedItemId = searchParams.get("item");
  const isSelected = selectedItemId === item.id;
  const type = itemTypes.find((t) => t.id === item.typeId);
  const { Icon, bgColor, iconColor } = getTypeInfo(item.typeId, itemTypes);
  const showImage = isImageFileListItem(item, type) && Boolean(item.fileUrl);

  const href = (() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("item", item.id);
    const qs = params.toString();
    return `${pathname}${qs ? `?${qs}` : ""}`;
  })();

  const alt = item.title || item.fileName || "Item preview";
  const hasTags = tagNames.length > 0;

  return (
    <Link
      href={href}
      className={cn(
        "group block overflow-hidden rounded-xl border border-white/10 bg-card/60 shadow-sm backdrop-blur transition-colors hover:bg-card/70",
        isSelected && "bg-muted/50 ring-1 ring-primary/35 border-primary/40 shadow-sm",
        className
      )}
      aria-current={isSelected ? "true" : undefined}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {showImage && item.fileUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={r2KeyToDownloadPath(item.fileUrl)}
            alt={alt}
            className="size-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.05]"
            loading="lazy"
          />
        ) : (
          <div
            className={cn(
              "flex size-full flex-col items-center justify-center gap-2 px-3",
              bgColor
            )}
          >
            <Icon className={cn("size-10", iconColor)} aria-hidden />
            <span className="line-clamp-2 text-center text-sm font-medium text-foreground">
              {item.title}
            </span>
          </div>
        )}
      </div>
      {showImage && item.fileUrl ? (
        <div className="border-t border-white/10 px-3 py-2">
          <span className="line-clamp-1 text-sm font-medium text-foreground">{item.title}</span>
          <TagBadgeRow tagNames={tagNames} className="mt-2" />
        </div>
      ) : hasTags ? (
        <div className="border-t border-white/10 px-3 py-2">
          <TagBadgeRow tagNames={tagNames} />
        </div>
      ) : null}
    </Link>
  );
}
