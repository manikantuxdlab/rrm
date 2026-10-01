import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  MOCK_CREW,
  MOCK_CERTIFICATIONS,
} from "@/data/safetyMockData"
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
} from "lucide-react"

export function WorkforceBadgesView() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeTab, setActiveTab] = React.useState<"workers" | "certifications">("workers")

  const filteredWorkers = React.useMemo(() => {
    return MOCK_CREW.filter(
      (w) =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.trade.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  const expiringCount = MOCK_CERTIFICATIONS.filter(
    (c) => c.status === "expiring_soon" || c.status === "expired"
  ).length

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Award className="size-6 text-primary" />
            Workforce Certifications & OSHA Badging
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            OSHA 10/30-Hour cards, CPR/First Aid, Competent Person qualifications & digital credential verification
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-border bg-muted p-1 text-xs">
            <button
              onClick={() => setActiveTab("workers")}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                activeTab === "workers"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Field Tradesmen ({MOCK_CREW.length})
            </button>
            <button
              onClick={() => setActiveTab("certifications")}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                activeTab === "certifications"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Credentials ({MOCK_CERTIFICATIONS.length})
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Certified Tradesmen</CardDescription>
            <CardTitle className="text-2xl font-bold">{MOCK_CREW.length} Workers</CardTitle>
          </CardHeader>
          <CardFooter className="text-xs text-emerald-600 font-medium">
            100% OSHA 10/30 certified on commercial jobsites
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Certifications Expiring / Due</CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-600">
              {expiringCount} Renewal Actions
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            Scaffold Competent Person & Fall Protection recertification pending
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>First Aid / CPR Qualified Leads</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600">100% Coverage</CardTitle>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            Designated first-aid responders on every active deck
          </CardFooter>
        </Card>
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="size-3.5 absolute left-3 top-2.5 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search worker name, role, or trade..."
          className="pl-8 text-xs h-9"
        />
      </div>

      {activeTab === "workers" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkers.map((worker) => (
            <Card key={worker.id} className="hover:border-primary/40 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {worker.id}
                  </Badge>
                  <span className="text-emerald-600 text-[11px] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="size-3" />
                    Active Crew
                  </span>
                </div>
                <CardTitle className="text-base font-bold text-foreground mt-1">
                  {worker.name}
                </CardTitle>
                <CardDescription className="text-xs">
                  {worker.role} • {worker.trade}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-2 text-xs">
                <div className="font-semibold text-muted-foreground text-[11px]">
                  Verified Jobsite Credentials:
                </div>
                <div className="space-y-1.5">
                  {worker.certifications.map((cert, i) => {
                    const isValid = cert.status === "valid"
                    const isExpiring = cert.status === "expiring_soon"

                    return (
                      <div
                        key={i}
                        className="p-2 rounded-lg bg-muted/40 border border-border/60 flex items-center justify-between text-[11px]"
                      >
                        <div className="font-medium text-foreground">{cert.name}</div>
                        <div>
                          {isValid ? (
                            <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 bg-emerald-500/10 text-[9px]">
                              Valid
                            </Badge>
                          ) : isExpiring ? (
                            <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/10 text-[9px]">
                              Due Soon
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-[9px]">
                              Expired
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>

              <CardFooter className="text-[11px] text-muted-foreground border-t border-border/60 pt-3 flex items-center justify-between">
                <span>Phone: {worker.phone}</span>
                <Button size="sm" variant="outline" className="h-6 text-[10px]">
                  View OSHA Card
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-semibold">Worker Name</th>
                  <th className="px-4 py-3 font-semibold">Certification Type</th>
                  <th className="px-4 py-3 font-semibold">Credential #</th>
                  <th className="px-4 py-3 font-semibold">Issuing Body</th>
                  <th className="px-4 py-3 font-semibold">Valid Period</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {MOCK_CERTIFICATIONS.map((cert) => {
                  const isValid = cert.status === "valid"
                  const isExpiring = cert.status === "expiring_soon"

                  return (
                    <tr key={cert.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-foreground">{cert.workerName}</div>
                        <div className="text-[11px] text-muted-foreground">{cert.companyName}</div>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-foreground">
                        {cert.certType}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[11px] text-muted-foreground">
                        {cert.certNumber}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">
                        {cert.issuer}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">
                        {cert.issueDate} → {cert.expirationDate}
                      </td>
                      <td className="px-4 py-3.5">
                        {isValid ? (
                          <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 bg-emerald-500/10 text-[10px] flex items-center gap-1">
                            <CheckCircle2 className="size-3" />
                            Valid
                          </Badge>
                        ) : isExpiring ? (
                          <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/10 text-[10px] flex items-center gap-1">
                            <AlertTriangle className="size-3" />
                            Expiring Soon
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-[10px] flex items-center gap-1">
                            <XCircle className="size-3" />
                            Expired
                          </Badge>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
