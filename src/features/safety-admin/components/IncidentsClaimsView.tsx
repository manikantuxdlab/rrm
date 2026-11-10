import * as React from "react"
import {
  Card,
  CardContent,
  CardFooter,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { submissionsService } from "@/services/submissionsService"
import type { SubmissionRecord } from "@/types"
import { GlobalDataTable, DataTablePagination } from "@/components/ui/data-table-global"
import {
  AlertTriangle,
  User,
  Eye,
  FileSpreadsheet,
  HeartPulse,
  Send,
  Search,
  Building,
  Building2,
  Clock,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Loader2,
  CheckCircle2,
  Gavel,
  Camera,
  LayoutGrid,
  List,
  MoreVertical,
  X,
  MapPin,
  Calendar,
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

  // View mode switcher: Table or Grid Card
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("table")

  // Pagination states
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  // Side sheet detail modal
  const [selectedIncident, setSelectedIncident] = React.useState<SubmissionRecord | null>(null)

  // Fetch real-time submissions directly from Supabase (No hardcoded/mock data)
  const loadSubmissions = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const live = await submissionsService.fetchAll()
      const liveIncidentRecords = live.filter(
        (s) => s.moduleType === "claim_alert" || s.moduleType === "near_miss"
      )
      setRecords(liveIncidentRecords)
    } catch (err) {
      console.error("[IncidentsClaimsView] Error fetching incidents:", err)
      setRecords([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadSubmissions()
  }, [loadSubmissions])

  // Real-time live synchronization with Supabase
  React.useEffect(() => {
    const unsub = submissionsService.subscribeToChanges(() => {
      loadSubmissions()
    })
    return () => unsub()
  }, [loadSubmissions])

  // Reset to first page on filter change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, searchQuery, pageSize])

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

  // Paginated list for table/grid
  const paginatedRecords = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredRecords.slice(startIndex, startIndex + pageSize)
  }, [filteredRecords, currentPage, pageSize])

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
          <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <AlertTriangle className="size-5 text-destructive" />
            Incidents, Claims &amp; Near-Miss Hazard Portal
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review incoming site incident reports, Cal/OSHA Form 5020 &amp; OSHA 301 filings, and coordinate carrier claim numbers.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
              <ShieldAlert className="size-3.5" />
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

      {/* Filter and Search Bar with View Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search incident, worker, contractor, site..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-8 h-8 text-xs bg-background"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-2 text-muted-foreground hover:text-foreground cursor-pointer rounded-full p-0.5 hover:bg-muted"
              title="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Dropdown */}
          <Select
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as "all" | "claim_alert" | "near_miss")}
          >
            <SelectTrigger className="h-8 min-w-[175px] text-xs bg-background rounded-lg border-border">
              <SelectValue placeholder="All Incident Activity" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="all">
                All Incident Activity ({records.length})
              </SelectItem>
              <SelectItem value="claim_alert">
                First Reports of Injury ({claimsCount})
              </SelectItem>
              <SelectItem value="near_miss">
                Near-Miss Hazards ({nearMissCount})
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Table / Grid Card View Switcher */}
          <div className="flex items-center border border-border rounded-lg p-0.5 bg-background shrink-0 h-8">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-muted text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Table View"
            >
              <List className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-muted text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Table View vs Grid Cards */}
      {isLoading ? (
        <div className="p-10 text-center space-y-2 border border-dashed rounded-xl bg-card">
          <Loader2 className="size-6 animate-spin mx-auto text-primary" />
          <p className="text-xs text-muted-foreground">Loading incident records &amp; triage queues...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="p-10 text-center space-y-2 border border-dashed rounded-xl bg-card">
          <FileText className="size-8 mx-auto text-muted-foreground opacity-40" />
          <h3 className="text-sm font-semibold text-foreground">No Incident Records Found</h3>
          <p className="text-xs text-muted-foreground">
            Try adjusting your search query or tab filter.
          </p>
        </div>
      ) : viewMode === "table" ? (
        /* TABLE LISTING: Standardized Clean Enterprise Table */
        <div className="space-y-3">
          <GlobalDataTable<SubmissionRecord>
            data={paginatedRecords}
            keyExtractor={(sub) => sub.id}
            showRowNumbers
            startIndex={(currentPage - 1) * pageSize + 1}
            emptyMessage="No incident records found."
            onRowClick={(sub) => setSelectedIncident(sub)}
            columns={[
              {
                key: "incident",
                header: "Incident / Scope",
                className: "min-w-[200px] max-w-[280px]",
                cell: (sub) => {
                  const isClaim = sub.moduleType === "claim_alert"
                  const claimType = sub.data?.claimType || "injury"
                  const photosCount = sub.data?.photosCount || sub.data?.photosList?.length || 0

                  return (
                    <div className="space-y-1 pr-4">
                      <div className="font-semibold text-foreground group-hover:text-primary transition-colors leading-snug break-words">
                        <span>{sub.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/60">
                          {sub.id}
                        </span>
                        {isClaim ? (
                          <Badge
                            variant="outline"
                            className="text-[9.5px] px-1.5 py-0 text-rose-700 dark:text-rose-400 bg-rose-500/10 border-rose-500/25 font-semibold"
                          >
                            <HeartPulse className="size-2.5 mr-1" />
                            {claimType === "wc"
                              ? "Workers' Comp"
                              : claimType === "auto"
                              ? "Auto Claim"
                              : "Injury Report"}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[9.5px] px-1.5 py-0 text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/25 font-semibold"
                          >
                            <AlertTriangle className="size-2.5 mr-1" />
                            Near-Miss
                          </Badge>
                        )}
                        {photosCount > 0 && (
                          <span className="text-[9.5px] font-medium px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20">
                            {photosCount} Photos
                          </span>
                        )}
                      </div>
                    </div>
                  )
                },
              },
              {
                key: "company",
                header: "Contractor & Jobsite",
                className: "min-w-[170px] max-w-[220px]",
                cell: (sub) => (
                  <div className="pr-4 pl-1">
                    <div className="font-semibold text-foreground truncate" title={sub.companyName}>
                      {sub.companyName}
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Building className="size-3 text-muted-foreground shrink-0" />
                      <span className="truncate" title={sub.jobSiteName}>
                        {sub.jobSiteName}
                      </span>
                    </div>
                  </div>
                ),
              },
              {
                key: "affected",
                header: "Affected Party / Hazard",
                className: "min-w-[160px] max-w-[200px]",
                cell: (sub) => {
                  const isClaim = sub.moduleType === "claim_alert"
                  return isClaim ? (
                    <div className="pr-3">
                      <div className="font-medium text-foreground flex items-center gap-1 truncate">
                        <User className="size-3 text-primary shrink-0" />
                        <span className="truncate">
                          {sub.data?.injuredWorker ||
                            sub.data?.companyDriver ||
                            sub.data?.affectedParty?.name ||
                            "Field Team Member"}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate" title={sub.data?.bodyPart || sub.data?.companyVehicle || sub.data?.damagedProperty || "Evaluation report"}>
                        {sub.data?.bodyPart || sub.data?.companyVehicle || sub.data?.damagedProperty || "Evaluation report"}
                      </div>
                    </div>
                  ) : (
                    <div className="pr-3">
                      <div className="font-medium text-foreground truncate" title={sub.data?.hazardIdentified || "Proactive Observation"}>
                        {sub.data?.hazardIdentified || "Proactive Observation"}
                      </div>
                      <div className="text-[11px] text-muted-foreground">Preventative notice</div>
                    </div>
                  )
                },
              },
              {
                key: "lead",
                header: "Reporting Lead & Date",
                className: "whitespace-nowrap",
                cell: (sub) => (
                  <div>
                    <div className="font-medium text-foreground">{sub.foremanName}</div>
                    <div className="text-[10.5px] text-muted-foreground font-mono flex items-center gap-1 mt-0.5">
                      <Clock className="size-2.5 text-muted-foreground" />
                      <span>{sub.timestamp}</span>
                    </div>
                  </div>
                ),
              },
              {
                key: "status",
                header: "Medical / Status",
                className: "whitespace-nowrap",
                cell: (sub) => {
                  const isClaim = sub.moduleType === "claim_alert"
                  return (
                    <div>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-[11px] block">
                        {sub.data?.lostTime || (isClaim ? "First-Aid Only" : "Hazard Mitigated")}
                      </span>
                      {sub.data?.clinic && (
                        <span className="text-[10px] text-muted-foreground truncate block max-w-[170px]" title={sub.data.clinic}>
                          {sub.data.clinic}
                        </span>
                      )}
                    </div>
                  )
                },
              },
              {
                key: "actions",
                header: "Actions",
                className: "w-12 text-center",
                headerClassName: "text-center",
                align: "center",
                cell: (sub) => (
                  <div
                    className="flex items-center justify-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <MoreVertical className="size-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 text-xs">
                        <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase font-semibold">
                          Incident Options
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => setSelectedIncident(sub)}
                          className="cursor-pointer gap-2"
                        >
                          <Eye className="size-3.5 text-primary" />
                          <span>View Detail Sheet</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={onOpenDispatch}
                          className="cursor-pointer gap-2"
                        >
                          <Send className="size-3.5 text-amber-600" />
                          <span>Dispatch Alert</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer gap-2">
                          <FileSpreadsheet className="size-3.5 text-emerald-600" />
                          <span>Export OSHA Form</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ),
              },
            ]}
          />

          <DataTablePagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={filteredRecords.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[5, 10, 20]}
            itemLabel="incidents"
          />
        </div>
      ) : (
        /* CARD LISTING: Compact, Multi-Column Responsive Grid (Decreased Height & Width, Clean Alignment) */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {paginatedRecords.map((sub) => {
              const isClaim = sub.moduleType === "claim_alert"
              const claimType = sub.data?.claimType || "injury"
              const photosCount = sub.data?.photosCount || sub.data?.photosList?.length || 0

              return (
                <Card
                  key={sub.id}
                  onClick={() => setSelectedIncident(sub)}
                  className={`border transition-all duration-150 flex flex-col justify-between cursor-pointer group hover:shadow-md hover:border-primary/50 text-xs bg-card ${
                    isClaim
                      ? "border-destructive/25 hover:border-destructive/60"
                      : "border-border/80"
                  }`}
                >
                  <CardHeader className="p-3.5 pb-2.5 space-y-2">
                    {/* Header Row: ID, Badge, Timestamp */}
                    <div className="flex items-center justify-between gap-1.5 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/60">
                          {sub.id}
                        </span>
                        {isClaim ? (
                          <Badge
                            variant="outline"
                            className="text-[9.5px] px-1.5 py-0 text-rose-700 dark:text-rose-400 bg-rose-500/10 border-rose-500/25 font-semibold"
                          >
                            <HeartPulse className="size-2.5 mr-1" />
                            {claimType === "wc"
                              ? "Workers' Comp"
                              : claimType === "auto"
                              ? "Auto Claim"
                              : "Injury Report"}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[9.5px] px-1.5 py-0 text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/25 font-semibold"
                          >
                            <AlertTriangle className="size-2.5 mr-1" />
                            Near-Miss
                          </Badge>
                        )}
                        {photosCount > 0 && (
                          <span className="text-[9.5px] font-medium px-1 py-0 rounded bg-primary/10 text-primary border border-primary/20">
                            📷 {photosCount}
                          </span>
                        )}
                      </div>

                      <div className="text-[10.5px] text-muted-foreground flex items-center gap-1 font-mono">
                        <Clock className="size-3 text-muted-foreground" />
                        <span>{sub.timestamp}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="font-bold text-foreground text-xs leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {sub.title}
                    </div>
                  </CardHeader>

                  <CardContent className="p-3.5 pt-0 space-y-2.5 flex-1">
                    {/* Project & Affected Party Summary Box */}
                    <div className="space-y-1.5 p-2 rounded-lg bg-muted/30 border border-border/50 text-[11px]">
                      <div className="flex items-center gap-1.5 font-semibold text-foreground truncate">
                        <Building className="size-3 text-primary shrink-0" />
                        <span className="truncate">{sub.companyName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground truncate text-[10.5px]">
                        <MapPin className="size-2.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{sub.jobSiteName}</span>
                      </div>
                    </div>

                    {/* Affected Party / Hazard & Status Grid */}
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded-lg bg-muted/20 border border-border/40">
                        <span className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground block">
                          {isClaim ? "Affected Party" : "Hazard Focus"}
                        </span>
                        <div className="font-semibold text-foreground truncate mt-0.5 flex items-center gap-1">
                          {isClaim ? (
                            <>
                              <User className="size-3 text-primary shrink-0" />
                              <span className="truncate">
                                {sub.data?.injuredWorker ||
                                  sub.data?.companyDriver ||
                                  sub.data?.affectedParty?.name ||
                                  "Field Member"}
                              </span>
                            </>
                          ) : (
                            <span className="truncate">{sub.data?.hazardIdentified || "Proactive"}</span>
                          )}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          {isClaim ? sub.data?.bodyPart || "Evaluation" : "Mitigation logged"}
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-muted/20 border border-border/40">
                        <span className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground block">
                          Medical Status
                        </span>
                        <div className="font-semibold text-emerald-600 dark:text-emerald-400 truncate mt-0.5">
                          {sub.data?.lostTime || (isClaim ? "First-Aid Only" : "Mitigated")}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          {sub.data?.clinic ? `🏥 ${sub.data.clinic}` : "Jobsite triage"}
                        </div>
                      </div>
                    </div>

                    {/* Brief Narrative */}
                    <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 italic px-0.5">
                      "{sub.data?.description || sub.data?.immediateAction || "Standard first report incident logged under OSHA protocols."}"
                    </p>
                  </CardContent>

                  <CardFooter className="p-3.5 pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
                    <div className="text-muted-foreground text-[10.5px] truncate max-w-[170px]">
                      Lead: <strong className="text-foreground">{sub.foremanName}</strong>
                    </div>

                    <div className="flex items-center gap-1 font-semibold text-primary group-hover:underline cursor-pointer">
                      <Eye className="size-3.5" />
                      <span>View Sheet →</span>
                    </div>
                  </CardFooter>
                </Card>
              )
            })}
          </div>

          <DataTablePagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={filteredRecords.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[6, 12, 24]}
            itemLabel="incidents"
          />
        </div>
      )}

      {/* DETAIL ACTION VIEW SHEET (Standardized with other safety modules) */}
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
              {selectedIncident?.moduleType === "claim_alert" ? (
                <Badge variant="outline" className="text-[10px] text-rose-700 bg-rose-500/10 border-rose-500/25">
                  First Report of Injury
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] text-amber-700 bg-amber-500/10 border-amber-500/25">
                  Near-Miss Hazard
                </Badge>
              )}
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
              {/* Project & Contractor Info */}
              <div className="rounded-xl border border-border bg-card p-3.5 space-y-2">
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="size-3.5 text-primary" /> Project &amp; Contractor Entity
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/60">
                  <div>
                    <span className="text-muted-foreground block text-[10.5px]">Contractor:</span>
                    <span className="font-bold text-foreground">{selectedIncident.companyName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10.5px]">Jobsite:</span>
                    <span className="font-bold text-foreground flex items-center gap-1">
                      <MapPin className="size-3 text-muted-foreground" />
                      {selectedIncident.jobSiteName}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10.5px]">Site Lead:</span>
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      <User className="size-3 text-muted-foreground" />
                      {selectedIncident.foremanName}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10.5px]">Incident Timestamp:</span>
                    <span className="font-mono text-foreground font-semibold flex items-center gap-1">
                      <Calendar className="size-3 text-muted-foreground" />
                      {selectedIncident.timestamp}
                    </span>
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
                      <span className="font-mono text-foreground font-semibold">
                        {selectedIncident.data.policeReportNumber}
                      </span>
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
                  {selectedIncident.data?.description ||
                    selectedIncident.data?.immediateAction ||
                    "No further details recorded."}
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

              {/* Routing Recipients */}
              <div className="rounded-xl border border-border bg-card p-3.5 space-y-1.5">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Carrier / Underwriter Email Routing
                </span>
                <div className="font-mono text-[11px] text-foreground bg-muted/30 p-2 rounded-md border border-border/60">
                  {selectedIncident.recipients?.join(", ") || "claims@reliableriskmgmt.com, underwriting@reliableriskmgmt.com"}
                </div>
              </div>

              {/* Photos Gallery */}
              {selectedIncident.data?.photosList && selectedIncident.data.photosList.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-3.5 space-y-2.5">
                  <div className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Camera className="size-3.5 text-primary" /> Incident Evidence Photos ({selectedIncident.data.photosList.length})
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Logged from site
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {selectedIncident.data.photosList.map((p: string, idx: number) => {
                      const isUrl = typeof p === "string" && (p.startsWith("http://") || p.startsWith("https://") || p.startsWith("data:image/"))
                      return (
                        <div
                          key={idx}
                          className="rounded-xl border border-border/70 overflow-hidden bg-muted/30 p-2 space-y-1.5"
                        >
                          {isUrl ? (
                            <a
                              href={p}
                              target="_blank"
                              rel="noreferrer"
                              className="block aspect-video w-full overflow-hidden rounded-lg bg-black/5 hover:opacity-90 transition-opacity"
                            >
                              <img src={p} alt={`Evidence #${idx + 1}`} className="size-full object-cover" />
                            </a>
                          ) : (
                            <div className="aspect-video w-full rounded-lg bg-primary/10 text-primary flex flex-col items-center justify-center p-2 text-center">
                              <Camera className="size-5 mb-1 opacity-70" />
                              <span className="text-[10px] font-semibold leading-tight line-clamp-2">
                                {p}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
                            <span className="font-semibold text-foreground">Photo #{idx + 1}</span>
                            <span className="font-mono text-[9.5px]">Evidence</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <SheetFooter className="p-4 border-t border-border bg-muted/20 flex sm:flex-row items-center justify-between gap-2">
            <span className="text-[10.5px] text-muted-foreground">
              OSHA 301 Recordable Triage
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onOpenDispatch}
                className="text-xs font-semibold cursor-pointer gap-1.5"
              >
                <Send className="size-3" />
                Dispatch Alert
              </Button>
              <Button
                size="sm"
                onClick={() => setSelectedIncident(null)}
                className="text-xs font-semibold cursor-pointer px-4"
              >
                Close Sheet
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
