import type { ItemContentType } from "@/types/dashboard";

/** Shape shared by list/gallery item views and `ItemInfo` (subset). */
export interface ItemForList {
  id: string;
  title: string;
  description: string | null;
  isFavorite: boolean;
  isPinned?: boolean;
  typeId: string;
  createdAt: Date;
  contentType?: ItemContentType;
  fileUrl?: string | null;
  fileName?: string | null;
}
