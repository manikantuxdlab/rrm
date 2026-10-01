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
  Search,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  ShieldCheck,
  Calendar,
} from "lucide-react"

export function Osha300LogView() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedYear, setSelectedYear] = React.useState("2026")

  const handlePrint = () => {
    window.print()
  }

  const handleExport = (type: string) => {
    alert(`Exporting official OSHA 300 / 300A logs in ${type} format for Year ${selectedYear}...`)
  }

  const entries = [
    {
      caseNo: "#2026-001",
      workerName: "Alejandro Silva",
      date: "09/29/2026",
      jobsite: "Apex Tower Phase 2",
      company: "Titan Concrete & Pumping Co.",
      injury: "Minor superficial laceration on right forearm while handling formwork rebar tie. Cleansed & bandaged.",
      daysAway: "0 Days",
      status: "Non-Recordable (First Aid)",
      severity: "low",
    },
    {
      caseNo: "#2026-002",
      workerName: "Carlos Vance",
      date: "08/14/2026",
      jobsite: "Westfield Logistics Hub",
      company: "Pacific Rebar Ironworks LLC",
      injury: "Dust particle in eye during rebar grinding. Cleared with eye wash station. No medical treatment required.",
      daysAway: "0 Days",
      status: "Non-Recordable (First Aid)",
      severity: "low",
    },
  ]

  const filteredEntries = entries.filter((item) =>
    item.workerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.caseNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.jobsite.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.injury.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner with Badges & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl bg-card border border-border">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-primary text-primary-foreground font-mono text-[10px]">
              OFFICIAL RECORD
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              CY {selectedYear} AUDIT CYCLE
            </Badge>
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
              <CheckCircle2 className="size-3.5" />
              OSHA 1904 Compliant
            </span>
          </div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            OSHA Form 300 & 300A Annual Summary
          </h2>
          <p className="text-xs text-muted-foreground">
            Log of Work-Related Injuries and Illnesses pursuant to 29 CFR Part 1904. Mandatory annual posting record.
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
            Print Log
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleExport("Excel")}
            className="h-9 text-xs gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="size-3.5 text-emerald-600" />
            Export CSV / Excel
          </Button>
          <Button
            size="sm"
            onClick={() => handleExport("PDF")}
            className="h-9 text-xs gap-1.5 bg-[#ff4e00] hover:bg-[#e04500] text-white font-semibold cursor-pointer shadow-xs"
          >
            <Download className="size-3.5" />
            Export Certified 300A PDF
          </Button>
        </div>
      </div>

      {/* Statutory Posting Reminder Notice */}
      <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-2.5">
        <AlertCircle className="size-4 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold">OSHA Annual Posting Notice:</span> Form 300A Annual Summary must be posted in a conspicuous place in every jobsite trailer from February 1 through April 30 annually.
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 space-y-1">
            <div className="text-[11px] text-muted-foreground uppercase font-semibold">Total Recordables</div>
            <div className="text-2xl font-bold text-emerald-600">0 Fatalities</div>
            <div className="text-[11px] text-muted-foreground">Zero Lost-Time Days YTD</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 space-y-1">
            <div className="text-[11px] text-muted-foreground uppercase font-semibold">First-Aid Only Logs</div>
            <div className="text-2xl font-bold text-foreground">2 Incidents</div>
            <div className="text-[11px] text-muted-foreground">Minor treated on-site</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 space-y-1">
            <div className="text-[11px] text-muted-foreground uppercase font-semibold">DART Rate</div>
            <div className="text-2xl font-bold text-emerald-600">0.00</div>
            <div className="text-[11px] text-muted-foreground">Industry Avg: 1.80 per 100 FTE</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 space-y-1">
            <div className="text-[11px] text-muted-foreground uppercase font-semibold">Form 300A Status</div>
            <div className="text-2xl font-bold text-primary flex items-center gap-1.5">
              <ShieldCheck className="size-6 text-emerald-600" />
              Certified
            </div>
            <div className="text-[11px] text-muted-foreground">Signed by Marcus Vance (Safety Director)</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="size-4 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search entries by name, case #, jobsite..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-xs rounded-md border border-input bg-background text-foreground"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="size-3.5" />
            <span>Audit Year:</span>
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="h-9 px-3 text-xs rounded-md border border-input bg-background text-foreground font-medium"
          >
            <option value="2026">2026 (Current Active)</option>
            <option value="2025">2025 (Archived)</option>
            <option value="2024">2024 (Archived)</option>
          </select>
        </div>
      </div>

      {/* Table of Entries */}
      <Card className="border-border">
        <CardHeader className="p-4 pb-2 border-b border-border flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold">OSHA 300 Log Entries - Calendar Year {selectedYear}</CardTitle>
            <CardDescription className="text-xs">
              All work-related injury cases recorded in digital safety dispatch.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs bg-muted">
            {filteredEntries.length} Record{filteredEntries.length === 1 ? "" : "s"} Found
          </Badge>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground text-[10px] uppercase border-b border-border">
              <tr>
                <th className="px-4 py-3">Case No.</th>
                <th className="px-4 py-3">Worker Name</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Subcontractor Entity</th>
                <th className="px-4 py-3">Jobsite Location</th>
                <th className="px-4 py-3">Injury / Illness Description</th>
                <th className="px-4 py-3">Days Away</th>
                <th className="px-4 py-3">OSHA Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredEntries.map((row) => (
                <tr key={row.caseNo} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3.5 font-mono font-bold text-primary">{row.caseNo}</td>
                  <td className="px-4 py-3.5 font-semibold text-foreground">{row.workerName}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{row.date}</td>
                  <td className="px-4 py-3.5 text-foreground">{row.company}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{row.jobsite}</td>
                  <td className="px-4 py-3.5 text-foreground max-w-md">{row.injury}</td>
                  <td className="px-4 py-3.5 font-semibold text-emerald-600">{row.daysAway}</td>
                  <td className="px-4 py-3.5">
                    <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30 bg-emerald-500/10 font-semibold">
                      {row.status}
                    </Badge>
                  </td>
                </tr>
              ))}
              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground text-xs">
                    No OSHA log entries matched your search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
