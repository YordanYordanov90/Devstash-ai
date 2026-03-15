import { Pin } from "lucide-react";
import { items } from "@/lib/mock-data";
import { ItemListRow } from "./ItemList";

const pinnedItems = items.filter((i) => i.isPinned);

export function PinnedItems() {
  if (pinnedItems.length === 0) {
    return (
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Pin className="size-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Pinned</h2>
        </div>
        <p className="text-sm text-muted-foreground">No pinned items.</p>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Pin className="size-4 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">Pinned</h2>
      </div>
      <ul className="space-y-3">
        {pinnedItems.map((item) => (
          <li key={item.id}>
            <ItemListRow item={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}
