import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

interface SiteHeaderProps {
  title?: string
  subtitle?: string
  onDispatchAlert?: () => void
}

export function SiteHeader({
  title = "Overview Dashboard",
}: SiteHeaderProps) {
  return (
    <header className="flex h-12 shrink-0 items-center border-b bg-background/95 backdrop-blur-xs sticky top-0 z-10">
      <div className="flex w-full items-center px-4 lg:px-6 gap-3">
        <SidebarTrigger className="-ml-1 size-7 text-muted-foreground hover:text-foreground" />
        <Separator
          orientation="vertical"
          className="h-4 bg-border"
        />
        <h1 className="text-sm font-semibold text-foreground tracking-tight">
          {title}
        </h1>
      </div>
    </header>
  )
}
