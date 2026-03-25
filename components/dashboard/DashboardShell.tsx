"use client";

import { useState } from "react";
import { PanelLeft } from "lucide-react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { TopBar } from "@/components/dashboard/TopBar";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

export function DashboardShell({ children, sidebar }: DashboardShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar onToggleMobileSidebar={() => setMobileMenuOpen(true)} />
      <div className="flex flex-1">
        <aside
          className={cn(
            "hidden shrink-0 flex-col border-r border-border bg-sidebar transition-[width] duration-200 md:flex",
            sidebarCollapsed ? "w-14" : "w-64"
          )}
        >
          {sidebarCollapsed ? (
            <div className="flex flex-col items-center py-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(false)}
                aria-label="Expand sidebar"
              >
                <PanelLeft className="size-4" />
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-end border-b border-border p-2">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setSidebarCollapsed(true)}
                  aria-label="Collapse sidebar"
                >
                  <PanelLeft className="size-4 rotate-180" />
                </Button>
              </div>
              <div className="flex-1 overflow-auto">
                {sidebar}
              </div>
            </>
          )}
        </aside>

        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent
            side="left"
            className="w-64 p-0"
            showCloseButton={true}
          >
            <div className="flex h-full flex-col pt-12">
              {sidebar}
            </div>
          </SheetContent>
        </Sheet>

        <main className="min-w-0 flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
