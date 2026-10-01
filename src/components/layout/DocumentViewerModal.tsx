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
  X,
  Search,
  CheckCircle2,
} from "lucide-react"

interface DocumentViewerModalProps {
  documentName: string | null
  isOpen: boolean
  onClose: () => void
}

export function DocumentViewerModal({
  documentName,
  isOpen,
  onClose,
}: DocumentViewerModalProps) {
  const [searchFilter, setSearchFilter] = React.useState("")

  if (!isOpen || !documentName) return null

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    alert(`Downloading official certified copy of "${documentName}" (PDF / Excel Format)...`)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-4xl max-h-[88vh] flex flex-col bg-card border-border shadow-2xl text-card-foreground">
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground font-mono text-[10px]">
                OFFICIAL RECORD
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                CY 2026 AUDIT CYCLE
              </Badge>
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                <CheckCircle2 className="size-3" />
                OSHA Verified
              </span>
            </div>
            <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              {documentName}
            </CardTitle>
            <CardDescription className="text-xs">
              {documentName === "OSHA 300 Log" &&
                "Log of Work-Related Injuries and Illnesses (Form OSHA 300 / 300A Summary)"}
              {documentName === "Compliance Reports" &&
                "Monthly & Annual Safety Performance, Audit Scorecard & Insurance Broker Submissions"}
              {documentName === "OSHA 1926 Library" &&
                "Federal OSHA 29 CFR 1926 Construction Safety Regulations & Standards Codebook"}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrint}
              className="h-8 text-xs gap-1 cursor-pointer"
            >
              <Printer className="size-3.5" />
              Print
            </Button>
            <Button
              size="sm"
              onClick={handleDownload}
              className="h-8 text-xs gap-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cursor-pointer"
            >
              <Download className="size-3.5" />
              Export PDF
            </Button>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted ml-1 cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>
        </CardHeader>

        {/* Content Body */}
        <CardContent className="flex-1 overflow-y-auto p-5 text-xs space-y-4">
          {/* Document 1: OSHA 300 Log */}
          {documentName === "OSHA 300 Log" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-muted/40 border border-border">
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">Total Recordables</div>
                  <div className="text-xl font-bold text-emerald-600 mt-0.5">0 Fatalities</div>
                  <div className="text-[10px] text-muted-foreground">Zero Lost-Time YTD</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border border-border">
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">First-Aid Only Logs</div>
                  <div className="text-xl font-bold text-foreground mt-0.5">1 Incident</div>
                  <div className="text-[10px] text-muted-foreground">Minor Forearm Scrape</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border border-border">
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">DART Days Rate</div>
                  <div className="text-xl font-bold text-emerald-600 mt-0.5">0.00</div>
                  <div className="text-[10px] text-muted-foreground">Industry Avg: 1.80</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border border-border">
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">Annual 300A Status</div>
                  <div className="text-xl font-bold text-primary mt-0.5">Certified</div>
                  <div className="text-[10px] text-muted-foreground">Signed by Marcus Vance</div>
                </div>
              </div>

              {/* Table of Entries */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="bg-muted/60 px-4 py-2.5 font-bold text-[11px] border-b border-border flex items-center justify-between">
                  <span>OSHA 300 Log Entries - Year 2026</span>
                  <Badge variant="outline" className="text-[10px] bg-background">
                    1 Record Found
                  </Badge>
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/30 text-muted-foreground text-[10px] uppercase border-b border-border">
                    <tr>
                      <th className="px-3 py-2">Case No.</th>
                      <th className="px-3 py-2">Worker Name</th>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Location / Jobsite</th>
                      <th className="px-3 py-2">Injury Description</th>
                      <th className="px-3 py-2">Days Away</th>
                      <th className="px-3 py-2">OSHA Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    <tr className="hover:bg-muted/20">
                      <td className="px-3 py-2.5 font-mono font-bold text-primary">#2026-001</td>
                      <td className="px-3 py-2.5 font-medium text-foreground">Alejandro Silva</td>
                      <td className="px-3 py-2.5 text-muted-foreground">09/29/2026</td>
                      <td className="px-3 py-2.5 text-foreground">Apex Tower Phase 2</td>
                      <td className="px-3 py-2.5 text-muted-foreground">
                        Minor superficial laceration on right forearm while handling formwork rebar tie. Cleansed & bandaged.
                      </td>
                      <td className="px-3 py-2.5 font-semibold text-emerald-600">0 Days</td>
                      <td className="px-3 py-2.5">
                        <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30 bg-emerald-500/10">
                          Non-Recordable (First Aid)
                        </Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Document 2: Compliance Reports */}
          {documentName === "Compliance Reports" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground">Executive Safety Compliance Summary (Q3 2026)</span>
                  <Badge className="bg-emerald-600 text-white font-bold">GRADE A+ (98.5%)</Badge>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Consolidated safety audit performance for all 4 active customer contractor entities. Zero stop-work notices, 100% daily checklist submission compliance, and all 26 bilingual toolbox topics completed on schedule.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg border border-border bg-card space-y-1">
                  <span className="text-[11px] text-muted-foreground font-semibold">Daily Checklists Completed</span>
                  <div className="text-2xl font-bold text-foreground">148 / 148</div>
                  <span className="text-[10px] text-emerald-600">100% On-Time Submission</span>
                </div>
                <div className="p-3 rounded-lg border border-border bg-card space-y-1">
                  <span className="text-[11px] text-muted-foreground font-semibold">Toolbox Talk Attendees</span>
                  <div className="text-2xl font-bold text-foreground">486 Signatures</div>
                  <span className="text-[10px] text-muted-foreground">Digital Worker Verification</span>
                </div>
                <div className="p-3 rounded-lg border border-border bg-card space-y-1">
                  <span className="text-[11px] text-muted-foreground font-semibold">Insurance Loss Ratio</span>
                  <div className="text-2xl font-bold text-emerald-600">1.2%</div>
                  <span className="text-[10px] text-muted-foreground">Preferred Underwriter Tier</span>
                </div>
              </div>
            </div>
          )}

          {/* Document 3: OSHA 1926 Library */}
          {documentName === "OSHA 1926 Library" && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="size-3.5 absolute left-3 top-2.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search 29 CFR 1926 standards (e.g. 1926.501, Fall Protection, Trenching)..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full h-9 pl-8 pr-3 text-xs rounded-md border border-input bg-background text-foreground"
                />
              </div>

              <div className="space-y-2">
                {[
                  {
                    code: "29 CFR 1926.501",
                    title: "Duty to Have Fall Protection",
                    subpart: "Subpart M - Fall Protection",
                    desc: "Requires employers to provide fall protection systems (guardrails, safety nets, personal fall arrest) when employees are working on walking/working surfaces with unprotected sides or edges 6 feet or more above lower levels.",
                  },
                  {
                    code: "29 CFR 1926.651",
                    title: "Specific Excavation Requirements",
                    subpart: "Subpart P - Excavations",
                    desc: "Mandates utility location verification before digging, daily competent person inspections, safe entry/egress ladders every 25 ft for trenches 4+ feet deep, and structural shoring boxes.",
                  },
                  {
                    code: "29 CFR 1926.451",
                    title: "General Requirements for Scaffolds",
                    subpart: "Subpart L - Scaffolding",
                    desc: "Requires scaffolds to support their own weight and at least 4 times the maximum intended load. Full planking, guardrails on open sides 10 feet or higher, and baseplates on solid ground.",
                  },
                  {
                    code: "29 CFR 1926.1153",
                    title: "Respirable Crystalline Silica Standard",
                    subpart: "Subpart Z - Toxic & Hazardous Substances",
                    desc: "Table 1 engineering control requirements for concrete cutting, grinding, tuckpointing, and dowel drilling. Requires continuous water feed or HEPA vacuum dust collection.",
                  },
                ]
                  .filter(
                    (s) =>
                      s.code.toLowerCase().includes(searchFilter.toLowerCase()) ||
                      s.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
                      s.desc.toLowerCase().includes(searchFilter.toLowerCase())
                  )
                  .map((std, i) => (
                    <div key={i} className="p-3.5 rounded-xl border border-border bg-card space-y-1.5 hover:border-primary/40 transition-colors">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-primary font-mono text-[10px] font-bold">
                          {std.code}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">{std.subpart}</span>
                      </div>
                      <div className="font-semibold text-foreground text-sm">{std.title}</div>
                      <p className="text-muted-foreground text-xs leading-relaxed">{std.desc}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
