"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FileText, Loader2, Search } from "lucide-react";
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
  const [activeIndex, setActiveIndex] = useState(-1);
  const [itemTypes, setItemTypes] = useState<ItemTypeInfo[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const resetState = useCallback(() => {
    setQuery("");
    setResults([]);
    setLoading(false);
    setActiveIndex(-1);
  }, []);

  const close = useCallback(() => {
    resetState();
    onOpenChange(false);
  }, [resetState, onOpenChange]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) resetState();
      onOpenChange(next);
    },
    [resetState, onOpenChange]
  );

  const navigateToItem = useCallback(
    (itemId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("item", itemId);
      const qs = params.toString();
      router.push(`${pathname}${qs ? `?${qs}` : ""}`);
      close();
    },
    [router, pathname, searchParams, close]
  );

  // Focus input and reset when dialog opens
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    return () => window.clearTimeout(t);
  }, [open]);

  // Load item types once on open
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void getItemTypesAction().then((types) => {
      if (!cancelled) setItemTypes(types);
    });
    return () => { cancelled = true; };
  }, [open]);

  // Debounced search
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
        setActiveIndex(-1);
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

  // Keyboard navigation inside the list
  // Clear results when query is too short (event-driven, not effect-driven)
  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (value.trim().length < 2) {
      setResults([]);
      setLoading(false);
      setActiveIndex(-1);
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && activeIndex >= 0) {
        const item = results[activeIndex];
        if (item) navigateToItem(item.id);
      } else if (e.key === "Escape") {
        close();
      }
    },
    [results, activeIndex, navigateToItem, close]
  );

  const showEmpty = !loading && query.trim().length >= 2 && results.length === 0;
  const showHint = !loading && query.trim().length < 2;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-h-[min(85vh,520px)] gap-0 overflow-hidden p-0 sm:max-w-lg"
        showCloseButton
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Search items</DialogTitle>
        </DialogHeader>

        {/* Search input */}
        <div className="flex items-center border-b border-white/10 px-3">
          {loading ? (
            <Loader2 className="mr-2 size-4 shrink-0 animate-spin text-muted-foreground" aria-hidden />
          ) : (
            <Search className="mr-2 size-4 shrink-0 text-muted-foreground" aria-hidden />
          )}
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleKeyDown}
            placeholder="Search items by title or description…"
            className="flex h-11 w-full bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            aria-label="Search query"
            aria-autocomplete="list"
            aria-activedescendant={activeIndex >= 0 ? `search-result-${activeIndex}` : undefined}
          />
        </div>

        {/* Results */}
        <div className="max-h-[min(40vh,320px)] overflow-y-auto p-2" role="listbox" aria-label="Search results">
          {showHint && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Type at least 2 characters
            </p>
          )}
          {showEmpty && (
            <p className="py-8 text-center text-sm text-muted-foreground">No items found</p>
          )}
          {!loading && results.length > 0 && (
            <>
              <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Items</p>
              {results.map((item, idx) => (
                <button
                  key={item.id}
                  id={`search-result-${idx}`}
                  type="button"
                  role="option"
                  aria-selected={activeIndex === idx}
                  onClick={() => navigateToItem(item.id)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm outline-none transition-colors",
                    activeIndex === idx
                      ? "bg-muted/80 text-foreground"
                      : "text-foreground/80 hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <TypeIcon typeId={item.typeId} itemTypes={itemTypes} />
                  <span className="min-w-0 flex-1 truncate font-medium">{item.title}</span>
                </button>
              ))}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
