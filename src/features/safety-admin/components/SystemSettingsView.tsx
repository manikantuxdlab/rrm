import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toolboxAdminService } from "@/services"
import {
  Settings2,
  Calendar,
  Lock,
  Save,
  Loader2,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react"

export function SystemSettingsView() {
  const [activeTab, setActiveTab] = React.useState<"toolbox" | "routing">("toolbox")
  
  // Toolbox Schedule & Lock Config State
  const [scheduleConfig, setScheduleConfig] = React.useState<{
    scheduleDay: string
    enforceDayOfWeek: boolean
    oneTalkPerWeek: boolean
  }>({
    scheduleDay: "Friday",
    enforceDayOfWeek: true,
    oneTalkPerWeek: true,
  })
  const [isLoading, setIsLoading] = React.useState<boolean>(true)
  const [isSaving, setIsSaving] = React.useState<boolean>(false)
  const [saveSuccess, setSaveSuccess] = React.useState<boolean>(false)

  React.useEffect(() => {
    let mounted = true
    async function loadConfig() {
      setIsLoading(true)
      try {
        const conf = await toolboxAdminService.fetchScheduleConfig()
        if (mounted) {
          setScheduleConfig(conf)
        }
      } catch (err) {
        console.error("[SystemSettingsView] Error loading settings:", err)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    loadConfig()
    return () => {
      mounted = false
    }
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    try {
      const ok = await toolboxAdminService.saveScheduleConfig(scheduleConfig)
      if (ok) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        alert("Failed to update settings. Please check connection.")
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Settings2 className="size-5" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              Safety & Compliance Settings
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Global policies, mobile attendance schedules, site locking rules & audit parameters
          </p>
        </div>

        {/* Top-Right Save Button */}
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold animate-in fade-in">
              <CheckCircle2 className="size-4" />
              Settings Synced to Mobile
            </span>
          )}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="text-xs h-9 px-4 rounded-xl bg-primary text-white font-bold gap-2 shadow-xs cursor-pointer"
          >
            {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
            Save System Settings
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-2">
        <button
          onClick={() => setActiveTab("toolbox")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === "toolbox"
              ? "bg-card text-foreground shadow-xs border border-border/80"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
          }`}
        >
          <Calendar className="size-3.5 text-primary" />
          Toolbox Schedule & Site Lock
        </button>
      </div>

      {isLoading ? (
        <div className="p-16 text-center space-y-3">
          <Loader2 className="size-8 animate-spin mx-auto text-primary" />
          <p className="text-sm font-semibold text-foreground">Loading compliance settings...</p>
        </div>
      ) : activeTab === "toolbox" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Controls Card */}
          <div className="md:col-span-2 space-y-6">
            <Card className="rounded-2xl border-border/80 shadow-xs">
              <CardHeader className="pb-3 border-b border-border/60">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Calendar className="size-4 text-primary" />
                  Weekly Briefing Day
                </CardTitle>
                <CardDescription className="text-xs">
                  Designate the standard day of the week when field foremen must conduct 15-minute safety talks.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {["Friday", "Monday", "Tuesday", "Wednesday", "Thursday", "Saturday", "Any"].map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setScheduleConfig((prev) => ({ ...prev, scheduleDay: day }))}
                      className={`py-3 px-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                        scheduleConfig.scheduleDay === day
                          ? "border-primary bg-primary/10 text-primary shadow-xs"
                          : "border-border/70 bg-card hover:bg-muted/40 text-foreground"
                      }`}
                    >
                      {day === "Any" ? "Any Day of Week" : `Every ${day}`}
                    </button>
                  ))}
                </div>
                <p className="text-[11.5px] text-muted-foreground">
                  Recommended industry practice: <b>Friday</b> mornings prior to weekly site closeout.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/80 shadow-xs">
              <CardHeader className="pb-3 border-b border-border/60">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Lock className="size-4 text-primary" />
                  Field Lockout & Attendance Protections
                </CardTitle>
                <CardDescription className="text-xs">
                  Automate compliance guardrails to prevent duplicate or unapproved submissions in the mobile app.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {/* 1. One Talk Per Week Lock */}
                <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-border/70 bg-muted/10">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-foreground">
                      1 Talk Per Week per Site Lock
                    </div>
                    <div className="text-[11px] text-muted-foreground leading-relaxed">
                      Once attendance is certified for an active jobsite, the mobile module automatically locks until the following week (Monday 00:00). Foremen can view the signed PDF but cannot re-submit.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={scheduleConfig.oneTalkPerWeek}
                    onChange={(e) =>
                      setScheduleConfig((prev) => ({
                        ...prev,
                        oneTalkPerWeek: e.target.checked,
                      }))
                    }
                    className="size-4.5 accent-primary cursor-pointer shrink-0 mt-0.5"
                  />
                </div>

                {/* 2. Strict Day Enforcement */}
                <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-border/70 bg-muted/10">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-foreground">
                      Enforce Scheduled Day Lock
                    </div>
                    <div className="text-[11px] text-muted-foreground leading-relaxed">
                      Strictly lock mobile attendance recording on all other days of the week except {scheduleConfig.scheduleDay}. Foremen receive an alert with next unlock timing.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={scheduleConfig.enforceDayOfWeek}
                    onChange={(e) =>
                      setScheduleConfig((prev) => ({
                        ...prev,
                        enforceDayOfWeek: e.target.checked,
                      }))
                    }
                    className="size-4.5 accent-primary cursor-pointer shrink-0 mt-0.5"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Information & Preview Card */}
          <div className="space-y-4">
            <Card className="rounded-2xl border-primary/30 bg-primary/5 p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="size-4 text-primary" />
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
                  Live Mobile Rules Preview
                </h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                These rules sync instantly to all connected foreman devices and enforce OSHA 29 CFR 1926 standards:
              </p>

              <div className="mt-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-primary/15">
                  <span className="text-muted-foreground">Briefing Day:</span>
                  <Badge variant="outline" className="font-bold border-primary/30">
                    {scheduleConfig.scheduleDay}
                  </Badge>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-primary/15">
                  <span className="text-muted-foreground">Duplicate Lock:</span>
                  <span className={`font-bold ${scheduleConfig.oneTalkPerWeek ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600"}`}>
                    {scheduleConfig.oneTalkPerWeek ? "Enabled (1/Week)" : "Disabled"}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-primary/15">
                  <span className="text-muted-foreground">Day Enforcement:</span>
                  <span className={`font-bold ${scheduleConfig.enforceDayOfWeek ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
                    {scheduleConfig.enforceDayOfWeek ? `Strict (${scheduleConfig.scheduleDay}s only)` : "Flexible"}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="rounded-2xl border-border/80 bg-card p-4 space-y-2 text-xs text-muted-foreground shadow-2xs">
              <div className="font-bold text-foreground">💡 How Site Locking Works:</div>
              <p className="leading-relaxed">
                When a foreman on Jobsite Alpha submits attendance, Supabase records the timestamp. The mobile app automatically detects this and marks Jobsite Alpha as <b>"Completed for this Week"</b>.
              </p>
              <p className="leading-relaxed">
                Switching to Jobsite Beta will immediately allow attendance if Jobsite Beta has not been covered yet.
              </p>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  )
}
