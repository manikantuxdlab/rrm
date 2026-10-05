import * as React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  MOCK_SUBMISSIONS,
  MOCK_JOBSITES,
} from "@/data/safetyMockData"
import type { SubmissionRecord } from "@/types"
import {
  ShieldCheck,
  ClipboardCheck,
  AlertTriangle,
  TrendingUp,
  Building2,
  Eye,
  CheckCircle2,
  Search,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

const chartData = [
  { date: "Sep 25", checklists: 42, talks: 28 },
  { date: "Sep 26", checklists: 48, talks: 32 },
  { date: "Sep 27", checklists: 55, talks: 30 },
  { date: "Sep 28", checklists: 60, talks: 35 },
  { date: "Sep 29", checklists: 68, talks: 38 },
  { date: "Sep 30", checklists: 74, talks: 42 },
  { date: "Oct 01", checklists: 82, talks: 45 },
]

export function SafetyDashboardView({
  onSelectSubmission,
  onOpenDispatch: _onOpenDispatch,
  onNavigateModule,
}: {
  onSelectSubmission: (submission: SubmissionRecord) => void
  onOpenDispatch?: () => void
  onNavigateModule: (moduleKey: string) => void
}) {
  const [selectedFilter, setSelectedFilter] = React.useState<string>("all")
  const [searchQuery, setSearchQuery] = React.useState<string>("")

  const filteredSubmissions = React.useMemo(() => {
    return MOCK_SUBMISSIONS.filter((sub) => {
      const matchesFilter =
        selectedFilter === "all" || sub.moduleType === selectedFilter
      const matchesSearch =
        sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.jobSiteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.foremanName.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesFilter && matchesSearch
    })
  }, [selectedFilter, searchQuery])

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <Card
          onClick={() => onNavigateModule("safety-config")}
          className="cursor-pointer hover:border-primary/40 transition-colors shadow-none"
        >
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-medium text-muted-foreground">
              Daily Safety Audits
            </span>
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <ClipboardCheck className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              148
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center text-emerald-600 font-medium">
                <TrendingUp className="size-3 mr-0.5" /> 100%
              </span>
              <span>passed this week</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2 */}
        <Card
          onClick={() => onNavigateModule("jobsites")}
          className="cursor-pointer hover:border-primary/40 transition-colors shadow-none"
        >
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-medium text-muted-foreground">
              Active Job Sites
            </span>
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Building2 className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {MOCK_JOBSITES.length} Sites
            </div>
            <div className="text-xs text-muted-foreground">
              36 Crew members on-site
            </div>
          </CardContent>
        </Card>

        {/* Card 3 */}
        <Card
          onClick={() => onNavigateModule("submissions")}
          className="cursor-pointer hover:border-primary/40 transition-colors shadow-none"
        >
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-medium text-muted-foreground">
              Near Misses & Alerts
            </span>
            <div className="size-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
              <AlertTriangle className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              1 Alert
            </div>
            <div className="text-xs text-muted-foreground">
              0 Lost time incidents
            </div>
          </CardContent>
        </Card>

        {/* Card 4 */}
        <Card
          onClick={() => onNavigateModule("workforce")}
          className="cursor-pointer hover:border-primary/40 transition-colors shadow-none"
        >
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-medium text-muted-foreground">
              OSHA Safety Rating
            </span>
            <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              98.5%
            </div>
            <div className="text-xs text-muted-foreground">
              Meets premier underwriter tier
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <Card className="shadow-none">
        <CardHeader className="pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold text-foreground">
              Field Compliance Submissions Trend
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live automated data sync from field foremen mobile apps
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-md font-medium">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync Active
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="safetyChecklists" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="safetyTalks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" vertical={false} />
                <XAxis dataKey="date" stroke="currentColor" className="text-[11px] opacity-60" tickLine={false} />
                <YAxis stroke="currentColor" className="text-[11px] opacity-60" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "0.5rem",
                    fontSize: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="checklists"
                  name="Safety Checklists"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#safetyChecklists)"
                />
                <Area
                  type="monotone"
                  dataKey="talks"
                  name="Toolbox Talks"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#safetyTalks)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 pt-3 text-xs text-muted-foreground border-t mt-2">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary" />
              <span>Daily Pre-Pour & Hazard Audits</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#10b981]" />
              <span>Signed Toolbox Safety Talks</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Data Table */}
      <Card className="shadow-none">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b">
          <div>
            <CardTitle className="text-sm font-semibold text-foreground">
              Recent Field Compliance Records
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Audits, signatures, and reports submitted in real-time
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-48 sm:w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs bg-background"
              />
            </div>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Modules</option>
              <option value="daily_checklist">Daily Checklists</option>
              <option value="toolbox_talk">Toolbox Talks</option>
              <option value="jha">JHA Assessments</option>
              <option value="claim_alert">Claim Alerts</option>
              <option value="near_miss">Near Miss</option>
              <option value="customer_coi">COI Requests</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 text-muted-foreground text-xs font-medium border-b">
              <tr>
                <th className="px-4 py-3">Record / Module</th>
                <th className="px-4 py-3">Jobsite / Location</th>
                <th className="px-4 py-3">Foreman / Lead</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => {
                  const isClaim = sub.moduleType === "claim_alert"
                  const isNearMiss = sub.moduleType === "near_miss"

                  return (
                    <tr
                      key={sub.id}
                      className="hover:bg-muted/30 transition-colors cursor-pointer group"
                      onClick={() => onSelectSubmission(sub)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {sub.title}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {sub.companyName}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <span className="text-foreground font-medium">{sub.jobSiteName}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <span className="text-foreground">{sub.foremanName}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {sub.timestamp}
                      </td>
                      <td className="px-4 py-3">
                        {isClaim ? (
                          <Badge variant="destructive" className="text-[10px] font-normal py-0 px-2">
                            Critical Alert
                          </Badge>
                        ) : isNearMiss ? (
                          <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/10 text-[10px] font-normal py-0 px-2">
                            Near Miss
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 bg-emerald-500/10 text-[10px] font-normal py-0 px-2 gap-1">
                            <CheckCircle2 className="size-2.5" /> Compliant
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation()
                            onSelectSubmission(sub)
                          }}
                        >
                          <Eye className="size-3.5" /> View
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
