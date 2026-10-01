import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

interface SiteHeaderProps {
  title?: string
  subtitle?: string
  onDispatchAlert?: () => void
}

export function SiteHeader({
  title = "Dashboard",
  subtitle = "Executive Compliance Overview",
  onDispatchAlert,
}: SiteHeaderProps) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) bg-background/95 backdrop-blur-xs sticky top-0 z-10">
      <div className="flex w-full items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-foreground">{title}</h1>
              <Badge variant="outline" className="text-[10px] hidden sm:inline-flex text-emerald-600 border-emerald-500/20 bg-emerald-500/10">
                Live Field Sync
              </Badge>
            </div>
            {subtitle && (
              <p className="text-[11px] text-muted-foreground hidden md:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onDispatchAlert}
            className="text-xs h-8 gap-1.5 font-medium border-border"
          >
            <Send className="size-3 text-primary" />
            <span className="hidden sm:inline">Dispatch Alert</span>
          </Button>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-semibold">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">OSHA Safe</span>
          </div>
        </div>
      </div>
    </header>
  )
}
