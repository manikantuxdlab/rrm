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

export function AppLayout({ children, onDispatchAlert }: AppLayoutProps) {
  const location = useLocation()

  const currentModule = React.useMemo(() => {
    const mainMod = SAFETY_MODULES.find((m) => m.url === location.pathname)
    if (mainMod) return mainMod

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
