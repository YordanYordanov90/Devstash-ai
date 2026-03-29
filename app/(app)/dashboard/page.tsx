import { CollectionsSection } from "@/components/dashboard/CollectionsSection";
import { PinnedItems } from "@/components/dashboard/PinnedItems";
import { RecentItems } from "@/components/dashboard/RecentItems";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { authServer } from "@/lib/auth/server";
import { getDashboardData, getItemDrawerData } from "@/lib/db/queries";
import type {
  CollectionInfo,
  ItemInfo,
  ItemTagInfo,
  ItemTypeInfo,
  TagInfo,
} from "@/types/dashboard";
import { ItemDrawer } from "@/components/dashboard/ItemDrawer";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const { data: session } = await authServer.getSession();
  const userId = session?.user?.id ?? null;
  const itemId =
    typeof resolvedSearchParams?.item === "string" &&
    resolvedSearchParams.item.trim().length > 0
      ? resolvedSearchParams.item
      : null;

  let itemTypes: ItemTypeInfo[] = [];
  let collections: CollectionInfo[] = [];
  let items: ItemInfo[] = [];
  let tags: TagInfo[] = [];
  let itemTags: ItemTagInfo[] = [];
  let drawerItem = null;

  if (userId) {
    const dashboardData = await getDashboardData(userId);
    itemTypes = dashboardData.itemTypes;
    collections = dashboardData.collections;
    items = dashboardData.items;
    tags = dashboardData.tags;
    itemTags = dashboardData.itemTags;

    if (itemId) {
      drawerItem = await getItemDrawerData(userId, itemId);
    }
  }

  return (
    <div className="space-y-8 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Your developer knowledge hub</p>
      </header>

      <StatsCards
        items={items}
        collections={collections}
      />

      <CollectionsSection
        collections={collections}
        items={items}
        itemTypes={itemTypes}
      />

      <RecentItems items={items} itemTypes={itemTypes} />

      <PinnedItems
        items={items}
        itemTypes={itemTypes}
        tags={tags}
        itemTags={itemTags}
      />

      <ItemDrawer
        key={itemId ?? ""}
        isOpen={Boolean(itemId)}
        itemTypes={itemTypes}
        item={drawerItem}
      />
    </div>
  );
}
