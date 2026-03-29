import {
  File,
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
import { itemTypeToSlug, cn } from "@/lib/utils";
import { authServer } from "@/lib/auth/server";
import { SidebarNavLink } from "@/components/dashboard/SidebarNavLink";
import {
  getCachedSystemItemTypes,
  getCachedUserCollections,
  getCachedUserItems,
  getCachedUserTags,
  getCachedUserById,
} from "@/lib/db/queries";
import {
  FALLBACK_ITEM_TYPE_ICON,
  itemTypeIcons,
  itemTypeTextColors,
} from "@/lib/dashboard/item-type-meta";
import type {
  CollectionInfo,
  ItemInfo,
  ItemTypeInfo,
  TagInfo,
  UserInfo,
} from "@/types/dashboard";
import Link from 'next/link';

interface SidebarContentProps {
  className?: string;
  prefetchedData?: {
    itemTypes: ItemTypeInfo[];
    collections: CollectionInfo[];
    items: ItemInfo[];
    tags: TagInfo[];
    user: UserInfo | null;
  };
}

export async function SidebarContent({ className, prefetchedData }: SidebarContentProps) {
  const { data: session } = await authServer.getSession();
  const userId = session?.user?.id ?? null;

  let user = prefetchedData?.user ?? null;
  let itemTypes = prefetchedData?.itemTypes ?? [];
  let collections = prefetchedData?.collections ?? [];
  let items = prefetchedData?.items ?? [];
  let userTags = prefetchedData?.tags ?? [];

  if (userId && !prefetchedData) {
    const [itemTypesResult, collectionsResult, itemsResult, tagsResult, userResult] =
      await Promise.all([
      getCachedSystemItemTypes(),
      getCachedUserCollections(userId),
      getCachedUserItems(userId),
      getCachedUserTags(userId),
      getCachedUserById(userId),
    ]);
    itemTypes = itemTypesResult;
    collections = collectionsResult;
    items = itemsResult;
    userTags = tagsResult;
    user = userResult;
  }

  const itemCountByType = new Map<string, number>();
  const itemCountByCollection = new Map<string, number>();
  for (const item of items) {
    itemCountByType.set(item.typeId, (itemCountByType.get(item.typeId) ?? 0) + 1);
    if (item.collectionId) {
      itemCountByCollection.set(
        item.collectionId,
        (itemCountByCollection.get(item.collectionId) ?? 0) + 1
      );
    }
  }

  const favoriteCollections = collections.filter((c) => c.isFavorite);
  const allCollections = collections
    .filter((c) => !c.isFavorite)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className={cn("flex h-full flex-col bg-sidebar/80 backdrop-blur supports-backdrop-filter:bg-sidebar/70", className)}>
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-white/10 px-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/20">
          <Layers className="size-5 text-primary" />
        </div>
        <span className="font-semibold text-sidebar-foreground">DevStash</span>
      </div>

      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-1 p-3">
          {/* Types Section */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
              <span>Types</span>
              <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1 space-y-0.5 pl-2">
              {itemTypes.map((type) => {
                const iconKey = type.icon in itemTypeIcons ? type.icon : FALLBACK_ITEM_TYPE_ICON;
                const Icon = itemTypeIcons[iconKey] ?? File;
                const slug = itemTypeToSlug(type.name);
                const count = itemCountByType.get(type.id) ?? 0;
                const displayName = type.name === "URL" ? "Links" : `${type.name}s`;
                const colorClass = itemTypeTextColors[iconKey] ?? "text-muted-foreground";
                return (
                  <SidebarNavLink
                    key={type.id}
                    href={`/items/${slug}`}
                    className="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                    activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                  >
                    <Icon className={cn("size-4 shrink-0", colorClass)} />
                    <span className="truncate flex-1">{displayName}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {count}
                    </span>
                  </SidebarNavLink>
                );
              })}
            </CollapsibleContent>
          </Collapsible>

          {/* Collections Section */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
              <span>Collections</span>
              <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1 space-y-1 pl-2">
              {/* Favorites */}
              <Link href="/favorites">
                <div className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Favorites
                </div>
              </Link>
              {favoriteCollections.map((col) => (
                <SidebarNavLink
                  key={col.id}
                  href={`/collections/${col.id}`}
                  className="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                  activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                >
                  <Folder className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate flex-1">{col.name}</span>
                  <Star className="size-3.5 shrink-0 fill-amber-500 text-amber-500" />
                </SidebarNavLink>
              ))}

              {/* All Collections */}
              <div className="mt-2 px-2 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                All Collections
              </div>
              {allCollections.map((col) => {
                const count = itemCountByCollection.get(col.id) ?? 0;
                return (
                  <SidebarNavLink
                    key={col.id}
                    href={`/collections/${col.id}`}
                    className="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                    activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                  >
                    <Folder className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate flex-1">{col.name}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {count}
                    </span>
                  </SidebarNavLink>
                );
              })}
            </CollapsibleContent>
          </Collapsible>

          {/* Tags Section */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
              <span>Tags</span>
              <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1 space-y-0.5 pl-2">
              <SidebarNavLink
                href="/tags"
                className="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                exact={false}
              >
                <span className="truncate flex-1">All tags</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {userTags.length}
                </span>
              </SidebarNavLink>
            </CollapsibleContent>
          </Collapsible>
        </nav>
      </ScrollArea>

      {/* User Profile */}
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent transition-colors">
          <Avatar className="size-9 bg-muted">
            <AvatarFallback className="text-xs bg-muted text-muted-foreground">
              {user?.name
                .split(" ")
                .map((n) => n[0])
                .join("") ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {user?.name ?? "Guest"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email ?? "Sign in to save your items"}
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
