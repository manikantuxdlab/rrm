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
import { Input } from "@/components/ui/input"
import {
  MOCK_CERTIFICATIONS,
} from "@/data/safetyMockData"
import { crewAdminService } from "@/services"
import { MOCK_COMPANIES, MOCK_JOBSITES } from "@/data/safetyMockData"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { GlobalDataTable, DataTablePagination } from "@/components/ui/data-table-global"
import {
  Award,
  CheckCircle2,
  Search, Plus, Building2, UserCheck, MoreVertical, Trash2, HardHat, Phone, RefreshCw, Loader2, LayoutGrid, List,
  Eye, Edit, ShieldCheck, Calendar, Upload, Download, ExternalLink, X,
} from "lucide-react"

export function WorkforceBadgesView() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [workers, setWorkers] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [foremenList, setForemenList] = React.useState<any[]>([])
  const [companyFilter, setCompanyFilter] = React.useState('all')
  const [siteFilter, setSiteFilter] = React.useState('all')
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // View Worker Details Sheet state
  const [viewingWorker, setViewingWorker] = React.useState<any | null>(null)

  // Edit Worker Sheet state
  const [editingWorker, setEditingWorker] = React.useState<any | null>(null)
  const [editFormData, setEditFormData] = React.useState<any>({
    name: '',
    role: '',
    trade: '',
    phone: '',
    companyName: '',
    jobSiteId: '',
    foremanId: '',
  })

  // Certificate Preview Modal state
  const [viewingCertificate, setViewingCertificate] = React.useState<{
    worker: any
    cert: any
  } | null>(null)

  // Delete confirmation state
  const [deletingWorker, setDeletingWorker] = React.useState<any | null>(null)

  const [addDocumentFile, setAddDocumentFile] = React.useState<File | null>(null)

  const getFutureDate = (yearsAhead = 3) => {
    const d = new Date()
    d.setFullYear(d.getFullYear() + yearsAhead)
    return d.toISOString().split('T')[0]
  }

  const calculateCertStatus = (expiresDateStr: string): "valid" | "expiring_soon" | "expired" => {
    if (!expiresDateStr) return "valid"
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const exp = new Date(expiresDateStr)
    exp.setHours(0, 0, 0, 0)
    const diffTime = exp.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return "expired"
    if (diffDays <= 30) return "expiring_soon"
    return "valid"
  }

  const [availableTrades, setAvailableTrades] = React.useState<string[]>([])
  const [isCustomTrade, setIsCustomTrade] = React.useState(false)

  const [formData, setFormData] = React.useState({
    name: '',
    role: 'Journeyman Carpenter',
    trade: 'Carpentry & Framing',
    phone: '',
    companyName: MOCK_COMPANIES[0]?.name || 'General Contractor',
    jobSiteId: MOCK_JOBSITES[0]?.id || 'job-101',
    foremanId: '',
    certName: 'OSHA 10 Construction',
    expiresDate: getFutureDate(3),
  })

  const loadData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const [workersData, foremenData, tradesData] = await Promise.all([
        crewAdminService.fetchAll(),
        crewAdminService.fetchForemenList(),
        crewAdminService.fetchCompanyTrades(companyFilter === 'all' ? 'General Contractor' : companyFilter),
      ])
      setWorkers(workersData)
      setForemenList(foremenData)
      setAvailableTrades(tradesData || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [companyFilter])

  React.useEffect(() => {
    loadData()
  }, [loadData])
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("table")

  const [selectedWorkerIds, setSelectedWorkerIds] = React.useState<string[]>([])
  const [bulkAssignType, setBulkAssignType] = React.useState<"jobsite" | "foreman" | null>(null)
  const [bulkTargetValue, setBulkTargetValue] = React.useState("")
  const [isBulkSubmitting, setIsBulkSubmitting] = React.useState(false)

  // Reset selection on filter change
  React.useEffect(() => {
    setSelectedWorkerIds([])
  }, [searchQuery, companyFilter, siteFilter, currentPage, pageSize])

  const filteredWorkers = React.useMemo(() => {
    return workers.filter((w) => {
      const matchesSearch =
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.trade.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (w.foremanName && w.foremanName.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCompany = companyFilter === 'all' || w.companyName === companyFilter
      const matchesSite = siteFilter === 'all' || w.jobSiteId === siteFilter
      return matchesSearch && matchesCompany && matchesSite
    })
  }, [workers, searchQuery, companyFilter, siteFilter])

  const paginatedWorkers = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredWorkers.slice(startIndex, startIndex + pageSize)
  }, [filteredWorkers, currentPage, pageSize])

  const isAllCurrentPageSelected =
    paginatedWorkers.length > 0 &&
    paginatedWorkers.every((w) => selectedWorkerIds.includes(w.id))

  const handleToggleSelectAll = () => {
    if (isAllCurrentPageSelected) {
      const pageIds = new Set(paginatedWorkers.map((w) => w.id))
      setSelectedWorkerIds((prev) => prev.filter((id) => !pageIds.has(id)))
    } else {
      const pageIds = paginatedWorkers.map((w) => w.id)
      setSelectedWorkerIds((prev) => Array.from(new Set([...prev, ...pageIds])))
    }
  }

  const handleToggleSelectWorker = (workerId: string) => {
    setSelectedWorkerIds((prev) =>
      prev.includes(workerId)
        ? prev.filter((id) => id !== workerId)
        : [...prev, workerId]
    )
  }

  const handleApplyBulkAssign = async () => {
    if (!bulkAssignType || !bulkTargetValue || selectedWorkerIds.length === 0) return
    setIsBulkSubmitting(true)
    try {
      const selectedForeman = bulkAssignType === "foreman"
        ? foremenList.find((f) => f.id === bulkTargetValue)
        : null

      const updatedWorkers = workers.map((w) => {
        if (!selectedWorkerIds.includes(w.id)) return w
        if (bulkAssignType === "jobsite") {
          return { ...w, jobSiteId: bulkTargetValue }
        }
        if (bulkAssignType === "foreman") {
          return {
            ...w,
            foremanId: bulkTargetValue === "none" ? null : bulkTargetValue,
            foremanName: bulkTargetValue === "none" ? "Unassigned" : (selectedForeman?.fullName || "Foreman"),
          }
        }
        return w
      })

      // Update state immediately
      setWorkers(updatedWorkers)

      // Sync each selected worker to Supabase
      const toUpdate = updatedWorkers.filter((w) => selectedWorkerIds.includes(w.id))
      await Promise.all(toUpdate.map((w) => crewAdminService.updateWorker(w)))

      setSelectedWorkerIds([])
      setBulkAssignType(null)
      setBulkTargetValue("")
    } catch (err) {
      console.error("[WorkforceBadgesView] Bulk assign error:", err)
    } finally {
      setIsBulkSubmitting(false)
    }
  }

  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    setIsSubmitting(true)
    try {
      const selectedForeman = foremenList.find((f) => f.id === formData.foremanId)
      const today = new Date().toISOString().split('T')[0]
      const newWorkerId = 'w-' + Date.now()

      let uploadedDocUrl: string | null = null
      if (addDocumentFile) {
        uploadedDocUrl = await crewAdminService.uploadWorkerDocument(newWorkerId, addDocumentFile)
      }

      const computedStatus = calculateCertStatus(formData.expiresDate)

      const newWorkerObj: any = {
        id: newWorkerId,
        name: formData.name.trim(),
        role: formData.role,
        trade: formData.trade,
        phone: formData.phone.trim() || '(555) 000-0000',
        companyName: formData.companyName,
        jobSiteId: formData.jobSiteId || null,
        foremanId: formData.foremanId || null,
        foremanName: selectedForeman?.fullName || null,
        active: true,
        documentUrl: uploadedDocUrl || null,
        certifications: [
          {
            name: formData.certName || 'OSHA 10 Construction',
            issuedDate: today,
            expiresDate: formData.expiresDate || getFutureDate(3),
            status: computedStatus,
            fileUrl: uploadedDocUrl || null,
          },
        ],
      }
      await crewAdminService.insertWorker(newWorkerObj)
      setWorkers((prev) => [newWorkerObj, ...prev])
      setIsAddModalOpen(false)
      setAddDocumentFile(null)
      setFormData({
        name: '',
        role: 'Journeyman Carpenter',
        trade: 'Carpentry & Framing',
        phone: '',
        companyName: MOCK_COMPANIES[0]?.name || 'General Contractor',
        jobSiteId: MOCK_JOBSITES[0]?.id || 'job-101',
        foremanId: '',
        certName: 'OSHA 10 Construction',
        expiresDate: getFutureDate(3),
      })
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenEditWorker = (worker: any) => {
    setEditingWorker(worker)
    setEditFormData({
      name: worker.name || '',
      role: worker.role || '',
      trade: worker.trade || '',
      phone: worker.phone || '',
      companyName: worker.companyName || MOCK_COMPANIES[0]?.name || 'General Contractor',
      jobSiteId: worker.jobSiteId || MOCK_JOBSITES[0]?.id || '',
      foremanId: worker.foremanId || '',
    })
  }

  const handleSaveEditWorker = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingWorker || !editFormData.name.trim()) return
    setIsSubmitting(true)
    try {
      const selectedForeman = foremenList.find((f) => f.id === editFormData.foremanId)
      const updated = {
        ...editingWorker,
        name: editFormData.name.trim(),
        role: editFormData.role,
        trade: editFormData.trade,
        phone: editFormData.phone.trim() || editingWorker.phone,
        companyName: editFormData.companyName,
        jobSiteId: editFormData.jobSiteId || null,
        foremanId: editFormData.foremanId || null,
        foremanName: selectedForeman ? selectedForeman.fullName : editFormData.foremanId === 'none' ? null : editingWorker.foremanName,
      }
      setWorkers((prev) => prev.map((w) => (w.id === editingWorker.id ? updated : w)))
      if (viewingWorker && viewingWorker.id === editingWorker.id) {
        setViewingWorker(updated)
      }
      setEditingWorker(null)
      await crewAdminService.updateWorker(updated)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingWorker) return
    const id = deletingWorker.id
    setWorkers((prev) => prev.filter((w) => w.id !== id))
    if (viewingWorker && viewingWorker.id === id) {
      setViewingWorker(null)
    }
    setDeletingWorker(null)
    await crewAdminService.deleteWorker(id)
  }

  const handleDeleteWorker = (worker: any) => {
    setDeletingWorker(worker)
  }

  const expiringCount = MOCK_CERTIFICATIONS.filter(
    (c) => c.status === "expiring_soon" || c.status === "expired"
  ).length

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Award className="size-6 text-primary" />
            Workforce Certifications & OSHA Badging
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            OSHA 10/30-Hour cards, CPR/First Aid, Competent Person qualifications & digital credential verification
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsAddModalOpen(true)} className="gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs px-3 h-8"><Plus className="size-4" />Add Crew Member</Button>
          <Button onClick={loadData} variant="outline" size="icon" className="size-8" title="Refresh Roster"><RefreshCw className={"size-3.5 " + (isLoading ? "animate-spin" : "")} /></Button>
          
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Certified Tradesmen</CardDescription>
            <CardTitle className="text-2xl font-bold">{workers.length} Workers</CardTitle>
          </CardHeader>
          <CardFooter className="text-xs text-emerald-600 font-medium">
            100% OSHA 10/30 certified on commercial jobsites
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Certifications Expiring / Due</CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-600">
              {expiringCount} Renewal Actions
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            Scaffold Competent Person & Fall Protection recertification pending
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>First Aid / CPR Qualified Leads</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600">100% Coverage</CardTitle>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            Designated first-aid responders on every active deck
          </CardFooter>
        </Card>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/30 p-3 rounded-lg border border-border/60">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-xs"><Search className="size-3.5 absolute left-3 top-2.5 text-muted-foreground" /><Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search worker name, role, trade, foreman..." className="pl-8 text-xs h-9 bg-background" /></div>
          <Select value={companyFilter} onValueChange={setCompanyFilter}><SelectTrigger className="h-9 text-xs w-[180px] bg-background"><SelectValue placeholder="Filter Company" /></SelectTrigger><SelectContent><SelectItem value="all">All Contractors</SelectItem>{MOCK_COMPANIES.map((c) => (<SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>))}</SelectContent></Select>
          <Select value={siteFilter} onValueChange={setSiteFilter}><SelectTrigger className="h-9 text-xs w-[180px] bg-background"><SelectValue placeholder="Filter Jobsite" /></SelectTrigger><SelectContent><SelectItem value="all">All Jobsites</SelectItem>{MOCK_JOBSITES.map((j) => (<SelectItem key={j.id} value={j.id}>{j.name}</SelectItem>))}</SelectContent></Select>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-border bg-muted p-1 text-xs">
            <button type="button" onClick={() => setViewMode("table")} className={"p-1.5 rounded-md flex items-center justify-center transition-all cursor-pointer " + (viewMode === "table" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground")} title="Table View"><List className="size-3.5" /></button>
            <button type="button" onClick={() => setViewMode("grid")} className={"p-1.5 rounded-md flex items-center justify-center transition-all cursor-pointer " + (viewMode === "grid" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground")} title="Cards / Grid View"><LayoutGrid className="size-3.5" /></button>
          </div>
          <div className="text-xs text-muted-foreground font-mono hidden sm:block">{filteredWorkers.length} workers</div>
        </div>
      </div>

      {/* Worker Listing View (Table by default) vs Cards View */}
      {viewMode === "table" ? (
        <div className="space-y-3">
          <GlobalDataTable<any>
            data={filteredWorkers.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
            keyExtractor={(worker) => worker.id}
            showRowNumbers
            startIndex={(currentPage - 1) * pageSize + 1}
            emptyMessage="No workers found matching the filters."
            selectable
            selectedIds={selectedWorkerIds}
            onToggleSelectRow={(id) => handleToggleSelectWorker(String(id))}
            onToggleSelectAll={handleToggleSelectAll}
            isAllSelected={isAllCurrentPageSelected}
            onRowClick={(worker) => setViewingWorker(worker)}
            columns={[
              {
                key: "worker",
                header: "Worker / Badge ID",
                className: "min-w-[200px]",
                cell: (worker) => (
                  <div>
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      {worker.name}
                      <Badge variant="outline" className="text-[9px] font-mono py-0 px-1">
                        {worker.id}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Phone className="size-3 text-muted-foreground" />
                      {worker.phone || "No phone"}
                    </div>
                  </div>
                ),
              },
              {
                key: "role",
                header: "Role & Trade",
                className: "min-w-[160px]",
                cell: (worker) => (
                  <div>
                    <div className="font-medium text-foreground">{worker.role}</div>
                    <div className="text-[11px] text-muted-foreground">{worker.trade}</div>
                  </div>
                ),
              },
              {
                key: "company",
                header: "Contractor Company",
                className: "min-w-[150px] text-foreground text-xs",
                cell: (worker) => worker.companyName || "General Contractor",
              },
              {
                key: "jobsite",
                header: "Assigned Jobsite",
                className: "min-w-[160px]",
                cell: (worker) => {
                  const site = MOCK_JOBSITES.find((j) => j.id === worker.jobSiteId)
                  return (
                    <div className="flex items-center gap-1.5 text-xs">
                      <Building2 className="size-3 text-primary shrink-0" />
                      <span className="truncate max-w-[160px] font-medium text-foreground">
                        {site?.name || worker.jobSiteId || "Unassigned"}
                      </span>
                    </div>
                  )
                },
              },
              {
                key: "foreman",
                header: "Lead Foreman",
                className: "min-w-[150px]",
                cell: (worker) => (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <UserCheck className="size-3 text-emerald-600 shrink-0" />
                    <span className="truncate max-w-[140px] font-medium text-foreground">
                      {worker.foremanName || "Unassigned"}
                    </span>
                  </div>
                ),
              },
              {
                key: "credentials",
                header: "Credentials / Certs",
                className: "min-w-[210px]",
                cell: (worker) => (
                  <div className="flex flex-wrap gap-1">
                    {worker.certifications && worker.certifications.length > 0 ? (
                      worker.certifications.map((cert: any, i: number) => {
                        const isValid = cert.status === "valid"
                        const isExpiring = cert.status === "expiring_soon"
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setViewingCertificate({ worker, cert })
                            }}
                            title="Click to view verified certificate credential"
                            className="inline-flex cursor-pointer transition-transform hover:scale-105"
                          >
                            <Badge
                              variant="outline"
                              className={
                                "text-[10px] cursor-pointer inline-flex items-center gap-1 hover:border-primary/60 " +
                                (isValid
                                  ? "text-emerald-600 border-emerald-500/30 bg-emerald-500/10"
                                  : isExpiring
                                  ? "text-amber-600 border-amber-500/30 bg-amber-500/10"
                                  : "text-rose-600 border-rose-500/30 bg-rose-500/10")
                              }
                            >
                              <ShieldCheck className="size-2.5" />
                              {cert.name}
                            </Badge>
                          </button>
                        )
                      })
                    ) : (
                      <span className="text-muted-foreground text-[11px]">No credentials</span>
                    )}
                  </div>
                ),
              },
              {
                key: "status",
                header: "Status",
                className: "w-28 text-center",
                headerClassName: "text-center",
                align: "center",
                cell: () => (
                  <Badge
                    variant="outline"
                    className="text-emerald-600 border-emerald-500/30 bg-emerald-500/10 text-[10px] inline-flex items-center gap-1"
                  >
                    <CheckCircle2 className="size-3" />
                    Active Crew
                  </Badge>
                ),
              },
              {
                key: "actions",
                header: "Actions",
                className: "w-16 text-right",
                headerClassName: "text-right",
                align: "right",
                cell: (worker) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-7 cursor-pointer hover:bg-muted">
                        <MoreVertical className="size-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="text-xs w-48">
                      <DropdownMenuLabel>Worker Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setViewingWorker(worker)}
                        className="cursor-pointer"
                      >
                        <Eye className="size-3.5 mr-2 text-primary" />
                        View Profile & Cards
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleOpenEditWorker(worker)}
                        className="cursor-pointer"
                      >
                        <Edit className="size-3.5 mr-2 text-amber-600" />
                        Edit Worker Info
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteWorker(worker)}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <Trash2 className="size-3.5 mr-2" />
                        Delete Worker
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ),
              },
            ]}
          />

          <DataTablePagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={filteredWorkers.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[5, 10, 20, 50]}
            itemLabel="workers"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkers.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((worker: any) => (
              <Card key={worker.id} className="hover:border-primary/40 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {worker.id}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <span className="text-emerald-600 text-[11px] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="size-3" />
                        Active Crew
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-6 -mr-1">
                            <MoreVertical className="size-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-xs w-48">
                          <DropdownMenuItem
                            onClick={() => setViewingWorker(worker)}
                            className="cursor-pointer"
                          >
                            <Eye className="size-3.5 mr-2 text-primary" />
                            View Profile & Cards
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleOpenEditWorker(worker)}
                            className="cursor-pointer"
                          >
                            <Edit className="size-3.5 mr-2 text-amber-600" />
                            Edit Worker Info
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteWorker(worker)}
                            className="cursor-pointer text-destructive focus:text-destructive"
                          >
                            <Trash2 className="size-3.5 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <CardTitle className="text-base font-bold text-foreground mt-1 cursor-pointer hover:text-primary transition-colors" onClick={() => setViewingWorker(worker)}>
                    {worker.name}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {worker.role} • {worker.trade}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground flex items-center gap-1 font-medium">
                        <Building2 className="size-3 text-primary" /> Assigned Site:
                      </span>
                      <span className="font-semibold text-foreground truncate max-w-[150px]">
                        {MOCK_JOBSITES.find((j) => j.id === worker.jobSiteId)?.name || worker.jobSiteId || "Unassigned"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground flex items-center gap-1 font-medium">
                        <UserCheck className="size-3 text-emerald-600" /> Lead Foreman:
                      </span>
                      <span className="font-semibold text-foreground truncate max-w-[150px]">
                        {worker.foremanName || "Unassigned"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-0.5 border-t border-border/40">
                      <span className="text-muted-foreground">Contractor:</span>
                      <span className="text-muted-foreground truncate max-w-[150px]">
                        {worker.companyName || "General Contractor"}
                      </span>
                    </div>
                  </div>
                  <div className="font-semibold text-muted-foreground text-[11px]">
                    Verified Jobsite Credentials:
                  </div>
                  <div className="space-y-1.5">
                    {worker.certifications?.map((cert: any, i: number) => {
                      const isValid = cert.status === "valid"
                      const isExpiring = cert.status === "expiring_soon"

                      return (
                        <div
                          key={i}
                          onClick={() => setViewingCertificate({ worker, cert })}
                          className="p-2 rounded-lg bg-muted/40 border border-border/60 flex items-center justify-between text-[11px] hover:border-primary/50 cursor-pointer transition-colors"
                        >
                          <div className="font-medium text-foreground flex items-center gap-1.5">
                            <ShieldCheck className="size-3 text-primary" />
                            {cert.name}
                          </div>
                          <div>
                            {isValid ? (
                              <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 bg-emerald-500/10 text-[9px]">
                                Valid
                              </Badge>
                            ) : isExpiring ? (
                              <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/10 text-[9px]">
                                Due Soon
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="text-[9px]">
                                Expired
                              </Badge>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>

                <CardFooter className="text-[11px] text-muted-foreground border-t border-border/60 pt-3 flex items-center justify-between">
                  <span>Phone: {worker.phone}</span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-[10px] cursor-pointer"
                      onClick={() => setViewingWorker(worker)}
                    >
                      <Eye className="size-3 mr-1" />
                      View Profile
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-[10px] cursor-pointer text-primary border-primary/30"
                      onClick={() => {
                        const firstCert = worker.certifications?.[0]
                        if (firstCert) {
                          setViewingCertificate({ worker, cert: firstCert })
                        } else {
                          setViewingWorker(worker)
                        }
                      }}
                    >
                      View OSHA Card
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          <DataTablePagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={filteredWorkers.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[6, 9, 18, 36]}
            itemLabel="workers"
          />
        </div>
      )}

      {/* Floating Bulk Actions Bar */}
      {selectedWorkerIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-card border border-border shadow-2xl rounded-2xl px-5 py-3 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-2 pr-3 border-r border-border">
            <span className="size-6 rounded-full bg-primary text-primary-foreground font-mono text-xs flex items-center justify-center font-bold">
              {selectedWorkerIds.length}
            </span>
            <span className="text-xs font-semibold text-foreground">
              {selectedWorkerIds.length === 1 ? "worker selected" : "workers selected"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1.5 cursor-pointer font-medium hover:border-primary/50"
              onClick={() => {
                setBulkAssignType("jobsite")
                setBulkTargetValue(MOCK_JOBSITES[0]?.id || "")
              }}
            >
              <Building2 className="size-3.5 text-primary" />
              Assign Jobsite
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1.5 cursor-pointer font-medium hover:border-emerald-500/50"
              onClick={() => {
                setBulkAssignType("foreman")
                setBulkTargetValue(foremenList[0]?.id || "none")
              }}
            >
              <UserCheck className="size-3.5 text-emerald-600" />
              Assign Foreman
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={() => setSelectedWorkerIds([])}
            >
              <X className="size-3.5 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Bulk Assign Dialog Modal */}
      <Dialog open={Boolean(bulkAssignType)} onOpenChange={(open) => !open && setBulkAssignType(null)}>
        <DialogContent className="sm:max-w-[420px] p-6 space-y-4">
          <DialogHeader className="text-left space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                {bulkAssignType === "jobsite" ? (
                  <Building2 className="size-5" />
                ) : (
                  <UserCheck className="size-5 text-emerald-600" />
                )}
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  {bulkAssignType === "jobsite" ? "Bulk Assign Jobsite" : "Bulk Assign Lead Foreman"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Apply to <strong>{selectedWorkerIds.length}</strong> selected {selectedWorkerIds.length === 1 ? "tradesman" : "tradesmen"}.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label className="text-xs font-semibold text-foreground">
              {bulkAssignType === "jobsite" ? "Select Target Jobsite" : "Select Lead Foreman"}
            </Label>
            {bulkAssignType === "jobsite" ? (
              <Select value={bulkTargetValue} onValueChange={setBulkTargetValue}>
                <SelectTrigger className="h-10 text-xs px-3 bg-background border-border/80 w-full">
                  <SelectValue placeholder="Select Jobsite" />
                </SelectTrigger>
                <SelectContent className="text-xs max-h-56">
                  {MOCK_JOBSITES.map((j) => (
                    <SelectItem key={j.id} value={j.id} className="py-2 cursor-pointer">
                      {j.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Select value={bulkTargetValue} onValueChange={setBulkTargetValue}>
                <SelectTrigger className="h-10 text-xs px-3 bg-background border-border/80 w-full">
                  <SelectValue placeholder="Select Foreman" />
                </SelectTrigger>
                <SelectContent className="text-xs max-h-56">
                  <SelectItem value="none" className="py-2 cursor-pointer text-muted-foreground">
                    None / General Site Crew
                  </SelectItem>
                  {foremenList.map((f) => (
                    <SelectItem key={f.id} value={f.id} className="py-2 cursor-pointer">
                      {f.fullName} {f.email ? `(${f.email})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <DialogFooter className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 px-4 text-xs cursor-pointer"
              onClick={() => setBulkAssignType(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isBulkSubmitting || !bulkTargetValue}
              className="h-9 px-4 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shadow-xs gap-1.5"
              onClick={handleApplyBulkAssign}
            >
              {isBulkSubmitting && <Loader2 className="size-3.5 animate-spin mr-1" />}
              Apply to {selectedWorkerIds.length} Workers
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Worker Slide-over Sheet */}
      <Sheet open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <SheetContent side="right" className="sm:max-w-xl w-full flex flex-col p-0 gap-0 shadow-2xl bg-card">
          {/* Header */}
          <div className="p-6 sm:p-7 pb-5 border-b border-border/70 bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                <HardHat className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground tracking-tight">Add Field Crew Member</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Register a tradesman and assign them directly to an active jobsite and lead foreman.
                </p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleAddWorker} className="flex-1 flex flex-col justify-between overflow-y-auto">
            <div className="p-6 sm:p-7 space-y-6">
              {/* Section 1: Worker Profile Card */}
              <div className="rounded-xl border border-border/70 bg-card p-4 sm:p-5 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <div className="size-2 rounded-full bg-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Personal & Craft Details
                  </span>
                </div>

                {/* Worker Name */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    Worker Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramon Sanchez"
                    className="h-10 text-xs px-3 bg-background border-border/80 focus-visible:ring-1"
                  />
                </div>

                {/* Craft Role & Phone Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                        Craft Role <span className="text-destructive">*</span>
                      </Label>
                      <button
                        type="button"
                        onClick={() => setIsCustomTrade(!isCustomTrade)}
                        className="text-[11px] text-primary hover:underline cursor-pointer"
                      >
                        {isCustomTrade ? "Choose from list" : "+ Add custom role"}
                      </button>
                    </div>

                    {isCustomTrade ? (
                      <Input
                        required
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value, trade: e.target.value })}
                        placeholder="Type custom craft role (e.g. Ironworker)"
                        className="h-10 text-xs px-3 bg-background border-border/80 focus-visible:ring-1"
                      />
                    ) : (
                      <Select
                        value={formData.role}
                        onValueChange={(val) => {
                          if (val === "__custom__") {
                            setIsCustomTrade(true)
                            setFormData({ ...formData, role: '' })
                          } else {
                            setFormData({ ...formData, role: val, trade: val })
                          }
                        }}
                      >
                        <SelectTrigger className="h-10 text-xs px-3 bg-background border-border/80 w-full">
                          <SelectValue placeholder="Select Craft Role" />
                        </SelectTrigger>
                        <SelectContent className="text-xs max-h-56">
                          {availableTrades.map((t) => (
                            <SelectItem key={t} value={t} className="py-2 cursor-pointer">
                              {t}
                            </SelectItem>
                          ))}
                          <SelectItem value="__custom__" className="py-2 text-primary font-semibold cursor-pointer">
                            + Add Custom Craft Role...
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Phone Number</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(555) 000-0000"
                      className="h-10 text-xs px-3 bg-background border-border/80 focus-visible:ring-1"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Company & Jobsite Assignment Card */}
              <div className="rounded-xl border border-border/70 bg-card p-4 sm:p-5 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <div className="size-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Company & Site Assignment
                  </span>
                </div>

                {/* Contractor Company */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    Contractor Company <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.companyName}
                    onValueChange={(val) => setFormData({ ...formData, companyName: val })}
                  >
                    <SelectTrigger className="h-10 text-xs px-3 bg-background border-border/80 w-full">
                      <SelectValue placeholder="Select Contractor" />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      {MOCK_COMPANIES.map((c) => (
                        <SelectItem key={c.id} value={c.name} className="py-2 cursor-pointer">
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Assign Jobsite & Lead Foreman as stacked or spaced cards */}
                <div className="grid grid-cols-1 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                      Assign Jobsite <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.jobSiteId}
                      onValueChange={(val) => setFormData({ ...formData, jobSiteId: val })}
                    >
                      <SelectTrigger className="h-10 text-xs px-3 bg-background border-border/80 w-full">
                        <SelectValue placeholder="Select Jobsite" />
                      </SelectTrigger>
                      <SelectContent className="text-xs max-h-56">
                        {MOCK_JOBSITES.map((j) => (
                          <SelectItem key={j.id} value={j.id} className="py-2 cursor-pointer">
                            {j.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Assign Lead Foreman</Label>
                    <Select
                      value={formData.foremanId}
                      onValueChange={(val) => setFormData({ ...formData, foremanId: val })}
                    >
                      <SelectTrigger className="h-10 text-xs px-3 bg-background border-border/80 w-full">
                        <SelectValue placeholder="Select Foreman" />
                      </SelectTrigger>
                      <SelectContent className="text-xs max-h-56">
                        <SelectItem value="none" className="py-2 cursor-pointer text-muted-foreground">
                          None / General Crew
                        </SelectItem>
                        {foremenList.map((f) => (
                          <SelectItem key={f.id} value={f.id} className="py-2 cursor-pointer">
                            {f.fullName} {f.email ? `(${f.email})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Section 3: Safety Certification & Document Upload */}
              <div className="rounded-xl border border-border/70 bg-card p-4 sm:p-5 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <div className="size-2 rounded-full bg-blue-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Certification & Document (Supabase Storage)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Certification Name</Label>
                    <Input
                      value={formData.certName}
                      onChange={(e) => setFormData({ ...formData, certName: e.target.value })}
                      placeholder="e.g. OSHA 10 Construction"
                      className="h-10 text-xs px-3 bg-background border-border/80 focus-visible:ring-1"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                        Expiration Date
                      </Label>
                      {formData.expiresDate && (
                        <span className={
                          "text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded " +
                          (calculateCertStatus(formData.expiresDate) === "valid"
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : calculateCertStatus(formData.expiresDate) === "expiring_soon"
                            ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                            : "bg-destructive/10 text-destructive border border-destructive/20")
                        }>
                          {calculateCertStatus(formData.expiresDate) === "valid"
                            ? "Valid"
                            : calculateCertStatus(formData.expiresDate) === "expiring_soon"
                            ? "Due Soon"
                            : "Expired"}
                        </span>
                      )}
                    </div>
                    <Input
                      type="date"
                      value={formData.expiresDate}
                      onChange={(e) => setFormData({ ...formData, expiresDate: e.target.value })}
                      className="h-10 text-xs px-3 bg-background border-border/80 focus-visible:ring-1"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Upload Document (PDF / Image / Card)</Label>
                  <div className="border-2 border-dashed border-border/80 rounded-xl p-4 bg-muted/20 hover:bg-muted/40 transition-colors text-center relative">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.webp"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) setAddDocumentFile(file)
                      }}
                    />
                    <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                      <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <Upload className="size-4" />
                      </div>
                      {addDocumentFile ? (
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-foreground truncate max-w-xs">{addDocumentFile.name}</p>
                          <p className="text-[11px] text-emerald-600 font-medium">Ready to upload to Supabase Storage ({(addDocumentFile.size / 1024).toFixed(0)} KB)</p>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <p className="text-xs font-medium text-foreground">Click or drag OSHA card / Certificate document</p>
                          <p className="text-[11px] text-muted-foreground">Supported: PDF, JPG, PNG (Max 10MB)</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {addDocumentFile && (
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-[11px] text-destructive h-6 px-2 hover:bg-destructive/10"
                        onClick={() => setAddDocumentFile(null)}
                      >
                        Remove file
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 sm:p-5 px-6 sm:px-7 border-t border-border/70 bg-muted/30 flex items-center justify-end gap-3 mt-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 px-4 text-xs font-medium cursor-pointer"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="h-9 px-4 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs gap-1.5 cursor-pointer"
              >
                {isSubmitting && <Loader2 className="size-3.5 animate-spin mr-1" />}
                Save & Assign to Site
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* ================= VIEW WORKER DETAILS SHEET ================= */}
      <Sheet open={Boolean(viewingWorker)} onOpenChange={(open) => !open && setViewingWorker(null)}>
        <SheetContent side="right" className="sm:max-w-xl w-full flex flex-col p-0 gap-0 shadow-2xl bg-card">
          {viewingWorker && (
            <div className="flex flex-col h-full justify-between overflow-hidden">
              {/* Header */}
              <div className="p-6 sm:p-7 pb-5 border-b border-border/70 bg-muted/20">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-sm border border-primary/20 shrink-0">
                      <HardHat className="size-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-foreground">{viewingWorker.name}</h3>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {viewingWorker.id}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {viewingWorker.role} • {viewingWorker.trade}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      "text-[10px] px-2.5 py-0.5 " +
                      (viewingWorker.active
                        ? "text-emerald-600 border-emerald-500/30 bg-emerald-500/10"
                        : "text-rose-600 border-rose-500/30 bg-rose-500/10")
                    }
                  >
                    {viewingWorker.active ? "Active Crew" : "Inactive"}
                  </Badge>
                </div>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-5 text-xs">
                {/* Assignment & Deployment Overview */}
                <div className="rounded-xl border border-border/70 bg-card p-4 sm:p-5 shadow-2xs space-y-3.5">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                    <div className="size-2 rounded-full bg-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Deployment & Assignment
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-1">
                      <div className="text-[10px] font-medium text-muted-foreground uppercase flex items-center gap-1.5">
                        <Building2 className="size-3 text-primary" /> Active Jobsite
                      </div>
                      <div className="font-semibold text-foreground text-xs">
                        {MOCK_JOBSITES.find((j) => j.id === viewingWorker.jobSiteId)?.name || viewingWorker.jobSiteId || "Unassigned"}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-1">
                      <div className="text-[10px] font-medium text-muted-foreground uppercase flex items-center gap-1.5">
                        <UserCheck className="size-3 text-emerald-600" /> Lead Foreman
                      </div>
                      <div className="font-semibold text-foreground text-xs">
                        {viewingWorker.foremanName || "Unassigned Lead"}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-1">
                      <div className="text-[10px] font-medium text-muted-foreground uppercase flex items-center gap-1.5">
                        <HardHat className="size-3 text-amber-600" /> Employer / Contractor
                      </div>
                      <div className="font-semibold text-foreground text-xs">
                        {viewingWorker.companyName || "General Contractor"}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-1">
                      <div className="text-[10px] font-medium text-muted-foreground uppercase flex items-center gap-1.5">
                        <Phone className="size-3 text-primary" /> Contact Phone
                      </div>
                      <div className="font-semibold text-foreground text-xs">
                        {viewingWorker.phone || "No direct phone"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verified Credentials & OSHA Badges */}
                <div className="rounded-xl border border-border/70 bg-card p-4 sm:p-5 shadow-2xs space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-emerald-500" />
                      <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Verified Credentials & Certifications
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {viewingWorker.certifications?.length || 0} badges
                    </span>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    {viewingWorker.certifications && viewingWorker.certifications.length > 0 ? (
                      viewingWorker.certifications.map((cert: any, i: number) => {
                        const isValid = cert.status === "valid"
                        const isExpiring = cert.status === "expiring_soon"

                        return (
                          <div
                            key={i}
                            className="p-3 rounded-lg border border-border/60 bg-muted/30 flex items-center justify-between gap-3 hover:border-primary/50 transition-colors"
                          >
                            <div className="space-y-1">
                              <div className="font-semibold text-foreground flex items-center gap-1.5">
                                <ShieldCheck className="size-3.5 text-primary shrink-0" />
                                {cert.name}
                              </div>
                              <div className="text-[11px] text-muted-foreground flex items-center gap-3">
                                <span className="flex items-center gap-1 font-mono">
                                  <Calendar className="size-3 text-muted-foreground" />
                                  Exp: {cert.expiresDate || "2028-12-31"}
                                </span>
                                <span>•</span>
                                <span className="text-[10px] text-emerald-600 font-semibold">
                                  Digitally Verified
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isValid ? (
                                <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 bg-emerald-500/10 text-[10px]">
                                  Valid
                                </Badge>
                              ) : isExpiring ? (
                                <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/10 text-[10px]">
                                  Due Soon
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="text-[10px]">
                                  Expired
                                </Badge>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-[10px] cursor-pointer"
                                onClick={() => setViewingCertificate({ worker: viewingWorker, cert })}
                              >
                                View Card
                              </Button>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="p-4 rounded-lg bg-muted/20 text-center text-muted-foreground text-xs">
                        No active safety credentials on file for this tradesman.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sheet Action Footer */}
              <div className="p-4 sm:p-5 px-6 sm:px-7 border-t border-border/70 bg-muted/30 flex items-center justify-between mt-auto">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
                  onClick={() => handleDeleteWorker(viewingWorker)}
                >
                  <Trash2 className="size-3.5 mr-1" />
                  Remove Worker
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 text-xs cursor-pointer"
                    onClick={() => setViewingWorker(null)}
                  >
                    Close
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="h-9 px-4 text-xs bg-primary text-primary-foreground font-semibold cursor-pointer gap-1.5"
                    onClick={() => {
                      const w = viewingWorker
                      setViewingWorker(null)
                      handleOpenEditWorker(w)
                    }}
                  >
                    <Edit className="size-3.5" />
                    Edit Worker
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ================= EDIT WORKER SHEET ================= */}
      <Sheet open={Boolean(editingWorker)} onOpenChange={(open) => !open && setEditingWorker(null)}>
        <SheetContent side="right" className="sm:max-w-xl w-full flex flex-col p-0 gap-0 shadow-2xl bg-card">
          {editingWorker && (
            <div className="flex flex-col h-full justify-between overflow-hidden">
              {/* Header */}
              <div className="p-6 sm:p-7 pb-5 border-b border-border/70 bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20 shrink-0">
                    <Edit className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground tracking-tight">Edit Crew Member</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Update trade craft, assigned site, foreman, and contact details for <strong>{editingWorker.name}</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveEditWorker} className="flex-1 flex flex-col justify-between overflow-y-auto">
                <div className="p-6 sm:p-7 space-y-6">
                  {/* Card Section 1: Details */}
                  <div className="rounded-xl border border-border/70 bg-card p-4 sm:p-5 shadow-2xs space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                      <div className="size-2 rounded-full bg-amber-500" />
                      <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Profile & Contact Details
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                        Worker Full Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        required
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        className="h-10 text-xs px-3 bg-background border-border/80 focus-visible:ring-1"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                          Craft Role <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          required
                          value={editFormData.role}
                          onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                          className="h-10 text-xs px-3 bg-background border-border/80 focus-visible:ring-1"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-foreground">Trade Specialization</Label>
                        <Input
                          value={editFormData.trade}
                          onChange={(e) => setEditFormData({ ...editFormData, trade: e.target.value })}
                          className="h-10 text-xs px-3 bg-background border-border/80 focus-visible:ring-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground">Phone Number</Label>
                      <Input
                        value={editFormData.phone}
                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                        className="h-10 text-xs px-3 bg-background border-border/80 focus-visible:ring-1"
                      />
                    </div>
                  </div>

                  {/* Card Section 2: Deployment */}
                  <div className="rounded-xl border border-border/70 bg-card p-4 sm:p-5 shadow-2xs space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                      <div className="size-2 rounded-full bg-emerald-500" />
                      <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Site & Employer Assignment
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground">Contractor Employer</Label>
                      <Select
                        value={editFormData.companyName}
                        onValueChange={(val) => setEditFormData({ ...editFormData, companyName: val })}
                      >
                        <SelectTrigger className="h-10 text-xs px-3 bg-background border-border/80 w-full">
                          <SelectValue placeholder="Select Contractor" />
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                          {MOCK_COMPANIES.map((c) => (
                            <SelectItem key={c.id} value={c.name} className="py-2 cursor-pointer">
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 gap-4 pt-1">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-foreground">Assigned Jobsite</Label>
                        <Select
                          value={editFormData.jobSiteId}
                          onValueChange={(val) => setEditFormData({ ...editFormData, jobSiteId: val })}
                        >
                          <SelectTrigger className="h-10 text-xs px-3 bg-background border-border/80 w-full">
                            <SelectValue placeholder="Select Jobsite" />
                          </SelectTrigger>
                          <SelectContent className="text-xs max-h-56">
                            {MOCK_JOBSITES.map((j) => (
                              <SelectItem key={j.id} value={j.id} className="py-2 cursor-pointer">
                                {j.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-foreground">Lead Foreman</Label>
                        <Select
                          value={editFormData.foremanId}
                          onValueChange={(val) => setEditFormData({ ...editFormData, foremanId: val })}
                        >
                          <SelectTrigger className="h-10 text-xs px-3 bg-background border-border/80 w-full">
                            <SelectValue placeholder="Select Foreman" />
                          </SelectTrigger>
                          <SelectContent className="text-xs max-h-56">
                            <SelectItem value="none" className="py-2 cursor-pointer text-muted-foreground">
                              None / General Site
                            </SelectItem>
                            {foremenList.map((f) => (
                              <SelectItem key={f.id} value={f.id} className="py-2 cursor-pointer">
                                {f.fullName} {f.email ? `(${f.email})` : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 sm:p-5 px-6 sm:px-7 border-t border-border/70 bg-muted/30 flex items-center justify-end gap-3 mt-auto">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 text-xs font-medium cursor-pointer"
                    onClick={() => setEditingWorker(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmitting}
                    className="h-9 px-4 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs gap-1.5 cursor-pointer"
                  >
                    {isSubmitting && <Loader2 className="size-3.5 animate-spin mr-1" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ================= VIEW CERTIFICATE & OSHA CREDENTIAL MODAL ================= */}
      <Dialog open={Boolean(viewingCertificate)} onOpenChange={(open) => !open && setViewingCertificate(null)}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border border-border/80 shadow-2xl bg-card">
          {viewingCertificate && (
            <div>
              {/* Certificate Header Banner */}
              <div className="p-6 bg-gradient-to-br from-primary/15 via-primary/5 to-muted/30 border-b border-border/60">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="size-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                      <ShieldCheck className="size-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-foreground">
                        {viewingCertificate.cert?.name || "OSHA Verification"}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Digital Credential ID: <span className="font-mono font-semibold text-foreground">CERT-OSHA-{(viewingCertificate.worker.id || "").replace(/\D/g, "") || "94821"}</span>
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 bg-emerald-500/10 text-[10px]">
                    Verified
                  </Badge>
                </div>
              </div>

              {/* Certificate Visual Badge Card */}
              <div className="p-6 space-y-4 text-xs">
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                  <div className="flex items-center justify-between text-xs border-b border-primary/10 pb-2">
                    <span className="text-muted-foreground font-medium">Issued To:</span>
                    <span className="font-bold text-foreground text-sm">{viewingCertificate.worker.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-b border-primary/10 pb-2">
                    <span className="text-muted-foreground font-medium">Trade & Role:</span>
                    <span className="font-semibold text-foreground">{viewingCertificate.worker.role}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-b border-primary/10 pb-2">
                    <span className="text-muted-foreground font-medium">Contractor / Employer:</span>
                    <span className="font-semibold text-foreground">{viewingCertificate.worker.companyName || "General Contractor"}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div>
                      <span className="text-muted-foreground block">Issue Date</span>
                      <span className="font-semibold text-foreground font-mono">{viewingCertificate.cert?.issuedDate || "2024-03-15"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Expiration Date</span>
                      <span className="font-semibold text-emerald-600 font-mono">{viewingCertificate.cert?.expiresDate || "2027-03-15"}</span>
                    </div>
                  </div>
                </div>

                {/* QR Code & Verification Note */}
                <div className="p-3.5 rounded-lg border border-border/60 bg-muted/30 flex items-center gap-3">
                  <div className="size-12 rounded-lg bg-background border flex items-center justify-center font-mono text-[9px] text-center font-bold text-foreground shrink-0 shadow-2xs">
                    QR OK
                  </div>
                  <div className="text-[11px] text-muted-foreground leading-relaxed">
                    Card verified with Department of Labor & OSHA records. Scannable by safety compliance inspectors on-site.
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <DialogFooter className="p-4 px-6 border-t border-border/70 bg-muted/20 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 cursor-pointer"
                  onClick={() => setViewingCertificate(null)}
                >
                  Close
                </Button>
                <div className="flex items-center gap-2">
                  {(viewingCertificate.cert?.fileUrl || viewingCertificate.worker.documentUrl) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-8 gap-1.5 cursor-pointer text-primary border-primary/30 hover:bg-primary/10"
                      onClick={() => {
                        const fileUrl = viewingCertificate.cert?.fileUrl || viewingCertificate.worker.documentUrl
                        if (fileUrl) {
                          window.open(fileUrl, '_blank')
                        }
                      }}
                    >
                      <ExternalLink className="size-3.5" />
                      Open Document
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="text-xs h-8 bg-primary text-primary-foreground font-semibold gap-1.5 cursor-pointer shadow-xs"
                    onClick={() => {
                      const fileUrl = viewingCertificate.cert?.fileUrl || viewingCertificate.worker.documentUrl
                      if (fileUrl) {
                        const link = document.createElement('a')
                        link.href = fileUrl
                        link.target = '_blank'
                        link.download = `${viewingCertificate.worker.name.replace(/\s+/g, '_')}_${viewingCertificate.cert?.name || 'Certificate'}.pdf`
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                      } else {
                        // Print/save card preview as fallback
                        window.print()
                      }
                    }}
                  >
                    <Download className="size-3.5" />
                    Download {(viewingCertificate.cert?.fileUrl || viewingCertificate.worker.documentUrl) ? "Document" : "OSHA Card"}
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ================= DELETE WORKER CONFIRMATION DIALOG ================= */}
      <Dialog open={Boolean(deletingWorker)} onOpenChange={(open) => !open && setDeletingWorker(null)}>
        <DialogContent className="sm:max-w-[420px] p-6 space-y-4">
          <DialogHeader className="text-left space-y-2">
            <div className="size-11 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto sm:mx-0">
              <Trash2 className="size-5" />
            </div>
            <DialogTitle className="text-base font-bold text-foreground">
              Remove Crew Member?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to remove <strong>{deletingWorker?.name}</strong> from the workforce roster? Their active certifications and site assignment will be removed.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 px-4 text-xs cursor-pointer"
              onClick={() => setDeletingWorker(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="h-9 px-4 text-xs font-semibold cursor-pointer shadow-xs"
              onClick={handleConfirmDelete}
            >
              Confirm Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
