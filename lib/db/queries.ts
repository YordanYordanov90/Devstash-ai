import { and, desc, eq, inArray } from "drizzle-orm";
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
  TagInfo,
  ItemTagInfo,
  UserInfo,
  DashboardData,
} from "@/types/dashboard";

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 250;

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
    createdAt: i.createdAt,
    updatedAt: i.updatedAt,
  }));
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
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
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

