"use client"

import * as React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { MoreHorizontalIcon, FolderIcon, ShareIcon } from "lucide-react"

export function NavDocuments({
  items,
}: {
  items: {
    name: string
    url: string
    icon: React.ReactNode
  }[]
  onSelectDocument?: (name: string) => void
}) {
  const { isMobile } = useSidebar()
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Documents & Compliance</SidebarGroupLabel>
      <SidebarMenu className="gap-1">
        {items.map((item) => {
          const isActive = location.pathname === item.url

          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                isActive={isActive}
                onClick={() => navigate(item.url)}
                className={`cursor-pointer transition-all duration-150 ${
                  isActive
                    ? "bg-[#ff4e00]! text-white! font-semibold shadow-xs hover:bg-[#ff4e00]! hover:text-white! [&_svg]:text-white!"
                    : "hover:bg-muted/70 text-sidebar-foreground"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction
                    showOnHover
                    className="rounded-sm data-[state=open]:bg-accent cursor-pointer"
                  >
                    <MoreHorizontalIcon />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-28 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem
                    onClick={() => navigate(item.url)}
                    className="cursor-pointer text-xs"
                  >
                    <FolderIcon className="size-3.5 mr-1" />
                    <span>View Record</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.origin + item.url)
                      alert(`Shareable link for ${item.name} copied to clipboard!`)
                    }}
                    className="cursor-pointer text-xs"
                  >
                    <ShareIcon className="size-3.5 mr-1" />
                    <span>Share</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

