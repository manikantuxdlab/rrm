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
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MOCK_COMPANIES } from "@/data/safetyMockData"
import type { ClientCompany } from "@/types"
import {
  Building,
  Building2,
  Plus,
  Search,
  CheckCircle2,
  Settings2,
  X,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  ShieldCheck,
  FileText,
  Activity,
  Calendar,
  Users,
  HardHat,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { RoutingSettingsModal } from "./RoutingSettingsModal"

export function ContractorAccountsView({
  onOpenAddCompany,
}: {
  onOpenAddCompany: () => void
}) {
  const [companies, setCompanies] = React.useState<ClientCompany[]>(MOCK_COMPANIES)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("table")
  const [selectedCompanyForRouting, setSelectedCompanyForRouting] = React.useState<ClientCompany | null>(null)
  const [viewingCompany, setViewingCompany] = React.useState<ClientCompany | null>(null)
  const [editingCompany, setEditingCompany] = React.useState<ClientCompany | null>(null)
  const [successToast, setSuccessToast] = React.useState<string | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(5)

  // Edit form state
  const [editName, setEditName] = React.useState("")
  const [editTrade, setEditTrade] = React.useState("")
  const [editContactPerson, setEditContactPerson] = React.useState("")
  const [editContactPhone, setEditContactPhone] = React.useState("")
  const [editRoutingEmail, setEditRoutingEmail] = React.useState("")
  const [editPolicyNumber, setEditPolicyNumber] = React.useState("")
  const [editPolicyExpires, setEditPolicyExpires] = React.useState("")
  const [editSafetyScore, setEditSafetyScore] = React.useState<number>(95)
  const [editStatus, setEditStatus] = React.useState<"active" | "pending_setup" | "on_hold">("active")

  const filteredCompanies = React.useMemo(() => {
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.trade.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.routingEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.policyNumber.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [companies, searchQuery])

  // Reset to page 1 on filter/search change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, pageSize])

  const totalPages = Math.max(1, Math.ceil(filteredCompanies.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)

  const paginatedCompanies = React.useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize
    return filteredCompanies.slice(startIndex, startIndex + pageSize)
  }, [filteredCompanies, safeCurrentPage, pageSize])

  // Open Edit Sheet
  const handleOpenEdit = (company: ClientCompany) => {
    setEditingCompany(company)
    setEditName(company.name)
    setEditTrade(company.trade)
    setEditContactPerson(company.contactPerson)
    setEditContactPhone(company.contactPhone)
    setEditRoutingEmail(company.routingEmail)
    setEditPolicyNumber(company.policyNumber)
    setEditPolicyExpires(company.policyExpires)
    setEditSafetyScore(company.safetyScore)
    setEditStatus(company.status)
  }

  // Save Company Edits
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCompany) return

    setCompanies((prev) =>
      prev.map((c) => {
        if (c.id === editingCompany.id) {
          return {
            ...c,
            name: editName,
            trade: editTrade,
            contactPerson: editContactPerson,
            contactPhone: editContactPhone,
            routingEmail: editRoutingEmail,
            policyNumber: editPolicyNumber,
            policyExpires: editPolicyExpires,
            safetyScore: editSafetyScore,
            status: editStatus,
          }
        }
        return c
      })
    )

    setEditingCompany(null)
    setSuccessToast(`✅ Company "${editName}" details updated successfully!`)
    setTimeout(() => setSuccessToast(null), 4000)
  }

  // Delete Company
  const handleDeleteCompany = (comp: ClientCompany) => {
    if (
      confirm(
        `Are you sure you want to delete "${comp.name}"? This will remove all associated routing destinations and policy entity mappings.`
      )
    ) {
      setCompanies((prev) => prev.filter((item) => item.id !== comp.id))
      setSuccessToast(`🗑️ Contractor entity "${comp.name}" was removed from the system.`)
      setTimeout(() => setSuccessToast(null), 4000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Building className="size-6 text-primary" />
            Contractor Accounts & Policy Entities
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Section 7 Requirement: Onboard and deactivate customer companies, maintain policy schedules and routing destinations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={onOpenAddCompany}
            className="h-10 px-4 text-sm font-semibold gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow transition-all cursor-pointer rounded-lg"
          >
            <Plus className="size-4 shrink-0" />
            <span>Onboard Contractor Entity</span>
          </Button>
        </div>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 cursor-pointer"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards (Slim & Compact) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border-border py-2.5 px-3.5 flex flex-col justify-between">
          <div className="text-[11px] font-medium text-muted-foreground">Active Insured Contractors</div>
          <div className="text-lg font-bold text-foreground mt-0.5">{companies.length} Companies</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">100% active policy binders</div>
        </Card>

        <Card className="border-border py-2.5 px-3.5 flex flex-col justify-between">
          <div className="text-[11px] font-medium text-muted-foreground">Average Safety Rating</div>
          <div className="text-lg font-bold text-foreground mt-0.5">97.2% Compliance</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Top tier group captive rating</div>
        </Card>

        <Card className="border-border py-2.5 px-3.5 flex flex-col justify-between">
          <div className="text-[11px] font-medium text-muted-foreground">Automated Email Routing</div>
          <div className="text-lg font-bold text-foreground mt-0.5">100% Configured</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Instant delivery to directors & brokers</div>
        </Card>
      </div>

      {/* Search Bar & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-base font-bold text-foreground">Contractor Directory</h3>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="relative w-full sm:w-64">
            <Search className="size-3.5 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search entity, trade, contact..."
              className="pl-8 pr-8 text-xs h-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer rounded-full p-0.5 hover:bg-muted"
                title="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Table / Grid Toggle */}
          <div className="flex items-center border border-border rounded-lg p-0.5 bg-muted/40 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Table View"
            >
              <List className="size-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Grid Card View"
            >
              <LayoutGrid className="size-3.5" />
              <span>Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* Conditional Rendering: Grid View vs Open-Sided Table */}
      {viewMode === "grid" ? (
        filteredCompanies.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-xs border rounded-xl bg-card">
            No contractor entities found matching your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedCompanies.map((comp) => (
              <Card
                key={comp.id}
                onClick={() => setViewingCompany(comp)}
                className="border-border hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between bg-card cursor-pointer group"
              >
                <CardHeader className="p-4 pb-3 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-10 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Building2 className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-foreground text-xs truncate group-hover:text-primary transition-colors">
                          {comp.name}
                        </div>
                        <Badge variant="outline" className="text-[9px] mt-0.5 border-border h-4 px-1.5 font-medium">
                          {comp.trade}
                        </Badge>
                      </div>
                    </div>

                    {/* Dropdown Menu */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="size-7 p-0 rounded-md hover:bg-muted cursor-pointer shrink-0"
                          >
                            <MoreVertical className="size-3.5 text-muted-foreground hover:text-foreground" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 text-xs">
                          <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase font-semibold">
                            Actions
                          </DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setViewingCompany(comp)} className="cursor-pointer gap-2">
                            <Eye className="size-3.5 text-primary" />
                            <span>View Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenEdit(comp)} className="cursor-pointer gap-2">
                            <Edit className="size-3.5 text-blue-500" />
                            <span>Edit Company</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSelectedCompanyForRouting(comp)} className="cursor-pointer gap-2">
                            <Settings2 className="size-3.5 text-amber-500" />
                            <span>Configure Routing</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteCompany(comp)} className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10">
                            <Trash2 className="size-3.5 text-destructive" />
                            <span>Delete Company</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-0 space-y-2.5 text-xs flex-1">
                  <div className="space-y-1 p-2.5 rounded-lg bg-muted/30 border border-border/40 text-[11px]">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Primary Contact</span>
                      <span className="font-semibold text-foreground">{comp.contactPerson}</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Direct Phone</span>
                      <span className="font-mono text-foreground">{comp.contactPhone}</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Routing Dispatch</span>
                      <span className="font-mono text-primary truncate max-w-[150px]">{comp.routingEmail}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-muted/20 border border-border/30">
                      <span className="text-[10px] text-muted-foreground block">Active Sites</span>
                      <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                        <HardHat className="size-3 text-primary" />
                        {comp.activeJobsCount} Active
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/20 border border-border/30">
                      <span className="text-[10px] text-muted-foreground block">Safety Score</span>
                      <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                        <Activity className="size-3 text-emerald-600" />
                        {comp.safetyScore}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[10px] text-muted-foreground font-mono">
                    <span>Policy: {comp.policyNumber}</span>
                    <span>Expires: {comp.policyExpires}</span>
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-2 border-t border-border/40 flex items-center justify-between text-xs" onClick={(e) => e.stopPropagation()}>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#00c800]/12 text-[#008a00] dark:text-[#00e600] border border-[#00c800]/30">
                    <span className="size-1.5 rounded-full bg-[#00c800]"></span>
                    Active Binder
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCompanyForRouting(comp)}
                      className="h-6.5 text-[10px] px-2 gap-1 cursor-pointer border-primary/30 text-primary hover:bg-primary/10"
                    >
                      <Settings2 className="size-3" />
                      Routing
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingCompany(comp)}
                      className="h-6.5 text-[10px] px-2 gap-1 cursor-pointer hover:bg-primary/10 hover:text-primary border-border"
                    >
                      <Eye className="size-3" />
                      Details
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )
      ) : (
        /* Open-Sided Table (Border-Y only, Left & Right Open) */
        <div className="border-y border-border overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
              <tr>
                <th className="px-4 py-3 font-semibold">Company Name</th>
                <th className="px-4 py-3 font-semibold">Primary Trade</th>
                <th className="px-4 py-3 font-semibold">Safety Routing Dispatch</th>
                <th className="px-4 py-3 font-semibold">Policy Number & Expiry</th>
                <th className="px-4 py-3 font-semibold">Active Jobs</th>
                <th className="px-4 py-3 font-semibold">Safety Score</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-xs">
                    No contractor entities found matching your search.
                  </td>
                </tr>
              ) : (
                paginatedCompanies.map((comp) => (
                  <tr
                    key={comp.id}
                    onClick={() => setViewingCompany(comp)}
                    className="hover:bg-muted/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-foreground group-hover:text-primary transition-colors">{comp.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        Contact: {comp.contactPerson} ({comp.contactPhone})
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant="outline" className="text-[10px]">
                        {comp.trade}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-primary">
                      {comp.routingEmail}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px]">
                      <div className="text-foreground font-semibold">{comp.policyNumber}</div>
                      <div className="text-muted-foreground text-[10px]">Expires: {comp.policyExpires}</div>
                    </td>
                    <td className="px-4 py-3.5 text-foreground font-medium">
                      {comp.activeJobsCount} Active Sites
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-foreground border border-border">
                        {comp.safetyScore}%
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      {/* Three Dot Action Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="size-8 p-0 rounded-md hover:bg-muted cursor-pointer"
                          >
                            <MoreVertical className="size-4 text-muted-foreground hover:text-foreground" />
                            <span className="sr-only">Company Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 text-xs">
                          <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase font-semibold">
                            Actions
                          </DropdownMenuLabel>
                          
                          {/* View Details */}
                          <DropdownMenuItem
                            onClick={() => setViewingCompany(comp)}
                            className="cursor-pointer gap-2"
                          >
                            <Eye className="size-3.5 text-primary" />
                            <span>View Details</span>
                          </DropdownMenuItem>

                          {/* Edit Company */}
                          <DropdownMenuItem
                            onClick={() => handleOpenEdit(comp)}
                            className="cursor-pointer gap-2"
                          >
                            <Edit className="size-3.5 text-blue-500" />
                            <span>Edit Company</span>
                          </DropdownMenuItem>

                          {/* Configure Routing */}
                          <DropdownMenuItem
                            onClick={() => setSelectedCompanyForRouting(comp)}
                            className="cursor-pointer gap-2"
                          >
                            <Settings2 className="size-3.5 text-amber-500" />
                            <span>Configure Routing</span>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          {/* Delete Company */}
                          <DropdownMenuItem
                            onClick={() => handleDeleteCompany(comp)}
                            className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                          >
                            <Trash2 className="size-3.5 text-destructive" />
                            <span>Delete Company</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Bar */}
      {filteredCompanies.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs border-t border-border/40">
          {/* Info summary */}
          <div className="text-muted-foreground text-xs">
            Showing <span className="font-semibold text-foreground">{(safeCurrentPage - 1) * pageSize + 1}</span> to{" "}
            <span className="font-semibold text-foreground">
              {Math.min(safeCurrentPage * pageSize, filteredCompanies.length)}
            </span>{" "}
            of <span className="font-semibold text-foreground">{filteredCompanies.length}</span> contractors
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Rows per page selector */}
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs">Rows per page:</span>
              <Select
                value={String(pageSize)}
                onValueChange={(val) => {
                  setPageSize(Number(val))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="h-8 w-18 text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Page Navigation */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={safeCurrentPage === 1}
                className="size-8 p-0 cursor-pointer disabled:cursor-not-allowed border-border"
                title="First Page"
              >
                <ChevronsLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
                className="size-8 p-0 cursor-pointer disabled:cursor-not-allowed border-border"
                title="Previous Page"
              >
                <ChevronLeft className="size-4" />
              </Button>

              {/* Page Number Buttons */}
              <div className="flex items-center gap-1 mx-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    if (totalPages <= 5) return true
                    if (p === 1 || p === totalPages) return true
                    return Math.abs(p - safeCurrentPage) <= 1
                  })
                  .map((p, idx, arr) => {
                    const prev = arr[idx - 1]
                    const showEllipsis = prev && p - prev > 1

                    return (
                      <React.Fragment key={p}>
                        {showEllipsis && (
                          <span className="px-1 text-muted-foreground">...</span>
                        )}
                        <Button
                          variant={safeCurrentPage === p ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(p)}
                          className={`size-8 p-0 text-xs font-semibold cursor-pointer ${
                            safeCurrentPage === p
                              ? "bg-primary text-primary-foreground"
                              : "border-border text-foreground hover:bg-muted"
                          }`}
                        >
                          {p}
                        </Button>
                      </React.Fragment>
                    )
                  })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage === totalPages}
                className="size-8 p-0 cursor-pointer disabled:cursor-not-allowed border-border"
                title="Next Page"
              >
                <ChevronRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={safeCurrentPage === totalPages}
                className="size-8 p-0 cursor-pointer disabled:cursor-not-allowed border-border"
                title="Last Page"
              >
                <ChevronsRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW COMPANY DETAILS SHEET ================= */}
      <Sheet open={!!viewingCompany} onOpenChange={(open) => !open && setViewingCompany(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg md:max-w-xl flex flex-col p-0 overflow-hidden h-full">
          {viewingCompany && (
            <div className="flex flex-col h-full justify-between overflow-hidden">
              <SheetHeader className="px-6 py-5 border-b shrink-0 text-left">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0">
                    <Building2 className="size-6" />
                  </div>
                  <div>
                    <SheetTitle className="text-base font-bold text-foreground flex items-center gap-2">
                      {viewingCompany.name}
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#00c800]/12 text-[#008a00] dark:text-[#00e600] border border-[#00c800]/30">
                        <span className="size-1.5 rounded-full bg-[#00c800]"></span>
                        {viewingCompany.status === "active" ? "Active Policy" : "Setup Pending"}
                      </span>
                    </SheetTitle>
                    <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                      {viewingCompany.trade} • Policy ID: {viewingCompany.policyNumber}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 text-xs">
                {/* Safety Score Overview */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border bg-muted/30">
                    <div className="text-[10px] text-muted-foreground uppercase font-semibold">Safety Score</div>
                    <div className="text-xl font-bold text-foreground mt-1 flex items-center gap-1.5">
                      <Activity className="size-4 text-emerald-600" />
                      {viewingCompany.safetyScore}%
                    </div>
                    <div className="text-[10px] text-emerald-600 mt-0.5">Compliant rating</div>
                  </div>

                  <div className="p-3.5 rounded-xl border bg-muted/30">
                    <div className="text-[10px] text-muted-foreground uppercase font-semibold">Active Jobsites</div>
                    <div className="text-xl font-bold text-foreground mt-1 flex items-center gap-1.5">
                      <HardHat className="size-4 text-primary" />
                      {viewingCompany.activeJobsCount} Sites
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{viewingCompany.usersCount} Logins enrolled</div>
                  </div>
                </div>

                {/* Primary Contact Details */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider text-muted-foreground">
                    Primary Point of Contact
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg border bg-muted/30">
                      <div className="text-[10px] text-muted-foreground">Designated Director / Officer</div>
                      <div className="font-semibold text-foreground mt-0.5 flex items-center gap-1.5">
                        <Users className="size-3 text-primary" />
                        {viewingCompany.contactPerson}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg border bg-muted/30">
                      <div className="text-[10px] text-muted-foreground">Contact Direct Phone</div>
                      <div className="font-semibold text-foreground mt-0.5 flex items-center gap-1.5">
                        <Phone className="size-3 text-primary" />
                        {viewingCompany.contactPhone}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Automated Routing Dispatch */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider text-muted-foreground">
                    Safety Notification Dispatch
                  </h4>
                  <div className="p-3.5 rounded-lg border bg-muted/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] text-muted-foreground">Automated Incident / Form Dispatch Email</div>
                      <Badge variant="outline" className="text-[10px]">Real-time Sync</Badge>
                    </div>
                    <div className="font-mono text-xs font-semibold text-primary flex items-center gap-1.5">
                      <Mail className="size-3.5" />
                      {viewingCompany.routingEmail}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      All daily field checklists, toolbox talk signatures, and critical incident logs are automatically delivered here.
                    </p>
                  </div>
                </div>

                {/* Policy & Coverage Binder */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider text-muted-foreground">
                    Insurance Binder & Policy Schedule
                  </h4>
                  <div className="p-3.5 rounded-lg border bg-muted/30 grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[10px] text-muted-foreground">Policy Number</div>
                      <div className="font-mono text-xs font-semibold text-foreground mt-0.5 flex items-center gap-1.5">
                        <FileText className="size-3 text-primary" />
                        {viewingCompany.policyNumber}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground">Policy Expiration</div>
                      <div className="font-mono text-xs font-semibold text-foreground mt-0.5 flex items-center gap-1.5">
                        <Calendar className="size-3 text-primary" />
                        {viewingCompany.policyExpires}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Compliance info */}
                <div className="p-3.5 rounded-lg bg-primary/5 border border-primary/20 text-[11px] text-muted-foreground flex items-start gap-2.5">
                  <ShieldCheck className="size-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground">Section 7 Multi-Tenancy Compliance:</span>
                    <p className="mt-0.5">
                      {viewingCompany.name} is isolated with strict policy schedules, captive broker routing, and dedicated jobsite allocations.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sheet Footer */}
              <SheetFooter className="px-6 py-4 border-t bg-card shrink-0 flex flex-row items-center justify-between gap-3 mt-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const c = viewingCompany
                    setViewingCompany(null)
                    handleOpenEdit(c)
                  }}
                  className="text-xs gap-1.5 cursor-pointer"
                >
                  <Edit className="size-3.5 text-blue-500" />
                  Edit Company
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const c = viewingCompany
                      setViewingCompany(null)
                      setSelectedCompanyForRouting(c)
                    }}
                    className="text-xs gap-1.5 cursor-pointer border-primary/40 text-primary hover:bg-primary/10"
                  >
                    <Settings2 className="size-3.5" />
                    Configure Routing
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setViewingCompany(null)}
                    className="text-xs cursor-pointer"
                  >
                    Close
                  </Button>
                </div>
              </SheetFooter>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ================= EDIT COMPANY SHEET ================= */}
      <Sheet open={!!editingCompany} onOpenChange={(open) => !open && setEditingCompany(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg md:max-w-xl flex flex-col p-0 overflow-hidden h-full">
          {editingCompany && (
            <form onSubmit={handleSaveEdit} className="flex flex-col h-full justify-between overflow-hidden">
              <SheetHeader className="px-6 py-5 border-b shrink-0 text-left">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-xl bg-blue-500/10 text-blue-600 font-bold flex items-center justify-center text-sm shrink-0">
                    <Edit className="size-5" />
                  </div>
                  <div>
                    <SheetTitle className="text-base font-bold text-foreground">
                      Edit Contractor Entity
                    </SheetTitle>
                    <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                      Update company profile, safety contacts, policy details and routing dispatch.
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              {/* Form Body */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 text-xs">
                {/* Company Name */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Company Name</Label>
                  <Input
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. Pacific Rebar Ironworks LLC"
                    className="h-9 text-xs"
                  />
                </div>

                {/* Primary Trade & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Primary Trade</Label>
                    <Input
                      required
                      value={editTrade}
                      onChange={(e) => setEditTrade(e.target.value)}
                      placeholder="e.g. Concrete & Masonry"
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Account Status</Label>
                    <Select
                      value={editStatus}
                      onValueChange={(val: "active" | "pending_setup" | "on_hold") => setEditStatus(val)}
                    >
                      <SelectTrigger className="h-9 text-xs bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="text-xs">
                        <SelectItem value="active">Active Insured</SelectItem>
                        <SelectItem value="pending_setup">Pending Setup</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Contact Person & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Safety Lead / Contact</Label>
                    <Input
                      required
                      value={editContactPerson}
                      onChange={(e) => setEditContactPerson(e.target.value)}
                      placeholder="e.g. Marcus Vance"
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Contact Phone</Label>
                    <Input
                      required
                      value={editContactPhone}
                      onChange={(e) => setEditContactPhone(e.target.value)}
                      placeholder="e.g. (213) 555-0142"
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                {/* Safety Routing Email */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Safety Routing Dispatch Email</Label>
                  <Input
                    required
                    type="email"
                    value={editRoutingEmail}
                    onChange={(e) => setEditRoutingEmail(e.target.value)}
                    placeholder="safety@company.com"
                    className="h-9 text-xs font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Submissions and daily compliance summaries will be routed to this email.
                  </p>
                </div>

                {/* Policy Number & Expiration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Policy Schedule Number</Label>
                    <Input
                      required
                      value={editPolicyNumber}
                      onChange={(e) => setEditPolicyNumber(e.target.value)}
                      placeholder="e.g. POL-RRM-904821"
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Policy Expiration Date</Label>
                    <Input
                      required
                      type="date"
                      value={editPolicyExpires}
                      onChange={(e) => setEditPolicyExpires(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                {/* Safety Score */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Safety Compliance Score (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={editSafetyScore}
                    onChange={(e) => setEditSafetyScore(Number(e.target.value))}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* Footer */}
              <SheetFooter className="px-6 py-4 border-t bg-card shrink-0 flex flex-row items-center justify-end gap-3 mt-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingCompany(null)}
                  className="text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                >
                  Save Changes
                </Button>
              </SheetFooter>
            </form>
          )}
        </SheetContent>
      </Sheet>

      {/* Routing Configuration Modal */}
      <RoutingSettingsModal
        company={selectedCompanyForRouting}
        isOpen={!!selectedCompanyForRouting}
        onClose={() => setSelectedCompanyForRouting(null)}
        onSave={() => {
          setSuccessToast(
            `✅ Custom routing destinations updated for ${selectedCompanyForRouting?.name}!`
          )
          setTimeout(() => setSuccessToast(null), 4000)
        }}
      />
    </div>
  )
}


