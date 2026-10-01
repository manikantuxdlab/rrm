import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MOCK_SUBMISSIONS } from "@/data/safetyMockData"
import type { SubmissionRecord } from "@/types"
import {
  AlertTriangle,
  User,
  Eye,
  FileSpreadsheet,
  HeartPulse,
  Send,
} from "lucide-react"

export function IncidentsClaimsView({
  onSelectSubmission,
  onOpenDispatch,
}: {
  onSelectSubmission: (submission: SubmissionRecord) => void
  onOpenDispatch: () => void
}) {
  const [activeTab, setActiveTab] = React.useState<"all" | "claim_alert" | "near_miss">("all")

  const incidentRecords = MOCK_SUBMISSIONS.filter(
    (s) => s.moduleType === "claim_alert" || s.moduleType === "near_miss"
  )

  const filteredRecords = React.useMemo(() => {
    if (activeTab === "all") return incidentRecords
    return incidentRecords.filter((r) => r.moduleType === activeTab)
  }, [activeTab, incidentRecords])

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="size-6 text-destructive" />
            Incidents, Claims & Near-Miss Hazard Portal
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time Cal/OSHA first report of injury (Form 5020/OSHA 301) & proactive hazard notification tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={onOpenDispatch}
            className="text-xs font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send className="size-3.5" />
            Dispatch Safety Alert
          </Button>
          <Button size="sm" variant="outline" className="text-xs gap-1.5">
            <FileSpreadsheet className="size-3.5" />
            Export OSHA 300 Log
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>OSHA Recordable Injuries</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600">0 Recordables</CardTitle>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            Zero lost-time or DART days YTD
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>First-Aid Only Reports</CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-600">1 Logged</CardTitle>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            Minor scrape; treated at on-site kit
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Near-Miss Proactive Alerts</CardDescription>
            <CardTitle className="text-2xl font-bold text-primary">1 Actioned</CardTitle>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            Corrective double taglines instituted
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg. Triage & Dispatch Speed</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600">&lt; 2 Minutes</CardTitle>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            Instant email routing to underwriter & boss
          </CardFooter>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-lg border border-border bg-muted p-1 text-xs">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              activeTab === "all"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Incident Activity ({incidentRecords.length})
          </button>
          <button
            onClick={() => setActiveTab("claim_alert")}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              activeTab === "claim_alert"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            First Reports of Injury
          </button>
          <button
            onClick={() => setActiveTab("near_miss")}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              activeTab === "near_miss"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Near-Miss Hazard Reports
          </button>
        </div>
      </div>

      {/* Records Feed */}
      <div className="space-y-4">
        {filteredRecords.map((sub) => {
          const isClaim = sub.moduleType === "claim_alert"

          return (
            <Card
              key={sub.id}
              className={`transition-colors cursor-pointer ${
                isClaim ? "border-destructive/30 hover:border-destructive/60" : "hover:border-primary/40"
              }`}
              onClick={() => onSelectSubmission(sub)}
            >
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {sub.id}
                      </Badge>
                      {isClaim ? (
                        <Badge variant="destructive" className="text-[10px] flex items-center gap-1 uppercase">
                          <HeartPulse className="size-3" />
                          First Report of Injury
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/10 text-[10px] uppercase">
                          Near Miss Hazard
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-base font-bold text-foreground">
                      {sub.title}
                    </CardTitle>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-foreground">{sub.timestamp}</div>
                    <div className="text-[11px] text-muted-foreground">Lead: {sub.foremanName}</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-muted/40">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Contractor & Site:</span>
                    <span className="font-semibold text-foreground">{sub.companyName}</span>
                    <div className="text-[11px] text-muted-foreground">{sub.jobSiteName}</div>
                  </div>

                  {isClaim ? (
                    <>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Injured Worker:</span>
                        <span className="font-semibold text-foreground flex items-center gap-1">
                          <User className="size-3 text-primary" />
                          {sub.data.injuredWorker}
                        </span>
                        <div className="text-[11px] text-muted-foreground">
                          Affected: {sub.data.bodyPart} ({sub.data.incidentType})
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Lost-Time Status:</span>
                        <span className="font-semibold text-emerald-600">
                          {sub.data.lostTime}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="sm:col-span-2">
                        <span className="text-muted-foreground block text-[11px]">Hazard Identified:</span>
                        <span className="font-semibold text-foreground">{sub.data.hazardIdentified}</span>
                      </div>
                    </>
                  )}
                </div>

                {isClaim && (
                  <div className="p-3 rounded-xl bg-muted/20 border border-border text-xs space-y-1">
                    <span className="font-semibold text-foreground">Immediate Medical & Site Triage:</span>
                    <p className="text-muted-foreground leading-relaxed">
                      {sub.data.immediateAction}
                    </p>
                  </div>
                )}

                {!isClaim && sub.data.correctiveActionTaken && (
                  <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs space-y-1">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                      Immediate Hazard Abatement & Corrective Rule:
                    </span>
                    <p className="text-muted-foreground leading-relaxed">
                      {sub.data.correctiveActionTaken}
                    </p>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex items-center justify-between border-t border-border/60 pt-3">
                <span className="text-xs text-muted-foreground">
                  Underwriter Notified: {sub.recipients.join(", ")}
                </span>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                  <Eye className="size-3" />
                  View Signed Incident Form
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
