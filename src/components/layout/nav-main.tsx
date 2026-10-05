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
  url?: string
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

  const checkIsActive = (item: NavMainItem) => {
    const targetPath = item.url || `/${item.key}`
    if (location.pathname === targetPath || location.pathname.startsWith(`${targetPath}/`)) {
      return true
    }
    if (item.key === "dashboard" && (location.pathname === "/" || location.pathname === "/dashboard")) {
      return true
    }
    if (item.key === "companies" && location.pathname === "/users") {
      return true
    }
    if (
      item.key === "safety-config" &&
      (location.pathname === "/checklists" ||
        location.pathname === "/toolbox" ||
        location.pathname === "/jha")
    ) {
      return true
    }
    if (
      item.key === "submissions" &&
      (location.pathname === "/incidents" ||
        location.pathname === "/coi" ||
        location.pathname === "/fleet")
    ) {
      return true
    }
    return false
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu className="gap-1">
          {items.map((item) => {
            const targetPath = item.url || `/${item.key}`
            const isActive = checkIsActive(item)

            return (
              <SidebarMenuItem key={item.key}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isActive}
                  onClick={() => navigate(targetPath)}
                  className={`cursor-pointer transition-colors text-sm ${
                    isActive
                      ? "bg-primary! text-primary-foreground! font-semibold shadow-xs hover:bg-primary! hover:text-primary-foreground! [&_svg]:text-primary-foreground!"
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
