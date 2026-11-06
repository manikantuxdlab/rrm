import * as React from "react"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { submissionsService } from "@/services/submissionsService"
import { MOCK_SUBMISSIONS } from "@/data/safetyMockData"
import type { SubmissionRecord } from "@/types"
import {
  AlertTriangle,
  User,
  Eye,
  FileSpreadsheet,
  HeartPulse,
  Send,
  Search,
  Building,
  Clock,
  ShieldCheck,
  FileText,
  Loader2,
  RefreshCw,
  CheckCircle2,
  FileCheck2,
  Gavel,
  Camera,
} from "lucide-react"

export function IncidentsClaimsView({
  onSelectSubmission: _onSelectSubmission,
  onOpenDispatch,
}: {
  onSelectSubmission: (submission: SubmissionRecord) => void
  onOpenDispatch: () => void
}) {
  const [activeTab, setActiveTab] = React.useState<"all" | "claim_alert" | "near_miss">("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [records, setRecords] = React.useState<SubmissionRecord[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  // Side sheet detail modal
  const [selectedIncident, setSelectedIncident] = React.useState<SubmissionRecord | null>(null)

  // Fetch real-time submissions from Supabase with mock fallback
  const loadSubmissions = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const live = await submissionsService.fetchAll()
      const liveIncidentRecords = live.filter(
        (s) => s.moduleType === "claim_alert" || s.moduleType === "near_miss"
      )

      const mockIncidents = MOCK_SUBMISSIONS.filter(
        (s) => s.moduleType === "claim_alert" || s.moduleType === "near_miss"
      )

      const map = new Map<string, SubmissionRecord>()
      mockIncidents.forEach((item) => map.set(item.id, item))
      liveIncidentRecords.forEach((item) => map.set(item.id, item))

      setRecords(Array.from(map.values()))
    } catch (err) {
      console.warn("[IncidentsClaimsView] Error fetching incidents:", err)
      setRecords(
        MOCK_SUBMISSIONS.filter(
          (s) => s.moduleType === "claim_alert" || s.moduleType === "near_miss"
        )
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadSubmissions()
  }, [loadSubmissions])

  // Filtered list
  const filteredRecords = React.useMemo(() => {
    return records.filter((r) => {
      const isMatchingTab = activeTab === "all" ? true : r.moduleType === activeTab
      if (!isMatchingTab) return false

      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        r.title?.toLowerCase().includes(q) ||
        r.companyName?.toLowerCase().includes(q) ||
        r.jobSiteName?.toLowerCase().includes(q) ||
        r.foremanName?.toLowerCase().includes(q) ||
        r.data?.injuredWorker?.toLowerCase().includes(q) ||
        r.data?.claimType?.toLowerCase().includes(q) ||
        r.data?.otherParty?.name?.toLowerCase().includes(q)
      )
    })
  }, [records, activeTab, searchQuery])

  // Counts
  const claimsCount = records.filter((r) => r.moduleType === "claim_alert").length
  const nearMissCount = records.filter((r) => r.moduleType === "near_miss").length
  const wcCount = records.filter((r) => r.data?.claimType === "wc").length
  const urgentCount = records.filter(
    (r) => r.data?.mandatoryAffirmations?.emsOffered === true
  ).length

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] font-bold bg-destructive/10 text-destructive px-2 py-0.5 rounded-md">
              UNDERWRITER &amp; SAFETY OPERATIONS
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">
              Cal/OSHA First Notice of Loss (FNOL) Queue
            </span>
          </div>
          <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <AlertTriangle className="size-5 text-destructive" />
            Incidents, Claims &amp; Near-Miss Hazard Portal
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review incoming site incident reports, Cal/OSHA Form 5020 &amp; OSHA 301 filings, and coordinate carrier claim numbers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={loadSubmissions}
            className="text-xs h-8.5 gap-1.5 cursor-pointer"
            title="Reload live submissions"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={onOpenDispatch}
            className="text-xs h-8.5 font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
          >
            <Send className="size-3.5" />
            Dispatch Safety Alert
          </Button>

          <Button size="sm" variant="outline" className="text-xs h-8.5 gap-1.5 cursor-pointer">
            <FileSpreadsheet className="size-3.5" />
            Export OSHA 300 Log
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <Card className="shadow-none border-border">
          <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">
              FIRST REPORTS OF INJURY
            </span>
            <div className="size-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <HeartPulse className="size-3.5" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {claimsCount}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {wcCount} Workers' Comp active
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-border">
          <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              NEAR-MISS PROACTIVE
            </span>
            <div className="size-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="size-3.5" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {nearMissCount}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Preventative hazard notices
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-border">
          <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              EMS &amp; CLINIC TRIAGED
            </span>
            <div className="size-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="size-3.5" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {urgentCount}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Medical attention logged
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-border">
          <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-semibold text-primary">
              TRIAGE &amp; DISPATCH SPEED
            </span>
            <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Clock className="size-3.5" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold tracking-tight text-primary">
              &lt; 2 Minutes
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Instant carrier &amp; boss alert
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-muted/30 p-2.5 rounded-lg border border-border">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search incident, worker, contractor, site..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs bg-background"
          />
        </div>

        <div className="inline-flex rounded-lg border border-border bg-muted/60 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-background text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Incident Activity ({records.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("claim_alert")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeTab === "claim_alert"
                ? "bg-background text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            First Reports of Injury ({claimsCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("near_miss")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeTab === "near_miss"
                ? "bg-background text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Near-Miss Hazards ({nearMissCount})
          </button>
        </div>
      </div>

      {/* COMPACT CARD LISTING (Matching Clean SaaS Table & Card Standards) */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground space-y-2 border border-dashed rounded-xl">
            <Loader2 className="size-6 animate-spin mx-auto text-primary" />
            <p className="text-xs">Loading incident records &amp; triage queues...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground space-y-1.5 border border-dashed rounded-xl bg-card">
            <FileText className="size-8 mx-auto text-muted-foreground opacity-40" />
            <p className="text-xs font-bold text-foreground">No Incident Records Found</p>
            <p className="text-[11px] text-muted-foreground">
              Try adjusting your search query or tab filter.
            </p>
          </div>
        ) : (
          filteredRecords.map((sub) => {
            const isClaim = sub.moduleType === "claim_alert"
            const claimType = sub.data?.claimType || "injury"
            const photosCount = sub.data?.photosCount || sub.data?.photosList?.length || 0

            return (
              <div
                key={sub.id}
                onClick={() => setSelectedIncident(sub)}
                className={`group rounded-xl border transition-all duration-150 p-4 bg-card cursor-pointer hover:shadow-xs hover:border-primary/50 space-y-3 ${
                  isClaim
                    ? "border-destructive/25 hover:border-destructive/50"
                    : "border-border/80"
                }`}
              >
                {/* Card Top Row: ID, Badges, Title, Date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border/60">
                      {sub.id}
                    </span>

                    {isClaim ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1">
                        <HeartPulse className="size-3" /> FIRST REPORT OF INJURY
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                        <AlertTriangle className="size-3" /> NEAR MISS HAZARD
                      </span>
                    )}

                    {isClaim && (
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-muted text-foreground font-semibold">
                        {claimType === "wc" ? "Workers' Comp" : claimType === "auto" ? "Commercial Auto" : claimType === "gl" ? "General Liability" : claimType}
                      </span>
                    )}

                    {photosCount > 0 && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                        📷 {photosCount} Photos
                      </span>
                    )}
                  </div>

                  <div className="text-left sm:text-right text-[11px] text-muted-foreground shrink-0 flex items-center gap-1.5 sm:justify-end">
                    <Clock className="size-3 text-muted-foreground" />
                    <span>{sub.timestamp}</span>
                    <span className="text-border">•</span>
                    <span>Lead: <strong className="text-foreground">{sub.foremanName}</strong></span>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-sm font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
                    {sub.title}
                  </h3>
                </div>

                {/* Key Context Grid: 3 Clean Columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded-lg bg-muted/30 border border-border/60 text-xs">
                  {/* Column 1: Contractor & Jobsite */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                      Contractor &amp; Jobsite
                    </span>
                    <div className="font-bold text-foreground truncate">{sub.companyName}</div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Building className="size-3 text-muted-foreground shrink-0" />
                      <span className="truncate">{sub.jobSiteName}</span>
                    </div>
                  </div>

                  {/* Column 2: Affected Entity or Hazard */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                      {isClaim ? (claimType === "wc" ? "Injured Worker" : claimType === "auto" ? "Driver & Vehicle" : "Affected Party") : "Hazard Focus"}
                    </span>
                    {isClaim ? (
                      <>
                        <div className="font-bold text-foreground flex items-center gap-1">
                          <User className="size-3 text-primary shrink-0" />
                          <span className="truncate">
                            {sub.data?.injuredWorker || sub.data?.companyDriver || sub.data?.affectedParty?.name || "Field Team Member"}
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {sub.data?.bodyPart || sub.data?.companyVehicle || sub.data?.damagedProperty || "Evaluation report"}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="font-bold text-foreground truncate">
                          {sub.data?.hazardIdentified || "Proactive Observation"}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                          Risk mitigation logged
                        </div>
                      </>
                    )}
                  </div>

                  {/* Column 3: Medical / Lost Time Status */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                      Medical &amp; Lost-Time Status
                    </span>
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">
                      {sub.data?.lostTime || "First-Aid Treated / No Lost Time"}
                    </div>
                    {sub.data?.clinic && (
                      <div className="text-[10.5px] text-muted-foreground truncate mt-0.5">
                        🏥 {sub.data.clinic}
                      </div>
                    )}
                  </div>
                </div>

                {/* Brief Summary Box */}
                <div className="text-xs p-2.5 rounded-lg bg-card border border-border/70 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Immediate Medical &amp; Site Triage Summary:
                  </span>
                  <p className="text-xs text-foreground/90 leading-relaxed line-clamp-2">
                    {sub.data?.description || sub.data?.immediateAction || "Standard first report incident logged under OSHA protocols."}
                  </p>
                </div>

                {/* Card Footer: Routing and View Sheet Trigger */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
                  <div className="truncate">
                    Underwriter / Triage Notified:{" "}
                    <span className="font-mono text-foreground font-semibold">
                      {sub.recipients?.join(", ") || "claims@reliableriskmgmt.com"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 font-semibold text-primary group-hover:underline self-end sm:self-auto shrink-0">
                    <Eye className="size-3.5" />
                    <span>View Detail Sheet &amp; Audit Form →</span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* DETAIL VIEW SHEET (Matches modern COI Sheet Design) */}
      <Sheet open={!!selectedIncident} onOpenChange={(open) => !open && setSelectedIncident(null)}>
        <SheetContent side="right" className="sm:max-w-xl w-full flex flex-col p-0 gap-0 shadow-2xl bg-card">
          <SheetHeader className="p-5 pb-4 border-b border-border bg-muted/20">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-mono text-[9px] font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded">
                CAL/OSHA FORM 5020 &amp; INCIDENT AUDIT
              </span>
              <Badge variant="outline" className="font-mono text-[10px]">
                {selectedIncident?.id}
              </Badge>
            </div>
            <SheetTitle className="text-base font-bold text-foreground tracking-tight">
              {selectedIncident?.title}
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              Official jobsite incident recording, medical dispatch affirmations and carrier coordination log.
            </SheetDescription>
          </SheetHeader>

          {selectedIncident && (
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {/* Jobsite & Contractor Card */}
              <div className="rounded-xl border border-border bg-card p-3.5 space-y-2">
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Building className="size-3.5 text-primary" /> Project &amp; Contractor Entity
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/60">
                  <div>
                    <span className="text-muted-foreground block text-[10.5px]">Contractor:</span>
                    <span className="font-bold text-foreground">{selectedIncident.companyName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10.5px]">Jobsite:</span>
                    <span className="font-bold text-foreground">{selectedIncident.jobSiteName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10.5px]">Site Lead:</span>
                    <span className="font-semibold text-foreground">{selectedIncident.foremanName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10.5px]">Incident Timestamp:</span>
                    <span className="font-mono text-foreground font-semibold">{selectedIncident.timestamp}</span>
                  </div>
                </div>
              </div>

              {/* Specific Category Data */}
              <div className="rounded-xl border border-border bg-card p-3.5 space-y-2.5">
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <HeartPulse className="size-3.5 text-destructive" /> Incident Classification &amp; Affected Parties
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-border/60">
                  {selectedIncident.data?.injuredWorker && (
                    <div>
                      <span className="text-muted-foreground block text-[10.5px]">Injured Employee:</span>
                      <span className="font-bold text-foreground">{selectedIncident.data.injuredWorker}</span>
                    </div>
                  )}
                  {selectedIncident.data?.bodyPart && (
                    <div>
                      <span className="text-muted-foreground block text-[10.5px]">Body Part / Injury:</span>
                      <span className="font-semibold text-foreground">{selectedIncident.data.bodyPart}</span>
                    </div>
                  )}
                  {selectedIncident.data?.clinic && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground block text-[10.5px]">Designated Medical Clinic:</span>
                      <span className="font-semibold text-foreground">{selectedIncident.data.clinic}</span>
                      {selectedIncident.data.clinicPhone && (
                        <span className="text-muted-foreground font-mono block text-[10.5px]">
                          Tel: {selectedIncident.data.clinicPhone}
                        </span>
                      )}
                    </div>
                  )}
                  {selectedIncident.data?.companyVehicle && (
                    <div>
                      <span className="text-muted-foreground block text-[10.5px]">Company Vehicle:</span>
                      <span className="font-bold text-foreground">{selectedIncident.data.companyVehicle}</span>
                    </div>
                  )}
                  {selectedIncident.data?.policeReportNumber && (
                    <div>
                      <span className="text-muted-foreground block text-[10.5px]">Police Report #:</span>
                      <span className="font-mono text-foreground font-semibold">{selectedIncident.data.policeReportNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Factual Narrative */}
              <div className="rounded-xl border border-border bg-card p-3.5 space-y-1.5">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Detailed Incident Narrative &amp; Facts
                </span>
                <p className="text-xs text-foreground leading-relaxed bg-muted/30 p-2.5 rounded-lg border border-border/60">
                  {selectedIncident.data?.description || selectedIncident.data?.immediateAction || "No further details recorded."}
                </p>
              </div>

              {/* Legal Affirmations */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-2">
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <Gavel className="size-3.5 text-amber-600" /> Statutory Safety Affirmations Verified
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="size-3.5 shrink-0" />
                    <span>Emergency medical triage &amp; clinic routing offered on site</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="size-3.5 shrink-0" />
                    <span>General Contractor project supervision notified verbally</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="size-3.5 shrink-0" />
                    <span>Notice of Claim broker disclaimer accepted by reporting lead</span>
                  </div>
                </div>
              </div>

              {/* Photos Log */}
              {selectedIncident.data?.photosList && selectedIncident.data.photosList.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-3.5 space-y-2">
                  <div className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Camera className="size-3.5 text-primary" /> Evidence Photos ({selectedIncident.data.photosList.length})
                  </div>
                  <div className="space-y-1">
                    {selectedIncident.data.photosList.map((p: string, idx: number) => (
                      <div key={idx} className="p-2 rounded-lg bg-muted/40 border border-border/60 text-xs text-foreground flex items-center gap-2">
                        <FileCheck2 className="size-3 text-primary shrink-0" />
                        <span className="truncate">{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <SheetFooter className="p-4 border-t border-border bg-muted/20 flex sm:flex-row items-center justify-between gap-2">
            <span className="text-[10.5px] text-muted-foreground">
              OSHA 301 Recordable Triage
            </span>
            <Button
              size="sm"
              onClick={() => setSelectedIncident(null)}
              className="text-xs font-semibold cursor-pointer px-4"
            >
              Close Sheet
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
