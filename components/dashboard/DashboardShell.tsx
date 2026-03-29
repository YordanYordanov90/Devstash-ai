"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { TopBar } from "@/components/dashboard/TopBar";
import { ToastFlash } from "@/components/dashboard/ToastFlash";
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
      <ToastFlash />
      <TopBar
        onToggleMobileSidebar={() => setMobileMenuOpen(true)}
        onToggleSidebarCollapse={() => setSidebarCollapsed((prev) => !prev)}
        isSidebarCollapsed={sidebarCollapsed}
      />
      <div className="flex flex-1">
        <aside
          className={cn(
            "hidden shrink-0 flex-col border-r border-white/10 bg-sidebar transition-[width] duration-200 md:flex",
            sidebarCollapsed ? "w-14" : "w-64"
          )}
        >
          <div className="flex-1 overflow-auto">{sidebar}</div>
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
