import { CollectionsSection } from "@/components/dashboard/CollectionsSection";
import { PinnedItems } from "@/components/dashboard/PinnedItems";

export default function DashboardPage() {
  return (
    <div className="space-y-8 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Your developer knowledge hub</p>
      </header>

      <CollectionsSection />

      <PinnedItems />
    </div>
  );
}
