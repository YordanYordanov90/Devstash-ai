import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SidebarContent } from "@/components/dashboard/SidebarContent";

export default function ItemsLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell sidebar={<SidebarContent />}>{children}</DashboardShell>;
}

