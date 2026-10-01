import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

interface SiteHeaderProps {
  title?: string
  subtitle?: string
  onDispatchAlert?: () => void
}

export function SiteHeader({
  title = "Dashboard",
  subtitle = "Executive Compliance Overview",
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
            <h1 className="text-base font-bold tracking-tight text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-[11px] text-muted-foreground hidden md:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
