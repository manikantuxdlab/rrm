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
import { Checkbox } from "@/components/ui/checkbox"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Users,
  UserPlus,
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
  Loader2,
} from "lucide-react"
import { MOCK_COMPANIES, MOCK_JOBSITES } from "@/data/safetyMockData"
import type { AppUser, UserRole, LanguagePreference } from "@/types"
import { userService } from "@/services"

export function UserAccountsView() {
  const [users, setUsers] = React.useState<AppUser[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [selectedUserIds, setSelectedUserIds] = React.useState<string[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCompanyFilter, setSelectedCompanyFilter] = React.useState<string>("all")
  const [selectedRoleFilter, setSelectedRoleFilter] = React.useState<string>("all")
  const [selectedStatusFilter, setSelectedStatusFilter] = React.useState<"all" | "active" | "deactivated">("all")
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("table")
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(20)

  // State for View, Edit and Delete modals
  const [viewingUser, setViewingUser] = React.useState<AppUser | null>(null)
  const [editingUser, setEditingUser] = React.useState<AppUser | null>(null)
  const [userToDelete, setUserToDelete] = React.useState<AppUser | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  // Dynamic Companies & Jobsites lists
  const [companies, setCompanies] = React.useState<Array<{ id: string; name: string }>>(() =>
    MOCK_COMPANIES.map((c) => ({ id: c.id, name: c.name }))
  )
  const [jobsites, setJobsites] = React.useState<Array<{ id: string; name: string }>>(() =>
    MOCK_JOBSITES.map((j) => ({ id: j.id, name: j.name }))
  )

  // Edit user custom company / jobsite toggle state
  const [isEditCustomCompany, setIsEditCustomCompany] = React.useState(false)
  const [customEditCompanyName, setCustomEditCompanyName] = React.useState("")
  const [isEditCustomJobsite, setIsEditCustomJobsite] = React.useState(false)
  const [customEditJobsiteName, setCustomEditJobsiteName] = React.useState("")

  // Edit user form state
  const [editFullName, setEditFullName] = React.useState("")
  const [editEmail, setEditEmail] = React.useState("")
  const [editPhone, setEditPhone] = React.useState("")
  const [editCompanyId, setEditCompanyId] = React.useState("")
  const [editRole, setEditRole] = React.useState<AppUser["role"]>("foreman")
  const [editLanguage, setEditLanguage] = React.useState<"en" | "es">("en")
  const [editJobsiteId, setEditJobsiteId] = React.useState("")
  const [editStatus, setEditStatus] = React.useState<"active" | "deactivated">("active")

  // New user custom company / jobsite toggle state
  const [isCustomCompany, setIsCustomCompany] = React.useState(false)
  const [customCompanyName, setCustomCompanyName] = React.useState("")
  const [isCustomJobsite, setIsCustomJobsite] = React.useState(false)
  const [customJobsiteName, setCustomJobsiteName] = React.useState("")

  // New user form state
  const [newFullName, setNewFullName] = React.useState("")
  const [newEmail, setNewEmail] = React.useState("")
  const [newPhone, setNewPhone] = React.useState("")
  const [newCompanyId, setNewCompanyId] = React.useState(MOCK_COMPANIES[0]?.id || "")
  const [newRole, setNewRole] = React.useState<AppUser["role"]>("foreman")
  const [newLanguage, setNewLanguage] = React.useState<"en" | "es">("en")
  const [newJobsiteId, setNewJobsiteId] = React.useState(MOCK_JOBSITES[0]?.id || "")
  const [newStatus, setNewStatus] = React.useState<"active" | "deactivated">("active")
  const [successToast, setSuccessToast] = React.useState<string | null>(null)

  // Load users from Supabase or Fallback
  const loadUsers = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const { data } = await userService.getUsers()

      if (data && data.length > 0) {
        // Collect any custom companies or jobsites present on users
        setCompanies((prev) => {
          const names = new Set(prev.map((c) => c.name.toLowerCase()))
          const extras: Array<{ id: string; name: string }> = []
          data.forEach((u) => {
            if (u.companyName && !names.has(u.companyName.toLowerCase())) {
              names.add(u.companyName.toLowerCase())
              extras.push({ id: u.companyId || `comp-${u.id}`, name: u.companyName })
            }
          })
          return extras.length > 0 ? [...prev, ...extras] : prev
        })

        const mapped: AppUser[] = data.map((u) => {
          const matchedCompany = MOCK_COMPANIES.find(
            (c) => c.id === u.companyId || c.name.toLowerCase() === u.companyName.toLowerCase()
          )
          const jobs = (u.assignedJobsites || []).map((jid) => {
            return MOCK_JOBSITES.find((j) => j.id === jid)?.name || jid || "Assigned Project"
          })

          return {
            id: u.id,
            fullName: u.fullName,
            email: u.email,
            phone: u.phone,
            companyId: matchedCompany ? matchedCompany.id : (u.companyId || "comp-01"),
            companyName: u.companyName,
            role: (u.role as AppUser["role"]) || "foreman",
            assignedJobsiteIds: u.assignedJobsites || [],
            assignedJobsiteNames: jobs.length > 0 ? jobs : ["Assigned Project"],
            languagePreference: (u.languagePreference as LanguagePreference) || "en",
            status: u.status === "inactive" ? "deactivated" : (u.status as AppUser["status"]),
            lastActive: u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleTimeString() : "Active Now",
            submissionsCount: u.submissionsCount || 0,
            avatarUrl: u.avatarUrl,
          }
        })
        setUsers(mapped)
      } else {
        setUsers([])
      }
    } catch (err) {
      console.error("[UserAccountsView] Error fetching users:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial fetch and Realtime subscription
  React.useEffect(() => {
    loadUsers()
    const unsubscribe = userService.subscribeToProfiles(() => {
      loadUsers()
    })
    return () => {
      unsubscribe()
    }
  }, [loadUsers])

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
      const matchesStatus =
        selectedStatusFilter === "all" || u.status === selectedStatusFilter
      return matchesSearch && matchesCompany && matchesRole && matchesStatus
    })
  }, [users, searchQuery, selectedCompanyFilter, selectedRoleFilter, selectedStatusFilter])

  // Reset to page 1 on filter or search or page size change
  React.useEffect(() => {
    setCurrentPage(1)
    setSelectedUserIds([])
  }, [searchQuery, selectedCompanyFilter, selectedRoleFilter, selectedStatusFilter, pageSize])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)

  const paginatedUsers = React.useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize
    return filteredUsers.slice(startIndex, startIndex + pageSize)
  }, [filteredUsers, safeCurrentPage, pageSize])

  const isAllCurrentPageSelected =
    paginatedUsers.length > 0 &&
    paginatedUsers.every((u) => selectedUserIds.includes(u.id))

  const handleToggleSelectAll = () => {
    if (isAllCurrentPageSelected) {
      const pageIds = new Set(paginatedUsers.map((u) => u.id))
      setSelectedUserIds((prev) => prev.filter((id) => !pageIds.has(id)))
    } else {
      const pageIds = paginatedUsers.map((u) => u.id)
      setSelectedUserIds((prev) => Array.from(new Set([...prev, ...pageIds])))
    }
  }

  const handleToggleSelectUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    )
  }

  const totalActive = users.filter((u) => u.status === "active").length
  const totalDeactivated = users.filter((u) => u.status === "deactivated").length
  const totalForemen = users.filter((u) => u.role === "foreman").length

  // Open Edit modal with user data
  const handleOpenEdit = (u: AppUser) => {
    setEditingUser(u)
    setEditFullName(u.fullName)
    setEditEmail(u.email)
    setEditPhone(u.phone)
    setEditCompanyId(u.companyId)
    setEditRole(u.role)
    setEditLanguage(u.languagePreference)
    setEditJobsiteId(u.assignedJobsiteIds[0] || jobsites[0]?.id || "")
    setEditStatus(u.status === "deactivated" ? "deactivated" : "active")
    setIsEditCustomCompany(false)
    setCustomEditCompanyName("")
    setIsEditCustomJobsite(false)
    setCustomEditJobsiteName("")
  }

  // Save edited user
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    setIsSubmitting(true)
    const finalCompanyName = isEditCustomCompany && customEditCompanyName.trim()
      ? customEditCompanyName.trim()
      : (companies.find((c) => c.id === editCompanyId)?.name || editingUser.companyName)
    const finalCompanyId = isEditCustomCompany && customEditCompanyName.trim()
      ? `comp-${Date.now().toString().slice(-6)}`
      : editCompanyId

    const finalJobsiteName = isEditCustomJobsite && customEditJobsiteName.trim()
      ? customEditJobsiteName.trim()
      : (jobsites.find((j) => j.id === editJobsiteId)?.name || "Assigned Site")
    const finalJobsiteId = isEditCustomJobsite && customEditJobsiteName.trim()
      ? `job-${Date.now().toString().slice(-6)}`
      : editJobsiteId

    if (isEditCustomCompany && customEditCompanyName.trim()) {
      setCompanies((prev) => {
        if (prev.some((c) => c.name.toLowerCase() === customEditCompanyName.trim().toLowerCase())) return prev
        return [...prev, { id: finalCompanyId, name: customEditCompanyName.trim() }]
      })
    }
    if (isEditCustomJobsite && customEditJobsiteName.trim()) {
      setJobsites((prev) => {
        if (prev.some((j) => j.name.toLowerCase() === customEditJobsiteName.trim().toLowerCase())) return prev
        return [...prev, { id: finalJobsiteId, name: customEditJobsiteName.trim() }]
      })
    }

    try {
      const { error } = await userService.updateUser(editingUser.id, {
        fullName: editFullName,
        phone: editPhone,
        companyId: finalCompanyId,
        companyName: finalCompanyName,
        role: editRole as UserRole,
        status: editStatus === "deactivated" ? "inactive" : "active",
        languagePreference: editLanguage,
        assignedJobsites: [finalJobsiteId],
      })

      if (error) {
        console.warn("[UserAccountsView] Update warning:", error.message)
      }

      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === editingUser.id) {
            return {
              ...u,
              fullName: editFullName,
              email: editEmail,
              phone: editPhone,
              companyId: finalCompanyId,
              companyName: finalCompanyName,
              role: editRole,
              status: editStatus,
              lastActive:
                editStatus === "deactivated"
                  ? "Access Revoked"
                  : u.lastActive === "Access Revoked"
                  ? "Active Now"
                  : u.lastActive,
              languagePreference: editLanguage,
              assignedJobsiteIds: [finalJobsiteId],
              assignedJobsiteNames: [finalJobsiteName],
            }
          }
          return u
        })
      )

      setEditingUser(null)
      setIsEditCustomCompany(false)
      setCustomEditCompanyName("")
      setIsEditCustomJobsite(false)
      setSuccessToast(`✅ User "${editFullName}" updated & synced with Supabase!`)
      setTimeout(() => setSuccessToast(null), 4000)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Trigger delete confirmation modal
  const handleDeleteUser = (u: AppUser) => {
    setUserToDelete(u)
  }

  // Execute deletion after modal confirmation
  const handleConfirmDelete = async () => {
    if (!userToDelete) return
    try {
      setIsDeleting(true)
      const { error } = await userService.deleteUser(userToDelete.id)
      if (error) {
        console.warn("[UserAccountsView] Delete warning:", error.message)
      }
      setUsers((prev) => prev.filter((item) => item.id !== userToDelete.id))
      setSelectedUserIds((prev) => prev.filter((id) => id !== userToDelete.id))
      setSuccessToast(`🗑️ User "${userToDelete.fullName}" was removed from the database.`)
      setTimeout(() => setSuccessToast(null), 4000)
      setUserToDelete(null)
    } catch (err) {
      console.error("[UserAccountsView] Delete exception:", err)
    } finally {
      setIsDeleting(false)
    }
  }


  // Send Password Reset
  const handleSendReset = async (u: AppUser) => {
    const { error } = await userService.sendPasswordReset(u.email)
    if (error) {
      setSuccessToast(`⚠️ Reset notice for ${u.email}: ${error.message}`)
    } else {
      setSuccessToast(
        `🔑 Supabase password reset link dispatched to ${u.email} (SMS to ${u.phone})`
      )
    }
    setTimeout(() => setSuccessToast(null), 4000)
  }

  // Onboard new user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const finalCompanyName = isCustomCompany && customCompanyName.trim()
      ? customCompanyName.trim()
      : (companies.find((c) => c.id === newCompanyId)?.name || "Subcontractor Partner")
    const finalCompanyId = isCustomCompany && customCompanyName.trim()
      ? `comp-${Date.now().toString().slice(-6)}`
      : newCompanyId

    const finalJobsiteName = isCustomJobsite && customJobsiteName.trim()
      ? customJobsiteName.trim()
      : (jobsites.find((j) => j.id === newJobsiteId)?.name || "Active Projects")
    const finalJobsiteId = isCustomJobsite && customJobsiteName.trim()
      ? `job-${Date.now().toString().slice(-6)}`
      : newJobsiteId

    // Register new company & jobsite into local state lists
    if (isCustomCompany && customCompanyName.trim()) {
      setCompanies((prev) => {
        if (prev.some((c) => c.name.toLowerCase() === customCompanyName.trim().toLowerCase())) return prev
        return [...prev, { id: finalCompanyId, name: customCompanyName.trim() }]
      })
    }
    if (isCustomJobsite && customJobsiteName.trim()) {
      setJobsites((prev) => {
        if (prev.some((j) => j.name.toLowerCase() === customJobsiteName.trim().toLowerCase())) return prev
        return [...prev, { id: finalJobsiteId, name: customJobsiteName.trim() }]
      })
    }

    try {
      const { data, error } = await userService.createUser({
        email: newEmail,
        fullName: newFullName,
        phone: newPhone,
        companyId: finalCompanyId,
        companyName: finalCompanyName,
        role: newRole as UserRole,
        status: newStatus === "deactivated" ? "inactive" : "active",
        languagePreference: newLanguage,
        assignedJobsites: [finalJobsiteId],
      })

      const created: AppUser = {
        id: data?.id || `user-${Date.now().toString().slice(-4)}`,
        fullName: newFullName,
        email: newEmail,
        phone: newPhone,
        companyId: finalCompanyId,
        companyName: finalCompanyName,
        role: newRole,
        assignedJobsiteIds: [finalJobsiteId],
        assignedJobsiteNames: [finalJobsiteName],
        languagePreference: newLanguage,
        status: newStatus,
        lastActive: newStatus === "deactivated" ? "Access Revoked" : "Just invited",
        submissionsCount: 0,
      }

      setUsers([created, ...users])
      setIsInviteModalOpen(false)
      const toastMsg = error
        ? `⚠️ User created locally. Supabase note: ${error.message}`
        : `✅ New user "${newFullName}" successfully onboarded & saved to Supabase!`
      setSuccessToast(toastMsg)
      setTimeout(() => setSuccessToast(null), 4000)

      // Reset form
      setNewFullName("")
      setNewEmail("")
      setNewPhone("")
      setNewStatus("active")
      setIsCustomCompany(false)
      setCustomCompanyName("")
      setIsCustomJobsite(false)
      setCustomJobsiteName("")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-3">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Users className="size-5 text-primary" />
            User Management
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsInviteModalOpen(true)}
            size="sm"
            className="h-8 px-3 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs transition-all cursor-pointer rounded-md"
          >
            <UserPlus className="size-3.5 shrink-0" />
            <span>Add User</span>
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
          <div className="text-[10px] text-muted-foreground mt-0.5">
            Across {new Set(users.map((u) => u.companyName)).size || 1} Customer Companies
          </div>
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
          <div className="text-[11px] font-medium text-muted-foreground">Active Accounts</div>
          <div className="text-lg font-bold text-foreground mt-0.5">{totalActive} Active</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Full mobile & app access</div>
        </Card>

        <Card className="border-border py-2.5 px-3.5 flex flex-col justify-between">
          <div className="text-[11px] font-medium text-muted-foreground">Deactivated / Revoked</div>
          <div className="text-lg font-bold text-foreground mt-0.5">
            {totalDeactivated} Inactive
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Access disabled or revoked</div>
        </Card>
      </div>

      {/* Search & Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        {/* Left Side: Search Bar */}
        <div className="relative w-full sm:w-64 md:w-72 shrink-0">
          <Search className="size-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, email, phone..."
            className="pl-8 pr-7 text-xs h-8.5 bg-background rounded-lg border-border"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-2 text-muted-foreground hover:text-foreground cursor-pointer rounded-full p-0.5 hover:bg-muted"
              title="Clear search"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        {/* Right Side: Status, Company, Role Dropdowns & Compact View Toggle */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-start sm:justify-end">
          {/* Status Dropdown */}
          <Select
            value={selectedStatusFilter}
            onValueChange={(val) => setSelectedStatusFilter(val as any)}
          >
            <SelectTrigger className="h-8.5 min-w-[125px] text-xs bg-background rounded-lg border-border">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="all">All Status ({users.length})</SelectItem>
              <SelectItem value="active">
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-[#00c800]"></span>
                  Active ({totalActive})
                </span>
              </SelectItem>
              <SelectItem value="deactivated">
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-destructive"></span>
                  Deactivated ({totalDeactivated})
                </span>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Companies Dropdown */}
          <Select
            value={selectedCompanyFilter}
            onValueChange={(val) => setSelectedCompanyFilter(val)}
          >
            <SelectTrigger className="h-8.5 min-w-[145px] text-xs bg-background rounded-lg border-border">
              <SelectValue placeholder="All Companies" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="all">All Companies</SelectItem>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name.length > 22 ? c.name.substring(0, 22) + "..." : c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Roles Dropdown */}
          <Select
            value={selectedRoleFilter}
            onValueChange={(val) => setSelectedRoleFilter(val)}
          >
            <SelectTrigger className="h-8.5 min-w-[115px] text-xs bg-background rounded-lg border-border">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="foreman">Field Foreman</SelectItem>
              <SelectItem value="boss">Company Boss</SelectItem>
            </SelectContent>
          </Select>

          {/* Compact View Toggle */}
          <div className="flex items-center border border-border/80 rounded-lg p-0.5 bg-muted/30 shrink-0 h-8.5">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-background text-foreground shadow-xs"
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
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Selected Users Indicator / Bulk Action Bar */}
      {selectedUserIds.length > 0 && (
        <div className="flex items-center justify-between px-3.5 py-2 rounded-lg bg-primary/10 border border-primary/20 text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-primary">
              {selectedUserIds.length} user{selectedUserIds.length > 1 ? "s" : ""} selected
            </span>
            <span className="text-muted-foreground text-[11px]">
              (on current page: {paginatedUsers.filter((u) => selectedUserIds.includes(u.id)).length} of {paginatedUsers.length})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedUserIds([])}
              className="h-7 text-xs px-2.5 bg-background hover:bg-muted cursor-pointer border-border"
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Conditional Rendering: Grid View vs Open-Sided Table */}
      {viewMode === "grid" ? (
        isLoading ? (
          <div className="p-12 text-center text-muted-foreground text-xs border rounded-xl bg-card flex flex-col items-center justify-center gap-2">
            <Loader2 className="size-6 animate-spin text-primary" />
            <span className="font-medium text-foreground">Loading user profiles...</span>
            <span className="text-[11px] text-muted-foreground">Synchronizing with Supabase database</span>
          </div>
        ) : filteredUsers.length === 0 ? (
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
                            <span>View Profile Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenEdit(u)} className="cursor-pointer gap-2">
                            <Edit className="size-3.5 text-blue-500" />
                            <span>Edit User</span>
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
        /* Excel Sheet-Style Clean & Compact Grid Table */
        <div className="rounded-lg border border-border/80 bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <Table className="w-full border-collapse text-xs">
              <TableHeader className="bg-muted/60 border-b border-border/80 sticky top-0 z-10">
                <TableRow className="h-8.5 hover:bg-transparent">
                  <TableHead className="w-10 px-2.5 py-2 text-center border-r border-border/60">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={isAllCurrentPageSelected}
                        onCheckedChange={handleToggleSelectAll}
                        aria-label="Select all rows on current page"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="w-11 px-2.5 py-2 font-semibold text-muted-foreground text-[11px] text-center uppercase tracking-wider border-r border-border/60">
                    #
                  </TableHead>
                  <TableHead className="min-w-[170px] px-3 py-2 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider border-r border-border/60">
                    Full Name
                  </TableHead>
                  <TableHead className="min-w-[190px] px-3 py-2 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider border-r border-border/60">
                    Email Address
                  </TableHead>
                  <TableHead className="min-w-[130px] px-3 py-2 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider border-r border-border/60">
                    Phone Number
                  </TableHead>
                  <TableHead className="min-w-[170px] px-3 py-2 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider border-r border-border/60">
                    Company
                  </TableHead>
                  <TableHead className="min-w-[110px] px-3 py-2 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider border-r border-border/60 text-center">
                    Role
                  </TableHead>
                  <TableHead className="min-w-[160px] px-3 py-2 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider border-r border-border/60">
                    Assigned Jobsite
                  </TableHead>
                  <TableHead className="w-16 px-3 py-2 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider border-r border-border/60 text-center">
                    Lang
                  </TableHead>
                  <TableHead className="min-w-[95px] px-3 py-2 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider border-r border-border/60 text-center">
                    Status
                  </TableHead>
                  <TableHead className="w-12 px-2 py-2 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-border/60">
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="px-4 py-12 text-center text-muted-foreground text-xs">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="size-5 animate-spin text-primary" />
                        <span className="font-medium text-foreground">Loading user profiles from Supabase...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="px-4 py-8 text-center text-muted-foreground text-xs">
                      No users found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((u, idx) => {
                    const rowNumber = (safeCurrentPage - 1) * pageSize + idx + 1
                    const isDeactivated = u.status === "deactivated"
                    const isSelected = selectedUserIds.includes(u.id)

                    return (
                      <TableRow
                        key={u.id}
                        onClick={() => setViewingUser(u)}
                        className={`h-9 hover:bg-primary/[0.04] dark:hover:bg-primary/[0.08] transition-colors cursor-pointer group even:bg-muted/[0.12] ${
                          isSelected ? "bg-primary/[0.08] dark:bg-primary/[0.12]" : ""
                        } ${isDeactivated ? "opacity-60 bg-muted/20" : ""}`}
                      >
                        {/* 1. Selection Checkbox */}
                        <TableCell
                          className="w-10 px-2.5 py-1.5 text-center border-r border-border/50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-center">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleToggleSelectUser(u.id)}
                              aria-label={`Select ${u.fullName}`}
                            />
                          </div>
                        </TableCell>

                        {/* 2. Row Index */}
                        <TableCell className="w-11 px-2.5 py-1.5 text-center font-mono text-[11px] text-muted-foreground/80 border-r border-border/50">
                          {rowNumber}
                        </TableCell>

                        {/* 3. Full Name */}
                        <TableCell className="min-w-[170px] px-3 py-1.5 border-r border-border/50">
                          <div className="flex items-center gap-1.5 font-medium text-foreground text-xs">
                            <span className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                              {u.fullName}
                            </span>
                            {u.role === "foreman" && (
                              <HardHat className="size-3 text-amber-500 shrink-0" />
                            )}
                          </div>
                        </TableCell>

                        {/* 4. Email */}
                        <TableCell className="min-w-[190px] px-3 py-1.5 border-r border-border/50">
                          <span
                            className="text-muted-foreground font-mono text-[11px] select-all truncate block max-w-[210px]"
                            title={u.email}
                          >
                            {u.email}
                          </span>
                        </TableCell>

                        {/* 5. Phone */}
                        <TableCell className="min-w-[130px] px-3 py-1.5 border-r border-border/50 whitespace-nowrap">
                          <span className="font-mono text-[11px] text-foreground select-all">
                            {u.phone}
                          </span>
                        </TableCell>

                        {/* 6. Company */}
                        <TableCell className="min-w-[170px] px-3 py-1.5 border-r border-border/50">
                          <div
                            className="flex items-center gap-1.5 text-foreground truncate max-w-[180px]"
                            title={u.companyName}
                          >
                            <Building2 className="size-3 text-primary shrink-0 opacity-70" />
                            <span className="truncate font-medium">{u.companyName}</span>
                          </div>
                        </TableCell>

                        {/* 7. Role */}
                        <TableCell className="min-w-[110px] px-3 py-1.5 border-r border-border/50 text-center whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className="text-[10px] h-5 px-1.5 capitalize font-medium border-border/80"
                          >
                            {u.role.replace("_", " ")}
                          </Badge>
                        </TableCell>

                        {/* 8. Assigned Jobsite */}
                        <TableCell className="min-w-[160px] px-3 py-1.5 border-r border-border/50">
                          <span
                            className="text-[11px] text-foreground font-medium truncate block max-w-[160px]"
                            title={u.assignedJobsiteNames.join(", ")}
                          >
                            {u.assignedJobsiteNames.join(", ")}
                          </span>
                        </TableCell>

                        {/* 9. Language */}
                        <TableCell className="w-16 px-3 py-1.5 border-r border-border/50 text-center whitespace-nowrap">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
                            {u.languagePreference === "es" ? "ES" : "EN"}
                          </span>
                        </TableCell>

                        {/* 10. Status */}
                        <TableCell className="min-w-[95px] px-3 py-1.5 border-r border-border/50 text-center whitespace-nowrap">
                          {u.status === "active" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <span className="size-1.5 rounded-full bg-emerald-500"></span>
                              Active
                            </span>
                          )}
                          {u.status === "deactivated" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground border border-border">
                              <span className="size-1.5 rounded-full bg-muted-foreground/60"></span>
                              Inactive
                            </span>
                          )}
                          {u.status === "invited" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                              <span className="size-1.5 rounded-full bg-amber-500"></span>
                              Invited
                            </span>
                          )}
                        </TableCell>

                        {/* 11. Actions (Only 3 dots) */}
                        <TableCell
                          className="w-12 px-2 py-1.5 text-center whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="size-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer rounded-md"
                                  aria-label="User actions"
                                >
                                  <MoreVertical className="size-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 text-xs">
                                <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase font-semibold">
                                  User Options
                                </DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => setViewingUser(u)}
                                  className="cursor-pointer gap-2"
                                >
                                  <Eye className="size-3.5 text-primary" />
                                  <span>View Profile Details</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleOpenEdit(u)}
                                  className="cursor-pointer gap-2"
                                >
                                  <Edit className="size-3.5 text-blue-500" />
                                  <span>Edit User</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteUser(u)}
                                  className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                                >
                                  <Trash2 className="size-3.5 text-destructive" />
                                  <span className="font-semibold text-destructive">Delete User</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
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
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
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
        <SheetContent side="right" className="w-full sm:max-w-2xl md:max-w-3xl lg:max-w-[760px] xl:max-w-[800px] flex flex-col p-0 overflow-hidden h-full shadow-2xl">
          {viewingUser && (
            <div className="flex flex-col h-full justify-between overflow-hidden">
              <SheetHeader className="px-8 py-5.5 border-b border-border/80 bg-muted/15 shrink-0 text-left">
                <div className="flex items-center gap-3.5">
                  <div className="size-12 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0 border border-primary/20">
                    {viewingUser.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <SheetTitle className="text-lg font-bold text-foreground flex items-center gap-2.5">
                      {viewingUser.fullName}
                      {viewingUser.status === "active" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#00c800]/12 text-[#008a00] dark:text-[#00e600] border border-[#00c800]/30">
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
              <div className="flex-1 overflow-y-auto px-8 py-7 space-y-6 text-xs">
                {/* Contact details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-0.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Contact & Authentication Details
                    </span>
                    <div className="h-px bg-border/60 flex-1"></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl border border-border/70 bg-muted/25">
                      <div className="text-[11px] text-muted-foreground font-medium">Work Email Address</div>
                      <div className="font-semibold text-foreground text-xs mt-1 flex items-center gap-2">
                        <Mail className="size-3.5 text-primary" />
                        {viewingUser.email}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl border border-border/70 bg-muted/25">
                      <div className="text-[11px] text-muted-foreground font-medium">Mobile Phone (SMS Invite)</div>
                      <div className="font-semibold text-foreground text-xs mt-1 flex items-center gap-2">
                        <Phone className="size-3.5 text-primary" />
                        {viewingUser.phone || "Not provided"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Jobsite & Language */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-0.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Jobsite & Configuration
                    </span>
                    <div className="h-px bg-border/60 flex-1"></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl border border-border/70 bg-muted/25 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] text-muted-foreground font-medium">Assigned Active Jobsites</div>
                        <div className="font-semibold text-foreground text-xs mt-1 flex items-center gap-2">
                          <Building2 className="size-3.5 text-primary" />
                          {viewingUser.assignedJobsiteNames.join(", ")}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5">Primary Site</Badge>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border/70 bg-muted/25 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] text-muted-foreground font-medium">Preferred Mobile Language</div>
                        <div className="font-semibold text-foreground text-xs mt-1">
                          {viewingUser.languagePreference === "es" ? "🇲🇽 Spanish (Español)" : "🇺🇸 English"}
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-bold">
                        {viewingUser.languagePreference.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Submissions stats */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-0.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Field Activity & Submissions
                    </span>
                    <div className="h-px bg-border/60 flex-1"></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl border border-border/70 bg-muted/25">
                      <div className="text-[11px] text-muted-foreground font-medium">Total Form Submissions</div>
                      <div className="text-base font-bold text-foreground mt-1 flex items-center gap-2">
                        <FileCheck2 className="size-4 text-emerald-600" />
                        {viewingUser.submissionsCount} records
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl border border-border/70 bg-muted/25">
                      <div className="text-[11px] text-muted-foreground font-medium">Last App Login</div>
                      <div className="text-xs font-semibold text-foreground mt-1.5 flex items-center gap-2">
                        <Calendar className="size-3.5 text-muted-foreground" />
                        {viewingUser.lastActive}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security info */}
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground flex items-start gap-3">
                  <ShieldCheck className="size-4.5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground">Section 7 Multi-Tenancy Compliance:</span>
                    <p className="mt-1 leading-relaxed">
                      This user is strictly scoped to {viewingUser.companyName}'s jobsites, checklists and insurance records.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <SheetFooter className="px-8 py-4.5 border-t border-border/80 bg-muted/20 shrink-0 flex flex-row items-center justify-between gap-3 mt-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const u = viewingUser
                    setViewingUser(null)
                    handleOpenEdit(u)
                  }}
                  className="text-xs gap-1.5 cursor-pointer rounded-lg border-border"
                >
                  <Edit className="size-3.5 text-blue-500" />
                  Edit Profile
                </Button>
                <div className="flex items-center gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendReset(viewingUser)}
                    className="text-xs gap-1.5 cursor-pointer rounded-lg border-border"
                  >
                    <KeyRound className="size-3.5 text-amber-500" />
                    Reset Password
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setViewingUser(null)}
                    className="text-xs cursor-pointer rounded-lg px-4"
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
        <SheetContent side="right" className="w-full sm:max-w-2xl md:max-w-3xl lg:max-w-[760px] xl:max-w-[800px] flex flex-col p-0 overflow-hidden h-full shadow-2xl">
          <form onSubmit={handleSaveEdit} className="flex flex-col h-full justify-between overflow-hidden">
            <SheetHeader className="px-8 py-5.5 border-b border-border/80 bg-muted/15 shrink-0 text-left">
              <div className="flex items-center gap-3.5">
                <div className="size-11 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Edit className="size-5" />
                </div>
                <div>
                  <SheetTitle className="text-lg font-bold text-foreground">
                    Edit User Profile
                  </SheetTitle>
                  <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                    Update profile credentials, customer organization, and site permissions
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto px-8 py-7 space-y-6 text-xs">
              {/* Section 1: Contact Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-0.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Personal & Contact Details
                  </span>
                  <div className="h-px bg-border/60 flex-1"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground text-xs">
                      Full Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      required
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      className="h-10 text-xs rounded-lg bg-background"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground text-xs">
                      Mobile Phone <span className="text-destructive">*</span>
                    </label>
                    <Input
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="h-10 text-xs rounded-lg bg-background"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground text-xs">
                    Work Email Address <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="h-10 text-xs rounded-lg bg-background"
                  />
                </div>
              </div>

              {/* Section 2: Company & Jobsite Permissions */}
              <div className="space-y-4 pt-1">
                <div className="flex items-center gap-2 pb-0.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Organization & Permissions
                  </span>
                  <div className="h-px bg-border/60 flex-1"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-foreground text-xs">
                        Customer Company <span className="text-destructive">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditCustomCompany(!isEditCustomCompany)
                          if (!isEditCustomCompany) setCustomEditCompanyName("")
                        }}
                        className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {isEditCustomCompany ? "Select Existing" : "+ Add New Company"}
                      </button>
                    </div>
                    {isEditCustomCompany ? (
                      <Input
                        required
                        placeholder="Enter company name..."
                        value={customEditCompanyName}
                        onChange={(e) => setCustomEditCompanyName(e.target.value)}
                        className="h-10 text-xs rounded-lg bg-background"
                      />
                    ) : (
                      <Select
                        value={editCompanyId}
                        onValueChange={(val) => {
                          if (val === "__add_new__") {
                            setIsEditCustomCompany(true)
                            setCustomEditCompanyName("")
                          } else {
                            setEditCompanyId(val)
                          }
                        }}
                      >
                        <SelectTrigger className="h-10 w-full text-xs bg-background rounded-lg border-border">
                          <SelectValue placeholder="Select company" />
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                          {companies.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="__add_new__" className="text-primary font-medium border-t border-border/50 mt-1 pt-1.5">
                            + Add New Company...
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground text-xs">
                      Role / Permission <span className="text-destructive">*</span>
                    </label>
                    <Select
                      value={editRole}
                      onValueChange={(val) => setEditRole(val as AppUser["role"])}
                    >
                      <SelectTrigger className="h-10 w-full text-xs bg-background rounded-lg border-border">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent className="text-xs">
                        <SelectItem value="foreman">Field Foreman (Daily Checks & Talks)</SelectItem>
                        <SelectItem value="boss">Company Boss / Lead</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-foreground text-xs">
                        Assigned Active Jobsite <span className="text-destructive">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditCustomJobsite(!isEditCustomJobsite)
                          if (!isEditCustomJobsite) setCustomEditJobsiteName("")
                        }}
                        className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {isEditCustomJobsite ? "Select Existing" : "+ Add New Jobsite"}
                      </button>
                    </div>
                    {isEditCustomJobsite ? (
                      <Input
                        required
                        placeholder="Enter jobsite name..."
                        value={customEditJobsiteName}
                        onChange={(e) => setCustomEditJobsiteName(e.target.value)}
                        className="h-10 text-xs rounded-lg bg-background"
                      />
                    ) : (
                      <Select
                        value={editJobsiteId}
                        onValueChange={(val) => {
                          if (val === "__add_new__") {
                            setIsEditCustomJobsite(true)
                            setCustomEditJobsiteName("")
                          } else {
                            setEditJobsiteId(val)
                          }
                        }}
                      >
                        <SelectTrigger className="h-10 w-full text-xs bg-background rounded-lg border-border">
                          <SelectValue placeholder="Select jobsite" />
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                          {jobsites.map((j) => (
                            <SelectItem key={j.id} value={j.id}>
                              {j.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="__add_new__" className="text-primary font-medium border-t border-border/50 mt-1 pt-1.5">
                            + Add New Jobsite...
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground text-xs">
                      App Language Preference
                    </label>
                    <Select
                      value={editLanguage}
                      onValueChange={(val) => setEditLanguage(val as "en" | "es")}
                    >
                      <SelectTrigger className="h-10 w-full text-xs bg-background rounded-lg border-border">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent className="text-xs">
                        <SelectItem value="en">🇺🇸 English</SelectItem>
                        <SelectItem value="es">🇲🇽 Spanish (Español)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground text-xs">
                      Account Status <span className="text-destructive">*</span>
                    </label>
                    <Select
                      value={editStatus}
                      onValueChange={(val) => setEditStatus(val as "active" | "deactivated")}
                    >
                      <SelectTrigger className="h-10 w-full text-xs bg-background rounded-lg border-border">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="text-xs">
                        <SelectItem value="active">
                          <span className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-[#00c800]"></span>
                            <span>Active (Full Mobile & Dashboard Access)</span>
                          </span>
                        </SelectItem>
                        <SelectItem value="deactivated">
                          <span className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-destructive"></span>
                            <span>Deactivated (Access Revoked)</span>
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <SheetFooter className="px-8 py-4.5 border-t border-border/80 bg-muted/20 shrink-0 flex flex-row items-center justify-end gap-3 mt-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingUser(null)}
                className="h-9.5 px-5 text-xs font-medium cursor-pointer rounded-lg border-border"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-9.5 px-6 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm cursor-pointer gap-2 rounded-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* 3. Onboard / Add User Sheet (Shadcn Sheet) */}
      <Sheet open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl md:max-w-3xl lg:max-w-[760px] xl:max-w-[800px] flex flex-col p-0 overflow-hidden h-full shadow-2xl">
          <form onSubmit={handleCreateUser} className="flex flex-col h-full justify-between overflow-hidden">
            {/* Header */}
            <SheetHeader className="px-8 py-5.5 border-b border-border/80 bg-muted/15 shrink-0 text-left">
              <div className="flex items-center gap-3.5">
                <div className="size-11 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                  <UserPlus className="size-5" />
                </div>
                <div>
                  <SheetTitle className="text-lg font-bold text-foreground">
                    Add New User
                  </SheetTitle>
                  <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                    Configure profile information, organization roles, and jobsite access permissions
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto px-8 py-7 space-y-6 text-xs">
              {/* Section 1: Contact Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-0.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Contact & Login Details
                  </span>
                  <div className="h-px bg-border/60 flex-1"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground text-xs">
                      Full Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      required
                      placeholder="e.g. Sergio Ramos"
                      value={newFullName}
                      onChange={(e) => setNewFullName(e.target.value)}
                      className="h-10 text-xs rounded-lg bg-background"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground text-xs">
                      Mobile Phone (SMS Invite) <span className="text-destructive">*</span>
                    </label>
                    <Input
                      required
                      placeholder="e.g. (213) 555-0988"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="h-10 text-xs rounded-lg bg-background"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground text-xs">
                    Work Email Address <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="email"
                    required
                    placeholder="e.g. sramos@titanconcrete-ca.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="h-10 text-xs rounded-lg bg-background"
                  />
                </div>
              </div>

              {/* Section 2: Company & Jobsite Permissions */}
              <div className="space-y-4 pt-1">
                <div className="flex items-center gap-2 pb-0.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Company & Jobsite Access
                  </span>
                  <div className="h-px bg-border/60 flex-1"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-foreground text-xs">
                        Customer Company <span className="text-destructive">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomCompany(!isCustomCompany)
                          if (!isCustomCompany) setCustomCompanyName("")
                        }}
                        className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {isCustomCompany ? "Select Existing" : "+ Add New Company"}
                      </button>
                    </div>
                    {isCustomCompany ? (
                      <Input
                        required
                        placeholder="Enter company name..."
                        value={customCompanyName}
                        onChange={(e) => setCustomCompanyName(e.target.value)}
                        className="h-10 text-xs rounded-lg bg-background"
                      />
                    ) : (
                      <Select
                        value={newCompanyId}
                        onValueChange={(val) => {
                          if (val === "__add_new__") {
                            setIsCustomCompany(true)
                            setCustomCompanyName("")
                          } else {
                            setNewCompanyId(val)
                          }
                        }}
                      >
                        <SelectTrigger className="h-10 w-full text-xs bg-background rounded-lg border-border">
                          <SelectValue placeholder="Select company" />
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                          {companies.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="__add_new__" className="text-primary font-medium border-t border-border/50 mt-1 pt-1.5">
                            + Add New Company...
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground text-xs">
                      Role / Permission <span className="text-destructive">*</span>
                    </label>
                    <Select
                      value={newRole}
                      onValueChange={(val) => setNewRole(val as AppUser["role"])}
                    >
                      <SelectTrigger className="h-10 w-full text-xs bg-background rounded-lg border-border">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent className="text-xs">
                        <SelectItem value="foreman">Field Foreman (Daily Checks & Talks)</SelectItem>
                        <SelectItem value="boss">Company Boss / Lead</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-foreground text-xs">
                        Assigned Active Jobsite <span className="text-destructive">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomJobsite(!isCustomJobsite)
                          if (!isCustomJobsite) setCustomJobsiteName("")
                        }}
                        className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {isCustomJobsite ? "Select Existing" : "+ Add New Jobsite"}
                      </button>
                    </div>
                    {isCustomJobsite ? (
                      <Input
                        required
                        placeholder="Enter jobsite name..."
                        value={customJobsiteName}
                        onChange={(e) => setCustomJobsiteName(e.target.value)}
                        className="h-10 text-xs rounded-lg bg-background"
                      />
                    ) : (
                      <Select
                        value={newJobsiteId}
                        onValueChange={(val) => {
                          if (val === "__add_new__") {
                            setIsCustomJobsite(true)
                            setCustomJobsiteName("")
                          } else {
                            setNewJobsiteId(val)
                          }
                        }}
                      >
                        <SelectTrigger className="h-10 w-full text-xs bg-background rounded-lg border-border">
                          <SelectValue placeholder="Select jobsite" />
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                          {jobsites.map((j) => (
                            <SelectItem key={j.id} value={j.id}>
                              {j.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="__add_new__" className="text-primary font-medium border-t border-border/50 mt-1 pt-1.5">
                            + Add New Jobsite...
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground text-xs">
                      App Language Preference
                    </label>
                    <Select
                      value={newLanguage}
                      onValueChange={(val) => setNewLanguage(val as "en" | "es")}
                    >
                      <SelectTrigger className="h-10 w-full text-xs bg-background rounded-lg border-border">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent className="text-xs">
                        <SelectItem value="en">🇺🇸 English</SelectItem>
                        <SelectItem value="es">🇲🇽 Spanish (Español)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground text-xs">
                      Account Status <span className="text-destructive">*</span>
                    </label>
                    <Select
                      value={newStatus}
                      onValueChange={(val) => setNewStatus(val as "active" | "deactivated")}
                    >
                      <SelectTrigger className="h-10 w-full text-xs bg-background rounded-lg border-border">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="text-xs">
                        <SelectItem value="active">
                          <span className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-[#00c800]"></span>
                            <span>Active (Full Mobile & Dashboard Access)</span>
                          </span>
                        </SelectItem>
                        <SelectItem value="deactivated">
                          <span className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-destructive"></span>
                            <span>Deactivated (Access Revoked)</span>
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer (Pinned) */}
            <SheetFooter className="px-8 py-4.5 border-t border-border/80 bg-muted/20 shrink-0 flex flex-row items-center justify-end gap-3 mt-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsInviteModalOpen(false)}
                className="h-9.5 px-5 text-xs font-medium cursor-pointer rounded-lg border-border"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-9.5 px-6 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm cursor-pointer gap-2 rounded-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Adding User...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="size-3.5 shrink-0" />
                    <span>Add User</span>
                  </>
                )}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* 4. Delete User Confirmation Dialog / Popup */}
      <Dialog open={!!userToDelete} onOpenChange={(open) => !open && !isDeleting && setUserToDelete(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-border bg-card">
          {userToDelete && (
            <div>
              {/* Header with warning accent */}
              <div className="p-5 border-b border-border/60 bg-destructive/5 flex items-start gap-3.5">
                <div className="size-10 rounded-full bg-destructive/15 text-destructive flex items-center justify-center shrink-0">
                  <Trash2 className="size-5" />
                </div>
                <div className="space-y-1">
                  <DialogTitle className="text-base font-bold text-foreground">
                    Confirm User Deletion
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Are you sure you want to permanently delete this account?
                  </DialogDescription>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3.5 text-xs">
                {/* User Info Card */}
                <div className="p-3 rounded-lg border border-border/60 bg-muted/30 flex items-center gap-3">
                  <div className="size-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0">
                    {userToDelete.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-foreground text-xs truncate">
                      {userToDelete.fullName}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono truncate">
                      {userToDelete.email}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[9px] h-4 px-1 capitalize border-border">
                        {userToDelete.role.replace("_", " ")}
                      </Badge>
                      <span>•</span>
                      <span className="truncate">{userToDelete.companyName}</span>
                    </div>
                  </div>
                </div>

                {/* Warning Message Box */}
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <span>⚠️ Irreversible Action</span>
                  </div>
                  <p className="text-[11px] text-amber-600 dark:text-amber-300/90 leading-relaxed">
                    This user will immediately lose access to both the <strong>Web Dashboard</strong> and the <strong>Mobile App</strong>. All associated login sessions and credentials will be permanently deleted from Supabase.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border/60 bg-muted/20 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUserToDelete(null)}
                  disabled={isDeleting}
                  className="h-9 px-4 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="h-9 px-4 text-xs font-bold gap-2 cursor-pointer shadow-xs"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="size-3.5" />
                      <span>Delete User</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
