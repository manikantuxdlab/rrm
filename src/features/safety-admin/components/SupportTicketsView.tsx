import * as React from "react"
import {
  LifeBuoy,
  Search,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  Layers,
  Loader2,
  Send,
  Building2,
  Briefcase,
  Shield,
  RefreshCw,
  MessageSquare,
  MapPin,
  Tag,
  User,
  SlidersHorizontal,
  FileText,
  X,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  GlobalDataTable,
  DataTablePagination,
  type DataTableColumn,
} from "@/components/ui/data-table-global"
import { ticketService } from "@/services/ticketService"
import type {
  SupportTicket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
  TicketStage,
} from "@/types"

// Refined, calm category styling without aggressive saturation
const CATEGORY_CONFIG: Record<TicketCategory, { label: string; dotColor: string }> = {
  mobile_app: { label: "Mobile App & Sync", dotColor: "bg-sky-500" },
  incident_claim: { label: "Incident & Claim", dotColor: "bg-rose-500" },
  coi_billing: { label: "Insurance & COI", dotColor: "bg-indigo-500" },
  osha_compliance: { label: "OSHA & Compliance", dotColor: "bg-amber-500" },
  jobsite_access: { label: "Jobsite & Badges", dotColor: "bg-emerald-500" },
  general: { label: "General Inquiries", dotColor: "bg-slate-400" },
}

// Clean, humanized subject formatting for machine/event bus strings
function formatTicketSubject(subject: string): { title: string; isSystem: boolean } {
  if (subject.startsWith("SYSTEM_EVENT_BUS:")) {
    const rawTag = subject.replace("SYSTEM_EVENT_BUS:", "").replace(/_/g, " ")
    return {
      title: `Automated COI Event Bus: ${rawTag}`,
      isSystem: true,
    }
  }
  return { title: subject, isSystem: false }
}

// Humanized clean date formatting
function formatTicketDate(dateStr: string): string {
  if (!dateStr) return "—"
  try {
    const parts = dateStr.split("T")[0].split("-")
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      }
    }
  } catch {}
  return dateStr
}

export function SupportTicketsView() {
  const [tickets, setTickets] = React.useState<SupportTicket[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedTicket, setSelectedTicket] = React.useState<SupportTicket | null>(null)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)
  const [ticketToDelete, setTicketToDelete] = React.useState<SupportTicket | null>(null)

  // Quick segment tab filter: all | open | admin | urgent | resolved
  const [activeTab, setActiveTab] = React.useState<"all" | "open" | "admin" | "urgent" | "resolved">("all")

  // Deep Dropdown Filters & Search
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [priorityFilter, setPriorityFilter] = React.useState<string>("all")
  const [stageFilter, setStageFilter] = React.useState<string>("all")
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all")

  // Pagination: Default 20
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(20)

  // Drawer message response
  const [replyMessage, setReplyMessage] = React.useState("")
  const [replying, setReplying] = React.useState(false)
  const [resolutionNotes, setResolutionNotes] = React.useState("")

  const loadTickets = React.useCallback(async () => {
    setLoading(true)
    const { data } = await ticketService.getTickets()
    setTickets(data)
    setLoading(false)
  }, [])

  React.useEffect(() => {
    loadTickets()
  }, [loadTickets])

  // Open detail drawer and load conversation thread
  const handleOpenTicket = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket)
    setIsDetailOpen(true)
    setResolutionNotes(ticket.resolutionNotes || "")
    const { data } = await ticketService.getTicketDetails(ticket.id)
    if (data) {
      setSelectedTicket(data)
    }
  }

  // Send reply message in thread
  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return
    setReplying(true)
    const { data: newMsg } = await ticketService.addTicketMessage(
      selectedTicket.id,
      replyMessage,
      "Super Admin (Support)",
      "super_admin"
    )
    if (newMsg) {
      setSelectedTicket((prev) =>
        prev
          ? {
              ...prev,
              messages: [...(prev.messages || []), newMsg],
            }
          : null
      )
      setReplyMessage("")
    }
    setReplying(false)
  }

  // Update Status handler
  const handleUpdateStatus = async (newStatus: TicketStatus) => {
    if (!selectedTicket) return
    await ticketService.updateTicketStatus(
      selectedTicket.id,
      newStatus,
      resolutionNotes,
      "Super Admin"
    )
    setSelectedTicket((prev) => (prev ? { ...prev, status: newStatus } : null))
    loadTickets()
  }

  // Update Priority handler
  const handleUpdatePriority = async (newPriority: TicketPriority) => {
    if (!selectedTicket) return
    await ticketService.updateTicketPriority(selectedTicket.id, newPriority)
    setSelectedTicket((prev) => (prev ? { ...prev, priority: newPriority } : null))
    loadTickets()
  }

  // Update Stage / Assignee handler
  const handleUpdateStage = async (newStage: TicketStage) => {
    if (!selectedTicket) return
    await ticketService.updateTicketStage(selectedTicket.id, newStage)
    setSelectedTicket((prev) => (prev ? { ...prev, stage: newStage } : null))
    loadTickets()
  }

  // Delete ticket
  const handleConfirmDelete = async () => {
    if (!ticketToDelete) return
    await ticketService.deleteTicket(ticketToDelete.id)
    setTicketToDelete(null)
    if (selectedTicket?.id === ticketToDelete.id) {
      setIsDetailOpen(false)
    }
    loadTickets()
  }

  // Clear all filters
  const handleResetFilters = () => {
    setActiveTab("all")
    setSearchQuery("")
    setStatusFilter("all")
    setPriorityFilter("all")
    setStageFilter("all")
    setCategoryFilter("all")
    setCurrentPage(1)
  }

  const hasActiveFilters =
    activeTab !== "all" ||
    searchQuery.trim() !== "" ||
    statusFilter !== "all" ||
    priorityFilter !== "all" ||
    stageFilter !== "all" ||
    categoryFilter !== "all"

  // Quick Tab Switching
  const handleSelectTab = (tab: "all" | "open" | "admin" | "urgent" | "resolved") => {
    setActiveTab(tab)
    setCurrentPage(1)
    if (tab === "all") {
      setStatusFilter("all")
      setStageFilter("all")
      setPriorityFilter("all")
    } else if (tab === "open") {
      setStatusFilter("open")
      setStageFilter("all")
      setPriorityFilter("all")
    } else if (tab === "admin") {
      setStatusFilter("all")
      setStageFilter("escalated_to_admin")
      setPriorityFilter("all")
    } else if (tab === "urgent") {
      setStatusFilter("all")
      setStageFilter("all")
      setPriorityFilter("urgent")
    } else if (tab === "resolved") {
      setStatusFilter("resolved")
      setStageFilter("all")
      setPriorityFilter("all")
    }
  }

  // Filtered tickets memo
  const filteredTickets = React.useMemo(() => {
    return tickets.filter((t) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        t.ticketNumber.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.companyName.toLowerCase().includes(q) ||
        t.userName.toLowerCase().includes(q) ||
        (t.jobsiteName && t.jobsiteName.toLowerCase().includes(q))

      // Tab constraint
      let matchesTab = true
      if (activeTab === "open") matchesTab = t.status === "open"
      else if (activeTab === "admin") matchesTab = t.stage === "escalated_to_admin"
      else if (activeTab === "urgent") matchesTab = t.priority === "urgent" || t.priority === "high"
      else if (activeTab === "resolved") matchesTab = t.status === "resolved"

      const matchesStatus = statusFilter === "all" || t.status === statusFilter
      const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter
      const matchesStage = stageFilter === "all" || t.stage === stageFilter
      const matchesCategory = categoryFilter === "all" || t.category === categoryFilter

      return matchesSearch && matchesTab && matchesStatus && matchesPriority && matchesStage && matchesCategory
    })
  }, [tickets, searchQuery, activeTab, statusFilter, priorityFilter, stageFilter, categoryFilter])

  // Counts for KPI & Tabs
  const totalCount = tickets.length
  const openCount = tickets.filter((t) => t.status === "open").length
  const urgentCount = tickets.filter((t) => t.priority === "urgent" || t.priority === "high").length
  const escalatedCount = tickets.filter((t) => t.stage === "escalated_to_admin").length
  const resolvedCount = tickets.filter((t) => t.status === "resolved").length

  // Paginated records
  const paginatedTickets = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredTickets.slice(start, start + pageSize)
  }, [filteredTickets, currentPage, pageSize])

  // Reset page when search/filter changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, priorityFilter, stageFilter, categoryFilter, pageSize])

  // Table Columns - Clean, Calm, Professional Design
  const columns: DataTableColumn<SupportTicket>[] = [
    {
      key: "ticketNumber",
      header: "Ticket ID",
      className: "w-[105px]",
      cell: (ticket) => (
        <span
          className="inline-flex items-center justify-center font-mono font-bold text-[11px] w-[94px] h-6 rounded-md bg-muted/80 text-foreground/80 border border-border/80 group-hover:border-primary/50 group-hover:text-primary group-hover:bg-primary/5 transition-all cursor-pointer"
          onClick={() => handleOpenTicket(ticket)}
        >
          {ticket.ticketNumber}
        </span>
      ),
    },
    {
      key: "subject",
      header: "Subject & Project",
      className: "min-w-[280px]",
      cell: (ticket) => {
        const { title, isSystem } = formatTicketSubject(ticket.subject)
        return (
          <div className="space-y-1 cursor-pointer py-1" onClick={() => handleOpenTicket(ticket)}>
            <div className="flex items-center gap-1.5 flex-wrap">
              {isSystem && (
                <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  SYSTEM
                </span>
              )}
              <span className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {title}
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 line-clamp-1">
              <span className="font-medium text-foreground/80">{ticket.companyName}</span>
              {ticket.jobsiteName && (
                <>
                  <span className="text-muted-foreground/40">•</span>
                  <span className="text-[10.5px] text-muted-foreground/80 truncate max-w-[220px]">
                    {ticket.jobsiteName}
                  </span>
                </>
              )}
            </div>
          </div>
        )
      },
    },
    {
      key: "requester",
      header: "Requester",
      className: "min-w-[150px]",
      cell: (ticket) => {
        const isForeman = ticket.userRole === "foreman"
        const initial = ticket.userName ? ticket.userName.charAt(0).toUpperCase() : "U"
        return (
          <div className="flex items-center gap-2">
            <div
              className={`size-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                isForeman
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                  : "bg-blue-500/15 text-blue-700 dark:text-blue-300"
              }`}
            >
              {initial}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-foreground truncate">{ticket.userName}</div>
              <div className="text-[10px] text-muted-foreground font-medium">
                {isForeman ? "Site Foreman" : "Company Boss"}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      key: "category",
      header: "Category",
      className: "w-[150px]",
      cell: (ticket) => {
        const config = CATEGORY_CONFIG[ticket.category] || {
          label: ticket.category.replace(/_/g, " "),
          dotColor: "bg-slate-400",
        }
        return (
          <div className="inline-flex items-center gap-1.5 text-xs text-foreground/90 max-w-[150px]">
            <span className={`size-1.5 rounded-full shrink-0 ${config.dotColor}`} />
            <span className="font-medium text-[11px] truncate">{config.label}</span>
          </div>
        )
      },
    },
    {
      key: "priority",
      header: "Priority",
      align: "center",
      className: "w-[100px] text-center",
      headerClassName: "text-center",
      cell: (ticket) => {
        switch (ticket.priority) {
          case "urgent":
            return (
              <span className="inline-flex items-center gap-1.5 font-bold text-xs text-rose-600 dark:text-rose-400">
                <span className="size-2 rounded-full bg-rose-600 animate-pulse shrink-0" />
                Urgent
              </span>
            )
          case "high":
            return (
              <span className="inline-flex items-center gap-1.5 font-semibold text-xs text-amber-600 dark:text-amber-400">
                <span className="size-2 rounded-full bg-amber-500 shrink-0" />
                High
              </span>
            )
          case "medium":
            return (
              <span className="inline-flex items-center gap-1.5 font-medium text-xs text-muted-foreground">
                <span className="size-1.5 rounded-full bg-slate-400 shrink-0" />
                Medium
              </span>
            )
          case "low":
          default:
            return (
              <span className="inline-flex items-center gap-1.5 font-medium text-xs text-muted-foreground/70">
                <span className="size-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                Low
              </span>
            )
        }
      },
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      className: "w-[140px] text-center",
      headerClassName: "text-center",
      cell: (ticket) => {
        const statusConfig: Record<
          TicketStatus,
          { bg: string; text: string; border: string; icon: React.ReactNode; label: string }
        > = {
          open: {
            bg: "bg-amber-500/10",
            text: "text-amber-700 dark:text-amber-300",
            border: "border-amber-500/25",
            icon: <span className="size-1.5 rounded-full bg-amber-500 shrink-0" />,
            label: "Open",
          },
          in_progress: {
            bg: "bg-sky-500/10",
            text: "text-sky-700 dark:text-sky-300",
            border: "border-sky-500/25",
            icon: <span className="size-1.5 rounded-full bg-sky-500 animate-pulse shrink-0" />,
            label: "In Progress",
          },
          waiting_on_user: {
            bg: "bg-purple-500/10",
            text: "text-purple-700 dark:text-purple-300",
            border: "border-purple-500/25",
            icon: <Clock className="size-3 text-purple-600 dark:text-purple-400 shrink-0" />,
            label: "Waiting On Field",
          },
          resolved: {
            bg: "bg-emerald-500/10",
            text: "text-emerald-700 dark:text-emerald-300",
            border: "border-emerald-500/25",
            icon: <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400 shrink-0" />,
            label: "Resolved",
          },
          closed: {
            bg: "bg-muted/70",
            text: "text-muted-foreground",
            border: "border-border/80",
            icon: <span className="size-1.5 rounded-full bg-muted-foreground/50 shrink-0" />,
            label: "Closed",
          },
        }

        const stat = statusConfig[ticket.status] || statusConfig.closed
        return (
          <div className="flex justify-center">
            <span
              className={`inline-flex items-center justify-center gap-1.5 w-[124px] h-6 rounded-full text-[10.5px] font-semibold border ${stat.bg} ${stat.text} ${stat.border}`}
            >
              {stat.icon}
              <span className="truncate">{stat.label}</span>
            </span>
          </div>
        )
      },
    },
    {
      key: "createdAt",
      header: "Created",
      align: "center",
      className: "w-[100px] text-center text-muted-foreground text-xs font-mono",
      headerClassName: "text-center",
      cell: (ticket) => formatTicketDate(ticket.createdAt),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      className: "w-[80px]",
      cell: (ticket) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              handleOpenTicket(ticket)
            }}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg hover:bg-muted"
            title="View Details"
          >
            <Eye className="size-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              setTicketToDelete(ticket)
            }}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive cursor-pointer rounded-lg hover:bg-destructive/10"
            title="Delete Ticket"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <LifeBuoy className="size-4.5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Support Ticket Desk
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Centralized queue for OSHA compliance questions, mobile sync tickets, and field contractor inquiries.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-8.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer rounded-lg px-2.5"
            >
              <X className="size-3.5" />
              Reset Filters
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={loadTickets}
            className="h-8.5 gap-1.5 text-xs cursor-pointer font-medium rounded-lg shadow-2xs"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Queue
          </Button>
        </div>
      </div>

      {/* 2. Elevated Interactive KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Tickets */}
        <button
          type="button"
          onClick={() => handleSelectTab("all")}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
            activeTab === "all"
              ? "bg-card border-primary/40 shadow-xs ring-1 ring-primary/20"
              : "bg-card border-border/80 hover:border-border hover:shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Total Queue
            </span>
            <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Layers className="size-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-foreground tracking-tight">{totalCount}</div>
          <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">All logged tickets</p>
        </button>

        {/* Open & Pending */}
        <button
          type="button"
          onClick={() => handleSelectTab("open")}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
            activeTab === "open"
              ? "bg-amber-500/5 border-amber-500/40 shadow-xs ring-1 ring-amber-500/20"
              : "bg-card border-border/80 hover:border-border hover:shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Awaiting Action
            </span>
            <div className="size-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Clock className="size-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
            {openCount}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">Requires initial response</p>
        </button>

        {/* Super Admin Desk */}
        <button
          type="button"
          onClick={() => handleSelectTab("admin")}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
            activeTab === "admin"
              ? "bg-blue-500/5 border-blue-500/40 shadow-xs ring-1 ring-blue-500/20"
              : "bg-card border-border/80 hover:border-border hover:shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Admin Escalations
            </span>
            <div className="size-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Shield className="size-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
            {escalatedCount}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
            {urgentCount} flagged high/urgent
          </p>
        </button>

        {/* Resolved */}
        <button
          type="button"
          onClick={() => handleSelectTab("resolved")}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
            activeTab === "resolved"
              ? "bg-emerald-500/5 border-emerald-500/40 shadow-xs ring-1 ring-emerald-500/20"
              : "bg-card border-border/80 hover:border-border hover:shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Resolved Cases
            </span>
            <div className="size-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="size-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            {resolvedCount}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">Successfully completed</p>
        </button>
      </div>

      {/* 3. Streamlined Control Bar with Segment Tabs and Unified Filter Dropdowns */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-2.5 rounded-xl bg-card border border-border/80 shadow-2xs">
        {/* Quick Segment Filter Buttons */}
        <div className="inline-flex rounded-lg border border-border bg-muted/60 p-1 text-xs gap-1 self-start lg:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => handleSelectTab("all")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "all"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Tickets ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => handleSelectTab("open")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "open"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="size-1.5 rounded-full bg-amber-500" />
            Open ({openCount})
          </button>
          <button
            type="button"
            onClick={() => handleSelectTab("admin")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "admin"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Shield className="size-3 text-blue-600" />
            Admin ({escalatedCount})
          </button>
          <button
            type="button"
            onClick={() => handleSelectTab("urgent")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "urgent"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="size-1.5 rounded-full bg-rose-500" />
            Urgent ({urgentCount})
          </button>
          <button
            type="button"
            onClick={() => handleSelectTab("resolved")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "resolved"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Check className="size-3 text-emerald-600" />
            Resolved ({resolvedCount})
          </button>
        </div>

        {/* Right Search & Deep Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64 md:w-72">
            <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, subject, contractor..."
              className="pl-8 pr-7 text-xs h-8.5 bg-background rounded-lg border-border/80 shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer rounded-full p-0.5 hover:bg-muted"
                title="Clear search"
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          {/* Status Dropdown */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8.5 text-xs w-[125px] rounded-lg bg-background border-border/80 shadow-2xs">
              <SelectValue placeholder="Status: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="waiting_on_user">Waiting On Field</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority Dropdown */}
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="h-8.5 text-xs w-[125px] rounded-lg bg-background border-border/80 shadow-2xs">
              <SelectValue placeholder="Priority: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          {/* Category Dropdown */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-8.5 text-xs w-[140px] rounded-lg bg-background border-border/80 shadow-2xs">
              <SelectValue placeholder="Category: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="mobile_app">Mobile App & Sync</SelectItem>
              <SelectItem value="incident_claim">Incident & Claim</SelectItem>
              <SelectItem value="coi_billing">Insurance & COI</SelectItem>
              <SelectItem value="osha_compliance">OSHA & Compliance</SelectItem>
              <SelectItem value="jobsite_access">Jobsite & Badges</SelectItem>
              <SelectItem value="general">General Inquiries</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 4. Elegant Global Data Table */}
      <div className="rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden">
        <GlobalDataTable<SupportTicket>
          columns={columns}
          data={paginatedTickets}
          keyExtractor={(ticket) => ticket.id}
          isLoading={loading}
          loadingMessage="Loading support tickets from Supabase cloud..."
          emptyMessage="No tickets found matching your current filter criteria."
          onRowClick={(ticket) => handleOpenTicket(ticket)}
          containerClassName="border-0 shadow-none rounded-none"
        />
      </div>

      {/* 5. Global Pagination */}
      <DataTablePagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={filteredTickets.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[20, 50, 100]}
        itemLabel="tickets"
      />

      {/* 6. Ticket Detail & Resolution Sheet (Drawer) */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl md:max-w-3xl lg:max-w-[760px] xl:max-w-[800px] overflow-hidden flex flex-col p-0 shadow-2xl border-l border-border/80 bg-background"
        >
          {selectedTicket && (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Header */}
              <SheetHeader className="px-6 py-5 border-b border-border/60 bg-muted/20 pr-14">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold tracking-wider px-2.5 py-1 rounded-md bg-muted/80 text-foreground border border-border">
                      {selectedTicket.ticketNumber}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                      {CATEGORY_CONFIG[selectedTicket.category]?.label || selectedTicket.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold border ${
                        selectedTicket.stage === "escalated_to_admin"
                          ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/25"
                          : "bg-muted text-foreground/80 border-border"
                      }`}
                    >
                      {selectedTicket.stage === "escalated_to_admin" ? (
                        <Shield className="size-3 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Briefcase className="size-3 text-muted-foreground" />
                      )}
                      Assigned: {selectedTicket.stage === "escalated_to_admin" ? "Super Admin" : "Company Boss"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 border border-rose-500/20">
                      {selectedTicket.priority} Priority
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-left space-y-1">
                  <SheetTitle className="text-lg font-bold text-foreground tracking-tight leading-snug">
                    {formatTicketSubject(selectedTicket.subject).title}
                  </SheetTitle>
                  <SheetDescription className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                    <span>
                      Logged on <strong className="font-semibold text-foreground">{formatTicketDate(selectedTicket.createdAt)}</strong>
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <User className="size-3 text-muted-foreground" />
                      {selectedTicket.userName} ({selectedTicket.userRole === "foreman" ? "Site Foreman" : "Company Boss"})
                    </span>
                  </SheetDescription>
                </div>
              </SheetHeader>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                {/* Context Information Card */}
                <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Building2 className="size-3.5 text-primary" />
                        Company
                      </span>
                      <p className="font-semibold text-sm text-foreground">
                        {selectedTicket.companyName}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Tag className="size-3.5 text-primary" />
                        Category
                      </span>
                      <p className="font-semibold text-sm text-foreground">
                        {CATEGORY_CONFIG[selectedTicket.category]?.label || selectedTicket.category}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Shield className="size-3.5 text-primary" />
                        Assigned Desk
                      </span>
                      <p className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                        {selectedTicket.stage === "escalated_to_admin" ? (
                          <Shield className="size-3.5 text-blue-600" />
                        ) : (
                          <Briefcase className="size-3.5 text-amber-600" />
                        )}
                        {selectedTicket.stage === "escalated_to_admin" ? "Super Admin" : "Company Boss"}
                      </p>
                    </div>

                    {selectedTicket.jobsiteName && (
                      <div className="col-span-1 sm:col-span-3 pt-3 border-t border-border/40 space-y-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <MapPin className="size-3.5 text-primary" />
                          Jobsite Location
                        </span>
                        <p className="text-xs font-medium text-foreground">
                          {selectedTicket.jobsiteName}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Initial Issue Description */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="size-3.5 text-primary" />
                    <Label className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Initial Issue Description
                    </Label>
                  </div>
                  <div className="p-4 rounded-xl border border-border/80 bg-muted/20 text-xs text-foreground leading-relaxed whitespace-pre-line shadow-xs">
                    {selectedTicket.description}
                  </div>
                </div>

                {/* Quick Admin Controls (Status, Priority & Assignee) */}
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="size-3.5 text-primary" />
                    <Label className="text-xs font-bold text-primary uppercase tracking-wider">
                      Quick Status, Priority & Assignment Controls
                    </Label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-semibold text-foreground">
                        Update Ticket Status
                      </Label>
                      <Select
                        value={selectedTicket.status}
                        onValueChange={(val) => handleUpdateStatus(val as TicketStatus)}
                      >
                        <SelectTrigger className="h-9 text-xs bg-background border-border/80 hover:border-primary/50 transition-colors">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="waiting_on_user">Waiting On Field</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-semibold text-foreground">
                        Set Priority Level
                      </Label>
                      <Select
                        value={selectedTicket.priority}
                        onValueChange={(val) => handleUpdatePriority(val as TicketPriority)}
                      >
                        <SelectTrigger className="h-9 text-xs bg-background border-border/80 hover:border-primary/50 transition-colors">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                          <SelectItem value="urgent">Urgent Priority</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-semibold text-foreground">
                        Assign / Route Desk
                      </Label>
                      <Select
                        value={selectedTicket.stage}
                        onValueChange={(val) => handleUpdateStage(val as TicketStage)}
                      >
                        <SelectTrigger className="h-9 text-xs bg-background border-border/80 hover:border-primary/50 transition-colors">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="escalated_to_admin">Super Admin</SelectItem>
                          <SelectItem value="company_level">Company Boss</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Resolution Notes */}
                <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                      <Label className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Resolution Notes (For Field Records)
                      </Label>
                    </div>
                    {selectedTicket.status === "resolved" && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Resolved
                      </span>
                    )}
                  </div>
                  <textarea
                    value={resolutionNotes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResolutionNotes(e.target.value)}
                    placeholder="Document how this issue was resolved, actions taken, or fixes deployed..."
                    className="w-full text-xs min-h-[72px] rounded-lg border border-input bg-background p-3 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 leading-relaxed resize-y"
                  />
                  <div className="flex justify-end pt-1">
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus("resolved")}
                      className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 cursor-pointer font-bold px-3.5 shadow-sm transition-all"
                    >
                      <CheckCircle2 className="size-3.5" />
                      Save & Mark Resolved
                    </Button>
                  </div>
                </div>

                {/* Communication Thread */}
                <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3.5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="size-4 text-primary" />
                      <Label className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Messages & Activity
                      </Label>
                    </div>
                    <span className="text-[11px] font-semibold text-muted-foreground px-2 py-0.5 rounded-md bg-muted/60">
                      {selectedTicket.messages?.length || 0} messages
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                    {!selectedTicket.messages || selectedTicket.messages.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground text-xs italic">
                        No messages yet in this ticket thread. Send a reply below.
                      </div>
                    ) : (
                      selectedTicket.messages.map((msg) => {
                        const isAdmin = msg.senderRole === "super_admin"
                        return (
                          <div
                            key={msg.id}
                            className={`p-3 rounded-xl text-xs space-y-1.5 transition-all ${
                              isAdmin
                                ? "bg-primary/5 border border-primary/20 ml-6"
                                : "bg-muted/40 border border-border/60 mr-6"
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px]">
                              <span className={`font-bold flex items-center gap-1.5 ${isAdmin ? "text-primary" : "text-foreground"}`}>
                                {isAdmin ? <Shield className="size-3 text-primary" /> : <User className="size-3 text-muted-foreground" />}
                                {msg.senderName}
                                <span className="font-normal text-[10px] text-muted-foreground">
                                  ({isAdmin ? "Super Admin" : msg.senderRole === "boss" ? "Boss" : "Foreman"})
                                </span>
                              </span>
                              <span className="text-[10px] text-muted-foreground font-mono">
                                {formatTicketDate(msg.createdAt)}
                              </span>
                            </div>
                            <p className="text-foreground leading-relaxed whitespace-pre-line pl-4">
                              {msg.message}
                            </p>
                          </div>
                        )
                      })
                    )}
                  </div>

                  {/* Reply Input Box */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                    <Input
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendReply()
                        }
                      }}
                      placeholder="Type a response to the foreman or boss..."
                      className="h-9 text-xs rounded-lg flex-1 bg-background"
                    />
                    <Button
                      size="sm"
                      disabled={replying || !replyMessage.trim()}
                      onClick={handleSendReply}
                      className="h-9 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs gap-1.5 cursor-pointer shadow-sm"
                    >
                      {replying ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <>
                          <Send className="size-3.5" />
                          <span>Send</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Alert using standard Dialog */}
      <Dialog open={!!ticketToDelete} onOpenChange={(open: boolean) => !open && setTicketToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">
              Delete Ticket {ticketToDelete?.ticketNumber}?
            </DialogTitle>
            <DialogDescription className="text-xs">
              This will permanently delete this support ticket and all conversation messages from Supabase.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTicketToDelete(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmDelete}
              className="text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
