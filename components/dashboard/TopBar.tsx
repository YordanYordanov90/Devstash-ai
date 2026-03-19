"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus,  FolderPlus } from "lucide-react";
import { UserButton } from "@neondatabase/auth/react/ui";



export function TopBar({   }) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-background px-4">
      <div className="flex flex-1 items-center gap-2 md:gap-4">
        
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search items..."
            className="pl-9 pr-16 bg-muted/50 border-0"
            readOnly
            aria-label="Search items"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 select-none items-center gap-0.5 rounded bg-background px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground md:inline-flex border border-border">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-1.5">
          <FolderPlus className="size-4" />
          New Collection
        </Button>
        <Button size="sm" className="gap-1.5 bg-primary hover:bg-primary/90">
          <Plus className="size-4" />
          New Item
        </Button>
        <div className="ml-2">
          <UserButton size='icon' />
        </div>
      </div>
    </header>
  );
}
