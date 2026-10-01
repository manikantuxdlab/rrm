import * as React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Database,
  Search,
  BookOpen,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
} from "lucide-react"

export function Osha1926LibraryView() {
  const [searchFilter, setSearchFilter] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState("ALL")

  const categories = [
    { key: "ALL", label: "All Standards" },
    { key: "FALL", label: "Fall Protection (Subpart M)" },
    { key: "EXCAVATION", label: "Excavations & Trenches (Subpart P)" },
    { key: "SCAFFOLD", label: "Scaffolding (Subpart L)" },
    { key: "HEALTH", label: "Silica & HazMat (Subpart Z)" },
    { key: "ELECTRICAL", label: "Electrical (Subpart K)" },
    { key: "CRANE", label: "Cranes & Derricks (Subpart CC)" },
  ]

  const standards = [
    {
      code: "29 CFR 1926.501",
      subpartCategory: "FALL",
      title: "Duty to Have Fall Protection",
      subpart: "Subpart M - Fall Protection",
      desc: "Requires employers to provide fall protection systems (guardrails, safety nets, personal fall arrest) when employees are working on walking/working surfaces with unprotected sides or edges 6 feet or more above lower levels.",
      mandate: "Guardrail systems, safety net systems, or personal fall arrest systems mandatory at 6ft+ elevations.",
      checklistRef: "Pre-Pour Deck Inspection #CK-101",
    },
    {
      code: "29 CFR 1926.502",
      subpartCategory: "FALL",
      title: "Fall Protection Systems Criteria and Practices",
      subpart: "Subpart M - Fall Protection",
      desc: "Top edge height of guardrails must be 42 inches plus or minus 3 inches above walking/working level. Anchorages for personal fall arrest equipment must be capable of supporting at least 5,000 pounds per employee attached.",
      mandate: "Anchorage points certified to 5,000 lbs (22.2 kN) per worker.",
      checklistRef: "Fall Restraint Audit #CK-105",
    },
    {
      code: "29 CFR 1926.651",
      subpartCategory: "EXCAVATION",
      title: "Specific Excavation Requirements",
      subpart: "Subpart P - Excavations",
      desc: "Mandates 811 utility location verification before digging, daily competent person inspections, safe entry/egress ladders every 25 ft for trenches 4+ feet deep, and atmospheric testing for hazardous gases.",
      mandate: "Competent person inspection prior to start of each shift and after rainstorms.",
      checklistRef: "Trench Daily Safety Checklist #CK-204",
    },
    {
      code: "29 CFR 1926.652",
      subpartCategory: "EXCAVATION",
      title: "Requirements for Protective Systems",
      subpart: "Subpart P - Excavations",
      desc: "Each employee in an excavation shall be protected from cave-ins by an adequate protective system (sloping, benching, aluminum hydraulic shoring, or trench shield boxes) unless excavation is in solid rock or less than 5 feet deep.",
      mandate: "Protective shoring or sloping required for depths 5ft and greater.",
      checklistRef: "Shoring & Trench Box Log #CK-208",
    },
    {
      code: "29 CFR 1926.451",
      subpartCategory: "SCAFFOLD",
      title: "General Requirements for Scaffolds",
      subpart: "Subpart L - Scaffolding",
      desc: "Requires scaffolds to support their own weight and at least 4 times the maximum intended load. Full planking, guardrails on open sides 10 feet or higher, mudsills and baseplates on solid ground.",
      mandate: "Inspected by qualified scaffold competent person before daily crew access.",
      checklistRef: "Scaffold Tag & Inspection #CK-310",
    },
    {
      code: "29 CFR 1926.1153",
      subpartCategory: "HEALTH",
      title: "Respirable Crystalline Silica Standard",
      subpart: "Subpart Z - Toxic & Hazardous Substances",
      desc: "Table 1 engineering control requirements for concrete cutting, grinding, tuckpointing, and dowel drilling. Requires continuous water feed or HEPA vacuum dust collection with APF 10 tight-fitting respirators.",
      mandate: "Permissible Exposure Limit (PEL) of 50 µg/m3 as an 8-hour TWA.",
      checklistRef: "Silica Control Plan Audit #CK-402",
    },
    {
      code: "29 CFR 1926.404",
      subpartCategory: "ELECTRICAL",
      title: "Wiring Design and Protection (GFCI)",
      subpart: "Subpart K - Electrical",
      desc: "Requires ground-fault circuit interrupters (GFCI) on all 120-volt, single-phase 15- and 20-ampere receptacle outlets on construction sites, or an assured equipment grounding conductor program.",
      mandate: "GFCI protection mandatory for all cord sets, temporary lighting, and portable power tools.",
      checklistRef: "Temporary Power & Tool Inspection #CK-501",
    },
    {
      code: "29 CFR 1926.1400",
      subpartCategory: "CRANE",
      title: "Cranes and Derricks in Construction",
      subpart: "Subpart CC - Cranes & Derricks",
      desc: "NCCCO certified crane operator requirements, daily pre-operational crane inspections, ground condition verification, swing radius barricades, and clear 20-ft minimum clearance from overhead power lines.",
      mandate: "Daily crane pre-shift inspection logged and verified before critical lifts.",
      checklistRef: "Critical Lift Plan & Crane Log #CK-601",
    },
  ]

  const filteredStandards = standards.filter((s) => {
    const matchesCategory = selectedCategory === "ALL" || s.subpartCategory === selectedCategory
    const matchesSearch =
      s.code.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.desc.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.subpart.toLowerCase().includes(searchFilter.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl bg-card border border-border">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-primary text-primary-foreground font-mono text-[10px]">
              29 CFR PART 1926
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              FEDERAL OSHA SAFETY STANDARDS
            </Badge>
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
              <ShieldCheck className="size-3.5" />
              Active Codebase 2026
            </span>
          </div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Database className="size-5 text-primary" />
            OSHA 1926 Construction Safety Library
          </h2>
          <p className="text-xs text-muted-foreground">
            Searchable regulatory database for jobsite hazard standards, mandatory safety thresholds, and field checklist references.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://www.osha.gov/laws-regs/regulations/standardnumber/1926"
            target="_blank"
            rel="noreferrer"
          >
            <Button
              size="sm"
              variant="outline"
              className="h-9 text-xs gap-1.5 cursor-pointer"
            >
              <ExternalLink className="size-3.5" />
              Official OSHA.gov Portal
            </Button>
          </a>
        </div>
      </div>

      {/* Search & Category Pills */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="size-4 absolute left-3 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search regulations by CFR code, hazard keyword (e.g. 1926.501, Fall Protection, Trench, Silica, Crane)..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full h-10 pl-9 pr-3 text-xs rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setSelectedCategory(c.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedCategory === c.key
                  ? "bg-[#ff4e00] text-white shadow-xs"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Standards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredStandards.map((std, i) => (
          <Card key={i} className="border-border hover:border-primary/50 transition-colors flex flex-col justify-between">
            <CardHeader className="p-4 pb-2 space-y-2">
              <div className="flex items-center justify-between">
                <Badge className="bg-primary text-primary-foreground font-mono text-[10px] font-bold">
                  {std.code}
                </Badge>
                <span className="text-[11px] text-muted-foreground font-medium">{std.subpart}</span>
              </div>
              <CardTitle className="text-sm font-bold text-foreground leading-snug">
                {std.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 text-xs space-y-3 flex-1 flex flex-col justify-between">
              <p className="text-muted-foreground leading-relaxed">
                {std.desc}
              </p>

              <div className="space-y-2 pt-2 border-t border-border/60">
                <div className="p-2.5 rounded-lg bg-muted/40 border border-border text-[11px] space-y-1">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <AlertTriangle className="size-3 text-amber-500" />
                    Mandatory Threshold:
                  </div>
                  <div className="text-muted-foreground">{std.mandate}</div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1 text-primary font-medium">
                    <FileCheck className="size-3.5" />
                    {std.checklistRef}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-emerald-600">Enforced Daily</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredStandards.length === 0 && (
          <div className="col-span-2 p-12 text-center rounded-xl border border-dashed border-border text-muted-foreground text-xs">
            <BookOpen className="size-8 mx-auto mb-2 text-muted-foreground/60" />
            No OSHA standards matched your search query. Try searching for "Fall", "Excavation", or "1926".
          </div>
        )}
      </div>
    </div>
  )
}
