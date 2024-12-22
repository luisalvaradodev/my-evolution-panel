import { Home, PlusCircle, List, Settings, User } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";


// Configuración de las rutas del sidebar
const menuItems = [
  {
    title: "Inicio",
    url: "/",
    icon: Home,
  },
  {
    title: "Registro",
    url: "/register",
    icon: User,
  },
  {
    title: "Configuración",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        {/* Grupo de navegación principal */}
        <SidebarGroup>
          <SidebarGroupLabel>Menú</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.url}
                      className="flex items-center space-x-2 text-sm font-medium"
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
