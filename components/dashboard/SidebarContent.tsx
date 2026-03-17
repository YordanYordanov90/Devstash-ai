"use client";

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
  Folder,
  Settings,
  ChevronDown,
  Layers,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { itemTypeToSlug } from "@/lib/utils";
import {
  currentUser,
  itemTypes,
  collections,
  items,
} from "@/lib/mock-data";
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

const typeColors: Record<string, string> = {
  code: "text-blue-400",
  bot: "text-purple-400",
  "file-text": "text-blue-400",
  terminal: "text-amber-400",
  file: "text-gray-400",
  image: "text-pink-400",
  link: "text-teal-400",
};

function getItemCountByType(typeId: string): number {
  return items.filter((i) => i.typeId === typeId).length;
}

function getItemCountByCollection(collectionId: string): number {
  return items.filter((i) => i.collectionId === collectionId).length;
}

const favoriteCollections = collections.filter((c) => c.isFavorite);
const allCollections = collections
  .filter((c) => !c.isFavorite)
  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

export function SidebarContent({ className }: { className?: string }) {
  return (
    <div className={cn("flex h-full flex-col bg-sidebar", className)}>
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/20">
          <Layers className="size-5 text-primary" />
        </div>
        <span className="font-semibold text-sidebar-foreground">DevStash</span>
      </div>

      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-1 p-3">
          {/* Types Section */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
              <span>Types</span>
              <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1 space-y-0.5 pl-2">
              {itemTypes.map((type) => {
                const Icon = typeIcons[type.icon] ?? File;
                const slug = itemTypeToSlug(type.name);
                const count = getItemCountByType(type.id);
                const displayName = type.name === "URL" ? "Links" : `${type.name}s`;
                const colorClass = typeColors[type.icon] ?? "text-muted-foreground";
                return (
                  <Link
                    key={type.id}
                    href={`/items/${slug}`}
                    className="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                  >
                    <Icon className={cn("size-4 shrink-0", colorClass)} />
                    <span className="truncate flex-1">{displayName}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {count}
                    </span>
                  </Link>
                );
              })}
            </CollapsibleContent>
          </Collapsible>

          {/* Collections Section */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
              <span>Collections</span>
              <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1 space-y-1 pl-2">
              {/* Favorites */}
              <div className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Favorites
              </div>
              {favoriteCollections.map((col) => (
                <Link
                  key={col.id}
                  href={`/collections/${col.id}`}
                  className="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                >
                  <Folder className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate flex-1">{col.name}</span>
                  <Star className="size-3.5 shrink-0 fill-amber-500 text-amber-500" />
                </Link>
              ))}

              {/* All Collections */}
              <div className="mt-2 px-2 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                All Collections
              </div>
              {allCollections.map((col) => {
                const count = getItemCountByCollection(col.id);
                return (
                  <Link
                    key={col.id}
                    href={`/collections/${col.id}`}
                    className="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                  >
                    <Folder className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate flex-1">{col.name}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {count}
                    </span>
                  </Link>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        </nav>
      </ScrollArea>

      {/* User Profile */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent transition-colors">
          <Avatar className="size-9 bg-muted">
            <AvatarFallback className="text-xs bg-muted text-muted-foreground">
              {currentUser.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {currentUser.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {currentUser.email}
            </p>
          </div>
          <button
            type="button"
            className="rounded p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            aria-label="Settings"
          >
            <Settings className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
