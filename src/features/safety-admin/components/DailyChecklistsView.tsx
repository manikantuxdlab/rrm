import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { SubmissionRecord, ChecklistItem, JobSite } from "@/types"
import { jobsitesService } from "@/services/jobsitesService"
import { submissionsService } from "@/services/submissionsService"
import { ChecklistImportModal } from "./ChecklistImportModal"
import { ChecklistItemEditModal } from "./ChecklistItemEditModal"
import { useAppDispatch, useAppSelector } from "@/store"
import {
  setSelectedSiteId,
  loadChecklist,
  publishChecklist,
  addItem,
  updateItem,
  deleteItem,
  moveItem,
  importItems,
  resetToStandard,
} from "@/store/checklistSlice"
import {
  ClipboardCheck,
  CheckCircle2,
  Building2,
  Eye,
  Camera,
  Filter,
  UploadCloud,
  Plus,
  Save,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit2,
  Download,
  Layers,
  Radio,
  Archive,
  ArchiveRestore,
  Search,
  User,
} from "lucide-react"

export function DailyChecklistsView({
  onSelectSubmission,
}: {
  onSelectSubmission: (submission: SubmissionRecord) => void
}) {
  const dispatch = useAppDispatch()
  const {
    selectedSiteId,
    items: checklistItems,
    saving: isSaving,
    hasUnsavedChanges,
    realtimeConnected,
    lastSyncedAt,
  } = useAppSelector((state) => state.checklist)

  const [activeTab, setActiveTab] = React.useState<"checklist_manager" | "audits">("checklist_manager")
  const [jobsites, setJobsites] = React.useState<JobSite[]>([])
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all")
  const [saveSuccessMessage, setSaveSuccessMessage] = React.useState<string | null>(null)

  // Modals
  const [importModalOpen, setImportModalOpen] = React.useState(false)
  const [editModalOpen, setEditModalOpen] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState<ChecklistItem | null>(null)

  // Fetch jobsites list on mount
  React.useEffect(() => {
    async function loadSites() {
      try {
        const sites = await jobsitesService.fetchAll()
        setJobsites(sites)
      } catch (err) {
        console.error("Failed to load jobsites:", err)
      }
    }
    loadSites()
  }, [])

  // Load checklist items from Redux whenever selected site changes
  React.useEffect(() => {
    dispatch(loadChecklist(selectedSiteId))
  }, [dispatch, selectedSiteId])

  const selectedSite = React.useMemo(() => {
    if (selectedSiteId === "global") return null
    return jobsites.find((s) => s.id === selectedSiteId) || null
  }, [selectedSiteId, jobsites])

  const [submissions, setSubmissions] = React.useState<SubmissionRecord[]>([])
  const [isLoadingSubmissions, setIsLoadingSubmissions] = React.useState(false)

  // Fetch real submissions for the active site scope
  const loadSubmissions = React.useCallback(async () => {
    setIsLoadingSubmissions(true)
    try {
      const records = await submissionsService.fetchAll({
        moduleType: "daily_checklist",
        jobSiteId: selectedSiteId === "global" ? undefined : selectedSiteId,
      })
      setSubmissions(records)
    } catch (err) {
      console.error("Failed to load submissions:", err)
    } finally {
      setIsLoadingSubmissions(false)
    }
  }, [selectedSiteId])


  const [auditFilter, setAuditFilter] = React.useState<"active" | "archived" | "all">("active")
  const [auditSearch, setAuditSearch] = React.useState("")
  const [archivingId, setArchivingId] = React.useState<string | null>(null)

  const handleToggleArchive = async (e: React.MouseEvent, sub: SubmissionRecord) => {
    e.stopPropagation()
    setArchivingId(sub.id)
    try {
      const ok = await submissionsService.toggleArchive(sub.id, Boolean(sub.isArchived))
      if (ok) {
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === sub.id
              ? {
                  ...s,
                  isArchived: !sub.isArchived,
                  syncStatus: !sub.isArchived ? "archived" : "synced",
                }
              : s
          )
        )
      } else {
        alert("Failed to update archive status.")
      }
    } catch (err) {
      console.error("Error toggling archive:", err)
    } finally {
      setArchivingId(null)
    }
  }

  const activeAuditsCount = React.useMemo(
    () => submissions.filter((s) => !s.isArchived).length,
    [submissions]
  )
  const archivedAuditsCount = React.useMemo(
    () => submissions.filter((s) => s.isArchived).length,
    [submissions]
  )

  const filteredAudits = React.useMemo(() => {
    return submissions.filter((sub) => {
      if (auditFilter === "active" && sub.isArchived) return false
      if (auditFilter === "archived" && !sub.isArchived) return false

      if (auditSearch.trim()) {
        const q = auditSearch.toLowerCase()
        const matches =
          sub.id.toLowerCase().includes(q) ||
          sub.title.toLowerCase().includes(q) ||
          sub.jobSiteName.toLowerCase().includes(q) ||
          sub.foremanName.toLowerCase().includes(q)
        if (!matches) return false
      }
      return true
    })
  }, [submissions, auditFilter, auditSearch])

  // Load submissions whenever selectedSiteId changes
  React.useEffect(() => {
    loadSubmissions()
  }, [loadSubmissions])

  // Subscribe to real-time submission additions/updates
  React.useEffect(() => {
    const unsubscribe = submissionsService.subscribeToChanges(() => {
      loadSubmissions()
    })
    return () => {
      unsubscribe()
    }
  }, [loadSubmissions])

  const filteredChecklistItems = React.useMemo(() => {
    if (selectedCategory === "all") return checklistItems
    return checklistItems.filter((item) => item.category === selectedCategory)
  }, [checklistItems, selectedCategory])

  // Category summary counts
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {}
    checklistItems.forEach((i) => {
      counts[i.category] = (counts[i.category] || 0) + 1
    })
    return counts
  }, [checklistItems])

  // Save checklist via Redux action
  const handleSaveChecklist = async () => {
    setSaveSuccessMessage(null)
    const resultAction = await dispatch(
      publishChecklist({ siteId: selectedSiteId, items: checklistItems })
    )
    if (publishChecklist.fulfilled.match(resultAction)) {
      const siteLabel = selectedSite ? selectedSite.name : "Global Default Template"
      setSaveSuccessMessage(
        `Successfully published ${checklistItems.length} items for ${siteLabel}! Live in mobile app.`
      )
      setTimeout(() => setSaveSuccessMessage(null), 4000)
    } else {
      alert("Failed to save checklist: " + (resultAction.payload || "Unknown error"))
    }
  }

  // Handle Import
  const handleImport = (newItems: ChecklistItem[], mode: "replace" | "append") => {
    dispatch(importItems({ items: newItems, mode }))
  }

  // Handle Reset to standard template
  const handleResetToStandard = () => {
    if (confirm("Reset current checklist to the standard OSHA 20-item template?")) {
      dispatch(resetToStandard())
    }
  }

  // Handle Add Item
  const handleAddItem = () => {
    setEditingItem(null)
    setEditModalOpen(true)
  }

  // Handle Edit Item
  const handleEditItem = (item: ChecklistItem) => {
    setEditingItem(item)
    setEditModalOpen(true)
  }

  // Save Add/Edit Item
  const handleSaveItem = (item: ChecklistItem) => {
    const exists = checklistItems.some((i) => i.id === item.id)
    if (exists) {
      dispatch(updateItem(item))
    } else {
      dispatch(addItem(item))
    }
  }

  // Delete Item
  const handleDeleteItem = (id: string) => {
    dispatch(deleteItem(id))
  }

  // Move Item Up
  const handleMoveUp = (index: number) => {
    if (index === 0) return
    dispatch(moveItem({ fromIndex: index, toIndex: index - 1 }))
  }

  // Move Item Down
  const handleMoveDown = (index: number) => {
    if (index === checklistItems.length - 1) return
    dispatch(moveItem({ fromIndex: index, toIndex: index + 1 }))
  }

  // Export checklist as JSON
  const handleExportJson = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(checklistItems, null, 2))
    const downloadAnchor = document.createElement("a")
    downloadAnchor.setAttribute("href", dataStr)
    const siteSlug = selectedSite
      ? selectedSite.name.toLowerCase().replace(/[^a-z0-9]/g, "_")
      : "global"
    downloadAnchor.setAttribute("download", `checklist_${siteSlug}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  return (
    <div className="space-y-4">
      {/* Modals */}
      <ChecklistImportModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onImport={handleImport}
        currentSiteName={selectedSite ? selectedSite.name : "Global Default Template"}
      />
      <ChecklistItemEditModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        item={editingItem}
        onSave={handleSaveItem}
      />

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <ClipboardCheck className="size-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Checklist Management</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Redux-powered site-wise checklist builder with Supabase real-time cloud snapshots
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs & Realtime Indicator */}
        <div className="flex items-center gap-2">
          {realtimeConnected && (
            <Badge
              variant="outline"
              className="text-[10px] gap-1 text-emerald-600 bg-emerald-500/10 border-emerald-500/20"
              title="Supabase Realtime WebSocket Active: Live snapshots enabled"
            >
              <Radio className="size-3 text-emerald-600 animate-pulse" />
              Live Snapshot
            </Badge>
          )}

          <div className="inline-flex rounded-lg border border-border bg-muted p-1 text-xs">
            <button
              onClick={() => setActiveTab("checklist_manager")}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === "checklist_manager"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="size-3.5 text-primary" />
              Checklist Manager ({checklistItems.length})
            </button>
            <button
              onClick={() => setActiveTab("audits")}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === "audits"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CheckCircle2 className="size-3.5 text-emerald-600" />
              Field Audits ({activeAuditsCount})
            </button>
          </div>
        </div>
      </div>

      {/* Unified Compact Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 p-2 px-3 rounded-xl bg-card border border-border/80 shadow-2xs">
        {/* Left: Compact Site Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground shrink-0">
            <Building2 className="size-3.5 text-primary" />
            <span>Site:</span>
          </div>
          <select
            id="site-select"
            value={selectedSiteId}
            onChange={(e) => dispatch(setSelectedSiteId(e.target.value))}
            className="text-xs rounded-lg border border-border bg-background px-2.5 py-1 text-foreground font-medium shadow-2xs focus:ring-1 focus:ring-primary focus:outline-hidden min-w-[220px] max-w-[320px] truncate"
          >
            <option value="global">All Sites (Global Template)</option>
            {jobsites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name} ({site.jobNumber})
              </option>
            ))}
          </select>
          {selectedSiteId === "global" ? (
            <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20 shrink-0">
              Global
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shrink-0">
              Site-Specific
            </Badge>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-1.5 justify-end">
          <Button
            size="sm"
            onClick={handleAddItem}
            className="h-7 text-xs px-2.5 gap-1 bg-primary text-primary-foreground font-semibold shadow-2xs cursor-pointer"
          >
            <Plus className="size-3" />
            Add Item
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setImportModalOpen(true)}
            className="h-7 text-xs px-2.5 gap-1 border-primary/30 text-primary hover:bg-primary/10 font-semibold cursor-pointer"
          >
            <UploadCloud className="size-3" />
            Import (Excel, CSV, JSON, TXT)
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleExportJson}
            className="h-7 text-xs px-2 gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
            title="Export JSON"
          >
            <Download className="size-3" />
            Export
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleResetToStandard}
            className="h-7 text-xs px-2 gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
            title="Reset to standard 20 items"
          >
            <RotateCcw className="size-3" />
            Reset
          </Button>

          {hasUnsavedChanges && (
            <span className="text-[10px] text-amber-600 font-medium px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 animate-pulse">
              ● Unsaved
            </span>
          )}

          <Button
            size="sm"
            onClick={handleSaveChecklist}
            disabled={isSaving || !hasUnsavedChanges}
            className={`h-7 text-xs px-3 gap-1 font-bold shadow-2xs cursor-pointer ${
              hasUnsavedChanges
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-muted text-muted-foreground opacity-60"
            }`}
          >
            <Save className="size-3" />
            {isSaving ? "Saving..." : "Save to Cloud"}
          </Button>
        </div>
      </div>

      {/* Save Success Alert */}
      {saveSuccessMessage && (
        <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium flex items-center justify-between animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-3.5 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
          <span className="text-[10px] uppercase font-mono tracking-wider">
            {lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString() : "Synced"}
          </span>
        </div>
      )}

      {activeTab === "checklist_manager" ? (
        <div className="space-y-3">
          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Filter className="size-3.5" /> Categories:
            </span>
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              All Items ({checklistItems.length})
            </button>
            {Object.keys(categoryCounts).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs capitalize transition-colors ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.replace("_", " ")} ({categoryCounts[cat]})
              </button>
            ))}
          </div>

          {/* Interactive Checklist Items Table */}
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/60 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-semibold w-16">Item #</th>
                    <th className="px-4 py-3 font-semibold w-32">Category</th>
                    <th className="px-4 py-3 font-semibold">Inspection Standard (English & Spanish)</th>
                    <th className="px-4 py-3 font-semibold w-28">OSHA Code</th>
                    <th className="px-4 py-3 font-semibold w-32 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredChecklistItems.map((item, idx) => {
                    const originalIndex = checklistItems.findIndex((i) => i.id === item.id)
                    return (
                      <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="px-4 py-3 font-mono font-bold text-muted-foreground">
                          #{idx + 1}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                            {item.category.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 space-y-0.5">
                          <div className="font-semibold text-foreground text-xs leading-relaxed">
                            {item.labelEn}
                          </div>
                          {item.labelEs && item.labelEs !== item.labelEn && (
                            <div className="text-[11px] text-muted-foreground italic leading-relaxed">
                              {item.labelEs}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">
                            {item.oshaRef || "OSHA 1926"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleMoveUp(originalIndex)}
                              disabled={originalIndex === 0}
                              title="Move Up"
                              className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                              <ArrowUp className="size-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveDown(originalIndex)}
                              disabled={originalIndex === checklistItems.length - 1}
                              title="Move Down"
                              className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                              <ArrowDown className="size-3.5" />
                            </button>
                            <button
                              onClick={() => handleEditItem(item)}
                              title="Edit Item"
                              className="p-1 rounded-md hover:bg-muted text-primary hover:text-primary/80"
                            >
                              <Edit2 className="size-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              title="Delete Item"
                              className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}

                  {filteredChecklistItems.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-xs text-muted-foreground">
                        No checklist items found in this category. Click &quot;Add Item&quot; or &quot;Import&quot; to add items.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Submitted Audits Tabular View */
        <div className="space-y-3">
          {/* Sub-bar: Filter buttons (Active, Archived, All) and Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="inline-flex rounded-lg border border-border bg-muted p-1 text-xs">
              <button
                onClick={() => setAuditFilter("active")}
                className={`px-3 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                  auditFilter === "active"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                Active ({activeAuditsCount})
              </button>
              <button
                onClick={() => setAuditFilter("archived")}
                className={`px-3 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                  auditFilter === "archived"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Archive className="size-3.5 text-amber-600" />
                Archived ({archivedAuditsCount})
              </button>
              <button
                onClick={() => setAuditFilter("all")}
                className={`px-3 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                  auditFilter === "all"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Records ({submissions.length})
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search audit ID, title, jobsite, foreman..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Clean Tabular View Card */}
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/60 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Audit ID & Date</th>
                    <th className="px-4 py-3 font-semibold">Inspection Scope</th>
                    <th className="px-4 py-3 font-semibold">Jobsite Location</th>
                    <th className="px-4 py-3 font-semibold">Foreman</th>
                    <th className="px-4 py-3 font-semibold">Audit Results</th>
                    <th className="px-4 py-3 font-semibold text-center">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {isLoadingSubmissions ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-xs text-muted-foreground">
                        <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent mb-2" />
                        <p>Loading field audits from Supabase cloud...</p>
                      </td>
                    </tr>
                  ) : filteredAudits.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-xs text-muted-foreground">
                        <div className="size-10 rounded-full bg-muted mx-auto flex items-center justify-center text-muted-foreground mb-2">
                          <ClipboardCheck className="size-5 opacity-60" />
                        </div>
                        <p className="font-medium text-foreground">
                          {auditFilter === "archived"
                            ? "No archived field audits."
                            : "No field audits found."}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {auditSearch
                            ? "Try adjusting your search query."
                            : "Completed daily checklists from the mobile app will automatically appear here."}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredAudits.map((sub) => (
                      <tr
                        key={sub.id}
                        onClick={() => onSelectSubmission(sub)}
                        className="hover:bg-muted/40 transition-colors cursor-pointer group"
                      >
                        <td className="px-5 py-5 align-middle whitespace-nowrap">
                          <div className="font-mono text-[11px] font-medium text-foreground tracking-tight">
                            {sub.id}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            {sub.timestamp}
                          </div>
                        </td>

                        <td className="px-5 py-5 align-middle max-w-sm">
                          <div className="font-medium text-xs text-foreground group-hover:text-primary transition-colors leading-snug">
                            {sub.title}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <Badge variant="outline" className="text-[9px] h-4.5 px-1.5 text-emerald-600 bg-emerald-500/10 border-emerald-500/20 font-medium">
                              <CheckCircle2 className="size-2.5 mr-0.5" /> Cal/OSHA
                            </Badge>
                            {sub.recipients && sub.recipients.length > 0 && (
                              <span className="text-[10px] text-muted-foreground truncate max-w-[200px]" title={sub.recipients.join(", ")}>
                                to: {sub.recipients[0]}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-5 align-middle">
                          <div className="flex items-center gap-1.5 font-medium text-xs text-foreground">
                            <Building2 className="size-3.5 text-primary shrink-0" />
                            <span className="truncate max-w-[190px]" title={sub.jobSiteName}>
                              {sub.jobSiteName}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-5 align-middle whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                            <User className="size-3.5 text-muted-foreground shrink-0" />
                            <span>{sub.foremanName}</span>
                          </div>
                          {sub.companyName && (
                            <div className="text-[11px] text-muted-foreground ml-5 mt-0.5">
                              {sub.companyName}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-5 align-middle whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                              <span>{sub.data?.passedCount ?? 0} Passed</span>
                              {Boolean(sub.data?.failedCount) && (
                                <span className="text-amber-600 font-semibold ml-1">
                                  • {sub.data.failedCount} Corrected
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                              <Camera className="size-3 text-muted-foreground/70" />
                              <span>{sub.data?.photoCount ?? 0} Evidence Photos</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5 align-middle text-center whitespace-nowrap">
                          {sub.isArchived ? (
                            <Badge variant="outline" className="text-xs h-6 px-2.5 bg-muted text-muted-foreground border-border font-medium">
                              Archived
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs h-6 px-2.5 text-emerald-600 bg-emerald-500/10 border-emerald-500/20 font-medium">
                              Active
                            </Badge>
                          )}
                        </td>

                        <td className="px-5 py-5 align-middle text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2.5 text-xs gap-1.5 text-primary hover:text-primary hover:bg-primary/10 font-medium"
                              onClick={(e) => {
                                e.stopPropagation()
                                onSelectSubmission(sub)
                              }}
                              title="View Signed Compliance PDF"
                            >
                              <Eye className="size-3.5" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={archivingId === sub.id}
                              className={`h-8 px-2.5 text-xs gap-1.5 font-medium ${
                                sub.isArchived
                                  ? "text-primary hover:text-primary hover:bg-primary/10"
                                  : "text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10"
                              }`}
                              onClick={(e) => handleToggleArchive(e, sub)}
                              title={sub.isArchived ? "Restore submission" : "Archive submission"}
                            >
                              {sub.isArchived ? (
                                <>
                                  <ArchiveRestore className="size-3.5" />
                                  Restore
                                </>
                              ) : (
                                <>
                                  <Archive className="size-3.5" />
                                  Archive
                                </>
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
