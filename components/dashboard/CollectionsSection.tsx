"use client";

import Link from "next/link";
import { Star, Folder, MoreHorizontal, Code, Bot, FileText, Terminal, File, Image, Link as LinkIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { collections, items, itemTypes } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

function getItemCount(collectionId: string) {
  return items.filter((i) => i.collectionId === collectionId).length;
}

// Collection color schemes matching the screenshot
const collectionColors: Record<string, { border: string; icon: string }> = {
  "col-1": { border: "border-l-amber-500", icon: "text-amber-500" }, // React Patterns
  "col-2": { border: "border-l-purple-500", icon: "text-purple-500" }, // AI Prompts
  "col-3": { border: "border-l-orange-500", icon: "text-orange-500" }, // Git Commands
  "col-4": { border: "border-l-yellow-500", icon: "text-yellow-500" }, // Python Snippets
  "col-5": { border: "border-l-amber-500", icon: "text-amber-500" }, // Context Files
  "col-6": { border: "border-l-purple-500", icon: "text-purple-500" }, // Interview Prep
};

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  code: Code,
  bot: Bot,
  "file-text": FileText,
  terminal: Terminal,
  file: File,
  image: Image,
  link: LinkIcon,
};

const typeColors: Record<string, string> = {
  code: "text-blue-400",
  bot: "text-purple-400",
  "file-text": "text-blue-400",
  terminal: "text-amber-400",
  file: "text-gray-400",
  image: "text-pink-400",
  link: "text-teal-400",
};

interface TypeIconInfo {
  Icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  key: string;
}

function getCollectionTypeIcons(collectionId: string): TypeIconInfo[] {
  const collectionItems = items.filter((i) => i.collectionId === collectionId);
  const typeIds = [...new Set(collectionItems.map((i) => i.typeId))].slice(0, 3);
  
  const result: TypeIconInfo[] = [];
  for (const typeId of typeIds) {
    const type = itemTypes.find((t) => t.id === typeId);
    if (!type) continue;
    const Icon = typeIcons[type.icon] ?? FileText;
    const colorClass = typeColors[type.icon] ?? "text-muted-foreground";
    result.push({ Icon, colorClass, key: typeId });
  }
  return result;
}

const recentCollections = [...collections].sort(
  (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
);

export function CollectionsSection() {
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
          const count = getItemCount(col.id);
          const colors = collectionColors[col.id] ?? { border: "border-l-muted-foreground", icon: "text-muted-foreground" };
          const typeIconsList = getCollectionTypeIcons(col.id);
          
          return (
            <Link key={col.id} href={`/collections/${col.id}`}>
              <Card 
                size="sm" 
                className={cn(
                  "h-full transition-all hover:bg-muted/50 border-l-4",
                  colors.border
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
