"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Pill,
  BarChart3,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

const HRIcon = () => (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
        <span className="font-bold text-sm text-primary-foreground">HR</span>
    </div>
);


export function SiteSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: "/", label: "Painel", icon: LayoutDashboard },
    { href: "/medications", label: "Medicamentos", icon: Pill },
    { href: "/reports", label: "Relatórios", icon: BarChart3 },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <HRIcon />
            <h1 className="text-xl font-headline font-bold">Hora do Remédio</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href} passHref>
                <SidebarMenuButton
                  className="font-semibold"
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <item.icon className="size-5" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="flex items-center justify-between p-2 group-data-[collapsible=icon]:justify-center">
        <div className="text-xs text-muted-foreground text-center group-data-[collapsible=icon]:hidden">
            <p>&copy; {new Date().getFullYear()}</p>
        </div>
        <ThemeToggle />
      </SidebarFooter>
    </Sidebar>
  );
}
