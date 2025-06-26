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

const PillIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-8 w-8 text-primary"
  >
    <path
      fillRule="evenodd"
      d="M11.025 2.293a2.25 2.25 0 0 1 1.95 0l6.75 4.125a2.25 2.25 0 0 1 1.125 1.95v8.25a2.25 2.25 0 0 1-1.125 1.95l-6.75 4.125a2.25 2.25 0 0 1-1.95 0l-6.75-4.125a2.25 2.25 0 0 1-1.125-1.95v-8.25a2.25 2.25 0 0 1 1.125-1.95l6.75-4.125ZM12 1.5a.75.75 0 0 1 .65.383l6.75 4.125a.75.75 0 0 1 .375.65v8.25a.75.75 0 0 1-.375.65l-6.75 4.125a.75.75 0 0 1-.65.383.75.75 0 0 1-.65-.383l-6.75-4.125a.75.75 0 0 1-.375-.65v-8.25a.75.75 0 0 1 .375-.65l6.75-4.125A.75.75 0 0 1 12 1.5Z"
      clipRule="evenodd"
    />
  </svg>
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
            <PillIcon />
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
