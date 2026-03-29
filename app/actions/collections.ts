"use server";

import { and, eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { z } from "zod";
import { revalidatePath } from "next/cache";

import { authServer } from "@/lib/auth/server";
import { db } from "@/db";
import { collections } from "@/db/schema";

export type CollectionActionState = { success: true } | { success: false; error: string };

const actionError = (error: string): CollectionActionState => ({ success: false, error });

const nameSchema = z.string().trim().min(1).max(160);
const descriptionSchema = z
  .string()
  .trim()
  .max(5000)
  .optional()
  .transform((v) => (v && v.length > 0 ? v : null));

function getFormString(formData: FormData, key: string): string {
  const value = formData.get(key);
  if (typeof value !== "string") return "";
  return value;
}

async function getUserIdOrRedirect(): Promise<string> {
  const session = await authServer.getSession();
  const userId = session.data?.user?.id;
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

export async function createCollectionAction(
  prevState: CollectionActionState,
  formData: FormData
): Promise<CollectionActionState> {
  try {
    const userId = await getUserIdOrRedirect();

    const name = getFormString(formData, "name");
    const descriptionRaw = getFormString(formData, "description");

    const parsedName = nameSchema.safeParse(name);
    if (!parsedName.success) {
      return actionError(parsedName.error.issues[0]?.message ?? "Invalid name.");
    }

    const parsedDescription = descriptionSchema.safeParse(descriptionRaw);
    if (!parsedDescription.success) {
      return actionError(parsedDescription.error.issues[0]?.message ?? "Invalid description.");
    }

    const newId = randomUUID();
    await db.insert(collections).values({
      id: newId,
      userId,
      name: parsedName.data,
      description: parsedDescription.data,
      isFavorite: false,
      defaultTypeId: null,
    });

    revalidatePath("/dashboard");
    revalidatePath("/collections");
    revalidatePath("/items");
    revalidatePath("/favorites");
    revalidatePath("/tags");

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create collection.";
    return actionError(message);
  }
}

export async function updateCollectionAction(
  prevState: CollectionActionState,
  formData: FormData
): Promise<CollectionActionState> {
  try {
    const userId = await getUserIdOrRedirect();

    const collectionId = getFormString(formData, "collectionId");
    const name = getFormString(formData, "name");
    const descriptionRaw = getFormString(formData, "description");

    const parsedCollectionId = z.string().trim().min(1).max(128).safeParse(collectionId);
    if (!parsedCollectionId.success) {
      return actionError("Invalid collection id.");
    }

    const collectionResult = await db.query.collections.findFirst({
      where: and(eq(collections.userId, userId), eq(collections.id, parsedCollectionId.data)),
      columns: { id: true },
    });
    if (!collectionResult) {
      return actionError("Collection not found.");
    }

    const parsedName = nameSchema.safeParse(name);
    if (!parsedName.success) {
      return actionError(parsedName.error.issues[0]?.message ?? "Invalid name.");
    }

    const parsedDescription = descriptionSchema.safeParse(descriptionRaw);
    if (!parsedDescription.success) {
      return actionError(parsedDescription.error.issues[0]?.message ?? "Invalid description.");
    }

    await db
      .update(collections)
      .set({
        name: parsedName.data,
        description: parsedDescription.data,
        updatedAt: new Date(),
      })
      .where(and(eq(collections.userId, userId), eq(collections.id, parsedCollectionId.data)));

    revalidatePath("/dashboard");
    revalidatePath("/collections");
    revalidatePath("/items");
    revalidatePath("/favorites");
    revalidatePath("/tags");

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update collection.";
    return actionError(message);
  }
}

export async function deleteCollectionAction(formData: FormData): Promise<void> {
  const userId = await getUserIdOrRedirect();
  const collectionId = getFormString(formData, "collectionId");

  const parsedCollectionId = z.string().trim().min(1).max(128).safeParse(collectionId);
  if (!parsedCollectionId.success) return;

  await db
    .delete(collections)
    .where(and(eq(collections.userId, userId), eq(collections.id, parsedCollectionId.data)));

  revalidatePath("/dashboard");
  revalidatePath("/collections");
  revalidatePath("/items");
  revalidatePath("/favorites");
  revalidatePath("/tags");
}

export async function toggleCollectionFavoriteAction(formData: FormData): Promise<void> {
  const userId = await getUserIdOrRedirect();
  const collectionId = getFormString(formData, "collectionId");

  const parsedCollectionId = z.string().trim().min(1).max(128).safeParse(collectionId);
  if (!parsedCollectionId.success) return;

  const collectionResult = await db.query.collections.findFirst({
    where: and(eq(collections.userId, userId), eq(collections.id, parsedCollectionId.data)),
    columns: { id: true, isFavorite: true },
  });
  if (!collectionResult) return;

  await db
    .update(collections)
    .set({ isFavorite: !collectionResult.isFavorite, updatedAt: new Date() })
    .where(and(eq(collections.userId, userId), eq(collections.id, parsedCollectionId.data)));

  revalidatePath("/dashboard");
  revalidatePath("/collections");
  revalidatePath("/favorites");
}
