import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Printer,
  Download,
  CheckCircle2,
  TrendingUp,
  Award,
  Building2,
  Calendar,
  FileCheck2,
} from "lucide-react"

export function ComplianceReportsView() {
  const [selectedQuarter, setSelectedQuarter] = React.useState("Q3-2026")

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    alert("Exporting Executive Compliance & Audit Scorecard Pack (PDF)...")
  }

  const contractorPerformances = [
    {
      company: "Titan Concrete & Pumping Co.",
      checklists: "48 / 48 (100%)",
      toolboxAttendance: "164 workers",
      jhaCompleted: "12 high-risk",
      coiStatus: "Active / Verified",
      score: "99.2%",
      rating: "Tier 1 - Exemplary",
    },
    {
      company: "Pacific Rebar Ironworks LLC",
      checklists: "38 / 38 (100%)",
      toolboxAttendance: "112 workers",
      jhaCompleted: "9 high-risk",
      coiStatus: "Active / Verified",
      score: "98.4%",
      rating: "Tier 1 - Exemplary",
    },
    {
      company: "Golden State Shoring & Scaffolding",
      checklists: "35 / 35 (100%)",
      toolboxAttendance: "98 workers",
      jhaCompleted: "7 high-risk",
      coiStatus: "Active / Verified",
      score: "97.8%",
      rating: "Tier 1 - Exemplary",
    },
    {
      company: "Bay Area Crane & Rigging Solutions",
      checklists: "27 / 27 (100%)",
      toolboxAttendance: "112 workers",
      jhaCompleted: "14 critical lifts",
      coiStatus: "Active / Verified",
      score: "98.6%",
      rating: "Tier 1 - Exemplary",
    },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl bg-card border border-border">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-emerald-600 text-white font-bold text-[10px]">
              AUDIT GRADE: A+ (98.5%)
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {selectedQuarter} EXECUTIVE AUDIT
            </Badge>
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
              <CheckCircle2 className="size-3.5" />
              100% On-Time Submission
            </span>
          </div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            Compliance & Executive Audit Reports
          </h2>
          <p className="text-xs text-muted-foreground">
            Quarterly and annual consolidated safety performance, subcontractor audit scorecards, and insurance loss ratio ratings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePrint}
            className="h-9 text-xs gap-1.5 cursor-pointer"
          >
            <Printer className="size-3.5" />
            Print Report
          </Button>
          <Button
            size="sm"
            onClick={handleExport}
            className="h-9 text-xs gap-1.5 bg-[#ff4e00] hover:bg-[#e04500] text-white font-semibold cursor-pointer shadow-xs"
          >
            <Download className="size-3.5" />
            Download Complete Audit Dossier (PDF)
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 space-y-1">
            <span className="text-[11px] text-muted-foreground font-semibold uppercase">Daily Checklists Completed</span>
            <div className="text-2xl font-bold text-foreground">148 / 148</div>
            <span className="text-[11px] text-emerald-600 font-medium">100% On-Time Field Execution</span>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 space-y-1">
            <span className="text-[11px] text-muted-foreground font-semibold uppercase">Toolbox Talk Attendees</span>
            <div className="text-2xl font-bold text-foreground">486 Signatures</div>
            <span className="text-[11px] text-muted-foreground">Digital Worker Verification</span>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 space-y-1">
            <span className="text-[11px] text-muted-foreground font-semibold uppercase">Insurance Loss Ratio</span>
            <div className="text-2xl font-bold text-emerald-600">1.2%</div>
            <span className="text-[11px] text-muted-foreground">Preferred Underwriter Tier</span>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 space-y-1">
            <span className="text-[11px] text-muted-foreground font-semibold uppercase">Subcontractor Compliance</span>
            <div className="text-2xl font-bold text-primary">100%</div>
            <span className="text-[11px] text-muted-foreground">All 4 entities fully certified</span>
          </CardContent>
        </Card>
      </div>

      {/* Executive Summary Card */}
      <Card className="border-border bg-gradient-to-r from-primary/5 via-card to-card">
        <CardHeader className="p-4 pb-2 border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Award className="size-4 text-primary" />
              Executive Audit Synthesis ({selectedQuarter})
            </CardTitle>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="size-3.5" />
              <select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(e.target.value)}
                className="h-7 px-2 text-xs rounded border border-input bg-background text-foreground"
              >
                <option value="Q3-2026">Q3 2026</option>
                <option value="Q2-2026">Q2 2026</option>
                <option value="Q1-2026">Q1 2026</option>
                <option value="Annual-2025">Full Year 2025</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 text-xs text-muted-foreground space-y-3 leading-relaxed">
          <p>
            Consolidated safety audit score for all active project sites stands at <strong className="text-foreground">98.5% (Grade A+)</strong>. Zero stop-work notices were issued during this quarter. All required Spanish & English weekly safety discussions were executed with complete digital rosters.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-card border border-border space-y-1">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <TrendingUp className="size-3.5 text-emerald-600" />
                Zero Lost Time
              </div>
              <p className="text-[11px] text-muted-foreground">100% zero recordable days across 12 active jobsite addresses.</p>
            </div>
            <div className="p-3 rounded-lg bg-card border border-border space-y-1">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <FileCheck2 className="size-3.5 text-primary" />
                Automated Routing
              </div>
              <p className="text-[11px] text-muted-foreground">Every incident was instantly dispatched to safety managers & insurance reps.</p>
            </div>
            <div className="p-3 rounded-lg bg-card border border-border space-y-1">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <Building2 className="size-3.5 text-amber-500" />
                COI Verification
              </div>
              <p className="text-[11px] text-muted-foreground">All active subcontractors possess valid ACORD certificates with $5M umbrella.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contractor Performance Breakdown Table */}
      <Card className="border-border">
        <CardHeader className="p-4 pb-2 border-b border-border">
          <CardTitle className="text-sm font-bold">Subcontractor Entity Audit Scorecards</CardTitle>
          <CardDescription className="text-xs">
            Individual company breakdown for field checklists, talk signatures, JHAs, and overall safety rating.
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground text-[10px] uppercase border-b border-border">
              <tr>
                <th className="px-4 py-3">Contractor Entity</th>
                <th className="px-4 py-3">Daily Inspections</th>
                <th className="px-4 py-3">Toolbox Talks</th>
                <th className="px-4 py-3">JHA Mitigations</th>
                <th className="px-4 py-3">COI Insurance</th>
                <th className="px-4 py-3">Compliance Score</th>
                <th className="px-4 py-3">Audit Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {contractorPerformances.map((c, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3.5 font-semibold text-foreground">{c.company}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{c.checklists}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{c.toolboxAttendance}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{c.jhaCompleted}</td>
                  <td className="px-4 py-3.5">
                    <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30 bg-emerald-500/10">
                      {c.coiStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-emerald-600">{c.score}</td>
                  <td className="px-4 py-3.5">
                    <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px] font-semibold">
                      {c.rating}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
