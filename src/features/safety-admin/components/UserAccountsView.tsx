import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
} from "lucide-react"
import { MOCK_APP_USERS, MOCK_COMPANIES, MOCK_JOBSITES } from "@/data/safetyMockData"
import type { AppUser } from "@/types"

export function UserAccountsView() {
  const [users, setUsers] = React.useState<AppUser[]>(MOCK_APP_USERS)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCompanyFilter, setSelectedCompanyFilter] = React.useState<string>("all")
  const [selectedRoleFilter, setSelectedRoleFilter] = React.useState<string>("all")
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false)

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

  const totalActive = users.filter((u) => u.status === "active").length
  const totalForemen = users.filter((u) => u.role === "foreman").length
  const totalSpanish = users.filter((u) => u.languagePreference === "es").length

  const handleToggleStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus = u.status === "active" ? "deactivated" : "active"
          const msg =
            newStatus === "deactivated"
              ? `Access revoked for ${u.fullName}. Mobile login disabled.`
              : `Access restored for ${u.fullName}. Mobile login re-enabled.`
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

  const handleSendReset = (u: AppUser) => {
    setSuccessToast(
      `🔑 Password reset & SMS login link dispatched to ${u.phone} and ${u.email}`
    )
    setTimeout(() => setSuccessToast(null), 4000)
  }

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
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-9 gap-1.5 shadow-sm cursor-pointer"
          >
            <UserPlus className="size-4" />
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

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3 bg-card border-border">
          <div className="text-[11px] font-medium text-muted-foreground">Total App Accounts</div>
          <div className="text-xl font-bold text-foreground mt-0.5">{users.length} Logins</div>
          <div className="text-[10px] text-muted-foreground mt-1">Across 4 Customer Companies</div>
        </Card>
        <Card className="p-3 bg-card border-border">
          <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Active Field Foremen</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{totalForemen} Foremen</div>
          <div className="text-[10px] text-muted-foreground mt-1">{totalActive} Accounts Enabled</div>
        </Card>
        <Card className="p-3 bg-card border-border">
          <div className="text-[11px] font-medium text-primary">Spanish Interface Users</div>
          <div className="text-xl font-bold text-primary mt-0.5">{totalSpanish} Users</div>
          <div className="text-[10px] text-muted-foreground mt-1">Bilingual App Enabled (ES)</div>
        </Card>
        <Card className="p-3 bg-card border-border">
          <div className="text-[11px] font-medium text-muted-foreground">Sync & Submissions</div>
          <div className="text-xl font-bold text-foreground mt-0.5">
            {users.reduce((acc, u) => acc + u.submissionsCount, 0)} Total
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">Checklists, Talks & JHAs</div>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="size-3.5 absolute left-3 top-2.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, email, phone, or company..."
            className="pl-8 text-xs h-9"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCompanyFilter}
            onChange={(e) => setSelectedCompanyFilter(e.target.value)}
            className="h-9 text-xs rounded-md border border-input bg-background px-2.5 text-foreground cursor-pointer"
          >
            <option value="all">All Companies</option>
            {MOCK_COMPANIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name.length > 25 ? c.name.substring(0, 25) + "..." : c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="h-9 text-xs rounded-md border border-input bg-background px-2.5 text-foreground cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="foreman">Field Foreman</option>
            <option value="superintendent">Superintendent</option>
            <option value="safety_manager">Safety Manager</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <Card className="border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">User & Contact</th>
                <th className="px-4 py-3">Company & Role</th>
                <th className="px-4 py-3">Assigned Jobsite(s)</th>
                <th className="px-4 py-3">Language</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Submissions</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isDeactivated = u.status === "deactivated"

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-muted/40 transition-colors ${
                        isDeactivated ? "opacity-60 bg-muted/20" : ""
                      }`}
                    >
                      {/* Name & Contact */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="size-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0">
                            {u.fullName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground flex items-center gap-1.5">
                              <span>{u.fullName}</span>
                              {u.role === "foreman" && (
                                <HardHat className="size-3 text-amber-500" />
                              )}
                            </div>
                            <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Mail className="size-2.5" />
                                {u.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="size-2.5" />
                                {u.phone}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Company & Role */}
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-foreground">{u.companyName}</div>
                        <Badge
                          variant="outline"
                          className="text-[10px] mt-0.5 capitalize border-border"
                        >
                          {u.role.replace("_", " ")}
                        </Badge>
                      </td>

                      {/* Assigned Jobsites */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 text-muted-foreground line-clamp-1 max-w-[200px]">
                          <Building2 className="size-3 shrink-0 text-primary" />
                          <span className="text-[11px] text-foreground font-medium">
                            {u.assignedJobsiteNames.join(", ")}
                          </span>
                        </div>
                      </td>

                      {/* Language Preference */}
                      <td className="px-4 py-3.5">
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-mono gap-1"
                        >
                          <Globe className="size-2.5" />
                          {u.languagePreference === "es" ? "🇲🇽 Spanish" : "🇺🇸 English"}
                        </Badge>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        {u.status === "active" && (
                          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-semibold">
                            ● Active (App Access)
                          </Badge>
                        )}
                        {u.status === "deactivated" && (
                          <Badge variant="destructive" className="text-[10px]">
                            ✕ Deactivated
                          </Badge>
                        )}
                        {u.status === "invited" && (
                          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px]">
                            ⌛ Invite Sent
                          </Badge>
                        )}
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {u.lastActive}
                        </div>
                      </td>

                      {/* Submissions count */}
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-foreground">
                          {u.submissionsCount}
                        </span>{" "}
                        <span className="text-[10px] text-muted-foreground">records</span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSendReset(u)}
                          className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                          title="Send Password Reset & SMS Link"
                        >
                          <KeyRound className="size-3 mr-1 text-primary" />
                          Reset
                        </Button>

                        <Button
                          size="sm"
                          variant={isDeactivated ? "default" : "outline"}
                          onClick={() => handleToggleStatus(u.id)}
                          className={`h-7 px-2.5 text-[11px] font-medium cursor-pointer ${
                            isDeactivated
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                              : "text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                          }`}
                        >
                          {isDeactivated ? (
                            <>
                              <UserCheck className="size-3 mr-1" />
                              Reactivate
                            </>
                          ) : (
                            <>
                              <UserX className="size-3 mr-1" />
                              Deactivate
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Onboard / Invite User Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-lg bg-card border-border shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-4">
              <div>
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <UserPlus className="size-5 text-primary" />
                  Onboard New Field Foreman / App User
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Creates mobile app credentials and links the user to specific customer jobsites
                </CardDescription>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </CardHeader>

            <form onSubmit={handleCreateUser}>
              <CardContent className="space-y-3.5 pt-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Full Name *</label>
                    <Input
                      required
                      placeholder="e.g. Sergio Ramos"
                      value={newFullName}
                      onChange={(e) => setNewFullName(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Mobile Phone (SMS Invite) *</label>
                    <Input
                      required
                      placeholder="e.g. (213) 555-0988"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Work Email Address *</label>
                  <Input
                    type="email"
                    required
                    placeholder="e.g. sramos@titanconcrete-ca.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Customer Company *</label>
                    <select
                      value={newCompanyId}
                      onChange={(e) => setNewCompanyId(e.target.value)}
                      className="w-full h-8 text-xs rounded-md border border-input bg-background px-2 text-foreground"
                    >
                      {MOCK_COMPANIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Role / Permission *</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as AppUser["role"])}
                      className="w-full h-8 text-xs rounded-md border border-input bg-background px-2 text-foreground"
                    >
                      <option value="foreman">Field Foreman (Daily Checks & Talks)</option>
                      <option value="superintendent">Superintendent (Jobsite Lead)</option>
                      <option value="safety_manager">Safety Director / Officer</option>
                      <option value="admin">Company Administrator</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Assigned Active Jobsite *</label>
                    <select
                      value={newJobsiteId}
                      onChange={(e) => setNewJobsiteId(e.target.value)}
                      className="w-full h-8 text-xs rounded-md border border-input bg-background px-2 text-foreground"
                    >
                      {MOCK_JOBSITES.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">App Language Preference</label>
                    <select
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value as "en" | "es")}
                      className="w-full h-8 text-xs rounded-md border border-input bg-background px-2 text-foreground"
                    >
                      <option value="en">🇺🇸 English</option>
                      <option value="es">🇲🇽 Spanish (Español)</option>
                    </select>
                  </div>
                </div>

                <div className="p-2.5 rounded-md bg-muted/60 border border-border text-[11px] text-muted-foreground flex items-center gap-2">
                  <Smartphone className="size-4 text-primary shrink-0" />
                  <span>
                    Upon onboarding, a welcome SMS with a one-time magic login link and temporary password will be dispatched to the mobile phone.
                  </span>
                </div>
              </CardContent>

              <div className="flex items-center justify-end gap-2 border-t border-border/60 p-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="h-8 text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cursor-pointer"
                >
                  Onboard & Send App Invite
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
