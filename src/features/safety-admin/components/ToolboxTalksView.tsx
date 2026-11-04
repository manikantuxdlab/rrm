import * as React from "react"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toolboxAdminService } from "@/services"
import type { SubmissionRecord, ToolboxTopic } from "@/types"
import {
  MessageSquareCheck,
  CheckCircle2,
  XCircle,
  Clock,
  FileCheck,
  Eye,
  Users,
  Search,
  Loader2,
  AlertCircle,
  Building2,
  Download,
  LayoutGrid,
  List,
  Plus,
  Edit2,
  Trash2,
  Save,
  MoreVertical,
} from "lucide-react"

export function ToolboxTalksView({
  onSelectSubmission,
}: {
  onSelectSubmission: (submission: SubmissionRecord) => void
}) {
  // Live State from Supabase
  const [topics, setTopics] = React.useState<ToolboxTopic[]>([])
  const [submissions, setSubmissions] = React.useState<SubmissionRecord[]>([])
  const [isLoading, setIsLoading] = React.useState<boolean>(true)

  const [activeTab, setActiveTab] = React.useState<"library" | "rosters">("library")
  const [searchQuery, setSearchQuery] = React.useState("")

  // View Mode: Table (default) vs Grid Cards (Independent for Library & Rosters)
  const [libraryViewMode, setLibraryViewMode] = React.useState<"table" | "grid">("table")
  const [rostersViewMode, setRostersViewMode] = React.useState<"table" | "grid">("table")

  // Topic View Drawer (Row click sheet open)
  const [viewingTopic, setViewingTopic] = React.useState<ToolboxTopic | null>(null)
  const [isViewSheetOpen, setIsViewSheetOpen] = React.useState(false)
  const [drawerLang, setDrawerLang] = React.useState<"en" | "es">("en")

  // Edit Topic Sheet Drawer
  const [editingTopic, setEditingTopic] = React.useState<ToolboxTopic | null>(null)
  const [isEditSheetOpen, setIsEditSheetOpen] = React.useState(false)

  // Add Topic Sheet Drawer
  const [isAddSheetOpen, setIsAddSheetOpen] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)

  // Form State for Add / Edit
  const [formNumber, setFormNumber] = React.useState<number>(1)
  const [formStatus, setFormStatus] = React.useState<"active" | "inactive">("active")
  const [formTitleEn, setFormTitleEn] = React.useState("")
  const [formTitleEs, setFormTitleEs] = React.useState("")
  const [formOsha, setFormOsha] = React.useState("")
  const [formTrade, setFormTrade] = React.useState("Concrete & Masonry")
  const [formDuration, setFormDuration] = React.useState(15)
  const [formHazards, setFormHazards] = React.useState<string>("")
  const [formDiscussion, setFormDiscussion] = React.useState<string>("")
  const [formActions, setFormActions] = React.useState<string>("")
  // Schedule Config State
  


  // Load topics and real submissions on mount
  const loadData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const [fetchedTopics, fetchedSubmissions] = await Promise.all([
        toolboxAdminService.fetchTopics(),
        toolboxAdminService.fetchToolboxSubmissions(),
      ])
      setTopics(fetchedTopics)
      setSubmissions(fetchedSubmissions)
    } catch (err) {
      console.error("[ToolboxTalksView] Load data error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])




  // Toggle Active / Inactive Status
  const handleToggleStatus = async (topicId: string, currentStatus?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const nextStatus: "active" | "inactive" = currentStatus === "inactive" ? "active" : "inactive"
    // Optimistic UI update
    setTopics(prev => prev.map(t => t.id === topicId ? { ...t, status: nextStatus } : t))
    if (viewingTopic && viewingTopic.id === topicId) {
      setViewingTopic(prev => prev ? { ...prev, status: nextStatus } : null)
    }

    const ok = await toolboxAdminService.setTopicStatus(topicId, nextStatus)
    if (!ok) {
      await loadData() // Revert if failed
    }
  }

  // Open Topic Details View Sheet (On row click)
  const handleOpenView = (topic: ToolboxTopic) => {
    setViewingTopic(topic)
    setDrawerLang("en")
    setIsViewSheetOpen(true)
  }

  // Open Edit Sheet
  const handleOpenEdit = (topic: ToolboxTopic, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setEditingTopic(topic)
    setFormNumber(topic.number)
    setFormStatus((topic.status === "inactive" ? "inactive" : "active"))
    setFormTitleEn(topic.titleEn || "")
    setFormTitleEs(topic.titleEs || "")
    setFormOsha(topic.oshaStandard || "")
    setFormTrade(topic.trade || "Concrete & Masonry")
    setFormDuration(topic.durationMinutes || 15)
    setFormHazards((topic.keyHazards || []).join("\n"))
    setFormDiscussion((topic.discussionPoints || []).join("\n"))
    setFormActions((topic.recommendedActionItems || []).join("\n"))
    setIsViewSheetOpen(false)
    setIsEditSheetOpen(true)
  }

  // Open Add Sheet
  const handleOpenAdd = () => {
    const nextNumber = topics.length > 0 ? Math.max(...topics.map((t) => t.number)) + 1 : 1
    setFormNumber(nextNumber)
    setFormStatus("active")
    setFormTitleEn("")
    setFormTitleEs("")
    setFormOsha("29 CFR 1926.")
    setFormTrade("Concrete & Masonry")
    setFormDuration(15)
    setFormHazards("")
    setFormDiscussion("")
    setFormActions("")
    setIsAddSheetOpen(true)
  }

  // Save Edit
  const handleSaveEdit = async () => {
    if (!editingTopic) return
    setIsSaving(true)
    try {
      const updates: Partial<ToolboxTopic> = {
        number: Number(formNumber),
        status: formStatus,
        titleEn: formTitleEn.trim(),
        titleEs: formTitleEs.trim(),
        oshaStandard: formOsha.trim(),
        trade: formTrade.trim(),
        durationMinutes: Number(formDuration),
        keyHazards: formHazards.split("\n").map((s) => s.trim()).filter(Boolean),
        discussionPoints: formDiscussion.split("\n").map((s) => s.trim()).filter(Boolean),
        recommendedActionItems: formActions.split("\n").map((s) => s.trim()).filter(Boolean),
      }

      const success = await toolboxAdminService.updateTopic(editingTopic.id, updates)
      if (success) {
        setIsEditSheetOpen(false)
        await loadData()
      } else {
        alert("Failed to update topic in Supabase.")
      }
    } finally {
      setIsSaving(false)
    }
  }

  // Save Add
  const handleSaveAdd = async () => {
    if (!formTitleEn.trim()) {
      alert("Please provide an English Title.")
      return
    }
    setIsSaving(true)
    try {
      const newTopicData = {
        number: Number(formNumber),
        status: formStatus,
        titleEn: formTitleEn.trim(),
        titleEs: formTitleEs.trim() || formTitleEn.trim(),
        oshaStandard: formOsha.trim(),
        trade: formTrade.trim(),
        durationMinutes: Number(formDuration),
        keyHazards: formHazards.split("\n").map((s) => s.trim()).filter(Boolean),
        discussionPoints: formDiscussion.split("\n").map((s) => s.trim()).filter(Boolean),
        recommendedActionItems: formActions.split("\n").map((s) => s.trim()).filter(Boolean),
      }

      const created = await toolboxAdminService.createTopic(newTopicData)
      if (created) {
        setIsAddSheetOpen(false)
        await loadData()
        handleOpenView(created)
      } else {
        alert("Failed to create topic in Supabase.")
      }
    } finally {
      setIsSaving(false)
    }
  }

  // Delete Topic
  const handleDeleteTopic = async (topicId: string, topicName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (confirm(`Are you sure you want to delete "${topicName}" from Supabase?`)) {
      setIsLoading(true)
      const success = await toolboxAdminService.deleteTopic(topicId)
      if (success) {
        setIsViewSheetOpen(false)
        await loadData()
      } else {
        alert("Failed to delete topic from Supabase.")
        setIsLoading(false)
      }
    }
  }

  const filteredTopics = React.useMemo(() => {
    return topics.filter(
      (t) =>
        (t.titleEn && t.titleEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.titleEs && t.titleEs.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.trade && t.trade.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.oshaStandard && t.oshaStandard.toLowerCase().includes(searchQuery.toLowerCase())) ||
        t.number.toString().includes(searchQuery)
    )
  }, [topics, searchQuery])

  const filteredSubmissions = React.useMemo(() => {
    return submissions.filter(
      (s) =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.jobSiteName && s.jobSiteName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.foremanName && s.foremanName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.companyName && s.companyName.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [submissions, searchQuery])

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <MessageSquareCheck className="size-5" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              Weekly Toolbox Safety Talks & Field Rosters
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            26-Week OSHA Safety Curricula • Live Field Attendance Rosters • Signed PDFs from Mobile App
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Main Segment Tabs */}
          <div className="inline-flex rounded-xl border border-border bg-muted/60 p-1 text-xs">
            <button
              onClick={() => setActiveTab("library")}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === "library"
                  ? "bg-card text-foreground shadow-xs border border-border/70"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Curriculum Library
            </button>
            <button
              onClick={() => setActiveTab("rosters")}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === "rosters"
                  ? "bg-card text-foreground shadow-xs border border-border/70"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Signed Field Rosters
            </button>
          </div>

          


          {activeTab === "library" && (
            <Button
              size="sm"
              onClick={handleOpenAdd}
              className="text-xs h-8.5 rounded-xl gap-1.5 bg-primary text-white font-bold cursor-pointer shadow-xs"
            >
              <Plus className="size-3.5" />
              Add Topic
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="p-16 text-center space-y-3">
          <Loader2 className="size-8 animate-spin mx-auto text-primary" />
          <p className="text-sm font-semibold text-foreground">Syncing data with Supabase...</p>
          <p className="text-xs text-muted-foreground">Loading topics and signed field records</p>
        </div>
      ) : activeTab === "library" ? (
        /* ========================================================================= */
        /* TAB 1: CURRICULUM LIBRARY (DEFAULT TABLE VIEW + CARD VIEW + SHEET DRAWER) */
        /* ========================================================================= */
        <div className="space-y-4">
          {/* Controls Bar: Search + Table/Grid Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="size-3.5 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search 26 topics by title, OSHA standard, trade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="text-xs text-muted-foreground">
                Showing <strong className="text-foreground">{filteredTopics.length}</strong> topics
              </div>

              {/* View Mode Toggle Button Group */}
              <div className="inline-flex rounded-xl border border-border bg-muted/60 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setLibraryViewMode("table")}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    libraryViewMode === "table"
                      ? "bg-card text-foreground shadow-xs border border-border/80"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Table View (Default)"
                >
                  <List className="size-3.5" />
                  <span>Table View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLibraryViewMode("grid")}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    libraryViewMode === "grid"
                      ? "bg-card text-foreground shadow-xs border border-border/80"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Card Grid View"
                >
                  <LayoutGrid className="size-3.5" />
                  <span>Card View</span>
                </button>
              </div>
            </div>
          </div>

          {filteredTopics.length === 0 ? (
            <div className="p-12 rounded-3xl border border-dashed border-border text-center space-y-3 bg-muted/20">
              <p className="text-sm font-bold text-foreground">No Topics Found</p>
              <p className="text-xs text-muted-foreground">Try clearing your search query.</p>
            </div>
          ) : libraryViewMode === "table" ? (
            /* DEFAULT TABLE VIEW FOR CURRICULUM LIBRARY */
            <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-2xs">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="w-[85px] font-bold">Topic #</TableHead>
                    <TableHead className="font-bold">Topic Title (EN / ES)</TableHead>
                    <TableHead className="font-bold">OSHA Standard</TableHead>
                    <TableHead className="font-bold">Trade Division</TableHead>
                    <TableHead className="font-bold">Duration</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="text-right font-bold w-[140px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTopics.map((topic) => (
                    <TableRow
                      key={topic.id}
                      onClick={() => handleOpenView(topic)}
                      className="hover:bg-muted/30 transition-colors cursor-pointer group"
                    >
                      {/* Topic Number */}
                      <TableCell>
                        <span className="inline-flex size-7 rounded-lg bg-primary/10 text-primary font-mono font-bold text-xs items-center justify-center">
                          {topic.number < 10 ? `0${topic.number}` : topic.number}
                        </span>
                      </TableCell>

                      {/* Title EN & ES */}
                      <TableCell>
                        <div className="font-bold text-xs text-foreground group-hover:text-primary transition-colors leading-snug">
                          {topic.titleEn}
                        </div>
                        {topic.titleEs && (
                          <div className="text-[11px] text-muted-foreground italic truncate max-w-md mt-0.5">
                            {topic.titleEs}
                          </div>
                        )}
                      </TableCell>

                      {/* OSHA Standard */}
                      <TableCell>
                        <span className="font-mono text-[10.5px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                          {topic.oshaStandard?.split("(")[0]?.trim() || "OSHA 1926"}
                        </span>
                      </TableCell>

                      {/* Trade */}
                      <TableCell>
                        <span className="text-xs text-foreground font-medium">
                          {topic.trade || "Concrete & Masonry"}
                        </span>
                      </TableCell>

                      {/* Duration */}
                      <TableCell>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                          <Clock className="size-3 text-muted-foreground" />
                          {topic.durationMinutes || 15} min
                        </span>
                      </TableCell>

                      {/* Clickable Interactive Status Toggle (Active vs Inactive) */}
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => handleToggleStatus(topic.id, topic.status, e)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                            topic.status !== "inactive"
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25"
                              : "bg-muted/70 text-muted-foreground border-border/80 hover:bg-muted"
                          }`}
                          title={`Click to set ${topic.status !== "inactive" ? "Inactive" : "Active"}`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              topic.status !== "inactive" ? "bg-emerald-500" : "bg-muted-foreground/60"
                            }`}
                          />
                          <span>{topic.status !== "inactive" ? "Active" : "Inactive"}</span>
                        </button>
                      </TableCell>

                      {/* 3-Dot Dropdown Action Menu: View, Edit, Status Toggle, Delete */}
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                                title="Actions"
                              >
                                <MoreVertical className="size-4" />
                                <span className="sr-only">Open Actions Menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44 text-xs rounded-xl p-1 shadow-lg border-border">
                              <DropdownMenuItem
                                onClick={() => handleOpenView(topic)}
                                className="flex items-center gap-2 cursor-pointer font-medium py-1.5"
                              >
                                <Eye className="size-3.5 text-muted-foreground" />
                                <span>View Details</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => handleOpenEdit(topic, e)}
                                className="flex items-center gap-2 cursor-pointer font-medium text-primary py-1.5"
                              >
                                <Edit2 className="size-3.5" />
                                <span>Edit Topic</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => handleToggleStatus(topic.id, topic.status, e)}
                                className="flex items-center gap-2 cursor-pointer font-medium text-foreground py-1.5"
                              >
                                {topic.status !== "inactive" ? (
                                  <>
                                    <XCircle className="size-3.5 text-muted-foreground" />
                                    <span>Set Inactive</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="size-3.5 text-emerald-600" />
                                    <span>Set Active</span>
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="my-1" />
                              <DropdownMenuItem
                                onClick={(e) => handleDeleteTopic(topic.id, topic.titleEn, e)}
                                className="flex items-center gap-2 cursor-pointer font-medium text-destructive focus:text-destructive py-1.5"
                              >
                                <Trash2 className="size-3.5" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            /* CARD GRID VIEW FOR CURRICULUM LIBRARY */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTopics.map((topic) => (
                <Card
                  key={topic.id}
                  onClick={() => handleOpenView(topic)}
                  className="group border-border/80 bg-card hover:border-primary/40 hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer"
                >
                  <CardHeader className="pb-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="outline" className="text-[10px] font-bold bg-primary/10 text-primary border-primary/20">
                        Topic #{topic.number} (1 of {topics.length || 26})
                      </Badge>
                      <button
                        type="button"
                        onClick={(e) => handleToggleStatus(topic.id, topic.status, e)}
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9.5px] font-mono font-bold transition-all cursor-pointer border ${
                          topic.status !== "inactive"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 hover:bg-emerald-500/25"
                            : "bg-muted/70 text-muted-foreground border-border/80 hover:bg-muted"
                        }`}
                        title={`Click to set ${topic.status !== "inactive" ? "Inactive" : "Active"}`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            topic.status !== "inactive" ? "bg-emerald-500" : "bg-muted-foreground/60"
                          }`}
                        />
                        <span>{topic.status !== "inactive" ? "Active" : "Inactive"}</span>
                      </button>
                    </div>

                    <CardTitle className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                      {topic.titleEn}
                    </CardTitle>

                    {topic.titleEs && (
                      <p className="text-[11px] text-muted-foreground italic truncate">
                        {topic.titleEs}
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-1 border-t border-border/50 text-[10.5px] text-muted-foreground">
                      <span className="font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded font-semibold">
                        {topic.oshaStandard?.split("(")[0]?.trim() || "OSHA Standard"}
                      </span>
                      <span>•</span>
                      <span>{topic.trade}</span>
                      <span>•</span>
                      <span>{topic.durationMinutes || 15} min</span>
                    </div>
                  </CardHeader>

                  <CardFooter className="pt-2 border-t border-border/60 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleOpenView(topic)}
                      className="text-xs text-muted-foreground hover:text-foreground gap-1 h-7"
                    >
                      <Eye className="size-3" /> View
                    </Button>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={(e) => handleOpenEdit(topic, e)}
                        className="text-xs border-primary/30 text-primary hover:bg-primary/10 h-7 px-2 gap-1"
                      >
                        <Edit2 className="size-3" /> Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={(e) => handleDeleteTopic(topic.id, topic.titleEn, e)}
                        className="text-xs border-destructive/30 text-destructive hover:bg-destructive/10 h-7 px-2"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* TAB 2: SIGNED FIELD ROSTERS (DEFAULT TABLE VIEW + CARD VIEW)              */
        /* ========================================================================= */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="size-3.5 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search by topic, jobsite, foreman..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="text-xs text-muted-foreground">
                Showing <strong className="text-foreground">{filteredSubmissions.length}</strong> signed records
              </div>

              {/* View Mode Toggle */}
              <div className="inline-flex rounded-xl border border-border bg-muted/60 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setRostersViewMode("table")}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    rostersViewMode === "table"
                      ? "bg-card text-foreground shadow-xs border border-border/80"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Table View (Default)"
                >
                  <List className="size-3.5" />
                  <span>Table View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRostersViewMode("grid")}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    rostersViewMode === "grid"
                      ? "bg-card text-foreground shadow-xs border border-border/80"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Card Grid View"
                >
                  <LayoutGrid className="size-3.5" />
                  <span>Card View</span>
                </button>
              </div>
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="p-12 rounded-3xl border border-dashed border-border text-center space-y-3 bg-muted/20">
              <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <FileCheck className="size-6" />
              </div>
              <h4 className="text-sm font-bold text-foreground">No Field Talk Rosters Yet</h4>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                When a foreman conducts a Weekly Safety Talk on the mobile app and collects worker signatures, it will appear here in real-time.
              </p>
            </div>
          ) : rostersViewMode === "table" ? (
            /* DEFAULT TABLE VIEW FOR SIGNED FIELD ROSTERS */
            <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-2xs">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="w-[100px] font-bold">Topic #</TableHead>
                    <TableHead className="font-bold">Topic & Module Title</TableHead>
                    <TableHead className="font-bold">Jobsite & Project</TableHead>
                    <TableHead className="font-bold">Foreman / Lead</TableHead>
                    <TableHead className="font-bold">Attending Crew</TableHead>
                    <TableHead className="font-bold">Timestamp</TableHead>
                    <TableHead className="font-bold">Audit Status</TableHead>
                    <TableHead className="text-right font-bold">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((sub) => {
                    const attendees: string[] = sub.data?.attendees || []
                    const attendeesCount = sub.data?.attendeesCount || attendees.length
                    const loggedTimestamp = sub.data?.formattedTimestamp || sub.timestamp
                    const documentUrl = sub.data?.documentUrl

                    return (
                      <TableRow key={sub.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="font-mono text-[10px] font-bold bg-primary/10 text-primary border-primary/25"
                          >
                            {sub.data?.topicNumber ? `Topic #${sub.data.topicNumber}` : "#17"}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="font-bold text-xs text-foreground leading-snug">
                            {sub.title}
                          </div>
                          {sub.data?.notes && (
                            <div className="text-[10.5px] text-muted-foreground italic truncate max-w-xs mt-0.5">
                              "{sub.data.notes}"
                            </div>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                            <Building2 className="size-3.5 text-primary shrink-0" />
                            <span className="truncate max-w-[180px]">{sub.jobSiteName || "Jobsite"}</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="text-xs font-semibold text-foreground">
                            {sub.foremanName || "Site Foreman"}
                          </span>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Badge variant="secondary" className="text-[10px] font-bold px-1.5 py-0 h-4.5 shrink-0">
                              <Users className="size-3 mr-1 text-primary" />
                              {attendeesCount} Present
                            </Badge>
                            {attendees.length > 0 && (
                              <span className="text-[10px] text-muted-foreground truncate max-w-[160px]" title={attendees.join(", ")}>
                                {attendees.join(", ")}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="text-[11px] font-mono text-muted-foreground whitespace-nowrap">
                            {loggedTimestamp}
                          </span>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-[10px] font-mono text-emerald-700 bg-emerald-500/10 border-emerald-500/25 gap-1 shrink-0 whitespace-nowrap"
                          >
                            <CheckCircle2 className="size-3" /> Signed & Verified
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => onSelectSubmission(sub)}
                              className="text-xs text-muted-foreground hover:text-foreground gap-1 h-7 px-2"
                            >
                              <Eye className="size-3" /> View
                            </Button>

                            {documentUrl ? (
                              <a
                                href={documentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-bold bg-primary text-white hover:bg-primary/90 px-2.5 py-1 rounded-md transition-colors shadow-2xs h-7"
                              >
                                <Download className="size-3" />
                                PDF
                              </a>
                            ) : (
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() => onSelectSubmission(sub)}
                                className="text-xs gap-1 border-primary/30 text-primary h-7 px-2"
                              >
                                <Download className="size-3" /> PDF
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            /* CARD GRID VIEW FOR SIGNED FIELD ROSTERS */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSubmissions.map((sub) => {
                const attendees: string[] = sub.data?.attendees || []
                const attendeesCount = sub.data?.attendeesCount || attendees.length
                const loggedTimestamp = sub.data?.formattedTimestamp || sub.timestamp
                const documentUrl = sub.data?.documentUrl

                return (
                  <Card
                    key={sub.id}
                    className="group border-border/80 bg-card hover:border-primary/40 hover:shadow-xs transition-all flex flex-col justify-between"
                  >
                    <CardHeader className="pb-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <Badge variant="outline" className="text-[10px] font-bold bg-primary/10 text-primary border-primary/20">
                          {sub.data?.topicNumber ? `Topic #${sub.data.topicNumber}` : "Safety Talk"}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] font-mono text-emerald-700 bg-emerald-500/10 border-emerald-500/25 gap-1">
                          <CheckCircle2 className="size-3" /> Signed & Verified
                        </Badge>
                      </div>

                      <CardTitle className="text-sm font-bold text-foreground leading-snug">
                        {sub.title}
                      </CardTitle>

                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                          <Building2 className="size-3.5 text-primary shrink-0" />
                          <span className="truncate">{sub.jobSiteName || "Jobsite"}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/60">
                          <span>Foreman: <strong className="text-foreground">{sub.foremanName || "Foreman"}</strong></span>
                          <span className="font-mono text-muted-foreground">{loggedTimestamp}</span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3 pt-0">
                      <div className="rounded-xl bg-muted/40 p-2.5 border border-border/60 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-foreground flex items-center gap-1">
                            <Users className="size-3 text-primary" /> Present Crew:
                          </span>
                          <Badge variant="secondary" className="text-[9.5px] px-1.5 py-0 h-4">
                            {attendeesCount} Workers
                          </Badge>
                        </div>

                        {attendees.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto pt-0.5">
                            {attendees.map((name, i) => (
                              <span
                                key={i}
                                className="text-[10px] bg-background border border-border/70 px-1.5 py-0.5 rounded-md font-medium text-foreground"
                              >
                                {name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-muted-foreground italic">No individual worker names recorded.</p>
                        )}
                      </div>

                      {sub.data?.notes && (
                        <p className="text-[11px] text-muted-foreground bg-muted/20 p-2 rounded-lg border border-border/40 italic line-clamp-2">
                          "{sub.data.notes}"
                        </p>
                      )}
                    </CardContent>

                    <CardFooter className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => onSelectSubmission(sub)}
                        className="text-xs text-muted-foreground hover:text-foreground gap-1"
                      >
                        <Eye className="size-3.5" /> Details
                      </Button>

                      {documentUrl ? (
                        <a
                          href={documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold bg-primary text-white hover:bg-primary/90 px-3 py-1.5 rounded-lg transition-colors shadow-2xs"
                        >
                          <Download className="size-3" />
                          View Signed Report
                        </a>
                      ) : (
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => onSelectSubmission(sub)}
                          className="text-xs gap-1 border-primary/30 text-primary"
                        >
                          <Download className="size-3" /> Report
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. VIEW TOPIC DETAILS SHEET (Row Click Slide-Over Drawer)                 */}
      {/* ========================================================================= */}
      <Sheet open={isViewSheetOpen} onOpenChange={setIsViewSheetOpen}>
        <SheetContent side="right" className="sm:max-w-lg w-full flex flex-col p-0">
          {viewingTopic && (
            <>
              <SheetHeader className="p-6 pb-4 border-b border-border/60">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="default" className="text-[10px]">
                        Topic #{viewingTopic.number} (1 of {topics.length || 26})
                      </Badge>
                      <button
                        type="button"
                        onClick={(e) => handleToggleStatus(viewingTopic.id, viewingTopic.status, e)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                          viewingTopic.status !== "inactive"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25"
                            : "bg-muted/70 text-muted-foreground border-border/80 hover:bg-muted"
                        }`}
                        title={`Click to set ${viewingTopic.status !== "inactive" ? "Inactive" : "Active"}`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            viewingTopic.status !== "inactive" ? "bg-emerald-500" : "bg-muted-foreground/60"
                          }`}
                        />
                        <span>{viewingTopic.status !== "inactive" ? "Active" : "Inactive"}</span>
                      </button>
                      <span className="text-xs font-mono text-muted-foreground">
                        {viewingTopic.oshaStandard}
                      </span>
                    </div>
                    <SheetTitle className="text-base font-bold text-foreground leading-snug">
                      {drawerLang === "es" ? viewingTopic.titleEs : viewingTopic.titleEn}
                    </SheetTitle>
                    <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                      15-Minute Mandatory Weekly Safety Briefing • {viewingTopic.trade}
                    </SheetDescription>
                  </div>

                  {/* Language Switcher */}
                  <div className="inline-flex rounded-lg border border-border bg-muted p-0.5 text-xs shrink-0">
                    <button
                      onClick={() => setDrawerLang("en")}
                      className={`px-2 py-0.5 rounded font-bold transition-all ${
                        drawerLang === "en" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground"
                      }`}
                    >
                      EN
                    </button>
                    <button
                      onClick={() => setDrawerLang("es")}
                      className={`px-2 py-0.5 rounded font-bold transition-all ${
                        drawerLang === "es" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground"
                      }`}
                    >
                      ES
                    </button>
                  </div>
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                {/* Key Hazards */}
                {viewingTopic.keyHazards && viewingTopic.keyHazards.length > 0 && (
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-1.5 text-xs text-amber-950 dark:text-amber-200">
                    <span className="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                      <AlertCircle className="size-4" /> Key Hazards Identified:
                    </span>
                    <ul className="list-disc list-inside space-y-1 pl-1 text-[11.5px] opacity-90">
                      {viewingTopic.keyHazards.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Discussion Agenda */}
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Meeting Discussion Agenda & Talking Points:
                  </h5>
                  {viewingTopic.discussionPoints && viewingTopic.discussionPoints.length > 0 ? (
                    viewingTopic.discussionPoints.map((point, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-xl border border-border/70 bg-muted/20 text-xs leading-relaxed text-foreground"
                      >
                        {point}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">General site hazard mitigation and equipment safety review.</p>
                  )}
                </div>

                {/* Immediate Action Items */}
                {viewingTopic.recommendedActionItems && viewingTopic.recommendedActionItems.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <h5 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Required Crew Action Items:
                    </h5>
                    <div className="space-y-1.5">
                      {viewingTopic.recommendedActionItems.map((act, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 p-2 rounded-lg bg-background border border-border/60 text-xs text-muted-foreground"
                        >
                          <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <SheetFooter className="p-4 border-t border-border/60 flex sm:flex-row items-center justify-between gap-2 bg-muted/20">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteTopic(viewingTopic.id, viewingTopic.titleEn)}
                  className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10 rounded-xl"
                >
                  <Trash2 className="size-3.5 mr-1" /> Delete
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsViewSheetOpen(false)}
                    className="text-xs rounded-xl"
                  >
                    Close
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleOpenEdit(viewingTopic)}
                    className="text-xs bg-primary text-white font-bold gap-1 rounded-xl shadow-xs"
                  >
                    <Edit2 className="size-3.5" /> Edit Topic
                  </Button>
                </div>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ========================================================================= */}
      {/* 2. EDIT TOPIC SHEET (Right Slide-Over Drawer)                             */}
      {/* ========================================================================= */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent side="right" className="sm:max-w-xl md:max-w-2xl w-full flex flex-col p-0">
          <SheetHeader className="p-6 pb-4 border-b border-border/60">
            <div className="flex items-center gap-2 text-primary">
              <Edit2 className="size-4" />
              <SheetTitle className="text-base font-bold">Edit Topic #{formNumber}</SheetTitle>
            </div>
            <SheetDescription className="text-xs text-muted-foreground">
              Modify OSHA topic content, discussion points and action items in Supabase.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-foreground text-xs block mb-1.5">Topic Number:</label>
                <Input type="number" value={formNumber} onChange={e => setFormNumber(Number(e.target.value))} className="h-10 text-xs rounded-xl" />
              </div>
              <div>
                <label className="font-bold text-foreground text-xs block mb-1.5">Status:</label>
                <select
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value as "active" | "inactive")}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="active">Active (Visible)</option>
                  <option value="inactive">Inactive (Hidden)</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-foreground text-xs block mb-1.5">Duration (Minutes):</label>
                <Input type="number" value={formDuration} onChange={e => setFormDuration(Number(e.target.value))} className="h-10 text-xs rounded-xl" />
              </div>
            </div>

            <div>
              <label className="font-bold text-foreground text-xs block mb-1.5">Title (English):</label>
              <Input value={formTitleEn} onChange={e => setFormTitleEn(e.target.value)} className="h-10 text-xs rounded-xl font-medium" />
            </div>

            <div>
              <label className="font-bold text-foreground text-xs block mb-1.5">Title (Spanish):</label>
              <Input value={formTitleEs} onChange={e => setFormTitleEs(e.target.value)} className="h-10 text-xs rounded-xl italic font-medium" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-foreground text-xs block mb-1.5">OSHA Standard:</label>
                <Input value={formOsha} onChange={e => setFormOsha(e.target.value)} className="h-10 text-xs rounded-xl font-mono" />
              </div>
              <div>
                <label className="font-bold text-foreground text-xs block mb-1.5">Trade Division:</label>
                <Input value={formTrade} onChange={e => setFormTrade(e.target.value)} className="h-10 text-xs rounded-xl font-medium" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-foreground text-xs">Key Hazards Identified:</label>
                <span className="text-[11px] text-muted-foreground">1 hazard per line</span>
              </div>
              <textarea
                value={formHazards}
                onChange={e => setFormHazards(e.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-input bg-background/50 p-3.5 text-xs font-normal leading-relaxed focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y shadow-2xs"
                placeholder="Inhaling crystalline silica dust during cutting..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-foreground text-xs">Meeting Discussion Agenda & Talking Points:</label>
                <span className="text-[11px] text-muted-foreground">1 point per line</span>
              </div>
              <textarea
                value={formDiscussion}
                onChange={e => setFormDiscussion(e.target.value)}
                rows={6}
                className="w-full rounded-2xl border border-input bg-background/50 p-3.5 text-xs font-normal leading-relaxed focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y shadow-2xs"
                placeholder="1. Table 1 Engineering Controls: Always connect shroud to HEPA-filtered vacuum..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-foreground text-xs">Required Crew Action Items:</label>
                <span className="text-[11px] text-muted-foreground">1 action per line</span>
              </div>
              <textarea
                value={formActions}
                onChange={e => setFormActions(e.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-input bg-background/50 p-3.5 text-xs font-normal leading-relaxed focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y shadow-2xs"
                placeholder="Verify water supply lines for saws are charged and ready..."
              />
            </div>
          </div>

          <SheetFooter className="p-4 border-t border-border/60 flex sm:flex-row items-center justify-end gap-2 bg-muted/20">
            <Button variant="outline" size="sm" onClick={() => setIsEditSheetOpen(false)} className="text-xs rounded-xl h-9 px-4">
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveEdit} disabled={isSaving} className="text-xs bg-primary text-white font-bold gap-1.5 rounded-xl shadow-xs h-9 px-4">
              {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
              Save Changes to Supabase
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ========================================================================= */}
      {/* 3. ADD TOPIC SHEET (Right Slide-Over Drawer)                               */}
      {/* ========================================================================= */}
      
      

      <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
        <SheetContent side="right" className="sm:max-w-xl md:max-w-2xl w-full flex flex-col p-0">
          <SheetHeader className="p-6 pb-4 border-b border-border/60">
            <div className="flex items-center gap-2 text-primary">
              <Plus className="size-4" />
              <SheetTitle className="text-base font-bold">Add New Safety Topic</SheetTitle>
            </div>
            <SheetDescription className="text-xs text-muted-foreground">
              Create a new weekly OSHA safety topic that syncs to foremen mobile devices.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-foreground text-xs block mb-1.5">Topic Number:</label>
                <Input type="number" value={formNumber} onChange={e => setFormNumber(Number(e.target.value))} className="h-10 text-xs rounded-xl" />
              </div>
              <div>
                <label className="font-bold text-foreground text-xs block mb-1.5">Status:</label>
                <select
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value as "active" | "inactive")}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="active">Active (Visible)</option>
                  <option value="inactive">Inactive (Hidden)</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-foreground text-xs block mb-1.5">Duration (Minutes):</label>
                <Input type="number" value={formDuration} onChange={e => setFormDuration(Number(e.target.value))} className="h-10 text-xs rounded-xl" />
              </div>
            </div>

            <div>
              <label className="font-bold text-foreground text-xs block mb-1.5">Title (English):</label>
              <Input
                placeholder="e.g. Scaffolding Load Capacity & Fall Hazards"
                value={formTitleEn}
                onChange={e => setFormTitleEn(e.target.value)}
                className="h-10 text-xs rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-foreground text-xs block mb-1.5">Title (Spanish):</label>
              <Input
                placeholder="e.g. Capacidad de Carga y Peligros de Caída en Andamios"
                value={formTitleEs}
                onChange={e => setFormTitleEs(e.target.value)}
                className="h-10 text-xs rounded-xl italic font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-foreground text-xs block mb-1.5">OSHA Standard:</label>
                <Input
                  placeholder="29 CFR 1926.451"
                  value={formOsha}
                  onChange={e => setFormOsha(e.target.value)}
                  className="h-10 text-xs rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="font-bold text-foreground text-xs block mb-1.5">Trade Division:</label>
                <Input value={formTrade} onChange={e => setFormTrade(e.target.value)} className="h-10 text-xs rounded-xl font-medium" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-foreground text-xs">Key Hazards Identified:</label>
                <span className="text-[11px] text-muted-foreground">1 hazard per line</span>
              </div>
              <textarea
                placeholder="Plank slippage&#10;Overloading top scaffold frame"
                value={formHazards}
                onChange={e => setFormHazards(e.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-input bg-background/50 p-3.5 text-xs font-normal leading-relaxed focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y shadow-2xs"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-foreground text-xs">Meeting Discussion Agenda & Talking Points:</label>
                <span className="text-[11px] text-muted-foreground">1 point per line</span>
              </div>
              <textarea
                placeholder="Check yellow/green tag before climbing&#10;Maintain 3-point contact on access ladders"
                value={formDiscussion}
                onChange={e => setFormDiscussion(e.target.value)}
                rows={6}
                className="w-full rounded-2xl border border-input bg-background/50 p-3.5 text-xs font-normal leading-relaxed focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y shadow-2xs"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-foreground text-xs">Required Crew Action Items:</label>
                <span className="text-[11px] text-muted-foreground">1 action per line</span>
              </div>
              <textarea
                placeholder="Inspect base jacks and sill plates&#10;Verify mudsills are firmly packed"
                value={formActions}
                onChange={e => setFormActions(e.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-input bg-background/50 p-3.5 text-xs font-normal leading-relaxed focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y shadow-2xs"
              />
            </div>
          </div>

          <SheetFooter className="p-4 border-t border-border/60 flex sm:flex-row items-center justify-end gap-2 bg-muted/20">
            <Button variant="outline" size="sm" onClick={() => setIsAddSheetOpen(false)} className="text-xs rounded-xl h-9 px-4">
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveAdd} disabled={isSaving} className="text-xs bg-primary text-white font-bold gap-1.5 rounded-xl shadow-xs h-9 px-4">
              {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
              Create Topic in Supabase
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
