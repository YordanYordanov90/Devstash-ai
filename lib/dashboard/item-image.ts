import type { ItemContentType, ItemTypeInfo } from "@/types/dashboard";

export type ItemImageListFields = {
  contentType?: ItemContentType;
  fileUrl?: string | null;
  fileName?: string | null;
};

export function isImageFileListItem(
  item: ItemImageListFields,
  type: ItemTypeInfo | undefined
): boolean {
  if (item.contentType !== "file" || !item.fileUrl) return false;
  if (type?.icon === "image") return true;
  const name = item.fileName ?? "";
  return /\.(jpe?g|png|gif|webp|svg)$/i.test(name);
}
