import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Map item type name to URL slug (e.g. "Snippet" -> "snippets", "URL" -> "links"). */
export function itemTypeToSlug(name: string): string {
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  return slug === "url" ? "links" : `${slug}s`;
}

/** Get tag names for an item from itemTags + tags. */
export function getTagNamesForItem(
  itemId: string,
  itemTags: { itemId: string; tagId: string }[],
  tags: { id: string; name: string }[]
): string[] {
  const tagIds = itemTags.filter((it) => it.itemId === itemId).map((it) => it.tagId);
  return tagIds
    .map((tid) => tags.find((t) => t.id === tid)?.name)
    .filter((n): n is string => Boolean(n));
}
