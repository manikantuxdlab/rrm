import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, Loader2, ArrowRight, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context"
import { supabase } from "@/lib/supabase"

export function LoginPage({ onLoginSuccess }: { onLoginSuccess?: () => void }) {
  const navigate = useNavigate()
  const { signIn, user } = useAuth()

  const [email, setEmail] = React.useState("admin@gmail.com")
  const [password, setPassword] = React.useState("Test@123")
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [authMode, setAuthMode] = React.useState<"login" | "forgot">("login")
  const [feedbackMessage, setFeedbackMessage] = React.useState<string | null>(null)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  // Redirect if already authenticated
  React.useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true })
    }
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setFeedbackMessage(null)
    setErrorMessage(null)

    if (authMode === "forgot") {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase())
        if (error) {
          setErrorMessage(error.message)
        } else {
          setFeedbackMessage("Password reset instructions have been dispatched to your email.")
        }
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : "Failed to send reset link.")
      } finally {
        setIsLoading(false)
      }
      return
    }

    try {
      const { error } = await signIn(email, password)
      if (error) {
        setErrorMessage(error.message || "Invalid credentials. Please verify your email and password.")
      } else {
        if (onLoginSuccess) onLoginSuccess()
        navigate("/dashboard", { replace: true })
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Authentication failed.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-background select-none">
      {/* Left Column: Login / Auth Form */}
      <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-14 min-h-screen overflow-y-auto">
        <div className="w-full max-w-sm mx-auto my-auto py-8">
          {/* Company Brand Logo from public directory */}
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="p-3 rounded-lg bg-card/50 transition-transform hover:scale-105 duration-200">
              <img
                src="/logo.png"
                alt="RRRM Logo"
                className="h-16 w-auto max-w-[180px] object-contain"
              />
            </div>
          </div>

          {/* Form Header */}
          <div className="text-center space-y-1.5 mb-6">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ff4e00]/10 text-[#ff4e00] text-[11px] font-semibold mb-1">
              <ShieldCheck className="size-3.5" />
              <span>Super Admin Portal</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#ff4e00]">
              {authMode === "login" && "Login to your account"}
              {authMode === "forgot" && "Reset your password"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {authMode === "login" && "Enter your Super Admin credentials below to login"}
              {authMode === "forgot" && "Enter your registered email to receive recovery instructions"}
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2 animate-in fade-in duration-200">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {feedbackMessage && (
            <div className="mb-6 p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{feedbackMessage}</span>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Email
              </label>
              <Input
                type="email"
                required
                placeholder="admin@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errorMessage) setErrorMessage(null)
                }}
                className="h-10 text-xs border-input bg-background focus-visible:ring-[#ff4e00]"
              />
            </div>

            {authMode === "login" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setFeedbackMessage(null)
                      setErrorMessage(null)
                      setAuthMode("forgot")
                    }}
                    className="text-xs font-medium text-[#ff4e00] hover:underline cursor-pointer"
                  >
                    Forgot your password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (errorMessage) setErrorMessage(null)
                    }}
                    className="h-10 pr-9 text-xs border-input bg-background focus-visible:ring-[#ff4e00]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-[#ff4e00] hover:bg-[#e04500] text-white font-semibold text-xs tracking-wide shadow-sm transition-all duration-200 mt-2 cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  <span>Authenticating with Supabase...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1.5">
                  <span>
                    {authMode === "login" && "Login as Super Admin"}
                    {authMode === "forgot" && "Send Reset Link"}
                  </span>
                  <ArrowRight className="size-3.5" />
                </div>
              )}
            </Button>
          </form>

          {/* Alternate Mode Navigation */}
          {authMode === "forgot" && (
            <div className="mt-6 text-center text-xs text-muted-foreground">
              <p>
                Remembered your password?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setFeedbackMessage(null)
                    setErrorMessage(null)
                    setAuthMode("login")
                  }}
                  className="font-semibold text-[#ff4e00] hover:underline cursor-pointer"
                >
                  Back to login
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="w-full text-center text-[10px] text-muted-foreground pt-4">
          © {new Date().getFullYear()} RRRM Safety Compliance Systems • OSHA 1926 Certified
        </div>
      </div>

      {/* Right Column: High Resolution Construction Hero Image */}
      <div className="hidden lg:relative lg:flex flex-col justify-end overflow-hidden bg-zinc-900 border-l border-border">
        <img
          src="/login-hero.jpg"
          alt="Jobsite Construction Engineers"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        {/* Subtle gradient vignette to blend seamlessly */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        
        {/* Bottom Hero Caption */}
        <div className="relative z-10 p-10 text-white space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#ff4e00]/90 text-white text-[11px] font-bold tracking-wide uppercase">
            Field Compliance 2.0
          </div>
          <h2 className="text-xl font-bold leading-tight drop-shadow-sm">
            Empowering Jobsite Foremen & Heavy Construction Safety
          </h2>
          <p className="text-xs text-white/80 max-w-lg leading-relaxed">
            Real-time hazard mitigation, automated OSHA 300 logs, and certified trade compliance monitoring across high-risk jobsites.
          </p>
        </div>
      </div>
    </div>
  )
}
