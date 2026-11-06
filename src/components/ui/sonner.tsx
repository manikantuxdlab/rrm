import { useTheme } from "@/components/providers"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import {
  CheckCircle2,
  Info,
  AlertTriangle,
  XCircle,
  Loader2,
} from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      icons={{
        success: <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />,
        info: <Info className="size-4 text-sky-600 dark:text-sky-400 shrink-0" />,
        warning: <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />,
        error: <XCircle className="size-4 text-rose-600 dark:text-rose-400 shrink-0" />,
        loading: <Loader2 className="size-4 animate-spin text-primary shrink-0" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast flex items-center gap-3 px-4 py-3 sm:min-w-[340px] max-w-md rounded-2xl border border-border/80 bg-background/95 backdrop-blur-md text-foreground shadow-lg shadow-black/5 dark:shadow-black/25 text-xs font-medium transition-all",
          title: "font-semibold text-xs leading-snug",
          description: "text-muted-foreground text-[11px] font-normal mt-0.5",
          actionButton:
            "bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-primary/90 transition-colors",
          cancelButton:
            "bg-muted text-muted-foreground text-xs font-medium px-3 py-1.5 rounded-xl hover:bg-muted/80 transition-colors",
          closeButton:
            "!border !border-border/60 !bg-background/90 !text-muted-foreground hover:!text-foreground !rounded-full !size-5 !p-0 !flex !items-center !justify-center transition-colors shadow-2xs",
          success:
            "!bg-emerald-500/10 !text-emerald-950 dark:!text-emerald-100 !border-emerald-500/30",
          error:
            "!bg-rose-500/10 !text-rose-950 dark:!text-rose-100 !border-rose-500/30",
          warning:
            "!bg-amber-500/10 !text-amber-950 dark:!text-amber-100 !border-amber-500/30",
          info:
            "!bg-sky-500/10 !text-sky-950 dark:!text-sky-100 !border-sky-500/30",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
