"use server";

import { and, eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { authServer } from "@/lib/auth/server";
import { db } from "@/db";
import { itemTags, itemTypes, items, tags } from "@/db/schema";
import { deleteR2Object } from "@/lib/r2/client";
import type { ItemTypeIcon, ItemTypeInfo } from "@/types/dashboard";

export type DrawerActionState = { success: true } | { success: false; error: string };

const actionError = (error: string): DrawerActionState => ({ success: false, error });

function isNextRedirectError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const digest = (err as { digest?: unknown }).digest;
  return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
}

function dashboardUrl(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (!value) continue;
    search.set(key, value);
  }
  const qs = search.toString();
  return qs ? `/dashboard?${qs}` : "/dashboard";
}

export async function getItemTypesAction(): Promise<ItemTypeInfo[]> {
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

const titleSchema = z.string().trim().min(1).max(200);
const descriptionSchema = z
  .string()
  .trim()
  .max(5000)
  .optional()
  .transform((v) => (v && v.length > 0 ? v : null));

const LANGUAGE_OPTIONS = [
  "typescript",
  "javascript",
  "json",
  "python",
  "bash",
  "sql",
  "markdown",
  "plaintext",
  "xml",
  "css",
  "html",
  "go",
  "rust",
  "java",
  "c",
  "cpp",
] as const;

const editorLanguageEnumSchema = z.enum(LANGUAGE_OPTIONS);

const CONTENT_FORMAT_OPTIONS = ["markdown", "plain", "code"] as const;
const contentFormatEnumSchema = z.enum(CONTENT_FORMAT_OPTIONS);

function parseEditorLanguage(raw: string): string | null | { success: false; error: string } {
  const normalized = raw.trim();
  if (!normalized) return null;
  const parsed = editorLanguageEnumSchema.safeParse(normalized);
  if (!parsed.success) {
    return { success: false, error: "Invalid language." };
  }
  return parsed.data;
}

function getFormString(formData: FormData, key: string): string {
  const value = formData.get(key);
  if (typeof value !== "string") return "";
  return value;
}

const tagNameSchema = z.string().trim().min(1).max(64);
const tagNamesListSchema = z
  .string()
  .optional()
  .transform((v) => (typeof v === "string" ? v : ""))
  .transform((raw) =>
    raw
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .slice(0, 20)
  )
  .pipe(z.array(tagNameSchema));

async function upsertTagsAndAttachToItem(
  userId: string,
  itemId: string,
  tagNames: string[]
): Promise<void> {
  if (tagNames.length === 0) return;

  for (const name of tagNames) {
    const existingTag = await db.query.tags.findFirst({
      where: and(eq(tags.userId, userId), eq(tags.name, name)),
      columns: { id: true },
    });

    const tagId = existingTag?.id ?? randomUUID();
    if (!existingTag) {
      await db.insert(tags).values({
        id: tagId,
        userId,
        name,
      });
    }

    await db.insert(itemTags).values({ itemId, tagId }).onConflictDoNothing();
  }
}

/** Deletes the tag when nothing links to it (keeps /tags free of unused names). */
async function deleteTagIfOrphaned(userId: string, tagId: string): Promise<void> {
  const stillLinked = await db.query.itemTags.findFirst({
    where: eq(itemTags.tagId, tagId),
    columns: { itemId: true },
  });
  if (stillLinked) return;
  await db.delete(tags).where(and(eq(tags.id, tagId), eq(tags.userId, userId)));
}

async function requireUserOwnedItemOrError(userId: string, itemId: string): Promise<void> {
  const parsedItemId = z.string().trim().min(1).max(128).safeParse(itemId);
  if (!parsedItemId.success) {
    throw new Error("Invalid item id.");
  }
  const itemResult = await db.query.items.findFirst({
    where: and(eq(items.userId, userId), eq(items.id, parsedItemId.data)),
    columns: { id: true },
  });
  if (!itemResult) {
    throw new Error("Item not found.");
  }
}

function currentUrl(params: Record<string, string | undefined>, fallback = "/dashboard"): string {
  const url = params.returnTo && params.returnTo.trim().length > 0 ? params.returnTo : fallback;
  return url;
}

function stripSearchParam(urlPath: string, key: string): string {
  const [path, qs = ""] = urlPath.split("?");
  if (!qs) return urlPath;
  const params = new URLSearchParams(qs);
  params.delete(key);
  const nextQs = params.toString();
  return nextQs ? `${path}?${nextQs}` : path;
}

/** Preserves other query params (e.g.original page) while guaranteeing a toast after item delete. */
function urlWithToast(urlPath: string, toast: string): string {
  const [path, qs = ""] = urlPath.split("?");
  const params = new URLSearchParams(qs);
  params.set("toast", toast);
  return `${path}?${params.toString()}`;
}

function isUrlType(type: { name: string; icon: string }): boolean {
  return type.name === "URL" || type.icon === "link";
}

async function getUserIdOrRedirect(): Promise<string> {
  const session = await authServer.getSession();
  const userId = session.data?.user?.id;
  if (!userId) redirect("/auth/sign-in");
  return userId;
}

async function resolveSupportedTypeOrError(
  typeId: string
): Promise<{ typeId: string; contentType: "text" | "url" | "file"; isCodeLike: boolean }> {
  const typeIdSchema = z.string().trim().min(1);
  const parsedTypeId = typeIdSchema.safeParse(typeId);
  if (!parsedTypeId.success) {
    throw new Error("Invalid type.");
  }

  const typeResult = await db.query.itemTypes.findFirst({
    where: and(eq(itemTypes.id, parsedTypeId.data), eq(itemTypes.isSystem, true)),
    columns: {
      id: true,
      name: true,
      icon: true,
      isSystem: true,
    },
  });

  if (!typeResult) throw new Error("Type not found.");

  if (typeResult.icon === "file" || typeResult.icon === "image") {
    return { typeId: typeResult.id, contentType: "file", isCodeLike: false };
  }

  const contentType = isUrlType(typeResult) ? "url" : "text";
  const isCodeLike =
    typeResult.icon === "code" ||
    typeResult.icon === "terminal" ||
    typeResult.name.toLowerCase() === "snippet" ||
    typeResult.name.toLowerCase() === "command";

  return { typeId: typeResult.id, contentType, isCodeLike };
}

export async function createItemAction(
  prevState: DrawerActionState,
  formData: FormData
): Promise<DrawerActionState> {
  try {
    const userId = await getUserIdOrRedirect();

    const title = getFormString(formData, "title");
    const descriptionRaw = getFormString(formData, "description");
    const typeId = getFormString(formData, "typeId");
    const content = getFormString(formData, "content");
    const url = getFormString(formData, "url");
    const languageRaw = getFormString(formData, "language");
    const contentFormatRaw = getFormString(formData, "contentFormat");
    const tagNamesRaw = getFormString(formData, "tagNames");

    const resolvedType = await resolveSupportedTypeOrError(typeId);

    const parsedTitle = titleSchema.safeParse(title);
    if (!parsedTitle.success) return actionError(parsedTitle.error.issues[0]?.message ?? "Invalid title.");

    const parsedDescription = descriptionSchema.safeParse(descriptionRaw);
    if (!parsedDescription.success) {
      return actionError(parsedDescription.error.issues[0]?.message ?? "Invalid description.");
    }
    const description = parsedDescription.data;
    const parsedTagNames = tagNamesListSchema.safeParse(tagNamesRaw);
    if (!parsedTagNames.success) return actionError("Invalid tags.");

    if (resolvedType.contentType === "url") {
      const parsedUrl = z.string().trim().url().safeParse(url);
      if (!parsedUrl.success) return actionError("A valid URL is required.");

      const newId = randomUUID();
      await db.insert(items).values({
        id: newId,
        userId,
        title: parsedTitle.data,
        typeId: resolvedType.typeId,
        contentType: "url",
        content: null,
        url: parsedUrl.data,
        description,
        isPinned: false,
        isFavorite: false,
        collectionId: null,
        language: null,
      });
      await upsertTagsAndAttachToItem(userId, newId, parsedTagNames.data);

      revalidatePath("/dashboard");
      revalidatePath("/items");
      revalidatePath("/collections");
      revalidatePath("/tags");
      revalidatePath("/favorites");
      redirect(
        dashboardUrl({
          toast: "itemCreated",
          item: encodeURIComponent(newId),
        })
      );
    }

    if (resolvedType.contentType === "file") {
      const fileUrl = getFormString(formData, "fileUrl");
      const fileName = getFormString(formData, "fileName");
      const fileSizeRaw = getFormString(formData, "fileSize");

      const parsedFileUrl = z.string().trim().min(1).max(512).safeParse(fileUrl);
      if (!parsedFileUrl.success) return actionError("File key is required.");

      const storageKey = parsedFileUrl.data;
      if (!storageKey.startsWith(`${userId}/`) || storageKey.includes("..")) {
        return actionError("Invalid file reference.");
      }

      const parsedFileName = z.string().trim().min(1).max(255).safeParse(fileName);
      if (!parsedFileName.success) return actionError("File name is required.");

      const parsedFileSize = z.coerce.number().int().positive().safeParse(fileSizeRaw);
      if (!parsedFileSize.success) return actionError("Invalid file size.");

      const newId = randomUUID();
      await db.insert(items).values({
        id: newId,
        userId,
        title: parsedTitle.data,
        typeId: resolvedType.typeId,
        contentType: "file",
        content: null,
        url: null,
        fileUrl: storageKey,
        fileName: parsedFileName.data,
        fileSize: parsedFileSize.data,
        description,
        isPinned: false,
        isFavorite: false,
        collectionId: null,
        language: null,
      });
      await upsertTagsAndAttachToItem(userId, newId, parsedTagNames.data);

      revalidatePath("/dashboard");
      revalidatePath("/items");
      revalidatePath("/collections");
      revalidatePath("/tags");
      revalidatePath("/favorites");
      redirect(
        dashboardUrl({
          toast: "itemCreated",
          item: encodeURIComponent(newId),
        })
      );
    }

    const inferredContentFormat = resolvedType.isCodeLike ? "code" : "markdown";
    const contentFormatCandidate =
      contentFormatRaw.trim().length > 0 ? contentFormatRaw.trim() : inferredContentFormat;
    const parsedContentFormat = contentFormatEnumSchema.safeParse(contentFormatCandidate);
    if (!parsedContentFormat.success) return actionError("Invalid content format.");
    const contentFormat = parsedContentFormat.data;

    let language: string | null = null;
    if (contentFormat === "code") {
      const languageResult = parseEditorLanguage(languageRaw);
      if (typeof languageResult === "object" && languageResult !== null && "success" in languageResult) {
        return actionError(languageResult.error);
      }
      if (!languageResult || typeof languageResult !== "string") return actionError("Language is required.");
      language = languageResult;
    } else if (contentFormat === "plain") {
      language = resolvedType.isCodeLike ? null : "plaintext";
    }

    const parsedContent = z.string().trim().min(1).max(100000).safeParse(content);
    if (!parsedContent.success) return actionError("Content is required.");

    const newId = randomUUID();
    await db.insert(items).values({
      id: newId,
      userId,
      title: parsedTitle.data,
      typeId: resolvedType.typeId,
      contentType: "text",
      content: parsedContent.data,
      url: null,
      description,
      isPinned: false,
      isFavorite: false,
      collectionId: null,
      language,
    });
    await upsertTagsAndAttachToItem(userId, newId, parsedTagNames.data);

    revalidatePath("/dashboard");
    revalidatePath("/items");
    revalidatePath("/collections");
    revalidatePath("/tags");
    revalidatePath("/favorites");
    redirect(
      dashboardUrl({
        toast: "itemCreated",
        item: encodeURIComponent(newId),
      })
    );
  } catch (err) {
    if (isNextRedirectError(err)) throw err;
    const message = err instanceof Error ? err.message : "Failed to create item.";
    return actionError(message);
  }

  return prevState;
}

export async function updateItemAction(
  prevState: DrawerActionState,
  formData: FormData
): Promise<DrawerActionState> {
  try {
    const userId = await getUserIdOrRedirect();

    const itemId = getFormString(formData, "itemId");
    const title = getFormString(formData, "title");
    const descriptionRaw = getFormString(formData, "description");
    const content = getFormString(formData, "content");
    const url = getFormString(formData, "url");
    const languageRaw = getFormString(formData, "language");
    const contentFormatRaw = getFormString(formData, "contentFormat");

    const parsedItemId = z.string().trim().min(1).max(128).safeParse(itemId);
    if (!parsedItemId.success) return actionError("Invalid item id.");

    const itemResult = await db.query.items.findFirst({
      where: and(eq(items.userId, userId), eq(items.id, parsedItemId.data)),
      columns: {
        id: true,
        typeId: true,
      },
    });
    if (!itemResult) return actionError("Item not found.");

    const resolvedType = await resolveSupportedTypeOrError(itemResult.typeId);

    if (resolvedType.contentType === "file") {
      return actionError("File items are read-only. Delete and re-upload to replace.");
    }

    const parsedTitle = titleSchema.safeParse(title);
    if (!parsedTitle.success) return actionError(parsedTitle.error.issues[0]?.message ?? "Invalid title.");

    const parsedDescription = descriptionSchema.safeParse(descriptionRaw);
    if (!parsedDescription.success) {
      return actionError(parsedDescription.error.issues[0]?.message ?? "Invalid description.");
    }
    const description = parsedDescription.data;

    const now = new Date();

    if (resolvedType.contentType === "url") {
      const parsedUrl = z.string().trim().url().safeParse(url);
      if (!parsedUrl.success) return actionError("A valid URL is required.");

      await db
        .update(items)
        .set({
          title: parsedTitle.data,
          description,
          contentType: "url",
          content: null,
          url: parsedUrl.data,
          language: null,
          updatedAt: now,
        })
        .where(and(eq(items.userId, userId), eq(items.id, parsedItemId.data)));

      revalidatePath("/dashboard");
      revalidatePath("/items");
      revalidatePath("/collections");
      revalidatePath("/tags");
      revalidatePath("/favorites");
      redirect(
        dashboardUrl({
          toast: "itemUpdated",
          item: encodeURIComponent(parsedItemId.data),
        })
      );
    }

    const inferredContentFormat = resolvedType.isCodeLike ? "code" : "markdown";
    const contentFormatCandidate =
      contentFormatRaw.trim().length > 0 ? contentFormatRaw.trim() : inferredContentFormat;
    const parsedContentFormat = contentFormatEnumSchema.safeParse(contentFormatCandidate);
    if (!parsedContentFormat.success) return actionError("Invalid content format.");
    const contentFormat = parsedContentFormat.data;

    let language: string | null = null;
    if (contentFormat === "code") {
      const languageResult = parseEditorLanguage(languageRaw);
      if (typeof languageResult === "object" && languageResult !== null && "success" in languageResult) {
        return actionError(languageResult.error);
      }
      if (!languageResult || typeof languageResult !== "string") return actionError("Language is required.");
      language = languageResult;
    } else if (contentFormat === "plain") {
      language = resolvedType.isCodeLike ? null : "plaintext";
    }

    const parsedContent = z.string().trim().min(1).max(100000).safeParse(content);
    if (!parsedContent.success) return actionError("Content is required.");

    await db
      .update(items)
      .set({
        title: parsedTitle.data,
        description,
        contentType: "text",
        content: parsedContent.data,
        url: null,
        language,
        updatedAt: now,
      })
      .where(and(eq(items.userId, userId), eq(items.id, parsedItemId.data)));

    revalidatePath("/dashboard");
    revalidatePath("/items");
    revalidatePath("/collections");
    revalidatePath("/tags");
    revalidatePath("/favorites");
    redirect(
      dashboardUrl({
        toast: "itemUpdated",
        item: encodeURIComponent(parsedItemId.data),
      })
    );
  } catch (err) {
    if (isNextRedirectError(err)) throw err;
    const message = err instanceof Error ? err.message : "Failed to update item.";
    return actionError(message);
  }

  return prevState;
}

export async function addTagToItemAction(
  prevState: DrawerActionState,
  formData: FormData
): Promise<DrawerActionState> {
  try {
    const userId = await getUserIdOrRedirect();
    const itemId = getFormString(formData, "itemId");
    const tagNameRaw = getFormString(formData, "tagName");
    const returnTo = getFormString(formData, "returnTo");

    const parsedTagName = tagNameSchema.safeParse(tagNameRaw);
    if (!parsedTagName.success) return actionError("Invalid tag name.");

    await requireUserOwnedItemOrError(userId, itemId);

    const existingTag = await db.query.tags.findFirst({
      where: and(eq(tags.userId, userId), eq(tags.name, parsedTagName.data)),
      columns: { id: true },
    });

    const tagId = existingTag?.id ?? randomUUID();
    if (!existingTag) {
      await db.insert(tags).values({
        id: tagId,
        userId,
        name: parsedTagName.data,
      });
    }

    await db.insert(itemTags).values({ itemId, tagId }).onConflictDoNothing();
    revalidatePath("/dashboard");
    revalidatePath("/items");
    revalidatePath("/collections");
    revalidatePath("/tags");
    revalidatePath("/favorites");
    redirect(currentUrl({ returnTo }, dashboardUrl({ item: encodeURIComponent(itemId) })));
  } catch (err) {
    if (isNextRedirectError(err)) throw err;
    const message = err instanceof Error ? err.message : "Failed to add tag.";
    return actionError(message);
  }
}

export async function removeTagFromItemAction(
  prevState: DrawerActionState,
  formData: FormData
): Promise<DrawerActionState> {
  try {
    const userId = await getUserIdOrRedirect();
    const itemId = getFormString(formData, "itemId");
    const tagId = getFormString(formData, "tagId");
    const returnTo = getFormString(formData, "returnTo");

    await requireUserOwnedItemOrError(userId, itemId);

    const parsedTagId = z.string().trim().min(1).max(128).safeParse(tagId);
    if (!parsedTagId.success) return actionError("Invalid tag id.");

    // Ensure tag is owned by this user before removing the relationship.
    const tagResult = await db.query.tags.findFirst({
      where: and(eq(tags.userId, userId), eq(tags.id, parsedTagId.data)),
      columns: { id: true },
    });
    if (!tagResult) return actionError("Tag not found.");

    await db
      .delete(itemTags)
      .where(and(eq(itemTags.itemId, itemId), eq(itemTags.tagId, parsedTagId.data)));

    await deleteTagIfOrphaned(userId, parsedTagId.data);

    revalidatePath("/dashboard");
    revalidatePath("/items");
    revalidatePath("/collections");
    revalidatePath("/tags");
    revalidatePath("/favorites");
    redirect(currentUrl({ returnTo }, dashboardUrl({ item: encodeURIComponent(itemId) })));
  } catch (err) {
    if (isNextRedirectError(err)) throw err;
    const message = err instanceof Error ? err.message : "Failed to remove tag.";
    return actionError(message);
  }
}

export async function deleteItemAction(formData: FormData): Promise<void> {
  const userId = await getUserIdOrRedirect();
  const itemId = getFormString(formData, "itemId");
  const returnTo = getFormString(formData, "returnTo");
  const parsedItemId = z.string().trim().min(1).max(128).safeParse(itemId);
  if (!parsedItemId.success) redirect("/dashboard");

  const itemResult = await db.query.items.findFirst({
    where: and(eq(items.userId, userId), eq(items.id, parsedItemId.data)),
    columns: { fileUrl: true },
  });

  const tagLinks = await db.query.itemTags.findMany({
    where: eq(itemTags.itemId, parsedItemId.data),
    columns: { tagId: true },
  });
  const tagIdsToCheck = [...new Set(tagLinks.map((l) => l.tagId))];

  await db.delete(items).where(and(eq(items.userId, userId), eq(items.id, parsedItemId.data)));

  if (itemResult?.fileUrl) {
    try {
      await deleteR2Object(itemResult.fileUrl);
    } catch {
    }
  }

  for (const tid of tagIdsToCheck) {
    await deleteTagIfOrphaned(userId, tid);
  }
  const fallback = dashboardUrl({ toast: "itemDeleted" });
  revalidatePath("/dashboard");
  revalidatePath("/items");
  revalidatePath("/collections");
  revalidatePath("/tags");
  revalidatePath("/favorites");
  const afterStrip = stripSearchParam(currentUrl({ returnTo }, fallback), "item");
  redirect(urlWithToast(afterStrip, "itemDeleted"));
}

export async function togglePinAction(formData: FormData): Promise<void> {
  const userId = await getUserIdOrRedirect();
  const itemId = getFormString(formData, "itemId");
  const returnTo = getFormString(formData, "returnTo");
  const parsedItemId = z.string().trim().min(1).max(128).safeParse(itemId);
  if (!parsedItemId.success) redirect("/dashboard");

  const itemResult = await db.query.items.findFirst({
    where: and(eq(items.userId, userId), eq(items.id, parsedItemId.data)),
    columns: { id: true, isPinned: true },
  });
  if (!itemResult) redirect("/dashboard");

  await db
    .update(items)
    .set({ isPinned: !itemResult.isPinned, updatedAt: new Date() })
    .where(and(eq(items.userId, userId), eq(items.id, parsedItemId.data)));

  const fallback = dashboardUrl({
    toast: itemResult.isPinned ? "itemUnpinned" : "itemPinned",
    item: encodeURIComponent(parsedItemId.data),
  });
  revalidatePath("/dashboard");
  revalidatePath("/items");
  revalidatePath("/collections");
  revalidatePath("/favorites");
  redirect(currentUrl({ returnTo }, fallback));
}

export async function toggleFavoriteAction(formData: FormData): Promise<void> {
  const userId = await getUserIdOrRedirect();
  const itemId = getFormString(formData, "itemId");
  const returnTo = getFormString(formData, "returnTo");
  const parsedItemId = z.string().trim().min(1).max(128).safeParse(itemId);
  if (!parsedItemId.success) redirect("/dashboard");

  const itemResult = await db.query.items.findFirst({
    where: and(eq(items.userId, userId), eq(items.id, parsedItemId.data)),
    columns: { id: true, isFavorite: true },
  });
  if (!itemResult) redirect("/dashboard");

  await db
    .update(items)
    .set({ isFavorite: !itemResult.isFavorite, updatedAt: new Date() })
    .where(and(eq(items.userId, userId), eq(items.id, parsedItemId.data)));

  const fallback = dashboardUrl({
    toast: itemResult.isFavorite ? "itemUnsaved" : "itemSaved",
    item: encodeURIComponent(parsedItemId.data),
  });
  revalidatePath("/dashboard");
  revalidatePath("/items");
  revalidatePath("/collections");
  revalidatePath("/favorites");
  redirect(currentUrl({ returnTo }, fallback));
}

