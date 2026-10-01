import * as React from "react"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  MOCK_JHA_TEMPLATES,
  MOCK_SUBMISSIONS,
} from "@/data/safetyMockData"
import type { SubmissionRecord, JHATemplate } from "@/types"
import {
  FileText,
  ShieldAlert,
  HardHat,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Search,
} from "lucide-react"

export function JhaAssessmentsView({
  onSelectSubmission,
}: {
  onSelectSubmission: (submission: SubmissionRecord) => void
}) {
  const [selectedJha, setSelectedJha] = React.useState<JHATemplate | null>(
    MOCK_JHA_TEMPLATES[0] || null
  )
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeTab, setActiveTab] = React.useState<"templates" | "field_jhas">("templates")

  const jhaSubmissions = MOCK_SUBMISSIONS.filter((s) => s.moduleType === "jha")

  const filteredTemplates = React.useMemo(() => {
    return MOCK_JHA_TEMPLATES.filter(
      (j) =>
        j.activity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.trade.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ShieldAlert className="size-6 text-primary" />
            Job Hazard Analyses (JHA) & Risk Assessments
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Pre-task hazard assessments, engineering controls, and mandatory PPE matrices for high-risk operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-border bg-muted p-1 text-xs">
            <button
              onClick={() => setActiveTab("templates")}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                activeTab === "templates"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Master JHA Templates ({MOCK_JHA_TEMPLATES.length})
            </button>
            <button
              onClick={() => setActiveTab("field_jhas")}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                activeTab === "field_jhas"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Field JHA Records ({jhaSubmissions.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === "templates" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Templates list */}
          <div className="lg:col-span-5 space-y-3">
            <div className="relative">
              <Search className="size-3.5 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search high-risk activity or trade..."
                className="pl-8 text-xs h-9"
              />
            </div>

            <div className="space-y-2">
              {filteredTemplates.map((template) => {
                const isSelected = selectedJha?.id === template.id
                return (
                  <div
                    key={template.id}
                    onClick={() => setSelectedJha(template)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs space-y-1.5 ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/30"
                        : "border-border bg-card hover:bg-muted/40 hover:border-border/80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px]">
                        {template.trade}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {template.id}
                      </span>
                    </div>

                    <div className="font-semibold text-foreground text-sm">
                      {template.activity}
                    </div>

                    <div className="text-[11px] text-muted-foreground line-clamp-1">
                      {template.hazards.length} Critical Hazards • {template.controlMeasures.length} Controls
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* JHA Template Details */}
          <div className="lg:col-span-7">
            {selectedJha ? (
              <Card className="h-full flex flex-col justify-between">
                <CardHeader className="space-y-2 border-b border-border/60 pb-4">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-primary text-primary-foreground font-bold">
                      {selectedJha.trade}
                    </Badge>
                    <Badge variant="outline" className="text-emerald-600 border-emerald-500/20 bg-emerald-500/10">
                      OSHA 1926 Standard
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bold text-foreground">
                    {selectedJha.activity}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4 pt-4 text-xs">
                  {/* Required PPE Matrix */}
                  <div className="space-y-2">
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      <HardHat className="size-3.5 text-primary" />
                      Required Personal Protective Equipment (PPE Matrix):
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedJha.requiredPPE.map((ppe, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 p-2 rounded-lg bg-muted/40 border border-border/60 text-[11px]"
                        >
                          <CheckCircle2 className="size-3 text-primary shrink-0" />
                          <span className="text-foreground font-medium">{ppe}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Potential Hazards */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-destructive/5 border border-destructive/20">
                    <div className="font-semibold text-destructive flex items-center gap-1.5">
                      <AlertTriangle className="size-3.5" />
                      Identified High-Risk Activity Hazards:
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
                      {selectedJha.hazards.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Required Engineering Controls */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                    <div className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="size-3.5" />
                      Mandatory Engineering & Administrative Controls:
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
                      {selectedJha.controlMeasures.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>

                <CardFooter className="flex items-center justify-between border-t border-border/60 pt-3">
                  <span className="text-[11px] text-muted-foreground">
                    Cal/OSHA Pre-Task Plan Approved
                  </span>
                  <Button size="sm" className="text-xs font-semibold gap-1 bg-primary text-primary-foreground">
                    <FileText className="size-3.5" />
                    Print JHA Compliance Sheet
                  </Button>
                </CardFooter>
              </Card>
            ) : null}
          </div>
        </div>
      ) : (
        /* Field JHA Submissions */
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {jhaSubmissions.map((sub) => (
              <Card
                key={sub.id}
                className="hover:border-primary/40 transition-colors cursor-pointer"
                onClick={() => onSelectSubmission(sub)}
              >
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] uppercase font-mono">
                          {sub.id}
                        </Badge>
                        <Badge variant="outline" className="text-emerald-600 border-emerald-500/20 bg-emerald-500/10 text-[10px]">
                          <CheckCircle2 className="size-3 mr-1" />
                          Field JHA Verified
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

                <CardContent className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-muted/40">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Jobsite:</span>
                      <span className="font-semibold text-foreground">{sub.jobSiteName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Trade:</span>
                      <span className="font-semibold text-foreground">{sub.data.trade}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Active Crew Size:</span>
                      <span className="font-semibold text-foreground">{sub.data.crewSize} Workers Covered</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-xs">
                    <span className="font-semibold text-primary">Active Controls Implemented: </span>
                    <span className="text-foreground">{sub.data.keyControls}</span>
                  </div>
                </CardContent>

                <CardFooter className="flex items-center justify-between border-t border-border/60 pt-3">
                  <span className="text-xs text-muted-foreground">
                    Sent to: {sub.recipients.join(", ")}
                  </span>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                    <Eye className="size-3" />
                    View JHA PDF
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
