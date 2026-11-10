import * as React from "react"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MOCK_JHA_TEMPLATES } from "@/data/safetyMockData"
import { submissionsService } from "@/services/submissionsService"
import { supabase } from "@/lib/supabase"
import { downloadJhaPdf } from "@/lib/jhaPdfGenerator"
import type { SubmissionRecord, JHATemplate } from "@/types"
import { toast } from "sonner"
import {
  FileText,
  ShieldAlert,
  Shield,
  HardHat,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Search,
  Download,
  Building,
  Users,
  Check,
  Clock,
  RefreshCw,
  FileDown,
  UserCheck,
  ShieldCheck,
  X,
} from "lucide-react"

export function JhaAssessmentsView({
  onSelectSubmission: _onSelectSubmission,
}: {
  onSelectSubmission?: (submission: SubmissionRecord) => void
}) {
  const [selectedTemplate, setSelectedTemplate] = React.useState<JHATemplate | null>(
    MOCK_JHA_TEMPLATES[0] || null
  )
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeTab, setActiveTab] = React.useState<"field_jhas" | "templates">("field_jhas")
  const [tradeFilter, setTradeFilter] = React.useState<string>("all")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")

  // Real Database Submissions State
  const [jhaSubmissions, setJhaSubmissions] = React.useState<SubmissionRecord[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  // Drawer State
  const [inspectingJha, setInspectingJha] = React.useState<SubmissionRecord | null>(null)
  const [adminNotesInput, setAdminNotesInput] = React.useState("")
  const [isCertifying, setIsCertifying] = React.useState(false)

  // Fetch real submissions from Supabase
  const loadData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const records = await submissionsService.fetchAll({ moduleType: "jha" })
      setJhaSubmissions(records)
    } catch (err: any) {
      console.error("[JhaAssessmentsView] Fetch error:", err)
      toast.error("Failed to load real JHA records from database.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()

    // Realtime Supabase channel subscription
    const channel = supabase
      .channel("realtime_jha_assessments")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "submissions",
          filter: "module_type=eq.jha",
        },
        () => {
          loadData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadData])

  // Dynamic KPIs
  const totalJhas = jhaSubmissions.length
  const totalCrewCovered = React.useMemo(() => {
    return jhaSubmissions.reduce((acc, sub) => {
      const crewCount =
        typeof sub.data?.crewSize === "number"
          ? sub.data.crewSize
          : Array.isArray(sub.data?.acknowledgedCrew)
          ? sub.data.acknowledgedCrew.length
          : 0
      return acc + crewCount
    }, 0)
  }, [jhaSubmissions])

  const bossApprovedCount = jhaSubmissions.filter((s) => s.data?.bossApproval).length
  const adminCertifiedCount = jhaSubmissions.filter((s) => s.data?.adminCertified).length

  // Filtered Templates
  const filteredTemplates = React.useMemo(() => {
    return MOCK_JHA_TEMPLATES.filter(
      (j) =>
        j.activity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.trade.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  // Filtered Submissions
  const filteredSubmissions = React.useMemo(() => {
    return jhaSubmissions.filter((sub) => {
      const q = searchQuery.toLowerCase()
      const titleMatch = (sub.title || "").toLowerCase().includes(q)
      const jobMatch = (sub.jobSiteName || "").toLowerCase().includes(q)
      const foremanMatch = (sub.foremanName || "").toLowerCase().includes(q)
      const tradeMatch = (sub.data?.trade || "").toLowerCase().includes(q)
      const matchesSearch = titleMatch || jobMatch || foremanMatch || tradeMatch

      if (!matchesSearch) return false

      if (tradeFilter !== "all") {
        if (!sub.data?.trade?.toLowerCase().includes(tradeFilter.toLowerCase())) return false
      }

      if (statusFilter === "approved") {
        if (!sub.data?.bossApproval) return false
      } else if (statusFilter === "pending") {
        if (sub.data?.bossApproval) return false
      } else if (statusFilter === "certified") {
        if (!sub.data?.adminCertified) return false
      }

      return true
    })
  }, [jhaSubmissions, searchQuery, tradeFilter, statusFilter])

  // Direct PDF Download Handler
  const handleDownloadPdf = (sub: SubmissionRecord) => {
    try {
      const subData = sub.data || {}
      downloadJhaPdf({
        id: sub.id,
        activityName: subData.activityName || sub.title.replace(/^JHA Pre-Task Plan:\s*/, ""),
        trade: subData.trade || "Specialty Trade & Structural",
        jobSiteName: sub.jobSiteName || "Active Jobsite",
        jobNumber: sub.jobSiteId || "JOB-2026-AHA",
        date: sub.timestamp || subData.date || new Date().toLocaleDateString(),
        foremanName: sub.foremanName || subData.foremanName || "Field Foreman",
        companyName: sub.companyName || subData.companyName || "Titan Construction & Safety",
        hazards: Array.isArray(subData.hazards) ? subData.hazards : [],
        ppeList: Array.isArray(subData.ppeList) ? subData.ppeList : [],
        controlMeasures: Array.isArray(subData.controlMeasures) ? subData.controlMeasures : [],
        acknowledgedCrew: Array.isArray(subData.acknowledgedCrew) ? subData.acknowledgedCrew : [],
        signatureUri: sub.signatureUri || subData.signatureUri,
        bossNotes: subData.bossNotes,
        bossApprovedAt: subData.bossApprovedAt,
        bossApprovedBy: subData.bossApprovedBy,
      })
      toast.success("Signed JHA compliance document downloaded successfully!")
    } catch (err: any) {
      console.error("[JhaAssessmentsView] PDF download error:", err)
      toast.error("Failed to generate JHA PDF.")
    }
  }

  // Template PDF download
  const handleDownloadTemplatePdf = (tpl: JHATemplate) => {
    try {
      downloadJhaPdf({
        activityName: tpl.activity,
        trade: tpl.trade,
        jobSiteName: "Master OSHA Standard Template",
        jobNumber: tpl.id,
        date: new Date().toLocaleDateString(),
        foremanName: "Master Safety Director",
        companyName: "Reliable Risk Management",
        hazards: tpl.hazards,
        ppeList: tpl.requiredPPE,
        controlMeasures: tpl.controlMeasures,
        acknowledgedCrew: ["Crew Lead", "Journeyman Operator", "Rigger / Flagger", "Safety Specialist"],
      })
      toast.success(`Downloaded ${tpl.trade} master compliance PDF.`)
    } catch (err) {
      toast.error("Could not export template PDF.")
    }
  }

  // Super Admin Certification & Seal
  const handleAdminCertify = async (sub: SubmissionRecord) => {
    setIsCertifying(true)
    try {
      const ok = await submissionsService.updateSubmissionData(sub.id, {
        adminCertified: true,
        adminCertifiedAt: new Date().toISOString(),
        adminCertifiedBy: "Super Admin",
        adminNotes: adminNotesInput.trim() || "Cal/OSHA Title 8 § 1509 pre-task plan audited & certified compliant.",
      })

      if (ok) {
        toast.success("JHA Pre-Task Plan Certified by Super Admin!")
        setInspectingJha((prev) =>
          prev && prev.id === sub.id
            ? {
                ...prev,
                data: {
                  ...(prev.data || {}),
                  adminCertified: true,
                  adminCertifiedAt: new Date().toISOString(),
                  adminCertifiedBy: "Super Admin",
                  adminNotes: adminNotesInput.trim() || "Cal/OSHA Title 8 § 1509 pre-task plan audited & certified compliant.",
                },
              }
            : prev
        )
        setJhaSubmissions((prev) =>
          prev.map((item) =>
            item.id === sub.id
              ? {
                  ...item,
                  data: {
                    ...(item.data || {}),
                    adminCertified: true,
                    adminCertifiedAt: new Date().toISOString(),
                    adminCertifiedBy: "Super Admin",
                    adminNotes: adminNotesInput.trim() || "Cal/OSHA Title 8 § 1509 pre-task plan audited & certified compliant.",
                  },
                }
              : item
          )
        )
      } else {
        toast.error("Failed to update certification in database.")
      }
    } catch (err: any) {
      console.error("[JhaAssessmentsView] Certify error:", err)
      toast.error("Error certifying JHA.")
    } finally {
      setIsCertifying(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Top Header Bar ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ShieldAlert className="size-6 text-primary" />
            Job Hazard Analyses (JHA) & Risk Assessments
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Activity Hazard Analyses (AHA), Cal/OSHA Title 8 § 1509 compliance, 8-man crew attendance sign-offs, and formal signed PDFs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            className="text-xs font-semibold gap-1.5 h-8.5 rounded-lg"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Sync Live</span>
          </Button>

          <div className="inline-flex rounded-lg border border-border bg-muted p-1 text-xs">
            <button
              onClick={() => setActiveTab("field_jhas")}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeTab === "field_jhas"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Live Field JHAs ({jhaSubmissions.length})
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeTab === "templates"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Master Trade Templates ({MOCK_JHA_TEMPLATES.length})
            </button>
          </div>
        </div>
      </div>

      {/* ── Dynamic KPI Metric Cards ───────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 rounded-2xl border-border/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Total JHAs Logged</span>
            <FileText className="size-4 text-primary" />
          </div>
          <div className="text-2xl font-black text-foreground">{totalJhas}</div>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="size-3" />
            100% Cal/OSHA Standard
          </p>
        </Card>

        <Card className="p-4 rounded-2xl border-border/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Workers Covered</span>
            <Users className="size-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-foreground">{totalCrewCovered}</div>
          <p className="text-[11px] text-muted-foreground">Roster Sign-Offs Briefed</p>
        </Card>

        <Card className="p-4 rounded-2xl border-border/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Boss Sign-Offs</span>
            <UserCheck className="size-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {bossApprovedCount}
          </div>
          <p className="text-[11px] text-muted-foreground">Superintendent Reviewed</p>
        </Card>

        <Card className="p-4 rounded-2xl border-border/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Admin Certified</span>
            <ShieldCheck className="size-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {adminCertifiedCount}
          </div>
          <p className="text-[11px] text-muted-foreground">OSHA 1926 Legal Seal</p>
        </Card>
      </div>

      {/* ── TAB 1: LIVE FIELD JHA SUBMISSIONS ──────────────────────── */}
      {activeTab === "field_jhas" && (
        <div className="space-y-4">
          {/* Search & Filter Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-2xl bg-muted/40 border border-border/70">
            <div className="relative flex-1">
              <Search className="size-3.5 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by activity, trade, jobsite, or foreman..."
                className="pl-8 text-xs h-9 rounded-xl bg-background border-border/80"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={tradeFilter}
                onChange={(e) => setTradeFilter(e.target.value)}
                className="text-xs h-9 px-3 rounded-xl bg-background border border-border/80 text-foreground font-medium"
              >
                <option value="all">All Core Trades</option>
                <option value="excavation">Excavation & Trenching</option>
                <option value="concrete">Concrete & Masonry</option>
                <option value="roofing">Roofing & Leading Edge</option>
                <option value="crane">Crane & Rigging</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs h-9 px-3 rounded-xl bg-background border border-border/80 text-foreground font-medium"
              >
                <option value="all">All Approval States</option>
                <option value="approved">Boss Approved ✓</option>
                <option value="pending">Pending Boss Review</option>
                <option value="certified">Admin Certified</option>
              </select>
            </div>
          </div>

          {/* Submissions List */}
          {filteredSubmissions.length === 0 ? (
            <Card className="p-12 text-center rounded-3xl border-dashed border-border/80 bg-muted/20 space-y-2">
              <ShieldAlert className="size-10 text-muted-foreground/40 mx-auto" />
              <p className="text-sm font-bold text-foreground">No JHA pre-task plans match the selected filters</p>
              <p className="text-xs text-muted-foreground">
                Submissions from the mobile field app will appear here in real-time.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {filteredSubmissions.map((sub) => {
                const subData = sub.data || {}
                const isBossApproved = Boolean(subData.bossApproval)
                const isAdminCertified = Boolean(subData.adminCertified)
                const crewList = Array.isArray(subData.acknowledgedCrew) ? subData.acknowledgedCrew : []

                return (
                  <Card
                    key={sub.id}
                    className="hover:border-primary/40 transition-all rounded-3xl shadow-xs overflow-hidden"
                  >
                    <CardHeader className="pb-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-lg border border-border/60">
                              #{sub.id.replace("sub-", "").slice(0, 8)}
                            </span>
                            <Badge variant="outline" className="text-[10px] uppercase font-bold text-primary border-primary/30">
                              {subData.trade || "Specialty Trade"}
                            </Badge>
                            {isBossApproved && (
                              <Badge className="bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 text-[10px] font-bold">
                                Boss Approved ✓
                              </Badge>
                            )}
                            {isAdminCertified && (
                              <Badge className="bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30 text-[10px] font-bold">
                                OSHA Certified ✓
                              </Badge>
                            )}
                          </div>

                          <CardTitle className="text-sm font-bold text-foreground">
                            {subData.activityName || sub.title}
                          </CardTitle>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-xs font-bold text-foreground flex items-center sm:justify-end gap-1 text-muted-foreground">
                            <Clock className="size-3" />
                            <span>{sub.timestamp || subData.date || "Today"}</span>
                          </div>
                          <div className="text-[11px] text-muted-foreground font-medium">
                            Foreman: <strong className="text-foreground">{sub.foremanName || "Diego Morales"}</strong>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3 pt-0 text-xs">
                      {/* Jobsite & Crew Stats Strip */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-2xl bg-muted/30 border border-border/50">
                        <div className="flex items-center gap-2">
                          <Building className="size-4 text-primary shrink-0" />
                          <div className="min-w-0">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold block">Jobsite</span>
                            <span className="font-semibold text-foreground truncate block">
                              {sub.jobSiteName || "Sunset Ridge Medical Center"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Users className="size-4 text-emerald-600 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold block">Crew Attendance</span>
                            <span className="font-semibold text-foreground block">
                              {crewList.length} Workers Signed
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <HardHat className="size-4 text-amber-600 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold block">Company / Trade</span>
                            <span className="font-semibold text-foreground truncate block">
                              {sub.companyName || "Titan Construction & Safety"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Key Controls Summary */}
                      {subData.keyControls && (
                        <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/20 text-xs flex items-center gap-2">
                          <CheckCircle2 className="size-4 text-primary shrink-0" />
                          <span className="text-foreground font-medium leading-relaxed">
                            <strong className="text-primary">Key Controls: </strong>
                            {subData.keyControls}
                          </span>
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="flex items-center justify-between border-t border-border/60 pt-3 bg-muted/10">
                      <span className="text-[11px] text-muted-foreground font-medium">
                        Sent to: {sub.recipients?.join(", ") || "Safety Desk & GC"}
                      </span>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setInspectingJha(sub)}
                          className="h-8 text-xs font-bold gap-1.5 rounded-xl cursor-pointer"
                        >
                          <Eye className="size-3.5" />
                          <span>Audit Dossier</span>
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => handleDownloadPdf(sub)}
                          className="h-8 text-xs font-bold gap-1.5 rounded-xl bg-primary hover:bg-primary/90 text-white cursor-pointer"
                        >
                          <Download className="size-3.5" />
                          <span>Download Signed PDF</span>
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: MASTER JHA TRADE TEMPLATES ───────────────────────── */}
      {activeTab === "templates" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Templates list */}
          <div className="lg:col-span-5 space-y-3">
            <div className="relative">
              <Search className="size-3.5 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search trade or activity template..."
                className="pl-8 text-xs h-9 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              {filteredTemplates.map((template) => {
                const isSelected = selectedTemplate?.id === template.id
                return (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-xs space-y-1.5 ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-xs ring-2 ring-primary/20"
                        : "border-border bg-card hover:bg-muted/40 hover:border-border/80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[9.5px] font-bold text-primary border-primary/30">
                        {template.trade}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {template.id}
                      </span>
                    </div>

                    <div className="font-bold text-foreground text-xs leading-snug">
                      {template.activity}
                    </div>

                    <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                      <span>{template.hazards.length} Hazards</span>
                      <span>•</span>
                      <span>{template.controlMeasures.length} Controls</span>
                      <span>•</span>
                      <span>{template.requiredPPE.length} PPE Matrix</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* JHA Template Details */}
          <div className="lg:col-span-7">
            {selectedTemplate ? (
              <Card className="rounded-3xl border-border/80 shadow-xs h-full flex flex-col justify-between">
                <CardHeader className="space-y-2 border-b border-border/60 pb-4">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-primary text-white font-bold text-xs">
                      {selectedTemplate.trade}
                    </Badge>
                    <Badge variant="outline" className="text-emerald-600 border-emerald-500/20 bg-emerald-500/10 font-bold">
                      Cal/OSHA Title 8 § 1509
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-bold text-foreground">
                    {selectedTemplate.activity}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4 pt-4 text-xs">
                  {/* Required PPE Matrix */}
                  <div className="space-y-2">
                    <div className="font-bold text-foreground flex items-center gap-1.5">
                      <HardHat className="size-4 text-primary" />
                      <span>Required Personal Protective Equipment (PPE Matrix):</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedTemplate.requiredPPE.map((ppe, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/60 text-[11px]"
                        >
                          <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                          <span className="text-foreground font-medium">{ppe}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Potential Hazards */}
                  <div className="space-y-2 p-3.5 rounded-2xl bg-destructive/5 border border-destructive/20">
                    <div className="font-bold text-destructive flex items-center gap-1.5">
                      <AlertTriangle className="size-4" />
                      <span>Identified High-Risk Activity Hazards:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1.5 text-muted-foreground pl-1 leading-relaxed">
                      {selectedTemplate.hazards.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Required Engineering Controls */}
                  <div className="space-y-2 p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                    <div className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="size-4" />
                      <span>Mandatory Engineering & Work Controls:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1.5 text-muted-foreground pl-1 leading-relaxed">
                      {selectedTemplate.controlMeasures.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>

                <CardFooter className="flex items-center justify-between border-t border-border/60 pt-3">
                  <span className="text-[11px] text-muted-foreground font-medium">
                    Pre-Configured Safe Work Standard
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handleDownloadTemplatePdf(selectedTemplate)}
                    className="text-xs font-bold gap-1.5 bg-primary text-white rounded-xl cursor-pointer"
                  >
                    <FileDown className="size-3.5" />
                    <span>Export Master Template PDF</span>
                  </Button>
                </CardFooter>
              </Card>
            ) : null}
          </div>
        </div>
      )}

      {/* ── JHA AUDIT DOSSIER SIDE DRAWER ──────────────────────────── */}
      {inspectingJha && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setInspectingJha(null)} />
          <div className="relative z-10 w-full max-w-2xl h-full bg-card shadow-2xl border-l border-border p-6 overflow-y-auto space-y-5 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-border/60 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[10px]">
                    #{inspectingJha.id.replace("sub-", "").slice(0, 8)}
                  </Badge>
                  <Badge className="bg-primary text-white text-[10px] font-bold">
                    {inspectingJha.data?.trade || "Construction"}
                  </Badge>
                  {inspectingJha.data?.bossApproval && (
                    <Badge className="bg-emerald-500/15 text-emerald-800 border-emerald-500/30 text-[10px] font-bold">
                      Boss Approved ✓
                    </Badge>
                  )}
                </div>
                <h3 className="text-base font-black text-foreground">
                  {inspectingJha.data?.activityName || inspectingJha.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {inspectingJha.jobSiteName} • Foreman: {inspectingJha.foremanName || "Diego Morales"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setInspectingJha(null)}
                className="size-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground font-bold cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Section 1: Hazards */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-destructive/5 border border-destructive/20 text-xs">
              <h4 className="font-bold text-destructive flex items-center gap-1.5">
                <AlertTriangle className="size-4" />
                <span>Identified Activity Hazards:</span>
              </h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {(inspectingJha.data?.hazards || []).map((hz: string, i: number) => (
                  <li key={i}>{hz}</li>
                ))}
              </ul>
            </div>

            {/* Section 2: Controls */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs">
              <h4 className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="size-4" />
                <span>Engineering Controls Implemented:</span>
              </h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {(inspectingJha.data?.controlMeasures || []).map((c: string, i: number) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            {/* Section 3: PPE Matrix */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-foreground flex items-center gap-1.5">
                <Shield className="size-4 text-primary" />
                <span>Mandatory PPE Matrix:</span>
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {(inspectingJha.data?.ppeList || []).map((ppe: string, i: number) => (
                  <div key={i} className="p-2 rounded-xl bg-muted/40 border border-border/60 text-[11px] font-medium flex items-center gap-1.5">
                    <Check className="size-3 text-primary" />
                    <span>{ppe}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Attending Crew Roster */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-foreground flex items-center gap-1.5">
                  <Users className="size-4 text-emerald-600" />
                  <span>On-Site Crew Attendance Roster:</span>
                </h4>
                <Badge variant="outline" className="text-[10px] font-bold">
                  {inspectingJha.data?.acknowledgedCrew?.length || 0} Workers Signed
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {(inspectingJha.data?.acknowledgedCrew || []).map((name: string, i: number) => (
                  <div key={i} className="p-2.5 rounded-xl bg-background border border-border/60 flex items-center justify-between text-[11px]">
                    <span className="font-bold text-foreground">#{i + 1} {name}</span>
                    <span className="text-[9.5px] font-bold text-emerald-600">SIGNED ✓</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 5: Foreman Digital Signature */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-muted/30 border border-border/60 text-xs">
              <span className="font-bold text-muted-foreground block text-[10px] uppercase">
                Foreman Verification Signature
              </span>
              {inspectingJha.signatureUri ? (
                <div className="bg-white p-2 rounded-xl border border-border max-w-[240px]">
                  <img
                    src={inspectingJha.signatureUri}
                    alt="Foreman Signature"
                    className="h-14 object-contain"
                  />
                </div>
              ) : (
                <p className="font-mono text-xs text-muted-foreground italic">Signature recorded on-site</p>
              )}
              <p className="text-[10px] text-muted-foreground">
                Signed by {inspectingJha.foremanName || "Field Lead"} • {inspectingJha.timestamp || "Today"}
              </p>
            </div>

            {/* Section 6: Boss Approval Banner */}
            {inspectingJha.data?.bossApproval ? (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-emerald-600" />
                    <span>Superintendent Sign-Off Certified</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700">
                    {inspectingJha.data.bossApprovedAt ? new Date(inspectingJha.data.bossApprovedAt).toLocaleDateString() : "Approved"}
                  </span>
                </div>
                {inspectingJha.data.bossNotes && (
                  <p className="text-foreground leading-relaxed">
                    {inspectingJha.data.bossNotes}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <Clock className="size-4" />
                <span>Pending Superintendent / Project Manager field review</span>
              </div>
            )}

            {/* Section 7: Super Admin Legal Certification Seal */}
            <div className="pt-2 border-t border-border/60 space-y-3">
              {inspectingJha.data?.adminCertified ? (
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
                      <ShieldCheck className="size-4 text-purple-600" />
                      <span>OSHA 1926 Legal Compliance Certified by Super Admin</span>
                    </span>
                    <span className="text-[10px] font-mono text-purple-700">
                      {new Date(inspectingJha.data.adminCertifiedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-foreground font-medium leading-relaxed">
                    {inspectingJha.data.adminNotes}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">
                    Super Admin Legal Compliance Audit Notes:
                  </label>
                  <textarea
                    value={adminNotesInput}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAdminNotesInput(e.target.value)}
                    placeholder="Enter compliance notes (e.g. Activity Hazard Analysis certified compliant under Cal/OSHA Title 8 § 1509)..."
                    className="flex min-h-[64px] w-full rounded-xl border border-input bg-background px-3 py-2 text-xs shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  <Button
                    type="button"
                    disabled={isCertifying}
                    onClick={() => handleAdminCertify(inspectingJha)}
                    className="w-full text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-xs"
                  >
                    {isCertifying ? "Certifying..." : "Certify OSHA 1926 Legal Compliance"}
                  </Button>
                </div>
              )}

              {/* Download PDF Button */}
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDownloadPdf(inspectingJha)}
                className="w-full text-xs font-bold h-11 rounded-xl gap-2 cursor-pointer"
              >
                <Download className="size-4 text-primary" />
                <span>Export Official Signed JHA PDF</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
