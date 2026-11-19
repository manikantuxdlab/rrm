import { toast } from "sonner"
import * as React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Gift,
  Search,
  X,
  Phone,
  Mail,
  Building2,
  HardHat,
  MoreVertical,
  Eye,
  Trash2,
  Shirt,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react"
import type { SubmissionRecord } from "@/types"
import { submissionsService } from "@/services/submissionsService"

type ReferralStatus = "new" | "contacted" | "converted" | "reward_shipped" | "declined"

const STATUS_META: Record<ReferralStatus, { label: string; className: string; dot: string }> = {
  new: {
    label: "New",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    dot: "bg-amber-500",
  },
  contacted: {
    label: "Contacted",
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    dot: "bg-blue-500",
  },
  converted: {
    label: "Converted",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  reward_shipped: {
    label: "Reward Shipped",
    className: "bg-primary/10 text-primary border-primary/20",
    dot: "bg-primary",
  },
  declined: {
    label: "Declined",
    className: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground/60",
  },
}

const STATUS_KEYS = Object.keys(STATUS_META) as ReferralStatus[]

const getStatus = (r: SubmissionRecord): ReferralStatus => {
  const s = r.data?.referralStatus as ReferralStatus | undefined
  return s && STATUS_META[s] ? s : "new"
}

function StatusPill({ status }: { status: ReferralStatus }) {
  const meta = STATUS_META[status]
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${meta.className}`}
    >
      <span className={`size-1.5 rounded-full ${meta.dot}`}></span>
      {meta.label}
    </span>
  )
}

export function ReferralsView() {
  const [referrals, setReferrals] = React.useState<SubmissionRecord[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [currentPage, setCurrentPage] = React.useState(1)
  const pageSize = 20

  const [viewing, setViewing] = React.useState<SubmissionRecord | null>(null)
  const [editStatus, setEditStatus] = React.useState<ReferralStatus>("new")
  const [editNotes, setEditNotes] = React.useState("")
  const [toDelete, setToDelete] = React.useState<SubmissionRecord | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const loadReferrals = React.useCallback(async () => {
    try {
      const rows = await submissionsService.fetchAll({ moduleType: "referral" })
      setReferrals(rows)
    } catch (err) {
      console.error("[ReferralsView] Error fetching referrals:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadReferrals()
    const unsubscribe = submissionsService.subscribeToChanges(() => {
      loadReferrals()
    })
    return () => {
      unsubscribe()
    }
  }, [loadReferrals])

  const filtered = React.useMemo(() => {
    const q = searchQuery.toLowerCase()
    return referrals.filter((r) => {
      const d = r.data || {}
      const matchesSearch =
        !q ||
        (d.referralCompany || "").toLowerCase().includes(q) ||
        (d.contactName || "").toLowerCase().includes(q) ||
        (d.trade || "").toLowerCase().includes(q) ||
        (r.foremanName || "").toLowerCase().includes(q) ||
        (r.companyName || "").toLowerCase().includes(q)
      const matchesStatus = statusFilter === "all" || getStatus(r) === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [referrals, searchQuery, statusFilter])

  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const paginated = React.useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage]
  )

  const countBy = (s: ReferralStatus) => referrals.filter((r) => getStatus(r) === s).length

  const handleOpenView = (r: SubmissionRecord) => {
    setViewing(r)
    setEditStatus(getStatus(r))
    setEditNotes(r.data?.adminNotes || "")
  }

  const handleSave = async () => {
    if (!viewing) return
    setIsSaving(true)
    const ok = await submissionsService.updateSubmissionData(viewing.id, {
      referralStatus: editStatus,
      adminNotes: editNotes,
      referralUpdatedAt: new Date().toISOString(),
    })
    setIsSaving(false)
    if (!ok) {
      toast.error("Could not update referral. Check Supabase permissions.")
      return
    }
    setReferrals((prev) =>
      prev.map((r) =>
        r.id === viewing.id
          ? { ...r, data: { ...r.data, referralStatus: editStatus, adminNotes: editNotes } }
          : r
      )
    )
    toast.success(`Referral "${viewing.data?.referralCompany || "Referral"}" updated`)
    setViewing(null)
  }

  const handleConfirmDelete = async () => {
    if (!toDelete) return
    setIsDeleting(true)
    const ok = await submissionsService.deleteSubmission(toDelete.id)
    setIsDeleting(false)
    if (!ok) {
      toast.error("Could not delete referral. Check Supabase permissions.")
      return
    }
    setReferrals((prev) => prev.filter((r) => r.id !== toDelete.id))
    toast.success("Referral deleted")
    setToDelete(null)
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-3">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Gift className="size-5 text-primary" />
          Referrals
        </h2>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border py-2.5 px-3.5 flex flex-col justify-between">
          <div className="text-[11px] font-medium text-muted-foreground">Total Referrals</div>
          <div className="text-lg font-bold text-foreground mt-0.5">{referrals.length} Leads</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Submitted from the field</div>
        </Card>
        <Card className="border-border py-2.5 px-3.5 flex flex-col justify-between">
          <div className="text-[11px] font-medium text-muted-foreground">Awaiting Follow-up</div>
          <div className="text-lg font-bold text-foreground mt-0.5">{countBy("new")} New</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Not yet contacted</div>
        </Card>
        <Card className="border-border py-2.5 px-3.5 flex flex-col justify-between">
          <div className="text-[11px] font-medium text-muted-foreground">Converted</div>
          <div className="text-lg font-bold text-foreground mt-0.5">
            {countBy("converted") + countBy("reward_shipped")} Won
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Became clients</div>
        </Card>
        <Card className="border-border py-2.5 px-3.5 flex flex-col justify-between">
          <div className="text-[11px] font-medium text-muted-foreground">Rewards Shipped</div>
          <div className="text-lg font-bold text-foreground mt-0.5">{countBy("reward_shipped")} Boxes</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">High-vis shirt boxes sent</div>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        <div className="relative w-full sm:w-64 md:w-72 shrink-0">
          <Search className="size-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company, contact, trade..."
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

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8.5 min-w-[150px] text-xs bg-background rounded-lg border-border">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="text-xs">
            <SelectItem value="all">All Status ({referrals.length})</SelectItem>
            {STATUS_KEYS.map((s) => (
              <SelectItem key={s} value={s}>
                <span className="flex items-center gap-1.5">
                  <span className={`size-1.5 rounded-full ${STATUS_META[s].dot}`}></span>
                  {STATUS_META[s].label} ({countBy(s)})
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <Table className="w-full border-collapse text-xs">
            <TableHeader className="bg-muted/60 border-b border-border/80 sticky top-0 z-10">
              <TableRow className="h-8.5 hover:bg-transparent">
                <TableHead className="w-11 px-2.5 py-2 font-semibold text-muted-foreground text-[11px] text-center uppercase tracking-wider border-r border-border/60">
                  #
                </TableHead>
                <TableHead className="min-w-[190px] px-3 py-2 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider border-r border-border/60">
                  Referred Company
                </TableHead>
                <TableHead className="min-w-[150px] px-3 py-2 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider border-r border-border/60">
                  Contact
                </TableHead>
                <TableHead className="min-w-[110px] px-3 py-2 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider border-r border-border/60">
                  Trade
                </TableHead>
                <TableHead className="min-w-[180px] px-3 py-2 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider border-r border-border/60">
                  Shirt Sizes
                </TableHead>
                <TableHead className="min-w-[170px] px-3 py-2 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider border-r border-border/60">
                  Referred By
                </TableHead>
                <TableHead className="min-w-[140px] px-3 py-2 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider border-r border-border/60">
                  Submitted
                </TableHead>
                <TableHead className="min-w-[120px] px-3 py-2 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider border-r border-border/60 text-center">
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
                  <TableCell colSpan={9} className="px-4 py-12 text-center text-muted-foreground text-xs">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="size-5 animate-spin text-primary" />
                      <span className="font-medium text-foreground">Loading referrals from Supabase...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="px-4 py-8 text-center text-muted-foreground text-xs">
                    {referrals.length === 0
                      ? "No referrals yet. They appear here when foremen submit one from the mobile app."
                      : "No referrals match your filters."}
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((r, idx) => {
                  const d = r.data || {}
                  return (
                    <TableRow
                      key={r.id}
                      onClick={() => handleOpenView(r)}
                      className="h-9 hover:bg-primary/[0.04] dark:hover:bg-primary/[0.08] transition-colors cursor-pointer group even:bg-muted/[0.12]"
                    >
                      <TableCell className="w-11 px-2.5 py-1.5 text-center font-mono text-[11px] text-muted-foreground/80 border-r border-border/50">
                        {(safePage - 1) * pageSize + idx + 1}
                      </TableCell>
                      <TableCell className="px-3 py-1.5 border-r border-border/50">
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors truncate block">
                          {d.referralCompany || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="px-3 py-1.5 border-r border-border/50 whitespace-nowrap">
                        {d.contactName || "—"}
                      </TableCell>
                      <TableCell className="px-3 py-1.5 border-r border-border/50 whitespace-nowrap">
                        {d.trade || "—"}
                      </TableCell>
                      <TableCell className="px-3 py-1.5 border-r border-border/50">
                        <span className="text-[11px] text-muted-foreground truncate block max-w-[200px]" title={d.crewShirtSizes}>
                          {d.crewShirtSizes || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="px-3 py-1.5 border-r border-border/50">
                        <div className="flex flex-col leading-tight">
                          <span className="font-medium text-foreground flex items-center gap-1">
                            {r.foremanName || "—"}
                            <HardHat className="size-3 text-amber-500 shrink-0" />
                          </span>
                          <span className="text-[10px] text-muted-foreground truncate">{r.companyName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-1.5 border-r border-border/50 whitespace-nowrap text-[11px] text-muted-foreground">
                        {r.timestamp}
                      </TableCell>
                      <TableCell className="px-3 py-1.5 border-r border-border/50 text-center whitespace-nowrap">
                        <StatusPill status={getStatus(r)} />
                      </TableCell>
                      <TableCell
                        className="w-12 px-2 py-1.5 text-center whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="size-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer rounded-md"
                              aria-label="Referral actions"
                            >
                              <MoreVertical className="size-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 text-xs">
                            <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase font-semibold">
                              Referral Options
                            </DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleOpenView(r)} className="cursor-pointer gap-2">
                              <Eye className="size-3.5 text-primary" />
                              <span>View & Update Status</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setToDelete(r)}
                              className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                              <Trash2 className="size-3.5 text-destructive" />
                              <span className="font-semibold text-destructive">Delete Referral</span>
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
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs border-t border-border/40">
          <div className="text-muted-foreground text-xs">
            Showing <span className="font-semibold text-foreground">{(safePage - 1) * pageSize + 1}</span> to{" "}
            <span className="font-semibold text-foreground">
              {Math.min(safePage * pageSize, filtered.length)}
            </span>{" "}
            of <span className="font-semibold text-foreground">{filtered.length}</span> referrals
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="size-8 p-0 cursor-pointer disabled:cursor-not-allowed border-border"
              title="Previous Page"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="px-2 text-xs text-muted-foreground">
              {safePage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="size-8 p-0 cursor-pointer disabled:cursor-not-allowed border-border"
              title="Next Page"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* View / Update Sheet */}
      <Sheet open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl lg:max-w-[760px] flex flex-col p-0 overflow-hidden h-full shadow-2xl">
          {viewing && (
            <div className="flex flex-col h-full justify-between overflow-hidden">
              <SheetHeader className="px-8 py-5.5 border-b border-border/80 bg-muted/15 shrink-0 text-left">
                <div className="flex items-center gap-3.5">
                  <div className="size-12 rounded-full bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0 border border-amber-500/30">
                    <Gift className="size-5" />
                  </div>
                  <div>
                    <SheetTitle className="text-lg font-bold text-foreground flex items-center gap-2.5">
                      {viewing.data?.referralCompany || "Referral"}
                      <StatusPill status={getStatus(viewing)} />
                    </SheetTitle>
                    <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                      Referred by {viewing.foremanName} • {viewing.timestamp}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-8 py-7 space-y-6 text-xs">
                {/* Lead */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-0.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Contractor Lead
                    </span>
                    <div className="h-px bg-border/60 flex-1"></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl border border-border/70 bg-muted/25">
                      <div className="text-[11px] text-muted-foreground font-medium">Contact Person</div>
                      <div className="font-semibold text-foreground text-xs mt-1">
                        {viewing.data?.contactName || "—"}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl border border-border/70 bg-muted/25">
                      <div className="text-[11px] text-muted-foreground font-medium">Primary Trade</div>
                      <div className="font-semibold text-foreground text-xs mt-1 flex items-center gap-2">
                        <HardHat className="size-3.5 text-primary" />
                        {viewing.data?.trade || "—"}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl border border-border/70 bg-muted/25">
                      <div className="text-[11px] text-muted-foreground font-medium">Phone</div>
                      <div className="font-semibold text-foreground text-xs mt-1 flex items-center gap-2">
                        <Phone className="size-3.5 text-primary" />
                        {viewing.data?.phone || "Not provided"}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl border border-border/70 bg-muted/25">
                      <div className="text-[11px] text-muted-foreground font-medium">Email</div>
                      <div className="font-semibold text-foreground text-xs mt-1 flex items-center gap-2 break-all">
                        <Mail className="size-3.5 text-primary shrink-0" />
                        {viewing.data?.email || "Not provided"}
                      </div>
                    </div>
                  </div>
                  {viewing.data?.notes && (
                    <div className="p-3.5 rounded-xl border border-border/70 bg-muted/25">
                      <div className="text-[11px] text-muted-foreground font-medium">Introduction Notes</div>
                      <p className="text-xs text-foreground mt-1 leading-relaxed">{viewing.data.notes}</p>
                    </div>
                  )}
                </div>

                {/* Referrer */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-0.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Referred By & Reward
                    </span>
                    <div className="h-px bg-border/60 flex-1"></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl border border-border/70 bg-muted/25">
                      <div className="text-[11px] text-muted-foreground font-medium">Foreman</div>
                      <div className="font-semibold text-foreground text-xs mt-1">{viewing.foremanName}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 break-all">{viewing.foremanEmail}</div>
                    </div>
                    <div className="p-3.5 rounded-xl border border-border/70 bg-muted/25">
                      <div className="text-[11px] text-muted-foreground font-medium">Company & Jobsite</div>
                      <div className="font-semibold text-foreground text-xs mt-1 flex items-center gap-2">
                        <Building2 className="size-3.5 text-primary shrink-0" />
                        {viewing.companyName}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{viewing.jobSiteName}</div>
                    </div>
                    <div className="p-3.5 rounded-xl border border-border/70 bg-muted/25 sm:col-span-2">
                      <div className="text-[11px] text-muted-foreground font-medium">Crew T-Shirt Sizes (Reward Box)</div>
                      <div className="font-semibold text-foreground text-xs mt-1 flex items-center gap-2">
                        <Shirt className="size-3.5 text-primary" />
                        {viewing.data?.crewShirtSizes || "—"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Admin follow-up */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-0.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Follow-up
                    </span>
                    <div className="h-px bg-border/60 flex-1"></div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground text-xs">Status</label>
                    <Select value={editStatus} onValueChange={(v) => setEditStatus(v as ReferralStatus)}>
                      <SelectTrigger className="h-10 w-full text-xs bg-background rounded-lg border-border">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="text-xs">
                        {STATUS_KEYS.map((s) => (
                          <SelectItem key={s} value={s}>
                            <span className="flex items-center gap-2">
                              <span className={`size-2 rounded-full ${STATUS_META[s].dot}`}></span>
                              {STATUS_META[s].label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground text-xs">Internal Notes</label>
                              <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50 resize-none"
                      placeholder="e.g. Called Jason, quote sent..."
                    />
                  </div>
                </div>
              </div>

              <SheetFooter className="px-8 py-4.5 border-t border-border/80 bg-muted/20 shrink-0 flex flex-row items-center justify-end gap-3 mt-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setViewing(null)}
                  className="h-9.5 px-5 text-xs font-medium cursor-pointer rounded-lg border-border"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="h-9.5 px-6 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm cursor-pointer gap-2 rounded-lg"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </Button>
              </SheetFooter>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Dialog */}
      <Dialog open={!!toDelete} onOpenChange={(open) => !open && !isDeleting && setToDelete(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-border bg-card">
          {toDelete && (
            <div>
              <div className="p-5 border-b border-border/60 bg-destructive/5 flex items-start gap-3.5">
                <div className="size-10 rounded-full bg-destructive/15 text-destructive flex items-center justify-center shrink-0">
                  <Trash2 className="size-5" />
                </div>
                <div className="space-y-1">
                  <DialogTitle className="text-base font-bold text-foreground">Delete referral</DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    "{toDelete.data?.referralCompany || "This referral"}" will be permanently removed.
                  </DialogDescription>
                </div>
              </div>
              <div className="p-4 border-t border-border/60 bg-muted/20 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setToDelete(null)}
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
                      <span>Delete Referral</span>
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