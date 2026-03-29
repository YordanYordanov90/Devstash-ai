"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, FolderPlus, PanelLeft } from "lucide-react";
import { UserButton } from "@neondatabase/auth/react/ui";
import { CollectionDialog } from "./CollectionDialog";
import { CreateItemDialog } from "./CreateItemDialog";
import { ItemSearchPalette } from "./ItemSearchPalette";

function readShortcutLabel(): string {
  if (typeof navigator === "undefined") return "Ctrl+K";
  return /Mac|iPhone|iPod|iPad/i.test(navigator.platform || navigator.userAgent)
    ? "⌘K"
    : "Ctrl+K";
}

interface TopBarProps {
  onToggleMobileSidebar?: () => void;
  onToggleSidebarCollapse?: () => void;
  isSidebarCollapsed?: boolean;
}

export function TopBar({
  onToggleMobileSidebar,
  onToggleSidebarCollapse,
  isSidebarCollapsed = false,
}: TopBarProps) {
  const shortcutLabel = useSyncExternalStore(() => () => {}, readShortcutLabel, () => "Ctrl+K");
  const [searchOpen, setSearchOpen] = useState(false);
  const [isCollectionDialogOpen, setIsCollectionDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-white/10 bg-background/80 px-4 backdrop-blur-xl">
      <div className="flex flex-1 items-center gap-2 md:gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open sidebar menu"
          onClick={onToggleMobileSidebar}
        >
          <PanelLeft className="size-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hidden md:inline-flex"
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={onToggleSidebarCollapse}
        >
          <PanelLeft className={isSidebarCollapsed ? "size-4" : "size-4 rotate-180"} />
        </Button>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search items..."
            className="cursor-pointer pl-9 pr-16 bg-muted/30 border-white/10 focus-visible:border-white/15"
            readOnly
            aria-label="Search items"
            onClick={() => setSearchOpen(true)}
            onFocus={(e) => {
              e.target.blur();
              setSearchOpen(true);
            }}
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 select-none items-center gap-0.5 rounded bg-background/70 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground md:inline-flex border border-white/10 backdrop-blur">
            {shortcutLabel}
          </kbd>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => setIsCollectionDialogOpen(true)}
        >
          <FolderPlus className="size-4" />
          New Collection
        </Button>
        <Button
          type="button"
          size="sm"
          className="gap-1.5 bg-primary hover:bg-primary/90"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="size-4" />
          New Item
        </Button>
        <div className="ml-2">
          <UserButton size='icon' />
        </div>
      </div>
      <CollectionDialog
        open={isCollectionDialogOpen}
        onOpenChange={setIsCollectionDialogOpen}
      />
      <CreateItemDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
      <ItemSearchPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
