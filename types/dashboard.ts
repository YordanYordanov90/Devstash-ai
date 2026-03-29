/**
 * Shared types for dashboard components
 * These types represent the data shape used by dashboard components
 */

export interface ItemTypeInfo {
  id: string;
  name: string;
  icon: ItemTypeIcon;
  color: string;
  isSystem: boolean;
}

export type ItemTypeIcon =
  | "code"
  | "bot"
  | "file-text"
  | "terminal"
  | "file"
  | "image"
  | "link"
  | "sparkles"
  | "sticky-note";

export interface CollectionInfo {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  createdAt: Date;
}

export type ItemContentType = "text" | "file" | "url";

export interface ItemInfo {
  id: string;
  title: string;
  description: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  typeId: string;
  collectionId: string | null;
  language: string | null;
  contentType: ItemContentType;
  fileUrl: string | null;
  fileName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TagInfo {
  id: string;
  name: string;
}

export interface ItemTagInfo {
  itemId: string;
  tagId: string;
}

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  isPro: boolean;
}

export interface DashboardData {
  user: UserInfo | null;
  itemTypes: ItemTypeInfo[];
  collections: CollectionInfo[];
  items: ItemInfo[];
  tags: TagInfo[];
  itemTags: ItemTagInfo[];
}

export interface ItemDrawerData {
  id: string;
  title: string;
  description: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  typeId: string;
  contentType: ItemContentType;
  content: string | null;
  url: string | null;
  language: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  createdAt: Date;
  updatedAt: Date;
  type: ItemTypeInfo;
  tags: TagInfo[];
}
