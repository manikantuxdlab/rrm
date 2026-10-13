import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "./ThemeToggle"

interface SiteHeaderProps {
  title?: string
  subtitle?: string
  onDispatchAlert?: () => void
}

export function SiteHeader({
  title = "Overview Dashboard",
}: SiteHeaderProps) {
  return (
    <header className="flex h-12 shrink-0 items-center border-b bg-background/95 backdrop-blur-xs sticky top-0 z-10 transition-colors">
      <div className="flex w-full items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="-ml-1 size-7 text-muted-foreground hover:text-foreground cursor-pointer" />
          <Separator
            orientation="vertical"
            className="h-4 bg-border"
          />
          <h1 className="text-sm font-semibold text-foreground tracking-tight">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
