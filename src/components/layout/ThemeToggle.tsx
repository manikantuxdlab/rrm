import * as React from "react"
import { Moon, Sun, Monitor, Check } from "lucide-react"
import { useTheme } from "@/components/providers"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ThemeToggleProps {
  className?: string
  align?: "start" | "center" | "end"
}

export function ThemeToggle({ className, align = "end" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="size-8 rounded-lg border border-border/40 text-muted-foreground"
        disabled
      >
        <Sun className="size-4" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`relative size-8 rounded-lg border border-border/40 hover:bg-muted hover:text-foreground transition-colors cursor-pointer ${className || ""}`}
              aria-label="Toggle theme"
            >
              <Sun className="size-4 rotate-0 scale-100 transition-transform duration-300 dark:-rotate-90 dark:scale-0 text-amber-500" />
              <Moon className="absolute size-4 rotate-90 scale-0 transition-transform duration-300 dark:rotate-0 dark:scale-100 text-sky-400" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="center" className="text-xs">
          Toggle theme (Press <kbd className="px-1 py-0.5 rounded bg-muted font-mono text-[10px]">D</kbd>)
        </TooltipContent>
      </Tooltip>

      <DropdownMenuContent align={align} className="min-w-36 rounded-lg p-1">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs font-medium cursor-pointer"
        >
          <span className="flex items-center gap-2 text-foreground">
            <Sun className="size-3.5 text-amber-500" />
            <span>Light</span>
          </span>
          {theme === "light" && <Check className="size-3.5 text-primary" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs font-medium cursor-pointer"
        >
          <span className="flex items-center gap-2 text-foreground">
            <Moon className="size-3.5 text-sky-400" />
            <span>Dark</span>
          </span>
          {theme === "dark" && <Check className="size-3.5 text-primary" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs font-medium cursor-pointer"
        >
          <span className="flex items-center gap-2 text-foreground">
            <Monitor className="size-3.5 text-muted-foreground" />
            <span>System</span>
          </span>
          {theme === "system" && <Check className="size-3.5 text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
