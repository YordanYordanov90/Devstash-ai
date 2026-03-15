import Link from "next/link";
import {
  Code,
  Bot,
  FileText,
  Terminal,
  File,
  Image,
  Link as LinkIcon,
  Star,
  Pin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { itemTypes, itemTags, tags } from "@/lib/mock-data";
import { getTagNamesForItem } from "@/lib/utils";
import { cn } from "@/lib/utils";

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  code: Code,
  bot: Bot,
  "file-text": FileText,
  terminal: Terminal,
  file: File,
  image: Image,
  link: LinkIcon,
};

const typeBgColors: Record<string, string> = {
  code: "bg-blue-500/15",
  bot: "bg-purple-500/15",
  "file-text": "bg-blue-500/15",
  terminal: "bg-amber-500/15",
  file: "bg-gray-500/15",
  image: "bg-pink-500/15",
  link: "bg-teal-500/15",
};

const typeIconColors: Record<string, string> = {
  code: "text-blue-400",
  bot: "text-purple-400",
  "file-text": "text-blue-400",
  terminal: "text-amber-400",
  file: "text-gray-400",
  image: "text-pink-400",
  link: "text-teal-400",
};

export interface ItemForList {
  id: string;
  title: string;
  description: string | null;
  isFavorite: boolean;
  isPinned?: boolean;
  typeId: string;
  createdAt: Date;
}

function getTypeInfo(typeId: string) {
  const type = itemTypes.find((t) => t.id === typeId);
  const iconName = type?.icon ?? "file";
  return {
    Icon: typeIcons[iconName] ?? FileText,
    bgColor: typeBgColors[iconName] ?? "bg-muted",
    iconColor: typeIconColors[iconName] ?? "text-muted-foreground",
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
}: {
  item: ItemForList;
  showFavorite?: boolean;
  className?: string;
}) {
  const { Icon, bgColor, iconColor } = getTypeInfo(item.typeId);
  const tagNames = getTagNamesForItem(item.id, itemTags, tags);

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
