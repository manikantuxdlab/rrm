import * as React from "react"
import {
  Card,
  CardContent,
  CardHeader,
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
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Smartphone,
  Mail,
  Building2,
  HardHat,
  Search,
  KeyRound,
  CheckCircle2,
  X,
  Phone,
  Globe,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  ShieldCheck,
  FileCheck2,
  Calendar,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { MOCK_APP_USERS, MOCK_COMPANIES, MOCK_JOBSITES } from "@/data/safetyMockData"
import type { AppUser } from "@/types"

export function UserAccountsView() {
  const [users, setUsers] = React.useState<AppUser[]>(MOCK_APP_USERS)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCompanyFilter, setSelectedCompanyFilter] = React.useState<string>("all")
  const [selectedRoleFilter, setSelectedRoleFilter] = React.useState<string>("all")
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("table")
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(5)

  // State for View and Edit modals
  const [viewingUser, setViewingUser] = React.useState<AppUser | null>(null)
  const [editingUser, setEditingUser] = React.useState<AppUser | null>(null)

  // Edit user form state
  const [editFullName, setEditFullName] = React.useState("")
  const [editEmail, setEditEmail] = React.useState("")
  const [editPhone, setEditPhone] = React.useState("")
  const [editCompanyId, setEditCompanyId] = React.useState("")
  const [editRole, setEditRole] = React.useState<AppUser["role"]>("foreman")
  const [editLanguage, setEditLanguage] = React.useState<"en" | "es">("en")
  const [editJobsiteId, setEditJobsiteId] = React.useState("")

  // New user form state
  const [newFullName, setNewFullName] = React.useState("")
  const [newEmail, setNewEmail] = React.useState("")
  const [newPhone, setNewPhone] = React.useState("")
  const [newCompanyId, setNewCompanyId] = React.useState(MOCK_COMPANIES[0]?.id || "")
  const [newRole, setNewRole] = React.useState<AppUser["role"]>("foreman")
  const [newLanguage, setNewLanguage] = React.useState<"en" | "es">("en")
  const [newJobsiteId, setNewJobsiteId] = React.useState(MOCK_JOBSITES[0]?.id || "")
  const [successToast, setSuccessToast] = React.useState<string | null>(null)

  const filteredUsers = React.useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.phone.includes(searchQuery)
      const matchesCompany =
        selectedCompanyFilter === "all" || u.companyId === selectedCompanyFilter
      const matchesRole =
        selectedRoleFilter === "all" || u.role === selectedRoleFilter
      return matchesSearch && matchesCompany && matchesRole
    })
  }, [users, searchQuery, selectedCompanyFilter, selectedRoleFilter])

  // Reset to page 1 on filter or search or page size change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCompanyFilter, selectedRoleFilter, pageSize])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)

  const paginatedUsers = React.useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize
    return filteredUsers.slice(startIndex, startIndex + pageSize)
  }, [filteredUsers, safeCurrentPage, pageSize])

  const totalActive = users.filter((u) => u.status === "active").length
  const totalForemen = users.filter((u) => u.role === "foreman").length
  const totalSpanish = users.filter((u) => u.languagePreference === "es").length

  // Open Edit modal with user data
  const handleOpenEdit = (u: AppUser) => {
    setEditingUser(u)
    setEditFullName(u.fullName)
    setEditEmail(u.email)
    setEditPhone(u.phone)
    setEditCompanyId(u.companyId)
    setEditRole(u.role)
    setEditLanguage(u.languagePreference)
    setEditJobsiteId(u.assignedJobsiteIds[0] || MOCK_JOBSITES[0]?.id || "")
  }

  // Save edited user
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    const comp = MOCK_COMPANIES.find((c) => c.id === editCompanyId)
    const job = MOCK_JOBSITES.find((j) => j.id === editJobsiteId)

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === editingUser.id) {
          return {
            ...u,
            fullName: editFullName,
            email: editEmail,
            phone: editPhone,
            companyId: editCompanyId,
            companyName: comp ? comp.name : u.companyName,
            role: editRole,
            languagePreference: editLanguage,
            assignedJobsiteIds: [editJobsiteId],
            assignedJobsiteNames: [job ? job.name : "Assigned Site"],
          }
        }
        return u
      })
    )

    setEditingUser(null)
    setSuccessToast(`✅ User "${editFullName}" updated successfully!`)
    setTimeout(() => setSuccessToast(null), 4000)
  }

  // Delete user
  const handleDeleteUser = (u: AppUser) => {
    if (confirm(`Are you sure you want to delete "${u.fullName}"? This action cannot be undone.`)) {
      setUsers((prev) => prev.filter((item) => item.id !== u.id))
      setSuccessToast(`🗑️ User "${u.fullName}" was removed from the system.`)
      setTimeout(() => setSuccessToast(null), 4000)
    }
  }

  // Toggle active / deactivated
  const handleToggleStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus = u.status === "active" ? "deactivated" : "active"
          const msg =
            newStatus === "deactivated"
              ? `🚫 Access revoked for ${u.fullName}. Mobile login disabled.`
              : `✅ Access restored for ${u.fullName}. Mobile login re-enabled.`
          setSuccessToast(msg)
          setTimeout(() => setSuccessToast(null), 4000)
          return {
            ...u,
            status: newStatus,
            lastActive:
              newStatus === "deactivated" ? "Access Revoked" : "Active Now",
          }
        }
        return u
      })
    )
  }

  // Send Password Reset
  const handleSendReset = (u: AppUser) => {
    setSuccessToast(
      `🔑 Password reset & SMS login link dispatched to ${u.phone} and ${u.email}`
    )
    setTimeout(() => setSuccessToast(null), 4000)
  }

  // Onboard new user
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault()
    const comp = MOCK_COMPANIES.find((c) => c.id === newCompanyId)
    const job = MOCK_JOBSITES.find((j) => j.id === newJobsiteId)

    const created: AppUser = {
      id: `user-${Date.now().toString().slice(-4)}`,
      fullName: newFullName,
      email: newEmail,
      phone: newPhone,
      companyId: newCompanyId,
      companyName: comp ? comp.name : "Subcontractor Partner",
      role: newRole,
      assignedJobsiteIds: [newJobsiteId],
      assignedJobsiteNames: [job ? job.name : "Active Projects"],
      languagePreference: newLanguage,
      status: "active",
      lastActive: "Just invited",
      submissionsCount: 0,
    }

    setUsers([created, ...users])
    setIsInviteModalOpen(false)
    setSuccessToast(
      `✅ New user "${newFullName}" successfully onboarded! SMS invite sent to ${newPhone}.`
    )
    setTimeout(() => setSuccessToast(null), 4000)

    // Reset form
    setNewFullName("")
    setNewEmail("")
    setNewPhone("")
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Users className="size-6 text-primary" />
            Foremen & Mobile App Logins
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Section 7 Compliance: Onboard, assign jobsites, grant field permissions, and manage 1-20 user logins per company
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsInviteModalOpen(true)}
            className="h-10 px-4 text-sm font-semibold gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow transition-all cursor-pointer rounded-lg"
          >
            <UserPlus className="size-4 shrink-0" />
            <span>Onboard New Foreman / User</span>
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

      {/* KPI Stats Strip (Compact & Slim) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border py-2.5 px-3.5 flex flex-col justify-between">
          <div className="text-[11px] font-medium text-muted-foreground">Total App Accounts</div>
          <div className="text-lg font-bold text-foreground mt-0.5">{users.length} Logins</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Across 4 Customer Companies</div>
        </Card>

        <Card className="border-border py-2.5 px-3.5 flex flex-col justify-between">
          <div className="text-[11px] font-medium text-muted-foreground">
            Active Field Foremen
          </div>
          <div className="text-lg font-bold text-foreground mt-0.5">
            {totalForemen} Foremen
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">{totalActive} Accounts Enabled</div>
        </Card>

        <Card className="border-border py-2.5 px-3.5 flex flex-col justify-between">
          <div className="text-[11px] font-medium text-muted-foreground">Spanish Interface Users</div>
          <div className="text-lg font-bold text-foreground mt-0.5">{totalSpanish} Users</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Bilingual App Enabled (ES)</div>
        </Card>

        <Card className="border-border py-2.5 px-3.5 flex flex-col justify-between">
          <div className="text-[11px] font-medium text-muted-foreground">Sync & Submissions</div>
          <div className="text-lg font-bold text-foreground mt-0.5">
            {users.reduce((acc, u) => acc + u.submissionsCount, 0)} Total
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Checklists, Talks & JHAs</div>
        </Card>
      </div>

      {/* Search & Shadcn Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="size-3.5 absolute left-3 top-2.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, email, phone, or company..."
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

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          {/* Shadcn Select for Companies */}
          <Select
            value={selectedCompanyFilter}
            onValueChange={(val) => setSelectedCompanyFilter(val)}
          >
            <SelectTrigger className="h-9 min-w-[170px] text-xs bg-background">
              <SelectValue placeholder="All Companies" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="all">All Companies</SelectItem>
              {MOCK_COMPANIES.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name.length > 25 ? c.name.substring(0, 25) + "..." : c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Shadcn Select for Roles */}
          <Select
            value={selectedRoleFilter}
            onValueChange={(val) => setSelectedRoleFilter(val)}
          >
            <SelectTrigger className="h-9 min-w-[140px] text-xs bg-background">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="foreman">Field Foreman</SelectItem>
              <SelectItem value="superintendent">Superintendent</SelectItem>
              <SelectItem value="safety_manager">Safety Manager</SelectItem>
            </SelectContent>
          </Select>

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
        filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-xs border rounded-xl bg-card">
            No users found matching your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {paginatedUsers.map((u) => {
              const isDeactivated = u.status === "deactivated"
              return (
                <Card
                  key={u.id}
                  onClick={() => setViewingUser(u)}
                  className={`border-border hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group ${
                    isDeactivated ? "opacity-65 bg-muted/10" : "bg-card"
                  }`}
                >
                  <CardHeader className="p-3.5 pb-2.5 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="size-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          {u.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground text-xs flex items-center gap-1 truncate group-hover:text-primary transition-colors">
                            <span className="truncate">{u.fullName}</span>
                            {u.role === "foreman" && (
                              <HardHat className="size-3 text-amber-500 shrink-0" />
                            )}
                          </div>
                          <Badge variant="outline" className="text-[9px] mt-0.5 capitalize border-border h-4 px-1.5 font-medium">
                            {u.role.replace("_", " ")}
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
                            User Actions
                          </DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setViewingUser(u)} className="cursor-pointer gap-2">
                            <Eye className="size-3.5 text-primary" />
                            <span>View Profile</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenEdit(u)} className="cursor-pointer gap-2">
                            <Edit className="size-3.5 text-blue-500" />
                            <span>Edit User</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSendReset(u)} className="cursor-pointer gap-2">
                            <KeyRound className="size-3.5 text-amber-500" />
                            <span>Reset Password / SMS</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleToggleStatus(u.id)} className="cursor-pointer gap-2">
                            {isDeactivated ? (
                              <>
                                <UserCheck className="size-3.5 text-emerald-600" />
                                <span className="text-emerald-600 font-semibold">Activate Login</span>
                              </>
                            ) : (
                              <>
                                <UserX className="size-3.5 text-amber-600" />
                                <span className="text-amber-600 font-semibold">Deactivate Access</span>
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteUser(u)} className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10">
                            <Trash2 className="size-3.5 text-destructive" />
                            <span className="font-semibold text-destructive">Delete User</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>

                  <CardContent className="p-3.5 pt-0 space-y-2.5 text-xs flex-1">
                    <div className="space-y-1 p-2 rounded-lg bg-muted/30 border border-border/40 text-[11px]">
                      <div className="flex items-center gap-1.5 font-medium text-foreground truncate">
                        <Building2 className="size-3 shrink-0 text-primary" />
                        <span className="truncate">{u.companyName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground truncate">
                        <Mail className="size-2.5 shrink-0" />
                        <span className="truncate">{u.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="size-2.5 shrink-0" />
                        <span>{u.phone}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-semibold text-muted-foreground">Assigned Jobsite</div>
                      <div className="text-[11px] text-foreground font-medium truncate flex items-center gap-1">
                        <HardHat className="size-3 text-primary shrink-0" />
                        <span className="truncate">{u.assignedJobsiteNames.join(", ")}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      <Badge variant="secondary" className="text-[9px] font-mono gap-1 h-5 px-1.5">
                        <Globe className="size-2.5" />
                        {u.languagePreference === "es" ? "Spanish" : "English"}
                      </Badge>
                      <div className="text-muted-foreground">
                        <span className="font-bold text-foreground">{u.submissionsCount}</span> records
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="p-3.5 pt-2 border-t border-border/40 flex items-center justify-between text-xs">
                    <div>
                      {u.status === "active" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#00c800]/12 text-[#008a00] dark:text-[#00e600] border border-[#00c800]/30">
                          <span className="size-1.5 rounded-full bg-[#00c800]"></span>
                          Active
                        </span>
                      )}
                      {u.status === "deactivated" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border border-border">
                          <span className="size-1.5 rounded-full bg-muted-foreground/60"></span>
                          Deactivated
                        </span>
                      )}
                      {u.status === "invited" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                          <span className="size-1.5 rounded-full bg-amber-500"></span>
                          Invited
                        </span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingUser(u)}
                      className="h-6.5 text-[10px] px-2 gap-1 cursor-pointer hover:bg-primary/10 hover:text-primary border-border"
                    >
                      <Eye className="size-3" />
                      View Profile
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )
      ) : (
        /* Open-Sided Table (Border-Y only, Left & Right Open) */
        <div className="border-y border-border overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40 border-b border-border">
              <TableRow>
                <TableHead className="px-4 py-3 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                  User & Email
                </TableHead>
                <TableHead className="px-4 py-3 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                  Mobile Number
                </TableHead>
                <TableHead className="px-4 py-3 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                  Company & Role
                </TableHead>
                <TableHead className="px-4 py-3 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                  Assigned Jobsite(s)
                </TableHead>
                <TableHead className="px-4 py-3 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                  Language
                </TableHead>
                <TableHead className="px-4 py-3 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                  Status
                </TableHead>
                <TableHead className="px-4 py-3 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                  Submissions
                </TableHead>
                <TableHead className="px-4 py-3 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/60">
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-4 py-8 text-center text-muted-foreground text-xs">
                    No users found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((u) => {
                  const isDeactivated = u.status === "deactivated"

                  return (
                    <TableRow
                      key={u.id}
                      onClick={() => setViewingUser(u)}
                      className={`hover:bg-muted/50 transition-colors cursor-pointer group ${
                        isDeactivated ? "opacity-60 bg-muted/10" : ""
                      }`}
                    >
                      {/* Name & Email */}
                      <TableCell className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="size-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            {u.fullName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                              <span>{u.fullName}</span>
                              {u.role === "foreman" && (
                                <HardHat className="size-3 text-amber-500" />
                              )}
                            </div>
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Mail className="size-2.5 shrink-0" />
                              <span className="truncate max-w-[180px]">{u.email}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Mobile Number */}
                      <TableCell className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-foreground font-medium">
                          <Phone className="size-3 text-primary shrink-0" />
                          <span>{u.phone}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          SMS Login Enabled
                        </div>
                      </TableCell>

                      {/* Company & Role */}
                      <TableCell className="px-4 py-3.5">
                        <div className="font-medium text-foreground">{u.companyName}</div>
                        <Badge
                          variant="outline"
                          className="text-[10px] mt-0.5 capitalize border-border"
                        >
                          {u.role.replace("_", " ")}
                        </Badge>
                      </TableCell>

                      {/* Assigned Jobsites */}
                      <TableCell className="px-4 py-3.5">
                        <div className="flex items-center gap-1 text-muted-foreground line-clamp-1 max-w-[200px]">
                          <Building2 className="size-3 shrink-0 text-primary" />
                          <span className="text-[11px] text-foreground font-medium">
                            {u.assignedJobsiteNames.join(", ")}
                          </span>
                        </div>
                      </TableCell>

                      {/* Language Preference */}
                      <TableCell className="px-4 py-3.5">
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-mono gap-1"
                        >
                          <Globe className="size-2.5" />
                          {u.languagePreference === "es" ? "🇲🇽 Spanish" : "🇺🇸 English"}
                        </Badge>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="px-4 py-3.5">
                        {u.status === "active" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#00c800]/12 text-[#008a00] dark:text-[#00e600] border border-[#00c800]/30">
                            <span className="size-1.5 rounded-full bg-[#00c800] shrink-0"></span>
                            Active
                          </span>
                        )}
                        {u.status === "deactivated" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border">
                            <span className="size-1.5 rounded-full bg-muted-foreground/60 shrink-0"></span>
                            Deactivated
                          </span>
                        )}
                        {u.status === "invited" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                            <span className="size-1.5 rounded-full bg-amber-500 shrink-0"></span>
                            Invited
                          </span>
                        )}
                        <div className="text-[10px] text-muted-foreground mt-1">
                          {u.lastActive}
                        </div>
                      </TableCell>

                      {/* Submissions count */}
                      <TableCell className="px-4 py-3.5">
                        <span className="font-semibold text-foreground">
                          {u.submissionsCount}
                        </span>{" "}
                        <span className="text-[10px] text-muted-foreground">records</span>
                      </TableCell>

                      {/* Actions: Shadcn DropdownMenu */}
                      <TableCell className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="size-8 p-0 rounded-md hover:bg-muted/80 cursor-pointer"
                            >
                              <MoreVertical className="size-4 text-muted-foreground hover:text-foreground" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 text-xs">
                            <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase font-semibold">
                              User Actions
                            </DropdownMenuLabel>
                            
                            {/* View Profile */}
                            <DropdownMenuItem
                              onClick={() => setViewingUser(u)}
                              className="cursor-pointer gap-2"
                            >
                              <Eye className="size-3.5 text-primary" />
                              <span>View Profile</span>
                            </DropdownMenuItem>

                            {/* Edit User */}
                            <DropdownMenuItem
                              onClick={() => handleOpenEdit(u)}
                              className="cursor-pointer gap-2"
                            >
                              <Edit className="size-3.5 text-blue-500" />
                              <span>Edit User</span>
                            </DropdownMenuItem>

                            {/* Reset Password & SMS */}
                            <DropdownMenuItem
                              onClick={() => handleSendReset(u)}
                              className="cursor-pointer gap-2"
                            >
                              <KeyRound className="size-3.5 text-amber-500" />
                              <span>Reset Password / SMS</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {/* Activate / Deactivate Toggle */}
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(u.id)}
                              className="cursor-pointer gap-2"
                            >
                              {isDeactivated ? (
                                <>
                                  <UserCheck className="size-3.5 text-emerald-600" />
                                  <span className="text-emerald-600 font-semibold">Activate Login</span>
                                </>
                              ) : (
                                <>
                                  <UserX className="size-3.5 text-amber-600" />
                                  <span className="text-amber-600 font-semibold">Deactivate Access</span>
                                </>
                              )}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {/* Delete User */}
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(u)}
                              className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                              <Trash2 className="size-3.5 text-destructive" />
                              <span className="font-semibold text-destructive">Delete User</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination Bar */}
      {filteredUsers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs border-t border-border/40">
          {/* Info summary */}
          <div className="text-muted-foreground text-xs">
            Showing <span className="font-semibold text-foreground">{(safeCurrentPage - 1) * pageSize + 1}</span> to{" "}
            <span className="font-semibold text-foreground">
              {Math.min(safeCurrentPage * pageSize, filteredUsers.length)}
            </span>{" "}
            of <span className="font-semibold text-foreground">{filteredUsers.length}</span> users
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

      {/* 1. View User Details Modal (Shadcn Sheet) */}
      <Sheet open={!!viewingUser} onOpenChange={(open) => !open && setViewingUser(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg md:max-w-xl flex flex-col p-0 overflow-hidden h-full">
          {viewingUser && (
            <div className="flex flex-col h-full justify-between overflow-hidden">
              <SheetHeader className="px-6 py-5 border-b shrink-0 text-left">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0">
                    {viewingUser.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <SheetTitle className="text-base font-bold text-foreground flex items-center gap-2">
                      {viewingUser.fullName}
                      {viewingUser.status === "active" ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#00c800]/12 text-[#008a00] dark:text-[#00e600] border border-[#00c800]/30">
                          <span className="size-1.5 rounded-full bg-[#00c800]"></span>
                          Active
                        </span>
                      ) : (
                        <Badge variant="destructive" className="text-[10px]">Deactivated</Badge>
                      )}
                    </SheetTitle>
                    <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                      {viewingUser.companyName} • {viewingUser.role.replace("_", " ")}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 text-xs">
                {/* Contact details */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider text-muted-foreground">
                    Contact & Authentication Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg border bg-muted/30">
                      <div className="text-[10px] text-muted-foreground">Work Email Address</div>
                      <div className="font-semibold text-foreground mt-0.5 flex items-center gap-1.5">
                        <Mail className="size-3 text-primary" />
                        {viewingUser.email}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg border bg-muted/30">
                      <div className="text-[10px] text-muted-foreground">Mobile Phone (SMS Invite)</div>
                      <div className="font-semibold text-foreground mt-0.5 flex items-center gap-1.5">
                        <Phone className="size-3 text-primary" />
                        {viewingUser.phone}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Jobsite & Language */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider text-muted-foreground">
                    Jobsite & Configuration
                  </h4>
                  <div className="space-y-2.5">
                    <div className="p-3 rounded-lg border bg-muted/30 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-muted-foreground">Assigned Active Jobsites</div>
                        <div className="font-semibold text-foreground mt-0.5 flex items-center gap-1.5">
                          <Building2 className="size-3 text-primary" />
                          {viewingUser.assignedJobsiteNames.join(", ")}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px]">Primary Site</Badge>
                    </div>

                    <div className="p-3 rounded-lg border bg-muted/30 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-muted-foreground">Preferred Mobile Language</div>
                        <div className="font-semibold text-foreground mt-0.5">
                          {viewingUser.languagePreference === "es" ? "🇲🇽 Spanish (Español)" : "🇺🇸 English"}
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        {viewingUser.languagePreference.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Submissions stats */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider text-muted-foreground">
                    Field Activity & Submissions
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg border bg-muted/30">
                      <div className="text-[10px] text-muted-foreground">Total Form Submissions</div>
                      <div className="text-lg font-bold text-foreground mt-0.5 flex items-center gap-1.5">
                        <FileCheck2 className="size-4 text-emerald-600" />
                        {viewingUser.submissionsCount} records
                      </div>
                    </div>
                    <div className="p-3 rounded-lg border bg-muted/30">
                      <div className="text-[10px] text-muted-foreground">Last App Login</div>
                      <div className="text-xs font-semibold text-foreground mt-1 flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-muted-foreground" />
                        {viewingUser.lastActive}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security info */}
                <div className="p-3.5 rounded-lg bg-primary/5 border border-primary/20 text-[11px] text-muted-foreground flex items-start gap-2.5">
                  <ShieldCheck className="size-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground">Section 7 Multi-Tenancy Compliance:</span>
                    <p className="mt-0.5">
                      This user is strictly scoped to {viewingUser.companyName}'s jobsites, checklists and insurance records.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <SheetFooter className="px-6 py-4 border-t bg-card shrink-0 flex flex-row items-center justify-between gap-3 mt-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const u = viewingUser
                    setViewingUser(null)
                    handleOpenEdit(u)
                  }}
                  className="text-xs gap-1.5 cursor-pointer"
                >
                  <Edit className="size-3.5 text-blue-500" />
                  Edit Profile
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendReset(viewingUser)}
                    className="text-xs gap-1.5 cursor-pointer"
                  >
                    <KeyRound className="size-3.5 text-amber-500" />
                    Reset Password
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setViewingUser(null)}
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

      {/* 2. Edit User Sheet (Shadcn Sheet) */}
      <Sheet open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl flex flex-col p-0 overflow-hidden h-full">
          <form onSubmit={handleSaveEdit} className="flex flex-col h-full justify-between overflow-hidden">
            <SheetHeader className="px-6 py-5 border-b shrink-0 text-left">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
                  <Edit className="size-5" />
                </div>
                <div>
                  <SheetTitle className="text-base font-bold text-foreground">
                    Edit User Profile
                  </SheetTitle>
                  <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                    Update credentials, customer company and site permissions
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Full Name *</label>
                  <Input
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="h-10 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Mobile Phone *</label>
                  <Input
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="h-10 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Work Email Address *</label>
                <Input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="h-10 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Customer Company *</label>
                  <Select
                    value={editCompanyId}
                    onValueChange={(val) => setEditCompanyId(val)}
                  >
                    <SelectTrigger className="h-10 w-full text-xs bg-background">
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      {MOCK_COMPANIES.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Role / Permission *</label>
                  <Select
                    value={editRole}
                    onValueChange={(val) => setEditRole(val as AppUser["role"])}
                  >
                    <SelectTrigger className="h-10 w-full text-xs bg-background">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      <SelectItem value="foreman">Field Foreman (Daily Checks & Talks)</SelectItem>
                      <SelectItem value="superintendent">Superintendent (Jobsite Lead)</SelectItem>
                      <SelectItem value="safety_manager">Safety Director / Officer</SelectItem>
                      <SelectItem value="admin">Company Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Assigned Active Jobsite *</label>
                  <Select
                    value={editJobsiteId}
                    onValueChange={(val) => setEditJobsiteId(val)}
                  >
                    <SelectTrigger className="h-10 w-full text-xs bg-background">
                      <SelectValue placeholder="Select jobsite" />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      {MOCK_JOBSITES.map((j) => (
                        <SelectItem key={j.id} value={j.id}>
                          {j.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">App Language Preference</label>
                  <Select
                    value={editLanguage}
                    onValueChange={(val) => setEditLanguage(val as "en" | "es")}
                  >
                    <SelectTrigger className="h-10 w-full text-xs bg-background">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      <SelectItem value="en">🇺🇸 English</SelectItem>
                      <SelectItem value="es">🇲🇽 Spanish (Español)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <SheetFooter className="px-6 py-4 border-t bg-card shrink-0 flex flex-row items-center justify-end gap-3 mt-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingUser(null)}
                className="h-10 px-5 text-xs font-medium cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-10 px-6 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-sm cursor-pointer"
              >
                Save Changes
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* 3. Onboard / Invite User Sheet (Shadcn Sheet) */}
      <Sheet open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl flex flex-col p-0 overflow-hidden h-full">
          <form onSubmit={handleCreateUser} className="flex flex-col h-full justify-between overflow-hidden">
            {/* Header */}
            <SheetHeader className="px-6 py-5 border-b shrink-0 text-left">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <UserPlus className="size-5" />
                </div>
                <div>
                  <SheetTitle className="text-base font-bold text-foreground">
                    Onboard New Field Foreman / User
                  </SheetTitle>
                  <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                    Creates mobile app credentials & links user to customer jobsites
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Full Name *</label>
                  <Input
                    required
                    placeholder="e.g. Sergio Ramos"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    className="h-10 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Mobile Phone (SMS Invite) *</label>
                  <Input
                    required
                    placeholder="e.g. (213) 555-0988"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="h-10 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Work Email Address *</label>
                <Input
                  type="email"
                  required
                  placeholder="e.g. sramos@titanconcrete-ca.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="h-10 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Customer Company *</label>
                  <Select
                    value={newCompanyId}
                    onValueChange={(val) => setNewCompanyId(val)}
                  >
                    <SelectTrigger className="h-10 w-full text-xs bg-background">
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      {MOCK_COMPANIES.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Role / Permission *</label>
                  <Select
                    value={newRole}
                    onValueChange={(val) => setNewRole(val as AppUser["role"])}
                  >
                    <SelectTrigger className="h-10 w-full text-xs bg-background">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      <SelectItem value="foreman">Field Foreman (Daily Checks & Talks)</SelectItem>
                      <SelectItem value="superintendent">Superintendent (Jobsite Lead)</SelectItem>
                      <SelectItem value="safety_manager">Safety Director / Officer</SelectItem>
                      <SelectItem value="admin">Company Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Assigned Active Jobsite *</label>
                  <Select
                    value={newJobsiteId}
                    onValueChange={(val) => setNewJobsiteId(val)}
                  >
                    <SelectTrigger className="h-10 w-full text-xs bg-background">
                      <SelectValue placeholder="Select jobsite" />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      {MOCK_JOBSITES.map((j) => (
                        <SelectItem key={j.id} value={j.id}>
                          {j.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">App Language Preference</label>
                  <Select
                    value={newLanguage}
                    onValueChange={(val) => setNewLanguage(val as "en" | "es")}
                  >
                    <SelectTrigger className="h-10 w-full text-xs bg-background">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      <SelectItem value="en">🇺🇸 English</SelectItem>
                      <SelectItem value="es">🇲🇽 Spanish (Español)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-muted/60 border border-border text-[11px] text-muted-foreground flex items-center gap-2.5">
                <Smartphone className="size-4 text-primary shrink-0" />
                <span>
                  Upon onboarding, a welcome SMS with a one-time magic login link and temporary password will be dispatched to the mobile phone.
                </span>
              </div>
            </div>

            {/* Footer (Pinned) */}
            <SheetFooter className="px-6 py-4 border-t bg-card shrink-0 flex flex-row items-center justify-end gap-3 mt-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsInviteModalOpen(false)}
                className="h-10 px-5 text-xs font-medium cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-10 px-6 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-sm cursor-pointer"
              >
                Onboard & Send App Invite
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
