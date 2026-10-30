import * as React from "react"
import {
  Card,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Building2,
  MapPin,
  Hospital,
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  MoreVertical,
  CheckCircle2,
  X,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from "lucide-react"
import { jobsitesService } from "@/services/jobsitesService"
import { JobsiteDetailModal } from "./JobsiteDetailModal"
import { JobsiteFormModal } from "./JobsiteFormModal"
import { DeleteJobsiteDialog } from "./DeleteJobsiteDialog"
import type { JobSite } from "@/types"

export function ActiveJobsitesView() {
  const [sites, setSites] = React.useState<JobSite[]>([])
  const [loading, setLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState("")
  const [companies, setCompanies] = React.useState<string[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedStatusFilter, setSelectedStatusFilter] = React.useState<string>("all")
  const [selectedCompanyFilter, setSelectedCompanyFilter] = React.useState<string>("all")
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid")

  // Pagination
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(12)

  // Modals state
  const [viewingSite, setViewingSite] = React.useState<JobSite | null>(null)
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [isNew, setIsNew] = React.useState(false)
  const [editingSite, setEditingSite] = React.useState<JobSite | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [siteToDelete, setSiteToDelete] = React.useState<JobSite | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [toastMessage, setToastMessage] = React.useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Fetch jobsites & companies
  const loadSites = React.useCallback(async () => {
    try {
      setLoading(true)
      setLoadError("")
      const data = await jobsitesService.fetchAll()
      setSites(data)
    } catch (err: any) {
      setLoadError(err?.message || "Failed to load jobsites")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadSites()
    jobsitesService
      .fetchCompanyNames()
      .then((comps) => {
        setCompanies(comps)
      })
      .catch(() => {})
  }, [loadSites])

  // Extract unique companies from fetched sites as well
  const allAvailableCompanies = React.useMemo(() => {
    const set = new Set(companies)
    sites.forEach((s) => {
      if (s.companyName) set.add(s.companyName)
    })
    return Array.from(set).sort()
  }, [companies, sites])

  // KPI Calculations
  const totalSites = sites.length
  const activeSitesCount = sites.filter((s) => s.status === "active").length
  const pausedSitesCount = sites.filter((s) => s.status === "paused").length
  const totalCrews = sites.reduce((acc, curr) => acc + (curr.activeCrewCount || 0), 0)

  // Filtering
  const filteredSites = React.useMemo(() => {
    return sites.filter((site) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        site.name.toLowerCase().includes(q) ||
        site.jobNumber.toLowerCase().includes(q) ||
        site.address.toLowerCase().includes(q) ||
        site.gcCompany.toLowerCase().includes(q) ||
        site.superintendent.toLowerCase().includes(q) ||
        (site.companyName && site.companyName.toLowerCase().includes(q))

      const matchesStatus =
        selectedStatusFilter === "all" || site.status === selectedStatusFilter

      const matchesCompany =
        selectedCompanyFilter === "all" || site.companyName === selectedCompanyFilter

      return matchesSearch && matchesStatus && matchesCompany
    })
  }, [sites, searchQuery, selectedStatusFilter, selectedCompanyFilter])

  // Pagination calculation
  const totalPages = Math.ceil(filteredSites.length / pageSize) || 1
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedSites = React.useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize
    return filteredSites.slice(start, start + pageSize)
  }, [filteredSites, safeCurrentPage, pageSize])

  // Handlers for Add/Edit/Delete
  const handleOpenAdd = () => {
    setIsNew(true)
    setEditingSite(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (site: JobSite) => {
    setIsNew(false)
    setEditingSite(site)
    setIsFormOpen(true)
  }

  const handleSaveJobsite = async (site: JobSite): Promise<boolean> => {
    try {
      setSaving(true)
      const res = await jobsitesService.upsert(site)
      if (!res.ok) {
        showToast(`⚠️ Error: ${res.error || "Save failed"}`)
        return false
      }
      showToast(isNew ? `✅ Jobsite "${site.name}" created successfully!` : `✅ Jobsite "${site.name}" updated!`)
      await loadSites()
      // If we were viewing this site, update view modal
      if (viewingSite?.id === site.id) {
        setViewingSite(site)
      }
      return true
    } catch (err: any) {
      showToast(`⚠️ Exception: ${err.message}`)
      return false
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteJobsite = async () => {
    if (!siteToDelete) return
    try {
      setIsDeleting(true)
      const ok = await jobsitesService.remove(siteToDelete.id)
      if (!ok) {
        showToast("⚠️ Delete failed. Please check permissions.")
        return
      }
      showToast(`🗑️ Jobsite "${siteToDelete.name}" deleted.`)
      setSiteToDelete(null)
      if (viewingSite?.id === siteToDelete.id) {
        setViewingSite(null)
      }
      await loadSites()
    } catch (err: any) {
      showToast(`⚠️ Delete error: ${err.message}`)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-3">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="size-5 text-primary" />
            Active Job Sites & Emergency Action Plans
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage site safety profiles, trauma hospital routing, general contractor details, and muster points.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleOpenAdd}
            size="sm"
            className="h-8.5 px-3.5 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs cursor-pointer rounded-lg"
          >
            <Plus className="size-3.5" />
            <span>Add Jobsite</span>
          </Button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 cursor-pointer"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border py-2.5 px-3.5 flex flex-col justify-between">
          <div className="text-[11px] font-medium text-muted-foreground">Total Jobsites</div>
          <div className="text-lg font-bold text-foreground mt-0.5">{totalSites} Sites</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            Across {allAvailableCompanies.length} Subcontractors
          </div>
        </Card>

        <Card className="border-border py-2.5 px-3.5 flex flex-col justify-between">
          <div className="text-[11px] font-medium text-muted-foreground">Active Construction Sites</div>
          <div className="text-lg font-bold text-foreground mt-0.5">{activeSitesCount} Active</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Emergency EAPs synced</div>
        </Card>

        <Card className="border-border py-2.5 px-3.5 flex flex-col justify-between">
          <div className="text-[11px] font-medium text-muted-foreground">Paused / Standby</div>
          <div className="text-lg font-bold text-foreground mt-0.5">{pausedSitesCount} On Hold</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Temporary inactive scope</div>
        </Card>

        <Card className="border-border py-2.5 px-3.5 flex flex-col justify-between">
          <div className="text-[11px] font-medium text-muted-foreground">Active Crew on Field</div>
          <div className="text-lg font-bold text-foreground mt-0.5">{totalCrews} Workers</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Live field deployment</div>
        </Card>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        {/* Search Bar */}
        <div className="relative w-full sm:w-64 md:w-80 shrink-0">
          <Search className="size-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Search site, GC, superintendent, job#..."
            className="pl-8 pr-7 text-xs h-8.5 bg-background rounded-lg border-border"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-2 text-muted-foreground hover:text-foreground cursor-pointer rounded-full p-0.5 hover:bg-muted"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        {/* Filters & View Mode Toggle */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-start sm:justify-end">
          {/* Status Select */}
          <Select
            value={selectedStatusFilter}
            onValueChange={(val) => {
              setSelectedStatusFilter(val)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="h-8.5 min-w-[130px] text-xs bg-background rounded-lg border-border">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="all">All Status ({sites.length})</SelectItem>
              <SelectItem value="active">Active ({activeSitesCount})</SelectItem>
              <SelectItem value="paused">Paused ({pausedSitesCount})</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          {/* Company Select */}
          <Select
            value={selectedCompanyFilter}
            onValueChange={(val) => {
              setSelectedCompanyFilter(val)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="h-8.5 min-w-[150px] text-xs bg-background rounded-lg border-border">
              <SelectValue placeholder="All Companies" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="all">All Companies ({allAvailableCompanies.length})</SelectItem>
              {allAvailableCompanies.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Toggle: Grid vs Table */}
          <div className="flex items-center rounded-lg border border-border bg-background p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-muted text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Grid / Card View"
            >
              <LayoutGrid className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-muted text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Table View"
            >
              <List className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 space-y-3 bg-card border border-border/60 rounded-xl">
          <Loader2 className="size-6 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-medium">Loading jobsites & safety plans...</p>
        </div>
      ) : loadError ? (
        <div className="p-6 bg-destructive/5 border border-destructive/20 rounded-xl text-center space-y-2">
          <p className="text-xs text-destructive font-semibold">{loadError}</p>
          <Button variant="outline" size="sm" onClick={() => loadSites()} className="text-xs">
            Retry Loading
          </Button>
        </div>
      ) : filteredSites.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border rounded-xl space-y-3">
          <Building2 className="size-10 text-muted-foreground/60 mx-auto" />
          <div className="text-sm font-semibold text-foreground">No jobsites found</div>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchQuery || selectedCompanyFilter !== "all" || selectedStatusFilter !== "all"
              ? "No job sites match the selected filters. Try resetting search or filter criteria."
              : "No jobsites registered yet. Click 'Add Jobsite' to create your first safety profile."}
          </p>
          <Button size="sm" onClick={handleOpenAdd} className="text-xs font-semibold gap-1.5 mt-2">
            <Plus className="size-3.5" />
            Add First Jobsite
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID / CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedSites.map((site) => (
            <Card
              key={site.id}
              className="border-border hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between overflow-hidden group hover:shadow-md"
            >
              <div className="p-4 space-y-3">
                {/* Header Row: Job # & Status */}
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] font-mono font-semibold bg-muted/40">
                    {site.jobNumber}
                  </Badge>
                  <div className="flex items-center gap-2">
                    {site.status === "active" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#00c800]/12 text-[#008a00] dark:text-[#00e600] border border-[#00c800]/30">
                        <span className="size-1.5 rounded-full bg-[#00c800] animate-pulse"></span>
                        Active ({site.activeCrewCount} Crew)
                      </span>
                    )}
                    {site.status === "paused" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                        <span className="size-1.5 rounded-full bg-amber-500"></span>
                        Paused
                      </span>
                    )}
                    {site.status === "completed" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border border-border">
                        Completed
                      </span>
                    )}

                    {/* Actions Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-muted">
                          <MoreVertical className="size-3.5 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="text-xs">
                        <DropdownMenuItem onClick={() => setViewingSite(site)} className="gap-2">
                          <Eye className="size-3.5" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenEdit(site)} className="gap-2">
                          <Pencil className="size-3.5" />
                          Edit Jobsite
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setSiteToDelete(site)}
                          className="gap-2 text-destructive focus:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                          Delete Jobsite
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Jobsite Name & Assigned Company */}
                <div>
                  <h3
                    onClick={() => setViewingSite(site)}
                    className="font-bold text-foreground text-sm hover:text-primary cursor-pointer line-clamp-1"
                  >
                    {site.name}
                  </h3>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Building2 className="size-3 text-muted-foreground shrink-0" />
                    <span className="font-medium text-foreground/80 truncate">
                      {site.companyName || "Subcontractor"}
                    </span>
                    {site.trade && <span className="text-muted-foreground">· {site.trade}</span>}
                  </div>
                </div>

                {/* Location */}
                <div className="text-[11px] text-muted-foreground flex items-start gap-1.5 pt-1">
                  <MapPin className="size-3.5 text-primary shrink-0 mt-0.5" />
                  <span className="line-clamp-2">
                    {site.address ? `${site.address}, ` : ""}
                    {site.cityStateZip || "Location not specified"}
                  </span>
                </div>

                {/* GC & Superintendent Mini Strip */}
                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50 text-[11px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">GC:</span>
                    <span className="font-semibold text-foreground truncate max-w-[160px]">
                      {site.gcCompany || "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Superintendent:</span>
                    <span className="font-semibold text-foreground truncate max-w-[160px]">
                      {site.superintendent || "—"}
                    </span>
                  </div>
                </div>

                {/* Emergency Hospital Highlight */}
                {site.emergencyHospital?.name && (
                  <div className="text-[10px] text-destructive flex items-center justify-between px-2 py-1 rounded-md bg-destructive/5 border border-destructive/15">
                    <div className="flex items-center gap-1 truncate">
                      <Hospital className="size-3 shrink-0" />
                      <span className="truncate">{site.emergencyHospital.name}</span>
                    </div>
                    {site.emergencyHospital.distanceMiles > 0 && (
                      <span className="font-semibold shrink-0 pl-1">
                        {site.emergencyHospital.distanceMiles} mi
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <CardFooter className="p-3 pt-2 border-t border-border/40 flex items-center justify-between bg-muted/10">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingSite(site)}
                  className="h-7 text-[11px] px-2.5 gap-1.5 hover:bg-primary/10 hover:text-primary border-border"
                >
                  <Eye className="size-3" />
                  View EAP Profile
                </Button>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(site)}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                    title="Edit"
                  >
                    <Pencil className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSiteToDelete(site)}
                    className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                    title="Delete"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-lg border border-border/80 bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <Table className="w-full border-collapse text-xs">
              <TableHeader className="bg-muted/60 border-b border-border/80 sticky top-0 z-10">
                <TableRow className="h-8.5 hover:bg-transparent">
                  <TableHead className="w-11 px-2.5 py-2 font-semibold text-muted-foreground text-[11px] text-center uppercase tracking-wider border-r border-border/60">
                    #
                  </TableHead>
                  <TableHead className="w-28 px-3 py-2 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider border-r border-border/60">
                    Job #
                  </TableHead>
                  <TableHead className="min-w-[200px] px-3 py-2 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider border-r border-border/60">
                    Jobsite Name
                  </TableHead>
                  <TableHead className="min-w-[160px] px-3 py-2 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider border-r border-border/60">
                    Company
                  </TableHead>
                  <TableHead className="min-w-[170px] px-3 py-2 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider border-r border-border/60">
                    Location
                  </TableHead>
                  <TableHead className="min-w-[150px] px-3 py-2 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider border-r border-border/60">
                    Superintendent
                  </TableHead>
                  <TableHead className="min-w-[150px] px-3 py-2 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider border-r border-border/60">
                    General Contractor
                  </TableHead>
                  <TableHead className="min-w-[100px] px-3 py-2 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider border-r border-border/60 text-center">
                    Status
                  </TableHead>
                  <TableHead className="w-16 px-2 py-2 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-border/60">
                {paginatedSites.map((site, idx) => {
                  const rowNumber = (safeCurrentPage - 1) * pageSize + idx + 1
                  return (
                    <TableRow
                      key={site.id}
                      onClick={() => setViewingSite(site)}
                      className="h-9 hover:bg-primary/[0.04] dark:hover:bg-primary/[0.08] transition-colors cursor-pointer group even:bg-muted/[0.12]"
                    >
                      <TableCell className="w-11 px-2.5 py-1.5 text-center font-mono text-[10px] text-muted-foreground border-r border-border/50">
                        {rowNumber}
                      </TableCell>
                      <TableCell className="w-28 px-3 py-1.5 border-r border-border/50">
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {site.jobNumber}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-3 py-1.5 font-bold text-foreground border-r border-border/50">
                        <div className="flex flex-col">
                          <span className="hover:text-primary transition-colors">{site.name}</span>
                          {site.trade && <span className="text-[10px] text-muted-foreground font-normal">{site.trade}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-1.5 text-muted-foreground border-r border-border/50">
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                          <Building2 className="size-3 text-primary shrink-0" />
                          <span className="truncate">{site.companyName || "—"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-1.5 text-muted-foreground border-r border-border/50 truncate max-w-[200px]">
                        {site.cityStateZip || site.address || "—"}
                      </TableCell>
                      <TableCell className="px-3 py-1.5 border-r border-border/50">
                        <div className="text-foreground font-medium">{site.superintendent || "—"}</div>
                        {site.superPhone && (
                          <div className="text-[10px] text-muted-foreground">{site.superPhone}</div>
                        )}
                      </TableCell>
                      <TableCell className="px-3 py-1.5 border-r border-border/50">
                        <div className="text-foreground font-medium">{site.gcCompany || "—"}</div>
                        {site.gcContact && (
                          <div className="text-[10px] text-muted-foreground">{site.gcContact}</div>
                        )}
                      </TableCell>
                      <TableCell className="px-3 py-1.5 text-center border-r border-border/50">
                        {site.status === "active" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#00c800]/12 text-[#008a00] dark:text-[#00e600] border border-[#00c800]/30">
                            <span className="size-1.5 rounded-full bg-[#00c800]"></span>
                            Active
                          </span>
                        )}
                        {site.status === "paused" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                            Paused
                          </span>
                        )}
                        {site.status === "completed" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border border-border">
                            Completed
                          </span>
                        )}
                      </TableCell>
                      <TableCell
                        className="px-2 py-1.5 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-muted">
                              <MoreVertical className="size-3.5 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs">
                            <DropdownMenuItem onClick={() => setViewingSite(site)} className="gap-2">
                              <Eye className="size-3.5" />
                              View EAP
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenEdit(site)} className="gap-2">
                              <Pencil className="size-3.5" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setSiteToDelete(site)}
                              className="gap-2 text-destructive focus:text-destructive"
                            >
                              <Trash2 className="size-3.5" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && filteredSites.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground pt-1">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => {
                setPageSize(Number(val))
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="h-7 w-16 text-xs bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="24">24</SelectItem>
                <SelectItem value="48">48</SelectItem>
              </SelectContent>
            </Select>
            <span className="hidden sm:inline">
              Showing {(safeCurrentPage - 1) * pageSize + 1}–
              {Math.min(safeCurrentPage * pageSize, filteredSites.length)} of {filteredSites.length} sites
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] mr-2">
              Page {safeCurrentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={safeCurrentPage <= 1}
              className="h-7 w-7 p-0"
              title="First page"
            >
              <ChevronsLeft className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage <= 1}
              className="h-7 w-7 p-0"
              title="Previous page"
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage >= totalPages}
              className="h-7 w-7 p-0"
              title="Next page"
            >
              <ChevronRight className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={safeCurrentPage >= totalPages}
              className="h-7 w-7 p-0"
              title="Last page"
            >
              <ChevronsRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* View Jobsite Detail Modal */}
      <JobsiteDetailModal
        jobsite={viewingSite}
        open={!!viewingSite}
        onClose={() => setViewingSite(null)}
        onEdit={(site) => handleOpenEdit(site)}
        onDelete={(site) => setSiteToDelete(site)}
      />

      {/* Add / Edit Form Modal */}
      <JobsiteFormModal
        open={isFormOpen}
        isNew={isNew}
        initialData={editingSite}
        companies={allAvailableCompanies}
        saving={saving}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveJobsite}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteJobsiteDialog
        jobsite={siteToDelete}
        open={!!siteToDelete}
        isDeleting={isDeleting}
        onClose={() => setSiteToDelete(null)}
        onConfirm={handleDeleteJobsite}
      />
    </div>
  )
}
