import * as React from "react"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  MOCK_SUBMISSIONS,
  MOCK_JOBSITES,
  MOCK_CERTIFICATIONS,
} from "@/data/safetyMockData"
import type { SubmissionRecord } from "@/types"
import {
  ShieldCheck,
  ClipboardCheck,
  AlertTriangle,
  HardHat,
  TrendingUp,
  Building2,
  Eye,
  CheckCircle2,
  Send,
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
  { date: "Sep 25", checklists: 42, talks: 28, jhas: 14, nearMiss: 2 },
  { date: "Sep 26", checklists: 48, talks: 32, jhas: 18, nearMiss: 1 },
  { date: "Sep 27", checklists: 55, talks: 30, jhas: 22, nearMiss: 0 },
  { date: "Sep 28", checklists: 60, talks: 35, jhas: 25, nearMiss: 3 },
  { date: "Sep 29", checklists: 68, talks: 38, jhas: 28, nearMiss: 1 },
  { date: "Sep 30", checklists: 74, talks: 42, jhas: 31, nearMiss: 0 },
  { date: "Oct 01", checklists: 82, talks: 45, jhas: 36, nearMiss: 1 },
]

export function SafetyDashboardView({
  onSelectSubmission,
  onOpenDispatch,
  onNavigateModule,
}: {
  onSelectSubmission: (submission: SubmissionRecord) => void
  onOpenDispatch: () => void
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

  const expiringCertsCount = MOCK_CERTIFICATIONS.filter(
    (c) => c.status === "expiring_soon" || c.status === "expired"
  ).length

  return (
    <div className="space-y-6">
      {/* Top Banner Alert Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary text-primary-foreground">
            <HardHat className="size-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              RRRM Safety Intelligence & Compliance Command
            </h2>
            <p className="text-xs text-muted-foreground">
              Monitoring {MOCK_JOBSITES.length} active high-risk jobsites & 100+ field tradesmen across Southern California.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            onClick={onOpenDispatch}
            className="text-xs font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send className="size-3.5" />
            Dispatch Field Alert
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <Card
          onClick={() => onNavigateModule("checklists")}
          className="cursor-pointer hover:border-primary/50 transition-colors"
        >
          <CardHeader>
            <CardDescription className="flex items-center justify-between">
              <span>Audits & Checklists</span>
              <ClipboardCheck className="size-4 text-primary" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold">148</CardTitle>
            <CardAction>
              <Badge variant="outline" className="text-emerald-600 border-emerald-500/20 bg-emerald-500/10">
                <TrendingUp className="size-3 mr-1" />
                100% Passed
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            18 pre-pour audits submitted this week
          </CardFooter>
        </Card>

        {/* Card 2 */}
        <Card
          onClick={() => onNavigateModule("jobsites")}
          className="cursor-pointer hover:border-primary/50 transition-colors"
        >
          <CardHeader>
            <CardDescription className="flex items-center justify-between">
              <span>Active Job Sites</span>
              <Building2 className="size-4 text-primary" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {MOCK_JOBSITES.length} Sites
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                36 Crew On-Site
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            All sites linked to Level-1 Trauma centers
          </CardFooter>
        </Card>

        {/* Card 3 */}
        <Card
          onClick={() => onNavigateModule("incidents")}
          className="cursor-pointer hover:border-primary/50 transition-colors"
        >
          <CardHeader>
            <CardDescription className="flex items-center justify-between">
              <span>Near Misses & Alerts</span>
              <AlertTriangle className="size-4 text-amber-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold">1 Alert</CardTitle>
            <CardAction>
              <Badge variant="outline" className="text-amber-600 border-amber-500/20 bg-amber-500/10">
                0 Lost Time
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            First-aid only; zero OSHA recordables
          </CardFooter>
        </Card>

        {/* Card 4 */}
        <Card
          onClick={() => onNavigateModule("workforce")}
          className="cursor-pointer hover:border-primary/50 transition-colors"
        >
          <CardHeader>
            <CardDescription className="flex items-center justify-between">
              <span>OSHA Safety Rating</span>
              <ShieldCheck className="size-4 text-emerald-600" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold">98.5%</CardTitle>
            <CardAction>
              <Badge variant="outline" className={expiringCertsCount > 0 ? "text-amber-600" : "text-emerald-600"}>
                {expiringCertsCount} Cert Renewal
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            Meets premier underwriter tier standards
          </CardFooter>
        </Card>
      </div>

      {/* Interactive Activity Trend Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base font-bold">
              Field Compliance Submissions Trend
            </CardTitle>
            <CardDescription className="text-xs">
              Live automated data sync from field foremen mobile apps (Daily Audits, Toolbox Talks, JHAs)
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync Active
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[220px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="safetyChecklists" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff4e00" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ff4e00" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="safetyTalks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
                <XAxis dataKey="date" stroke="currentColor" className="text-[11px] opacity-60" />
                <YAxis stroke="currentColor" className="text-[11px] opacity-60" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="checklists"
                  name="Safety Checklists"
                  stroke="#ff4e00"
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
          <div className="flex items-center justify-center gap-6 pt-3 text-xs text-muted-foreground border-t border-border/60">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-[#ff4e00]" />
              <span>Daily Pre-Pour & Hazard Audits</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-[#10b981]" />
              <span>Signed Toolbox Safety Talks</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-amber-500" />
              <span>Job Hazard Assessments (JHAs)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Data Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div>
            <CardTitle className="text-base font-bold">
              Recent Field Compliance Records
            </CardTitle>
            <CardDescription className="text-xs">
              Audits, signatures, and reports submitted in real-time from jobsite foremen
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Search record, site, trade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 rounded-lg border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary w-44 sm:w-56"
            />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
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
            <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
              <tr>
                <th className="px-4 py-3 font-semibold">Record / Module</th>
                <th className="px-4 py-3 font-semibold">Jobsite / Location</th>
                <th className="px-4 py-3 font-semibold">Foreman / Lead</th>
                <th className="px-4 py-3 font-semibold">Submitted</th>
                <th className="px-4 py-3 font-semibold">Status / Severity</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredSubmissions.map((sub) => {
                const isClaim = sub.moduleType === "claim_alert"
                const isNearMiss = sub.moduleType === "near_miss"

                return (
                  <tr
                    key={sub.id}
                    className="hover:bg-muted/30 transition-colors cursor-pointer group"
                    onClick={() => onSelectSubmission(sub)}
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {sub.title}
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                          {sub.moduleType.replace("_", " ").toUpperCase()}
                        </Badge>
                        <span>{sub.companyName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-foreground">{sub.jobSiteName}</div>
                      <div className="text-[11px] text-muted-foreground">Ref: {sub.jobSiteId}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-foreground">{sub.foremanName}</div>
                      <div className="text-[11px] text-muted-foreground">{sub.foremanEmail}</div>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">
                      {sub.timestamp}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {isClaim ? (
                          <Badge variant="destructive" className="text-[10px]">
                            Critical Incident
                          </Badge>
                        ) : isNearMiss ? (
                          <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/10 text-[10px]">
                            Near Miss Alert
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 bg-emerald-500/10 text-[10px] flex items-center gap-1">
                            <CheckCircle2 className="size-3" />
                            Compliant
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectSubmission(sub)
                        }}
                        className="h-7 text-xs gap-1"
                      >
                        <Eye className="size-3" />
                        View PDF
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
