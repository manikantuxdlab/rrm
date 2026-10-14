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
  HardHat,
  Briefcase,
  Shield,
  RefreshCw,
  MessageSquare,
  MapPin,
  Tag,
  User,
  SlidersHorizontal,
  FileText,
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

const CATEGORY_LABELS: Record<TicketCategory, { label: string; color: string }> = {
  mobile_app: { label: "Mobile App & Sync", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  incident_claim: { label: "Incident & Claim", color: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
  coi_billing: { label: "Insurance & COI", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  osha_compliance: { label: "OSHA & Talks", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  jobsite_access: { label: "Jobsite & Badges", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  general: { label: "General Inquiries", color: "bg-muted text-muted-foreground border-border" },
}

const PRIORITY_BADGES: Record<TicketPriority, { label: string; color: string }> = {
  urgent: { label: "Urgent", color: "bg-destructive/15 text-destructive border-destructive/30" },
  high: { label: "High", color: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  medium: { label: "Medium", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  low: { label: "Low", color: "bg-muted text-muted-foreground border-border" },
}

const STATUS_BADGES: Record<TicketStatus, { label: string; color: string }> = {
  open: { label: "Open", color: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
  in_progress: { label: "In Progress", color: "bg-blue-500/10 text-blue-600 border-blue-500/30" },
  waiting_on_user: { label: "Waiting On Field", color: "bg-purple-500/10 text-purple-600 border-purple-500/30" },
  resolved: { label: "Resolved", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" },
  closed: { label: "Closed", color: "bg-muted text-muted-foreground border-border" },
}

const ASSIGNEE_BADGES: Record<TicketStage, { label: string; color: string; icon: React.ReactNode }> = {
  company_level: {
    label: "Company Boss",
    color: "bg-amber-500/10 text-amber-700 border-amber-500/30",
    icon: <Briefcase className="size-3 mr-1" />,
  },
  escalated_to_admin: {
    label: "Super Admin",
    color: "bg-blue-500/10 text-blue-700 border-blue-500/30",
    icon: <Shield className="size-3 mr-1" />,
  },
  resolved_by_boss: {
    label: "Company Boss",
    color: "bg-muted text-muted-foreground border-border",
    icon: <CheckCircle2 className="size-3 mr-1" />,
  },
  resolved_by_admin: {
    label: "Super Admin",
    color: "bg-muted text-muted-foreground border-border",
    icon: <CheckCircle2 className="size-3 mr-1" />,
  },
}

export function SupportTicketsView() {
  const [tickets, setTickets] = React.useState<SupportTicket[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedTicket, setSelectedTicket] = React.useState<SupportTicket | null>(null)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)
  const [ticketToDelete, setTicketToDelete] = React.useState<SupportTicket | null>(null)

  // Filters & Search
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [priorityFilter, setPriorityFilter] = React.useState<string>("all")
  const [stageFilter, setStageFilter] = React.useState<string>("all")

  // Pagination: Default 20, options [20, 50, 100]
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(20)

  // Response form inside drawer
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

      const matchesStatus = statusFilter === "all" || t.status === statusFilter
      const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter
      const matchesStage = stageFilter === "all" || t.stage === stageFilter

      return matchesSearch && matchesStatus && matchesPriority && matchesStage
    })
  }, [tickets, searchQuery, statusFilter, priorityFilter, stageFilter])

  // KPI calculations
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
  }, [searchQuery, statusFilter, priorityFilter, stageFilter, pageSize])

  // Table Columns
  const columns: DataTableColumn<SupportTicket>[] = [
    {
      key: "ticketNumber",
      header: "Ticket ID",
      className: "font-mono font-bold text-xs text-primary min-w-[100px]",
      cell: (ticket) => (
        <span className="font-mono font-bold text-xs text-primary cursor-pointer hover:underline" onClick={() => handleOpenTicket(ticket)}>
          {ticket.ticketNumber}
        </span>
      ),
    },
    {
      key: "subject",
      header: "Subject & Company",
      className: "min-w-[280px]",
      cell: (ticket) => (
        <div className="space-y-0.5 cursor-pointer" onClick={() => handleOpenTicket(ticket)}>
          <div className="font-semibold text-xs text-foreground line-clamp-1 hover:text-primary transition-colors">
            {ticket.subject}
          </div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 line-clamp-1">
            <Building2 className="size-3 text-muted-foreground/70" />
            <span>{ticket.companyName}</span>
            {ticket.jobsiteName && (
              <>
                <span className="text-muted-foreground/40">•</span>
                <span className="text-[10px] text-muted-foreground/80">{ticket.jobsiteName}</span>
              </>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "requester",
      header: "Requester",
      className: "min-w-[160px]",
      cell: (ticket) => {
        const isForeman = ticket.userRole === "foreman"
        return (
          <div className="space-y-0.5">
            <div className="text-xs font-medium text-foreground flex items-center gap-1.5">
              {isForeman ? <HardHat className="size-3.5 text-amber-600" /> : <Briefcase className="size-3.5 text-primary" />}
              <span>{ticket.userName}</span>
            </div>
            <div className="text-[10.5px] text-muted-foreground font-mono">
              {ticket.userRole === "foreman" ? "Site Foreman" : "Boss / Owner"}
            </div>
          </div>
        )
      },
    },
    {
      key: "category",
      header: "Category",
      className: "min-w-[140px]",
      cell: (ticket) => {
        const cat = CATEGORY_LABELS[ticket.category] || { label: ticket.category, color: "bg-muted text-muted-foreground" }
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${cat.color}`}>
            {cat.label}
          </span>
        )
      },
    },
    {
      key: "stage",
      header: "Assigned To",
      className: "min-w-[140px]",
      cell: (ticket) => {
        const asg = ASSIGNEE_BADGES[ticket.stage] || { label: "Super Admin", color: "bg-muted text-muted-foreground", icon: null }
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10.5px] font-semibold border ${asg.color}`}>
            {asg.icon}
            {asg.label}
          </span>
        )
      },
    },
    {
      key: "priority",
      header: "Priority",
      className: "min-w-[90px]",
      cell: (ticket) => {
        const pri = PRIORITY_BADGES[ticket.priority] || { label: ticket.priority, color: "bg-muted text-muted-foreground" }
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${pri.color}`}>
            {pri.label}
          </span>
        )
      },
    },
    {
      key: "status",
      header: "Status",
      className: "min-w-[110px]",
      cell: (ticket) => {
        const stat = STATUS_BADGES[ticket.status] || { label: ticket.status, color: "bg-muted text-muted-foreground" }
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold border ${stat.color}`}>
            {stat.label}
          </span>
        )
      },
    },
    {
      key: "createdAt",
      header: "Created",
      className: "min-w-[100px] text-muted-foreground text-xs font-mono",
      cell: (ticket) => ticket.createdAt,
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
            onClick={() => handleOpenTicket(ticket)}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
            title="View Details"
          >
            <Eye className="size-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setTicketToDelete(ticket)}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive cursor-pointer"
            title="Delete Ticket"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <LifeBuoy className="size-5 text-primary" />
              Support Ticket Management
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Track, review, and resolve field safety inquiries, jobsite issues, and contractor support requests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadTickets}
            className="h-9 gap-1.5 text-xs cursor-pointer font-medium"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* 2. KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-border/70 bg-card shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Tickets</span>
            <Layers className="size-4 text-primary" />
          </div>
          <div className="text-2xl font-black text-foreground">{totalCount}</div>
          <div className="text-[10px] text-muted-foreground">All logged tickets in Supabase</div>
        </div>

        <div className="p-3.5 rounded-xl border border-border/70 bg-card shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">Open / Pending</span>
            <Clock className="size-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600">{openCount}</div>
          <div className="text-[10px] text-muted-foreground">Awaiting resolution</div>
        </div>

        <div className="p-3.5 rounded-xl border border-border/70 bg-card shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">Super Admin Desk</span>
            <Shield className="size-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-600">{escalatedCount}</div>
          <div className="text-[10px] text-muted-foreground">{urgentCount} High/Urgent priority</div>
        </div>

        <div className="p-3.5 rounded-xl border border-border/70 bg-card shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="size-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{resolvedCount}</div>
          <div className="text-[10px] text-muted-foreground">Successfully closed</div>
        </div>
      </div>

      {/* 3. Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        <div className="relative w-full sm:w-64 md:w-72 shrink-0">
          <Search className="size-3.5 absolute left-2.5 top-2.5 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets, company, requester..."
            className="pl-8 pr-7 text-xs h-8.5 bg-background rounded-lg border-border"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-2 text-muted-foreground hover:text-foreground cursor-pointer rounded-full p-0.5 hover:bg-muted"
              title="Clear search"
            >
              <span className="text-xs font-semibold">✕</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-start sm:justify-end">
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 text-xs w-[130px] rounded-lg">
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

          {/* Priority Filter */}
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="h-9 text-xs w-[130px] rounded-lg">
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

          {/* Assigned To Filter */}
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="h-8.5 text-xs w-[145px] rounded-lg">
              <SelectValue placeholder="Assigned: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              <SelectItem value="escalated_to_admin">Super Admin</SelectItem>
              <SelectItem value="company_level">Company Boss</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 4. Global Data Table */}
      <div className="rounded-xl border border-border/70 bg-card shadow-2xs overflow-hidden">
        <GlobalDataTable<SupportTicket>
          columns={columns}
          data={paginatedTickets}
          keyExtractor={(ticket) => ticket.id}
          isLoading={loading}
          emptyMessage="No support tickets found matching criteria."
        />
      </div>

      {/* 5. Global Pagination (Outside the Table Card) */}
      <DataTablePagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={filteredTickets.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[20, 50, 100]}
        itemLabel="tickets"
      />

      {/* 5. Ticket Detail & Resolution Sheet (Drawer) */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl md:max-w-3xl lg:max-w-[760px] xl:max-w-[800px] overflow-hidden flex flex-col p-0 shadow-2xl border-l border-border/80 bg-background">
          {selectedTicket && (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Header */}
              <SheetHeader className="px-6 py-5 border-b border-border/60 bg-muted/30 pr-14">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold tracking-wider px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">
                      {selectedTicket.ticketNumber}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_BADGES[selectedTicket.status].color}`}>
                      {STATUS_BADGES[selectedTicket.status].label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${PRIORITY_BADGES[selectedTicket.priority].color}`}>
                      {PRIORITY_BADGES[selectedTicket.priority].label} Priority
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-left space-y-1">
                  <SheetTitle className="text-lg font-bold text-foreground tracking-tight leading-snug">
                    {selectedTicket.subject}
                  </SheetTitle>
                  <SheetDescription className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                    <span>Logged on <strong className="font-semibold text-foreground">{selectedTicket.createdAt}</strong></span>
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
                {/* 1. Context Information Card */}
                <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block flex items-center gap-1.5">
                        <Building2 className="size-3.5 text-primary" />
                        Company
                      </span>
                      <p className="font-semibold text-sm text-foreground">
                        {selectedTicket.companyName}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block flex items-center gap-1.5">
                        <Tag className="size-3.5 text-primary" />
                        Category
                      </span>
                      <p className="font-semibold text-sm text-foreground">
                        {CATEGORY_LABELS[selectedTicket.category]?.label || selectedTicket.category}
                      </p>
                    </div>

                    {selectedTicket.jobsiteName && (
                      <div className="col-span-1 sm:col-span-2 pt-3 border-t border-border/40 space-y-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block flex items-center gap-1.5">
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

                {/* 2. Initial Issue Description */}
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

                {/* 3. Quick Admin Controls (Status & Priority) */}
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="size-3.5 text-primary" />
                    <Label className="text-xs font-bold text-primary uppercase tracking-wider">
                      Quick Status & Priority Controls
                    </Label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                  </div>
                </div>

                {/* 4. Resolution Notes */}
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

                {/* 5. Communication Thread */}
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
                    {(!selectedTicket.messages || selectedTicket.messages.length === 0) ? (
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
                                {msg.createdAt.split("T")[0]}
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
