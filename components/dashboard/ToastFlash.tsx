"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

type ToastCode =
  | "itemCreated"
  | "itemUpdated"
  | "itemDeleted"
  | "itemPinned"
  | "itemUnpinned"
  | "itemSaved"
  | "itemUnsaved"
  | "itemDeleteFailed"
  | "itemPinFailed"
  | "itemFavoriteFailed";

function getToastMessage(code: ToastCode): string {
  switch (code) {
    case "itemCreated":
      return "Item created.";
    case "itemUpdated":
      return "Item updated.";
    case "itemDeleted":
      return "Item deleted.";
    case "itemPinned":
      return "Item pinned.";
    case "itemUnpinned":
      return "Item unpinned.";
    case "itemSaved":
      return "Saved to favorites.";
    case "itemUnsaved":
      return "Removed from favorites.";
    case "itemDeleteFailed":
      return "Delete failed. Try again.";
    case "itemPinFailed":
      return "Pin update failed. Try again.";
    case "itemFavoriteFailed":
      return "Favorite update failed. Try again.";
  }
}

function isToastCode(value: string): value is ToastCode {
  return [
    "itemCreated",
    "itemUpdated",
    "itemDeleted",
    "itemPinned",
    "itemUnpinned",
    "itemSaved",
    "itemUnsaved",
    "itemDeleteFailed",
    "itemPinFailed",
    "itemFavoriteFailed",
  ].includes(value);
}

export function ToastFlash() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const value = searchParams.get("toast");
    if (!value || !isToastCode(value)) return;

    toast.success(getToastMessage(value));

    const next = new URLSearchParams(searchParams.toString());
    next.delete("toast");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router, pathname]);

  return null;
}

