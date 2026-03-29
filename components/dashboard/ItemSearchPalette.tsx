"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Command } from "cmdk";
import { FileText, Search } from "lucide-react";
import { toast } from "sonner";

import { searchItemsAction } from "@/app/actions/search";
import { getItemTypesAction } from "@/app/actions/items";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FALLBACK_ITEM_TYPE_ICON,
  itemTypeBgColors,
  itemTypeIcons,
  itemTypeTextColors,
} from "@/lib/dashboard/item-type-meta";
import { cn } from "@/lib/utils";
import type { ItemSearchResult } from "@/lib/db/queries";
import type { ItemTypeIcon, ItemTypeInfo } from "@/types/dashboard";

interface ItemSearchPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function TypeIcon({ typeId, itemTypes }: { typeId: string; itemTypes: ItemTypeInfo[] }) {
  const type = itemTypes.find((t) => t.id === typeId);
  const iconName = (type?.icon ?? FALLBACK_ITEM_TYPE_ICON) as ItemTypeIcon;
  const Icon = itemTypeIcons[iconName] ?? FileText;
  const bg = itemTypeBgColors[iconName] ?? "bg-muted";
  const fg = itemTypeTextColors[iconName] ?? "text-muted-foreground";
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10",
        bg
      )}
    >
      <Icon className={cn("size-4", fg)} aria-hidden />
    </span>
  );
}

export function ItemSearchPalette({ open, onOpenChange }: ItemSearchPaletteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ItemSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [itemTypes, setItemTypes] = useState<ItemTypeInfo[]>([]);

  const handlePaletteOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        setQuery("");
        setResults([]);
        setLoading(false);
      }
      onOpenChange(next);
    },
    [onOpenChange]
  );

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    if (value.trim().length < 2) {
      setResults([]);
      setLoading(false);
    }
  }, []);

  const navigateToItem = useCallback(
    (itemId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("item", itemId);
      const qs = params.toString();
      router.push(`${pathname}${qs ? `?${qs}` : ""}`);
      handlePaletteOpenChange(false);
    },
    [router, pathname, searchParams, handlePaletteOpenChange]
  );

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    void getItemTypesAction().then((types) => {
      if (!cancelled) setItemTypes(types);
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const q = query.trim();
    if (q.length < 2) return;

    let cancelled = false;
    const handle = window.setTimeout(() => {
      if (cancelled) return;
      setLoading(true);
      void (async () => {
        const res = await searchItemsAction(q);
        if (cancelled) return;
        setLoading(false);
        if (res.success) {
          setResults(res.data);
        } else {
          setResults([]);
          toast.error(res.error);
        }
      })();
    }, 280);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [query, open]);

  return (
    <Dialog open={open} onOpenChange={handlePaletteOpenChange}>
      <DialogContent
        className="max-h-[min(85vh,520px)] gap-0 overflow-hidden p-0 sm:max-w-lg"
        showCloseButton
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Search items</DialogTitle>
        </DialogHeader>
        <Command
          shouldFilter={false}
          className="bg-popover text-popover-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
        >
          <div className="flex items-center border-b border-white/10 px-3">
            <Search className="mr-2 size-4 shrink-0 text-muted-foreground" aria-hidden />
            <Command.Input
              value={query}
              onValueChange={handleQueryChange}
              placeholder="Search items by title or description…"
              className="flex h-11 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
              aria-label="Search query"
            />
          </div>
          <Command.List className="max-h-[min(40vh,320px)] overflow-y-auto p-2">
            {loading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Searching…</p>
            ) : query.trim().length < 2 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Type at least 2 characters
              </p>
            ) : results.length === 0 ? (
              <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
                No items found
              </Command.Empty>
            ) : (
              <Command.Group heading="Items">
                {results.map((item) => (
                  <Command.Item
                    key={item.id}
                    value={item.id}
                    onSelect={() => navigateToItem(item.id)}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-sm outline-none aria-selected:bg-muted/80 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  >
                    <TypeIcon typeId={item.typeId} itemTypes={itemTypes} />
                    <span className="min-w-0 flex-1 truncate font-medium">{item.title}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
