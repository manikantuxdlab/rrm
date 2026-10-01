import * as React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { CirclePlusIcon, MailIcon } from "lucide-react"

export interface NavMainItem {
  key: string
  title: string
  icon?: React.ReactNode
  badge?: string | number
}

export function NavMain({
  items,
  onQuickCreate,
}: {
  items: NavMainItem[]
  onQuickCreate?: () => void
}) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Dispatch Safety Alert"
              onClick={onQuickCreate}
              className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground cursor-pointer"
            >
              <CirclePlusIcon />
              <span>Quick Create</span>
            </SidebarMenuButton>
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0 cursor-pointer"
              variant="outline"
              onClick={onQuickCreate}
            >
              <MailIcon />
              <span className="sr-only">Inbox</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
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
                  className={`cursor-pointer ${
                    isActive
                      ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15"
                      : ""
                  }`}
                >
                  {item.icon}
                  <span>{item.title}</span>
                  {item.badge ? (
                    <Badge
                      variant="outline"
                      className="ml-auto text-[10px] px-1.5 py-0 h-4 bg-muted border-border font-mono group-data-[collapsible=icon]:hidden"
                    >
                      {item.badge}
                    </Badge>
                  ) : null}
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
