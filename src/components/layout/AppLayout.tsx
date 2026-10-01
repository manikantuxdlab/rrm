import * as React from "react"
import { useLocation } from "react-router-dom"
import { AppSidebar } from "./app-sidebar"
import { SiteHeader } from "./site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { SAFETY_MODULES } from "@/config/navigation"

interface AppLayoutProps {
  children: React.ReactNode
  onDispatchAlert?: () => void
}

const DOCUMENT_PAGE_METAS: Record<string, { title: string; description: string }> = {
  "/osha-300": {
    title: "OSHA 300 Log",
    description: "Log of Work-Related Injuries and Illnesses (Form OSHA 300 / 300A Summary)",
  },
  "/compliance-reports": {
    title: "Compliance Reports",
    description: "Monthly & Annual Safety Performance, Audit Scorecard & Insurance Broker Submissions",
  },
  "/osha-1926": {
    title: "OSHA 1926 Library",
    description: "Federal OSHA 29 CFR 1926 Construction Safety Regulations & Standards Codebook",
  },
}

export function AppLayout({ children, onDispatchAlert }: AppLayoutProps) {
  const location = useLocation()

  const currentModule = React.useMemo(() => {
    const mainMod = SAFETY_MODULES.find((m) => m.url === location.pathname)
    if (mainMod) return mainMod

    if (DOCUMENT_PAGE_METAS[location.pathname]) {
      return DOCUMENT_PAGE_METAS[location.pathname]
    }

    return SAFETY_MODULES[0]
  }, [location.pathname])

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        variant="inset"
        onQuickCreate={onDispatchAlert}
      />
      <SidebarInset>
        <SiteHeader
          title={currentModule.title}
          subtitle={currentModule.description}
          onDispatchAlert={onDispatchAlert}
        />
        <main className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 lg:p-6">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
