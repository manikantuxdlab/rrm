import * as React from "react"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MOCK_SUBMISSIONS, MOCK_COMPANIES } from "@/data/safetyMockData"
import type { SubmissionRecord } from "@/types"
import {
  FileText,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Building2,
  User,
  ClipboardCheck,
  MessageSquareCheck,
  Truck,
  ShieldAlert,
  Calendar,
} from "lucide-react"

interface FieldSubmissionsViewProps {
  onSelectSubmission: (submission: SubmissionRecord) => void
  onOpenDispatch?: () => void
}

const moduleFilters = [
  { key: "all", label: "All Submissions" },
  { key: "claim_alert", label: "Claims & Incidents" },
  { key: "daily_checklist", label: "Daily Checklists" },
  { key: "toolbox_talk", label: "Toolbox Rosters" },
  { key: "jha", label: "JHA Assessments" },
  { key: "near_miss", label: "Near-Miss Hazards" },
  { key: "customer_coi", label: "COI Requests" },
  { key: "equipment_inspection", label: "Equipment Inspections" },
]

export function FieldSubmissionsView({
  onSelectSubmission,
  onOpenDispatch,
}: FieldSubmissionsViewProps) {
  const [activeTab, setActiveTab] = React.useState<string>("all")
  const [searchQuery, setSearchQuery] = React.useState<string>("")
  const [selectedCompany, setSelectedCompany] = React.useState<string>("all")
  const [selectedSyncStatus, setSelectedSyncStatus] = React.useState<string>("all")

  const filteredSubmissions = React.useMemo(() => {
    return MOCK_SUBMISSIONS.filter((item) => {
      const matchesTab = activeTab === "all" || item.moduleType === activeTab
      const matchesCompany =
        selectedCompany === "all" || item.companyName === selectedCompany
      const matchesSync =
        selectedSyncStatus === "all" || item.syncStatus === selectedSyncStatus
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.foremanName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.jobSiteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.companyName.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesTab && matchesCompany && matchesSync && matchesSearch
    })
  }, [activeTab, searchQuery, selectedCompany, selectedSyncStatus])

  const getModuleIcon = (type: string) => {
    switch (type) {
      case "claim_alert":
        return <AlertTriangle className="size-4 text-destructive" />
      case "daily_checklist":
        return <ClipboardCheck className="size-4 text-primary" />
      case "toolbox_talk":
        return <MessageSquareCheck className="size-4 text-emerald-600" />
      case "jha":
        return <ShieldAlert className="size-4 text-amber-600" />
      case "near_miss":
        return <AlertTriangle className="size-4 text-amber-500" />
      case "equipment_inspection":
      case "add_equipment":
        return <Truck className="size-4 text-blue-600" />
      default:
        return <FileText className="size-4 text-muted-foreground" />
    }
  }

  const getSyncBadge = (status: string) => {
    switch (status) {
      case "synced":
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[11px] font-medium gap-1">
            <CheckCircle2 className="size-3" /> Synced
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[11px] font-medium gap-1">
            <Clock className="size-3" /> Pending Sync
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-[11px] font-medium gap-1">
            <AlertTriangle className="size-3" /> Sync Failed
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground text-[11px]">
            Draft
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <FileText className="size-6 text-primary" />
            Field Submissions & Sync Monitoring
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Section 7 & 8 Requirement: Real-time record audit, signed field rosters, claims triage, photos and sync queue.
          </p>
        </div>
        {onOpenDispatch && (
          <Button
            size="sm"
            onClick={onOpenDispatch}
            className="text-xs font-semibold gap-1.5 bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            <Send className="size-3.5" /> Emergency Dispatch Notice
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b">
        {moduleFilters.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, foreman, company, or jobsite..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <select
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          className="h-9 px-3 rounded-md border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">All Companies</option>
          {MOCK_COMPANIES.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={selectedSyncStatus}
          onChange={(e) => setSelectedSyncStatus(e.target.value)}
          className="h-9 px-3 rounded-md border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">All Sync States</option>
          <option value="synced">Synced</option>
          <option value="pending">Pending Sync</option>
          <option value="failed">Sync Failed</option>
        </select>
      </div>

      {/* Submissions List */}
      <div className="space-y-3">
        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-12 border rounded-xl bg-card text-muted-foreground">
            <FileText className="size-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">No submission records found</p>
            <p className="text-xs mt-1">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          filteredSubmissions.map((sub) => (
            <Card
              key={sub.id}
              className="hover:border-primary/40 transition-all cursor-pointer bg-card"
              onClick={() => onSelectSubmission(sub)}
            >
              <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-lg bg-muted border shrink-0 mt-0.5">
                    {getModuleIcon(sub.moduleType)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-sm text-foreground hover:text-primary transition-colors">
                        {sub.title}
                      </h4>
                      {getSyncBadge(sub.syncStatus)}
                      {sub.severity === "critical" && (
                        <Badge variant="destructive" className="text-[10px] uppercase">
                          Critical
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <Building2 className="size-3 text-muted-foreground" /> {sub.companyName}
                      </span>
                      <span>Jobsite: {sub.jobSiteName}</span>
                      <span className="flex items-center gap-1">
                        <User className="size-3" /> {sub.foremanName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" /> {sub.timestamp}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8 gap-1.5"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectSubmission(sub)
                    }}
                  >
                    <Eye className="size-3.5" /> View Record & PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
