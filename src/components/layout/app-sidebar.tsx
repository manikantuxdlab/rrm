import * as React from "react"
import { useNavigate } from "react-router-dom"

import { NavDocuments } from "./nav-documents"
import { NavMain, type NavMainItem } from "./nav-main"
import { NavUser } from "./nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboardIcon,
  ClipboardCheckIcon,
  Building2Icon,
  AwardIcon,
  BuildingIcon,
  UsersIcon,
  BellRingIcon,
  FileTextIcon,
} from "lucide-react"
import {
  SAFETY_MODULES,
  SAFETY_DOCUMENTS,
  CURRENT_USER,
} from "@/config/navigation"
import { siteConfig } from "@/config/site"

export interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onQuickCreate?: () => void
}

const moduleIconMap: Record<string, React.ReactNode> = {
  dashboard: <LayoutDashboardIcon className="size-4" />,
  companies: <BuildingIcon className="size-4" />,
  users: <UsersIcon className="size-4" />,
  routing: <BellRingIcon className="size-4" />,
  "safety-config": <ClipboardCheckIcon className="size-4" />,
  jobsites: <Building2Icon className="size-4" />,
  workforce: <AwardIcon className="size-4" />,
  submissions: <FileTextIcon className="size-4" />,
}

const documentIconMap: Record<string, React.ReactNode> = {
  "Compliance Reports": <FileTextIcon className="size-4" />,
}

export function AppSidebar({
  onQuickCreate,
  ...props
}: AppSidebarProps) {
  const navigate = useNavigate()

  const navMainItems: NavMainItem[] = React.useMemo(() => {
    return SAFETY_MODULES.map((m) => ({
      key: m.key,
      title: m.title,
      url: m.url,
      badge: m.badge,
      icon: moduleIconMap[m.key] || <LayoutDashboardIcon className="size-4" />,
    }))
  }, [])

  const navDocumentItems = React.useMemo(() => {
    return SAFETY_DOCUMENTS.map((d) => ({
      name: d.name,
      url: d.url,
      icon: documentIconMap[d.name] || <FileTextIcon className="size-4" />,
    }))
  }, [])

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5! cursor-pointer h-auto py-2"
              onClick={() => navigate("/dashboard")}
            >
              <div className="flex items-center">
                <img
                  src="/logo.png"
                  alt={siteConfig.name}
                  className="h-7 w-auto object-contain shrink-0"
                />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain
          items={navMainItems}
          onQuickCreate={onQuickCreate}
        />
        {navDocumentItems.length > 0 && (
          <NavDocuments
            items={navDocumentItems}
          />
        )}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={CURRENT_USER} />
      </SidebarFooter>
    </Sidebar>
  )
}
