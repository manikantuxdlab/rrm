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
  MOCK_DAILY_CHECKLIST_ITEMS,
  MOCK_SUBMISSIONS,
} from "@/data/safetyMockData"
import type { SubmissionRecord } from "@/types"
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Eye,
  Camera,
  Filter,
} from "lucide-react"

export function DailyChecklistsView({
  onSelectSubmission,
}: {
  onSelectSubmission: (submission: SubmissionRecord) => void
}) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all")
  const [activeTab, setActiveTab] = React.useState<"audits" | "checklist_template">("audits")

  const checklistSubmissions = MOCK_SUBMISSIONS.filter(
    (s) => s.moduleType === "daily_checklist"
  )

  const filteredChecklistItems = React.useMemo(() => {
    if (selectedCategory === "all") return MOCK_DAILY_CHECKLIST_ITEMS
    return MOCK_DAILY_CHECKLIST_ITEMS.filter((item) => item.category === selectedCategory)
  }, [selectedCategory])

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ClipboardCheck className="size-6 text-primary" />
            Daily Safety Audits & Field Inspections
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Mandatory pre-pour & start-of-shift OSHA hazard audits submitted daily by field foremen
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-border bg-muted p-1 text-xs">
            <button
              onClick={() => setActiveTab("audits")}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                activeTab === "audits"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Submitted Audits ({checklistSubmissions.length})
            </button>
            <button
              onClick={() => setActiveTab("checklist_template")}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                activeTab === "checklist_template"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Inspection Standard ({MOCK_DAILY_CHECKLIST_ITEMS.length} Items)
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Pre-Pour Audits Logged</CardDescription>
            <CardTitle className="text-2xl font-bold">148 Completed</CardTitle>
          </CardHeader>
          <CardFooter className="text-xs text-emerald-600 font-medium">
            100% daily compliance on active sites
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Deficiencies Identified & Corrected</CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-600">3 Corrected</CardTitle>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            Zero unresolved hazards at start of pour
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Digital Signatures Verified</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600">100% Verified</CardTitle>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            Timestamped & geo-tagged for Cal/OSHA audit trail
          </CardFooter>
        </Card>
      </div>

      {activeTab === "audits" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {checklistSubmissions.map((sub) => (
              <Card
                key={sub.id}
                className="hover:border-primary/40 transition-colors cursor-pointer"
                onClick={() => onSelectSubmission(sub)}
              >
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] uppercase font-mono">
                          {sub.id}
                        </Badge>
                        <Badge variant="outline" className="text-emerald-600 border-emerald-500/20 bg-emerald-500/10 text-[10px]">
                          <CheckCircle2 className="size-3 mr-1" />
                          Cal/OSHA Compliant
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-bold text-foreground">
                        {sub.title}
                      </CardTitle>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold text-foreground">{sub.timestamp}</div>
                      <div className="text-[11px] text-muted-foreground">Foreman: {sub.foremanName}</div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-muted/40 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Jobsite Location:</span>
                      <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                        <Building2 className="size-3.5 text-primary" />
                        {sub.jobSiteName}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Audit Results:</span>
                      <span className="font-semibold text-emerald-600 mt-0.5 block">
                        {sub.data.passedCount} Passed • {sub.data.failedCount} Corrected On-Site
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Photo Documentation:</span>
                      <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                        <Camera className="size-3.5 text-primary" />
                        {sub.data.photoCount} High-Res Evidence Photos
                      </span>
                    </div>
                  </div>

                  {sub.data.deficiencies && sub.data.deficiencies.length > 0 && (
                    <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 text-xs space-y-1">
                      <div className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="size-3.5" />
                        Identified & Immediate Corrective Actions:
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-muted-foreground pl-1">
                        {sub.data.deficiencies.map((def: string, i: number) => (
                          <li key={i} className="text-[11px]">{def}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex items-center justify-between border-t border-border/60 pt-3">
                  <div className="text-xs text-muted-foreground">
                    Emailed to: {sub.recipients.join(", ")}
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                    <Eye className="size-3" />
                    View Signed Audit PDF
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Filter className="size-3.5" /> Filter Category:
            </span>
            {["all", "ppe", "fall_protection", "ladders_scaffolds", "heavy_equipment", "fire_hazards"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs capitalize transition-colors ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.replace("_", " ")}
              </button>
            ))}
          </div>

          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Item #</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Inspection Standard (English & Spanish)</th>
                    <th className="px-4 py-3 font-semibold">Standard Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredChecklistItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-muted-foreground">
                        #{idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {item.category.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground">{item.labelEn}</div>
                        <div className="text-[11px] text-muted-foreground italic mt-0.5">
                          {item.labelEs}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {item.status === "pass" ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                            <CheckCircle2 className="size-3.5" />
                            Pass Required
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-600 font-semibold text-[11px]">
                            <AlertTriangle className="size-3.5" />
                            Deficiency Flag
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
