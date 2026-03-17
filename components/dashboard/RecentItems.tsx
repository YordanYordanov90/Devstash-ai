import { items } from "@/lib/mock-data";
import { ItemListRow } from "./ItemList";

const recentItems = [...items]
  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  .slice(0, 10);

export function RecentItems() {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">Recent</h2>
      <ul className="space-y-1">
        {recentItems.map((item) => (
          <li key={item.id}>
            <ItemListRow item={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}
