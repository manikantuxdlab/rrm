import * as React from "react"
import { createPortal } from "react-dom"
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
import { submissionsService } from "@/services/submissionsService"
import { jhaTemplateService, type DynamicJHATemplate } from "@/services/jhaTemplateService"
import { supabase } from "@/lib/supabase"
import { downloadJhaPdf } from "@/lib/jhaPdfGenerator"
import type { SubmissionRecord } from "@/types"
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
  Plus,
  Trash2,
  Edit3,
  Copy,
  Layers,
  Sliders,
} from "lucide-react"

export function JhaAssessmentsView({
  onSelectSubmission: _onSelectSubmission,
}: {
  onSelectSubmission?: (submission: SubmissionRecord) => void
}) {
  // Navigation Tabs: Live Field Records vs Super Admin Template Manager
  const [activeTab, setActiveTab] = React.useState<"templates" | "field_jhas">("templates")

  // Search & Filters
  const [searchQuery, setSearchQuery] = React.useState("")
  const [tradeFilter, setTradeFilter] = React.useState<string>("all")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")

  // Real Database Submissions State (Field Records)
  const [jhaSubmissions, setJhaSubmissions] = React.useState<SubmissionRecord[]>([])
  const [isLoadingSubmissions, setIsLoadingSubmissions] = React.useState(true)

  // Dynamic Super Admin Templates State
  const [templates, setTemplates] = React.useState<DynamicJHATemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = React.useState<DynamicJHATemplate | null>(null)
  const [isLoadingTemplates, setIsLoadingTemplates] = React.useState(true)

  // Drawer & Modal States
  const [inspectingJha, setInspectingJha] = React.useState<SubmissionRecord | null>(null)
  const [adminNotesInput, setAdminNotesInput] = React.useState("")
  const [isCertifying, setIsCertifying] = React.useState(false)

  // Template Editor Modal State (Create & Edit)
  const [isEditorOpen, setIsEditorOpen] = React.useState(false)
  const [editingTemplateId, setEditingTemplateId] = React.useState<string | null>(null)
  const [editorActivity, setEditorActivity] = React.useState("")
  const [editorTrade, setEditorTrade] = React.useState("Excavation & Earthwork")
  const [editorOshaStandard, setEditorOshaStandard] = React.useState("Cal/OSHA Title 8 § 1509")
  const [editorStatus, setEditorStatus] = React.useState<"active" | "inactive">("active")
  const [editorHazards, setEditorHazards] = React.useState<string[]>([])
  const [editorPPE, setEditorPPE] = React.useState<string[]>([])
  const [editorControls, setEditorControls] = React.useState<string[]>([])
  const [newHazardText, setNewHazardText] = React.useState("")
  const [newPPEText, setNewPPEText] = React.useState("")
  const [newControlText, setNewControlText] = React.useState("")
  const [isSavingTemplate, setIsSavingTemplate] = React.useState(false)

  // -------------------------------------------------------------
  // Data Fetching: Live Submissions & Dynamic Templates
  // -------------------------------------------------------------
  const loadSubmissions = React.useCallback(async () => {
    setIsLoadingSubmissions(true)
    try {
      const records = await submissionsService.fetchAll({ moduleType: "jha" })
      setJhaSubmissions(records)
    } catch (err: any) {
      console.error("[JhaAssessmentsView] Fetch submissions error:", err)
      toast.error("Failed to load live JHA records.")
    } finally {
      setIsLoadingSubmissions(false)
    }
  }, [])

  const loadTemplates = React.useCallback(async () => {
    setIsLoadingTemplates(true)
    try {
      const list = await jhaTemplateService.fetchAll()
      setTemplates(list)
      if (list.length > 0 && !selectedTemplate) {
        setSelectedTemplate(list[0])
      } else if (selectedTemplate) {
        const stillExists = list.find((t) => t.id === selectedTemplate.id)
        setSelectedTemplate(stillExists || list[0] || null)
      }
    } catch (err: any) {
      console.error("[JhaAssessmentsView] Fetch templates error:", err)
      toast.error("Failed to load dynamic JHA templates.")
    } finally {
      setIsLoadingTemplates(false)
    }
  }, [selectedTemplate])

  React.useEffect(() => {
    loadSubmissions()
    loadTemplates()

    // Realtime Supabase channel subscriptions for both field submissions and admin templates
    const subChannel = supabase
      .channel("realtime_jha_admin_channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "submissions",
          filter: "module_type=eq.jha",
        },
        () => {
          loadSubmissions()
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "submissions",
          filter: "module_type=eq.jha_template",
        },
        () => {
          loadTemplates()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subChannel)
    }
  }, [loadSubmissions, loadTemplates])

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
  const activeTemplatesCount = templates.filter((t) => t.status === "active").length

  // Filtered Templates
  const filteredTemplates = React.useMemo(() => {
    return templates.filter((j) => {
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        j.activity.toLowerCase().includes(q) ||
        j.trade.toLowerCase().includes(q) ||
        (j.oshaStandard || "").toLowerCase().includes(q)

      if (!matchesSearch) return false

      if (tradeFilter !== "all") {
        if (!j.trade.toLowerCase().includes(tradeFilter.toLowerCase())) return false
      }

      if (statusFilter === "active" && j.status !== "active") return false
      if (statusFilter === "inactive" && j.status !== "inactive") return false

      return true
    })
  }, [templates, searchQuery, tradeFilter, statusFilter])

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

      if (statusFilter === "approved" && !sub.data?.bossApproval) return false
      if (statusFilter === "pending" && sub.data?.bossApproval) return false
      if (statusFilter === "certified" && !sub.data?.adminCertified) return false

      return true
    })
  }, [jhaSubmissions, searchQuery, tradeFilter, statusFilter])

  // -------------------------------------------------------------
  // Template CRUD Operations (Super Admin Controlled)
  // -------------------------------------------------------------
  const handleOpenCreateModal = () => {
    setEditingTemplateId(null)
    setEditorActivity("")
    setEditorTrade("Excavation & Earthwork")
    setEditorOshaStandard("Cal/OSHA Title 8 § 1541")
    setEditorStatus("active")
    setEditorHazards([
      "Trench wall cave-in or soil collapse burying workers",
      "Struck-by hydraulic excavator boom or bucket swing radius",
    ])
    setEditorPPE([
      "Hard Hat (ANSI Z89.1 Type 1/2 with chin strap)",
      "High-Visibility Class 3 vest with reflective striping",
      "Steel/composite toe work boots",
    ])
    setEditorControls([
      "811 DigAlert ticket verified active with markings visible",
      "Competent person daily trench soil classification and inspection",
    ])
    setNewHazardText("")
    setNewPPEText("")
    setNewControlText("")
    setIsEditorOpen(true)
  }

  const handleOpenEditModal = (tpl: DynamicJHATemplate) => {
    setEditingTemplateId(tpl.id)
    setEditorActivity(tpl.activity)
    setEditorTrade(tpl.trade)
    setEditorOshaStandard(tpl.oshaStandard || "Cal/OSHA Title 8 § 1509")
    setEditorStatus(tpl.status)
    setEditorHazards([...tpl.hazards])
    setEditorPPE([...tpl.requiredPPE])
    setEditorControls([...tpl.controlMeasures])
    setNewHazardText("")
    setNewPPEText("")
    setNewControlText("")
    setIsEditorOpen(true)
  }

  const handleSaveTemplate = async () => {
    if (!editorActivity.trim()) {
      toast.error("Activity name is required.")
      return
    }

    if (editorHazards.length === 0) {
      toast.error("Please add at least 1 identified hazard.")
      return
    }

    if (editorControls.length === 0) {
      toast.error("Please add at least 1 mandatory engineering control.")
      return
    }

    setIsSavingTemplate(true)
    try {
      if (editingTemplateId) {
        // Update existing template
        const ok = await jhaTemplateService.update(editingTemplateId, {
          activity: editorActivity.trim(),
          trade: editorTrade.trim(),
          oshaStandard: editorOshaStandard.trim(),
          status: editorStatus,
          hazards: editorHazards,
          requiredPPE: editorPPE,
          controlMeasures: editorControls,
        })
        if (ok) {
          toast.success("JHA Template updated successfully!")
          setIsEditorOpen(false)
          loadTemplates()
        } else {
          toast.error("Failed to update template in database.")
        }
      } else {
        // Create new template
        const created = await jhaTemplateService.create({
          activity: editorActivity.trim(),
          trade: editorTrade.trim(),
          oshaStandard: editorOshaStandard.trim(),
          status: editorStatus,
          hazards: editorHazards,
          requiredPPE: editorPPE,
          controlMeasures: editorControls,
        })
        if (created) {
          toast.success("New JHA Template created and published to field app!")
          setIsEditorOpen(false)
          setSelectedTemplate(created)
          loadTemplates()
        } else {
          toast.error("Failed to create template in database.")
        }
      }
    } catch (err: any) {
      console.error("[JhaAssessmentsView] Save template error:", err)
      toast.error("Error saving template.")
    } finally {
      setIsSavingTemplate(false)
    }
  }

  const handleDeleteTemplate = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete the template:\n"${name}"?`)) {
      return
    }

    try {
      const ok = await jhaTemplateService.delete(id)
      if (ok) {
        toast.success("Template deleted from database.")
        loadTemplates()
      } else {
        toast.error("Failed to delete template.")
      }
    } catch (err) {
      toast.error("Error deleting template.")
    }
  }

  const handleDuplicateTemplate = async (tpl: DynamicJHATemplate) => {
    try {
      const created = await jhaTemplateService.create({
        activity: `${tpl.activity} (Custom Copy)`,
        trade: tpl.trade,
        oshaStandard: tpl.oshaStandard,
        status: "active",
        hazards: [...tpl.hazards],
        requiredPPE: [...tpl.requiredPPE],
        controlMeasures: [...tpl.controlMeasures],
      })
      if (created) {
        toast.success(`Duplicated template: ${created.activity}`)
        setSelectedTemplate(created)
        loadTemplates()
      }
    } catch (err) {
      toast.error("Could not duplicate template.")
    }
  }

  const handleToggleTemplateStatus = async (tpl: DynamicJHATemplate) => {
    const newStatus = tpl.status === "active" ? "inactive" : "active"
    const ok = await jhaTemplateService.update(tpl.id, { status: newStatus })
    if (ok) {
      toast.success(
        `Template ${tpl.activity} marked ${newStatus === "active" ? "Active (Visible in Field)" : "Inactive (Hidden)"}`
      )
      loadTemplates()
    }
  }

  // PDF Export Handlers
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

  const handleDownloadTemplatePdf = (tpl: DynamicJHATemplate) => {
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
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="size-6 text-primary" />
              Job Hazard Analyses (JHA) & Risk Assessments
            </h2>
            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">
              Dynamic Database Powered
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Super Admin controlled master templates, live field crew pre-task briefs, and formal signed compliance PDFs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadSubmissions()
              loadTemplates()
            }}
            disabled={isLoadingSubmissions || isLoadingTemplates}
            className="text-xs font-semibold gap-1.5 h-8.5 rounded-lg"
          >
            <RefreshCw className={`size-3.5 ${isLoadingSubmissions || isLoadingTemplates ? "animate-spin" : ""}`} />
            <span>Sync Database</span>
          </Button>

          <div className="inline-flex rounded-lg border border-border bg-muted p-1 text-xs">
            <button
              onClick={() => setActiveTab("templates")}
              className={`px-3 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                activeTab === "templates"
                  ? "bg-card text-foreground shadow-xs ring-1 ring-border/50"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Master Templates ({templates.length})
            </button>
            <button
              onClick={() => setActiveTab("field_jhas")}
              className={`px-3 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                activeTab === "field_jhas"
                  ? "bg-card text-foreground shadow-xs ring-1 ring-border/50"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Live Field JHAs ({jhaSubmissions.length})
            </button>
          </div>
        </div>
      </div>

      {/* ── Dynamic KPI Metric Cards ───────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 rounded-2xl border-border/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Dynamic Templates</span>
            <Layers className="size-4 text-primary" />
          </div>
          <div className="text-2xl font-black text-foreground">{templates.length}</div>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="size-3" />
            {activeTemplatesCount} Active in Mobile App
          </p>
        </Card>

        <Card className="p-4 rounded-2xl border-border/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Live Field JHAs</span>
            <FileText className="size-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-foreground">{totalJhas}</div>
          <p className="text-[11px] text-muted-foreground">Archived in Cloud Vault</p>
        </Card>

        <Card className="p-4 rounded-2xl border-border/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Workers Covered</span>
            <Users className="size-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-foreground">{totalCrewCovered}</div>
          <p className="text-[11px] text-muted-foreground">Signed On-Site Rosters</p>
        </Card>

        <Card className="p-4 rounded-2xl border-border/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Boss Sign-Offs</span>
            <UserCheck className="size-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {bossApprovedCount}
          </div>
          <p className="text-[11px] text-muted-foreground">Superintendent Certified</p>
        </Card>
      </div>

      {/* ── TAB 1: SUPER ADMIN JHA TEMPLATE MANAGER (DYNAMIC CRUD) ─── */}
      {activeTab === "templates" && (
        <div className="space-y-4">
          {/* Action & Filter Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-muted/40 border border-border/70">
            <div className="relative flex-1">
              <Search className="size-3.5 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates by activity name, trade, or OSHA standard..."
                className="pl-8 text-xs h-9 rounded-xl bg-background border-border/80"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={tradeFilter}
                onChange={(e) => setTradeFilter(e.target.value)}
                className="text-xs h-9 px-3 rounded-xl bg-background border border-border/80 text-foreground font-medium"
              >
                <option value="all">All Trade Categories</option>
                <option value="excavation">Excavation & Trenching</option>
                <option value="concrete">Concrete & Masonry</option>
                <option value="roofing">Roofing & Waterproofing</option>
                <option value="crane">Crane & Rigging</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs h-9 px-3 rounded-xl bg-background border border-border/80 text-foreground font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive (Hidden)</option>
              </select>

              <Button
                onClick={handleOpenCreateModal}
                className="text-xs font-bold gap-1.5 h-9 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-xs cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Create JHA Template</span>
              </Button>
            </div>
          </div>

          {/* Master Templates 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Template Cards List */}
            <div className="lg:col-span-5 space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Dynamic Templates ({filteredTemplates.length})
                </span>
                <span className="text-[11px] text-muted-foreground">Click to preview & edit</span>
              </div>

              {filteredTemplates.length === 0 ? (
                <Card className="p-8 text-center rounded-3xl border-dashed border-border/80 bg-muted/20 space-y-2">
                  <Layers className="size-8 text-muted-foreground/40 mx-auto" />
                  <p className="text-xs font-bold text-foreground">No templates match the current filter</p>
                  <Button size="sm" onClick={handleOpenCreateModal} className="text-xs font-bold">
                    Create New Template
                  </Button>
                </Card>
              ) : (
                filteredTemplates.map((template) => {
                  const isSelected = selectedTemplate?.id === template.id
                  const isActive = template.status === "active"

                  return (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-xs space-y-2 ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-xs ring-2 ring-primary/20"
                          : "border-border bg-card hover:bg-muted/40 hover:border-border/80"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Badge variant="outline" className="text-[9px] font-bold text-primary border-primary/30 truncate">
                            {template.trade}
                          </Badge>
                          <Badge
                            className={`text-[9px] font-bold px-1.5 py-0 h-4.5 ${
                              isActive
                                ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {isActive ? "Active in Mobile" : "Draft / Inactive"}
                          </Badge>
                        </div>

                        {/* Quick Card Action Buttons */}
                        <div
                          className="flex items-center gap-1 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            title="Edit Template"
                            onClick={() => handleOpenEditModal(template)}
                            className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          >
                            <Edit3 className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Duplicate Template"
                            onClick={() => handleDuplicateTemplate(template)}
                            className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          >
                            <Copy className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Delete Template"
                            onClick={() => handleDeleteTemplate(template.id, template.activity)}
                            className="p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="font-bold text-foreground text-xs leading-snug">
                        {template.activity}
                      </div>

                      <div className="text-[11px] text-muted-foreground flex items-center justify-between pt-0.5 border-t border-border/40">
                        <span>{template.hazards.length} Hazards • {template.controlMeasures.length} Controls</span>
                        <span className="font-mono text-[10px]">{template.oshaStandard || "Cal/OSHA"}</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Right Column: Detailed Template Inspector & Controls */}
            <div className="lg:col-span-7">
              {selectedTemplate ? (
                <Card className="rounded-3xl border-border/80 shadow-xs flex flex-col space-y-0">
                  <CardHeader className="space-y-2 border-b border-border/60 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary text-white font-bold text-xs">
                          {selectedTemplate.trade}
                        </Badge>
                        <Badge variant="outline" className="text-emerald-600 border-emerald-500/20 bg-emerald-500/10 font-bold">
                          {selectedTemplate.oshaStandard || "Cal/OSHA Title 8 § 1509"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleTemplateStatus(selectedTemplate)}
                          className={`h-7 text-xs font-bold rounded-lg ${
                            selectedTemplate.status === "active"
                              ? "text-emerald-700 border-emerald-500/30"
                              : "text-muted-foreground"
                          }`}
                        >
                          {selectedTemplate.status === "active" ? "Active in App ✓" : "Activate"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEditModal(selectedTemplate)}
                          className="h-7 text-xs font-bold gap-1 rounded-lg"
                        >
                          <Edit3 className="size-3" />
                          <span>Edit</span>
                        </Button>
                      </div>
                    </div>

                    <CardTitle className="text-base font-black text-foreground">
                      {selectedTemplate.activity}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-4 text-xs">
                    {/* Potential Hazards */}
                    <div className="space-y-2 p-3.5 rounded-2xl bg-destructive/5 border border-destructive/20">
                      <div className="font-bold text-destructive flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle className="size-4" />
                          <span>Identified Activity Hazards ({selectedTemplate.hazards.length}):</span>
                        </span>
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
                        <span>Mandatory Engineering & Work Controls ({selectedTemplate.controlMeasures.length}):</span>
                      </div>
                      <ul className="list-disc list-inside space-y-1.5 text-muted-foreground pl-1 leading-relaxed">
                        {selectedTemplate.controlMeasures.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>

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
                  </CardContent>

                  <CardFooter className="flex items-center justify-between border-t border-border/60 pt-3 mt-4">
                    <span className="text-[11px] text-muted-foreground font-medium">
                      Live sync to mobile field crews
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleDownloadTemplatePdf(selectedTemplate)}
                      className="text-xs font-bold gap-1.5 bg-primary text-white rounded-xl cursor-pointer"
                    >
                      <FileDown className="size-3.5" />
                      <span>Export Template PDF</span>
                    </Button>
                  </CardFooter>
                </Card>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: LIVE FIELD JHA SUBMISSIONS ──────────────────────── */}
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

      {/* ── SUPER ADMIN TEMPLATE EDITOR DRAWER (CREATE & EDIT) ───────── */}
      {isEditorOpen &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="fixed inset-0" onClick={() => setIsEditorOpen(false)} />
            <div className="relative z-10 w-full max-w-2xl h-full bg-card shadow-2xl border-l border-border p-6 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden space-y-5 animate-in slide-in-from-right duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="text-base font-black text-foreground flex items-center gap-2">
                  <Sliders className="size-5 text-primary" />
                  <span>{editingTemplateId ? "Edit JHA Standard Template" : "Create Master JHA Template"}</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Changes sync immediately to all mobile field foreman devices.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="size-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground font-bold cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 text-xs">
              {/* Activity Name */}
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Activity Scope Title *</label>
                <Input
                  value={editorActivity}
                  onChange={(e) => setEditorActivity(e.target.value)}
                  placeholder="e.g. Deep Foundation Trenching & Footing Excavation"
                  className="rounded-xl text-xs h-10"
                />
              </div>

              {/* Trade Category & Regulatory Standard */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Trade Category</label>
                  <Input
                    value={editorTrade}
                    onChange={(e) => setEditorTrade(e.target.value)}
                    placeholder="e.g. Excavation & Earthwork"
                    className="rounded-xl text-xs h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">OSHA Standard / Subpart</label>
                  <Input
                    value={editorOshaStandard}
                    onChange={(e) => setEditorOshaStandard(e.target.value)}
                    placeholder="e.g. Cal/OSHA Title 8 § 1541"
                    className="rounded-xl text-xs h-10"
                  />
                </div>
              </div>

              {/* Status Switch */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60">
                <div>
                  <span className="font-bold text-foreground block">Active in Mobile App</span>
                  <span className="text-[11px] text-muted-foreground">
                    When active, foremen can select this template during pre-task sign-offs.
                  </span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setEditorStatus((prev) => (prev === "active" ? "inactive" : "active"))}
                  className={`text-xs font-bold ${
                    editorStatus === "active"
                      ? "bg-emerald-500/15 text-emerald-800 border-emerald-500/30"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {editorStatus === "active" ? "Active ✓" : "Inactive (Draft)"}
                </Button>
              </div>

              {/* 1. Dynamic Hazards Manager */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-destructive/5 border border-destructive/20">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-destructive flex items-center gap-1.5">
                    <AlertTriangle className="size-4" />
                    <span>Identified Activity Hazards ({editorHazards.length})</span>
                  </span>
                </div>

                <div className="space-y-1.5">
                  {editorHazards.map((hz, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-xl bg-background border border-border/60 text-xs"
                    >
                      <span className="leading-snug">{hz}</span>
                      <button
                        type="button"
                        onClick={() => setEditorHazards((prev) => prev.filter((_, idx) => idx !== i))}
                        className="text-muted-foreground hover:text-destructive p-1 shrink-0 transition-colors cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Input
                    value={newHazardText}
                    onChange={(e) => setNewHazardText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        if (newHazardText.trim()) {
                          setEditorHazards((prev) => [...prev, newHazardText.trim()])
                          setNewHazardText("")
                        }
                      }
                    }}
                    placeholder="Add custom hazard..."
                    className="text-xs h-9 rounded-xl bg-background"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (newHazardText.trim()) {
                        setEditorHazards((prev) => [...prev, newHazardText.trim()])
                        setNewHazardText("")
                      }
                    }}
                    className="h-9 px-3 rounded-xl font-bold cursor-pointer"
                  >
                    <Plus className="size-3.5" /> Add
                  </Button>
                </div>
              </div>

              {/* 2. Mandatory Engineering Controls Manager */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="size-4" />
                    <span>Mandatory Engineering & Work Controls ({editorControls.length})</span>
                  </span>
                </div>

                <div className="space-y-1.5">
                  {editorControls.map((ctrl, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-xl bg-background border border-border/60 text-xs"
                    >
                      <span className="leading-snug">{ctrl}</span>
                      <button
                        type="button"
                        onClick={() => setEditorControls((prev) => prev.filter((_, idx) => idx !== i))}
                        className="text-muted-foreground hover:text-destructive p-1 shrink-0 transition-colors cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Input
                    value={newControlText}
                    onChange={(e) => setNewControlText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        if (newControlText.trim()) {
                          setEditorControls((prev) => [...prev, newControlText.trim()])
                          setNewControlText("")
                        }
                      }
                    }}
                    placeholder="Add mandatory control measure..."
                    className="text-xs h-9 rounded-xl bg-background"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (newControlText.trim()) {
                        setEditorControls((prev) => [...prev, newControlText.trim()])
                        setNewControlText("")
                      }
                    }}
                    className="h-9 px-3 rounded-xl font-bold cursor-pointer"
                  >
                    <Plus className="size-3.5" /> Add
                  </Button>
                </div>
              </div>

              {/* 3. Mandatory PPE Matrix Manager */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary flex items-center gap-1.5">
                    <HardHat className="size-4" />
                    <span>Mandatory PPE Items ({editorPPE.length})</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {editorPPE.map((ppe, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-xl bg-background border border-border/60 text-xs"
                    >
                      <span className="truncate">{ppe}</span>
                      <button
                        type="button"
                        onClick={() => setEditorPPE((prev) => prev.filter((_, idx) => idx !== i))}
                        className="text-muted-foreground hover:text-destructive p-1 shrink-0 transition-colors cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Input
                    value={newPPEText}
                    onChange={(e) => setNewPPEText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        if (newPPEText.trim()) {
                          setEditorPPE((prev) => [...prev, newPPEText.trim()])
                          setNewPPEText("")
                        }
                      }
                    }}
                    placeholder="Add PPE requirement..."
                    className="text-xs h-9 rounded-xl bg-background"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (newPPEText.trim()) {
                        setEditorPPE((prev) => [...prev, newPPEText.trim()])
                        setNewPPEText("")
                      }
                    }}
                    className="h-9 px-3 rounded-xl font-bold cursor-pointer"
                  >
                    <Plus className="size-3.5" /> Add
                  </Button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditorOpen(false)}
                className="text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isSavingTemplate}
                onClick={handleSaveTemplate}
                className="text-xs font-bold bg-primary hover:bg-primary/90 text-white rounded-xl px-5 h-10 shadow-xs cursor-pointer"
              >
                {isSavingTemplate ? "Publishing to Database..." : "Save & Publish Template"}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── JHA AUDIT DOSSIER SIDE DRAWER ──────────────────────────── */}
      {inspectingJha &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="fixed inset-0" onClick={() => setInspectingJha(null)} />
            <div className="relative z-10 w-full max-w-2xl h-full bg-card shadow-2xl border-l border-border p-6 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden space-y-5 animate-in slide-in-from-right duration-200">
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
        </div>,
        document.body
      )}
    </div>
  )
}
