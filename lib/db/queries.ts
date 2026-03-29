import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { cache } from "react";

import { db } from "@/db";
import {
  itemTypes,
  collections,
  items,
  tags,
  itemTags,
  users,
} from "@/db/schema";
import type {
  ItemTypeIcon,
  ItemTypeInfo,
  CollectionInfo,
  ItemInfo,
  ItemDrawerData,
  TagInfo,
  ItemTagInfo,
  UserInfo,
  DashboardData,
} from "@/types/dashboard";

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 250;

const SEARCH_ITEMS_DEFAULT_LIMIT = 20;
const SEARCH_ITEMS_MAX_LIMIT = 50;

/** Escape `%`, `_`, and `\` for PostgreSQL ILIKE … ESCAPE '\\'. */
export function escapeIlikePattern(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

export interface ItemSearchResult {
  id: string;
  title: string;
  typeId: string;
  collectionId: string | null;
}

interface QueryOptions {
  limit?: number;
}

function resolveLimit(limit?: number): number {
  if (!limit || Number.isNaN(limit)) {
    return DEFAULT_LIMIT;
  }
  return Math.min(Math.max(Math.floor(limit), 1), MAX_LIMIT);
}

/**
 * Get all system item types (available to all users)
 */
export async function getSystemItemTypes(): Promise<ItemTypeInfo[]> {
  const result = await db.query.itemTypes.findMany({
    where: eq(itemTypes.isSystem, true),
    orderBy: itemTypes.name,
    columns: {
      id: true,
      name: true,
      icon: true,
      color: true,
      isSystem: true,
    },
  });

  return result.map((t) => ({
    id: t.id,
    name: t.name,
    icon: t.icon as ItemTypeIcon,
    color: t.color,
    isSystem: t.isSystem,
  }));
}

/**
 * Get all collections for a user
 */
export async function getUserCollections(
  userId: string,
  options: QueryOptions = {}
): Promise<CollectionInfo[]> {
  const result = await db.query.collections.findMany({
    where: eq(collections.userId, userId),
    orderBy: [desc(collections.isFavorite), desc(collections.createdAt)],
    limit: resolveLimit(options.limit),
    columns: {
      id: true,
      name: true,
      description: true,
      isFavorite: true,
      createdAt: true,
    },
  });

  return result.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    isFavorite: c.isFavorite,
    createdAt: c.createdAt,
  }));
}

/**
 * Get all items for a user
 */
export async function getUserItems(
  userId: string,
  options: QueryOptions = {}
): Promise<ItemInfo[]> {
  const result = await db.query.items.findMany({
    where: eq(items.userId, userId),
    orderBy: desc(items.createdAt),
    limit: resolveLimit(options.limit),
    columns: {
      id: true,
      title: true,
      description: true,
      isFavorite: true,
      isPinned: true,
      typeId: true,
      collectionId: true,
      language: true,
      contentType: true,
      fileUrl: true,
      fileName: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return result.map((i) => ({
    id: i.id,
    title: i.title,
    description: i.description,
    isFavorite: i.isFavorite,
    isPinned: i.isPinned,
    typeId: i.typeId,
    collectionId: i.collectionId,
    language: i.language,
    contentType: i.contentType as ItemInfo["contentType"],
    fileUrl: i.fileUrl,
    fileName: i.fileName,
    createdAt: i.createdAt,
    updatedAt: i.updatedAt,
  }));
}

/**
 * Search items by title or description (case-insensitive), scoped to user.
 */
export async function searchUserItems(
  userId: string,
  query: string,
  options: QueryOptions = {}
): Promise<ItemSearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length === 0) {
    return [];
  }

  const rawLimit =
    options.limit !== undefined && !Number.isNaN(options.limit)
      ? Math.floor(options.limit)
      : SEARCH_ITEMS_DEFAULT_LIMIT;
  const effectiveLimit = Math.min(Math.max(rawLimit, 1), SEARCH_ITEMS_MAX_LIMIT);
  const pattern = `%${escapeIlikePattern(trimmed)}%`;

  const result = await db
    .select({
      id: items.id,
      title: items.title,
      typeId: items.typeId,
      collectionId: items.collectionId,
    })
    .from(items)
    .where(
      and(
        eq(items.userId, userId),
        sql`(
          ${items.title} ILIKE ${pattern} ESCAPE ${"\\"}
          OR (
            ${items.description} IS NOT NULL
            AND ${items.description} ILIKE ${pattern} ESCAPE ${"\\"}
          )
        )`
      )
    )
    .orderBy(desc(items.updatedAt))
    .limit(effectiveLimit);

  return result;
}

/**
 * Get items for a user filtered by item type
 */
export async function getUserItemsByType(
  userId: string,
  typeId: string,
  options: QueryOptions = {}
): Promise<ItemInfo[]> {
  const result = await db.query.items.findMany({
    where: and(eq(items.userId, userId), eq(items.typeId, typeId)),
    orderBy: desc(items.createdAt),
    limit: resolveLimit(options.limit),
    columns: {
      id: true,
      title: true,
      description: true,
      isFavorite: true,
      isPinned: true,
      typeId: true,
      collectionId: true,
      language: true,
      contentType: true,
      fileUrl: true,
      fileName: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return result.map((i) => ({
    id: i.id,
    title: i.title,
    description: i.description,
    isFavorite: i.isFavorite,
    isPinned: i.isPinned,
    typeId: i.typeId,
    collectionId: i.collectionId,
    language: i.language,
    contentType: i.contentType as ItemInfo["contentType"],
    fileUrl: i.fileUrl,
    fileName: i.fileName,
    createdAt: i.createdAt,
    updatedAt: i.updatedAt,
  }));
}

/**
 * Get a single item by id (scoped to user)
 */
export async function getItemById(userId: string, itemId: string): Promise<ItemInfo | null> {
  const result = await db.query.items.findFirst({
    where: and(eq(items.userId, userId), eq(items.id, itemId)),
    columns: {
      id: true,
      title: true,
      description: true,
      isFavorite: true,
      isPinned: true,
      typeId: true,
      collectionId: true,
      language: true,
      contentType: true,
      fileUrl: true,
      fileName: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!result) return null;

  return {
    id: result.id,
    title: result.title,
    description: result.description,
    isFavorite: result.isFavorite,
    isPinned: result.isPinned,
    typeId: result.typeId,
    collectionId: result.collectionId,
    language: result.language,
    contentType: result.contentType as ItemInfo["contentType"],
    fileUrl: result.fileUrl,
    fileName: result.fileName,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  };
}

/**
 * Get full item data for the dashboard right drawer.
 * Note: File/image types are supported. File items are read-only in the drawer UI.
 */
export async function getItemDrawerData(
  userId: string,
  itemId: string
): Promise<ItemDrawerData | null> {
  const itemResult = await db.query.items.findFirst({
    where: and(eq(items.userId, userId), eq(items.id, itemId)),
    columns: {
      id: true,
      title: true,
      description: true,
      isFavorite: true,
      isPinned: true,
      typeId: true,
      contentType: true,
      content: true,
      url: true,
      language: true,
      fileUrl: true,
      fileName: true,
      fileSize: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!itemResult) return null;

  const typeResult = await db.query.itemTypes.findFirst({
    where: eq(itemTypes.id, itemResult.typeId),
    columns: {
      id: true,
      name: true,
      icon: true,
      color: true,
      isSystem: true,
    },
  });

  if (!typeResult) {
    // Data integrity issue: item points to a missing type.
    return null;
  }

  const tagRows = await db
    .select({
      id: tags.id,
      name: tags.name,
    })
    .from(itemTags)
    .innerJoin(tags, eq(tags.id, itemTags.tagId))
    .where(and(eq(itemTags.itemId, itemId), eq(tags.userId, userId)))
    .orderBy(tags.name);

  return {
    id: itemResult.id,
    title: itemResult.title,
    description: itemResult.description,
    isFavorite: itemResult.isFavorite,
    isPinned: itemResult.isPinned,
    typeId: itemResult.typeId,
    contentType: itemResult.contentType as ItemDrawerData["contentType"],
    content: itemResult.content,
    url: itemResult.url,
    language: itemResult.language,
    fileUrl: itemResult.fileUrl,
    fileName: itemResult.fileName,
    fileSize: itemResult.fileSize,
    createdAt: itemResult.createdAt,
    updatedAt: itemResult.updatedAt,
    type: {
      id: typeResult.id,
      name: typeResult.name,
      icon: typeResult.icon as ItemTypeIcon,
      color: typeResult.color,
      isSystem: typeResult.isSystem,
    },
    tags: tagRows satisfies TagInfo[],
  };
}

/**
 * Get a single collection by id (scoped to user)
 */
export async function getCollectionById(
  userId: string,
  collectionId: string
): Promise<CollectionInfo | null> {
  const result = await db.query.collections.findFirst({
    where: and(eq(collections.userId, userId), eq(collections.id, collectionId)),
    columns: {
      id: true,
      name: true,
      description: true,
      isFavorite: true,
      createdAt: true,
    },
  });

  if (!result) return null;

  return {
    id: result.id,
    name: result.name,
    description: result.description,
    isFavorite: result.isFavorite,
    createdAt: result.createdAt,
  };
}

/**
 * Get all tags for a user
 */
export async function getUserTags(
  userId: string,
  options: QueryOptions = {}
): Promise<TagInfo[]> {
  const result = await db.query.tags.findMany({
    where: eq(tags.userId, userId),
    orderBy: tags.name,
    limit: resolveLimit(options.limit),
    columns: {
      id: true,
      name: true,
    },
  });

  return result.map((t) => ({
    id: t.id,
    name: t.name,
  }));
}

export async function getUserTagById(userId: string, tagId: string): Promise<TagInfo | null> {
  const result = await db.query.tags.findFirst({
    where: and(eq(tags.userId, userId), eq(tags.id, tagId)),
    columns: { id: true, name: true },
  });
  if (!result) return null;
  return { id: result.id, name: result.name };
}

export async function getUserItemsByCollection(
  userId: string,
  collectionId: string,
  options: QueryOptions = {}
): Promise<ItemInfo[]> {
  const rows = await db
    .select({
      id: items.id,
      title: items.title,
      description: items.description,
      isFavorite: items.isFavorite,
      isPinned: items.isPinned,
      typeId: items.typeId,
      collectionId: items.collectionId,
      language: items.language,
      contentType: items.contentType,
      fileUrl: items.fileUrl,
      fileName: items.fileName,
      createdAt: items.createdAt,
      updatedAt: items.updatedAt,
    })
    .from(items)
    .where(and(eq(items.userId, userId), eq(items.collectionId, collectionId)))
    .orderBy(desc(items.createdAt))
    .limit(resolveLimit(options.limit));

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    isFavorite: r.isFavorite,
    isPinned: r.isPinned,
    typeId: r.typeId,
    collectionId: r.collectionId,
    language: r.language,
    contentType: r.contentType as ItemInfo["contentType"],
    fileUrl: r.fileUrl,
    fileName: r.fileName,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));
}

export async function getUserItemsByTag(
  userId: string,
  tagId: string,
  options: QueryOptions = {}
): Promise<ItemInfo[]> {
  const rows = await db
    .select({
      id: items.id,
      title: items.title,
      description: items.description,
      isFavorite: items.isFavorite,
      isPinned: items.isPinned,
      typeId: items.typeId,
      collectionId: items.collectionId,
      language: items.language,
      contentType: items.contentType,
      fileUrl: items.fileUrl,
      fileName: items.fileName,
      createdAt: items.createdAt,
      updatedAt: items.updatedAt,
    })
    .from(items)
    .innerJoin(itemTags, eq(itemTags.itemId, items.id))
    .innerJoin(tags, eq(tags.id, itemTags.tagId))
    .where(and(eq(items.userId, userId), eq(tags.userId, userId), eq(tags.id, tagId)))
    .orderBy(desc(items.createdAt))
    .limit(resolveLimit(options.limit));

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    isFavorite: r.isFavorite,
    isPinned: r.isPinned,
    typeId: r.typeId,
    collectionId: r.collectionId,
    language: r.language,
    contentType: r.contentType as ItemInfo["contentType"],
    fileUrl: r.fileUrl,
    fileName: r.fileName,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));
}

/**
 * Get item-tag relationships for a set of items
 */
export async function getItemTagsForItems(itemIds: string[]): Promise<ItemTagInfo[]> {
  if (itemIds.length === 0) return [];

  const result = await db.query.itemTags.findMany({
    where: inArray(itemTags.itemId, itemIds),
    columns: {
      itemId: true,
      tagId: true,
    },
  });

  return result.map((it) => ({
    itemId: it.itemId,
    tagId: it.tagId,
  }));
}

/**
 * Get user info by ID
 */
export async function getUserById(userId: string): Promise<UserInfo | null> {
  const result = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      email: true,
      isPro: true,
    },
  });

  if (!result) return null;

  // Generate a name from email if not available (e.g., "john" from "john@example.com")
  const nameFromEmail = result.email.split("@")[0];
  const displayName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);

  return {
    id: result.id,
    email: result.email,
    name: displayName,
    isPro: result.isPro,
  };
}

/**
 * Get all dashboard data for a user
 */
export async function getDashboardData(userId: string): Promise<DashboardData> {
  const [itemTypesResult, collectionsResult, itemsResult, tagsResult, userInfo] =
    await Promise.all([
    getCachedSystemItemTypes(),
    getCachedUserCollections(userId),
    getCachedUserItems(userId),
    getCachedUserTags(userId),
    getCachedUserById(userId),
  ]);

  const itemIds = itemsResult.map((i) => i.id);
  const itemTagsResult = await getItemTagsForItems(itemIds);

  return {
    user: userInfo,
    itemTypes: itemTypesResult,
    collections: collectionsResult,
    items: itemsResult,
    tags: tagsResult,
    itemTags: itemTagsResult,
  };
}

export const getCachedSystemItemTypes = cache(getSystemItemTypes);
export const getCachedUserCollections = cache((userId: string) =>
  getUserCollections(userId, { limit: 150 })
);
export const getCachedUserItems = cache((userId: string) =>
  getUserItems(userId, { limit: 200 })
);
export const getCachedUserTags = cache((userId: string) =>
  getUserTags(userId, { limit: 150 })
);
export const getCachedUserById = cache(getUserById);

