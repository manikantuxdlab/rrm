import * as React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context"
import { Loader2 } from "lucide-react"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground space-y-4">
        <div className="p-3 rounded-lg bg-card/50">
          <img
            src="/logo.png"
            alt="RRRM Logo"
            className="h-12 w-auto max-w-[160px] object-contain animate-pulse"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-[#ff4e00]" />
          <span>Verifying authentication session...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
