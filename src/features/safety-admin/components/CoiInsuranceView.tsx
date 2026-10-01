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
import {
  MOCK_SAVED_SUBCONTRACTORS,
  MOCK_SUBMISSIONS,
} from "@/data/safetyMockData"
import type { SubmissionRecord } from "@/types"
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Eye,
} from "lucide-react"

export function CoiInsuranceView({
  onSelectSubmission,
  onOpenIssueCoi,
}: {
  onSelectSubmission: (submission: SubmissionRecord) => void
  onOpenIssueCoi: () => void
}) {
  const [activeTab, setActiveTab] = React.useState<"subcontractors" | "issued_cois">("subcontractors")

  const coiSubmissions = MOCK_SUBMISSIONS.filter((s) => s.moduleType === "customer_coi")

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="size-6 text-emerald-600" />
            Certificates of Insurance (COI) & Subcontractor Compliance
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            ACORD 25 automated certificate generation, additional insured endorsements, and trade vendor tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={onOpenIssueCoi}
            className="text-xs font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-3.5" />
            Issue ACORD Certificate
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Subcontractors Monitored</CardDescription>
            <CardTitle className="text-2xl font-bold">
              {MOCK_SAVED_SUBCONTRACTORS.length} Vendors
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-xs text-emerald-600 font-medium">
            100% verified with primary & non-contributory endorsements
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Expiring Within 30 Days</CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-600">1 Expiring</CardTitle>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            Apex Ready-Mix (Renewal reminder sent)
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Instant Turnaround Speed</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600">&lt; 30 Seconds</CardTitle>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            Automated PDF dispatch directly to GC project safety inbox
          </CardFooter>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-lg border border-border bg-muted p-1 text-xs">
          <button
            onClick={() => setActiveTab("subcontractors")}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              activeTab === "subcontractors"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Subcontractor Vendor COIs ({MOCK_SAVED_SUBCONTRACTORS.length})
          </button>
          <button
            onClick={() => setActiveTab("issued_cois")}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              activeTab === "issued_cois"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Issued Project COIs ({coiSubmissions.length})
          </button>
        </div>
      </div>

      {activeTab === "subcontractors" ? (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-semibold">Subcontractor Entity</th>
                  <th className="px-4 py-3 font-semibold">Trade Specialty</th>
                  <th className="px-4 py-3 font-semibold">Contact & Dispatch</th>
                  <th className="px-4 py-3 font-semibold">Endorsed Policy Limits</th>
                  <th className="px-4 py-3 font-semibold">Expiration Date</th>
                  <th className="px-4 py-3 font-semibold">COI Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {MOCK_SAVED_SUBCONTRACTORS.map((sub) => {
                  const isExpiring = sub.coiStatus === "expiring"
                  return (
                    <tr key={sub.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-foreground">{sub.name}</div>
                        <div className="text-[11px] text-muted-foreground">ID: {sub.id}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant="outline" className="text-[10px]">
                          {sub.trade}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-foreground font-medium">{sub.contact}</div>
                        <div className="text-[11px] text-muted-foreground">{sub.email}</div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[11px] text-muted-foreground">
                        {sub.defaultLimits}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">
                        {sub.expiresDate}
                      </td>
                      <td className="px-4 py-3.5">
                        {isExpiring ? (
                          <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/10 text-[10px] flex items-center gap-1">
                            <AlertTriangle className="size-3" />
                            Expiring Soon
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 bg-emerald-500/10 text-[10px] flex items-center gap-1">
                            <CheckCircle2 className="size-3" />
                            Active & Compliant
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                          <Eye className="size-3" />
                          View ACORD
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {coiSubmissions.map((sub) => (
            <Card
              key={sub.id}
              className="hover:border-primary/40 transition-colors cursor-pointer"
              onClick={() => onSelectSubmission(sub)}
            >
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {sub.id}
                      </Badge>
                      <Badge variant="outline" className="text-emerald-600 border-emerald-500/20 bg-emerald-500/10 text-[10px]">
                        <CheckCircle2 className="size-3 mr-1" />
                        ACORD 25 Issued
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-bold text-foreground">
                      {sub.title}
                    </CardTitle>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-foreground">{sub.timestamp}</div>
                    <div className="text-[11px] text-muted-foreground">Requested by: {sub.foremanName}</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-muted/40">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Certificate Holder (GC):</span>
                    <span className="font-semibold text-foreground">{sub.data.certificateHolder}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Project Name:</span>
                    <span className="font-semibold text-foreground">{sub.jobSiteName}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    Mandatory Policy Endorsements Attached:
                  </span>
                  <div className="text-muted-foreground mt-0.5">
                    {sub.data.specialEndorsements}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex items-center justify-between border-t border-border/60 pt-3">
                <span className="text-xs text-muted-foreground">
                  Dispatched directly to: {sub.recipients.join(", ")}
                </span>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                  <Eye className="size-3" />
                  View Issued Certificate
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
