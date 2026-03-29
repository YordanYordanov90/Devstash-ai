"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

interface SidebarNavLinkProps {
  href: string;
  className?: string;
  activeClassName?: string;
  exact?: boolean;
  children: React.ReactNode;
}

function normalizePath(path: string): string {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

export function SidebarNavLink({
  href,
  className,
  activeClassName = "bg-sidebar-accent text-sidebar-accent-foreground",
  exact = true,
  children,
}: SidebarNavLinkProps) {
  const pathname = usePathname();
  const current = normalizePath(pathname ?? "");
  const target = normalizePath(href);
  const isActive = exact ? current === target : current.startsWith(target);

  return (
    <Link href={href} className={cn(className, isActive && activeClassName)} aria-current={isActive ? "page" : undefined}>
      {children}
    </Link>
  );
}

