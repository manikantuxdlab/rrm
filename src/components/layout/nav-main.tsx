import * as React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export interface NavMainItem {
  key: string
  title: string
  icon?: React.ReactNode
  badge?: string | number
}

export function NavMain({
  items,
}: {
  items: NavMainItem[]
  onQuickCreate?: () => void
}) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu className="gap-1">
          {items.map((item) => {
            const targetPath = `/${item.key}`
            const isActive =
              location.pathname === targetPath ||
              (item.key === "dashboard" && location.pathname === "/")

            return (
              <SidebarMenuItem key={item.key}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isActive}
                  onClick={() => navigate(targetPath)}
                  className={`cursor-pointer transition-all duration-150 ${
                    isActive
                      ? "bg-[#ff4e00]! text-white! font-semibold shadow-xs hover:bg-[#ff4e00]! hover:text-white! [&_svg]:text-white!"
                      : "hover:bg-muted/70 text-sidebar-foreground"
                  }`}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
