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
import { MOCK_JOBSITES } from "@/data/safetyMockData"
import type { JobSite } from "@/types"
import {
  Building2,
  MapPin,
  Phone,
  Hospital,
  Search,
  Navigation,
} from "lucide-react"

export function ActiveJobsitesView() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedSite, setSelectedSite] = React.useState<JobSite | null>(
    MOCK_JOBSITES[0] || null
  )

  const filteredSites = React.useMemo(() => {
    return MOCK_JOBSITES.filter(
      (j) =>
        j.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.jobNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.gcCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.superintendent.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="size-6 text-primary" />
            Active Job Sites & Emergency Action Plans
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Jobsite profiles, general contractor safety directors, Level-1 trauma routing, and emergency muster points
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-600 text-white font-semibold">
            {MOCK_JOBSITES.length} Active Sites
          </Badge>
        </div>
      </div>

      {/* Grid of sites */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Site cards */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative">
            <Search className="size-3.5 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search site, GC, or superintendent..."
              className="pl-8 text-xs h-9"
            />
          </div>

          <div className="space-y-3">
            {filteredSites.map((site) => {
              const isSelected = selectedSite?.id === site.id
              return (
                <div
                  key={site.id}
                  onClick={() => setSelectedSite(site)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-xs space-y-2 ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/30"
                      : "border-border bg-card hover:bg-muted/40 hover:border-border/80"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {site.jobNumber}
                    </Badge>
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active ({site.activeCrewCount} Crew)
                    </span>
                  </div>

                  <div className="font-bold text-foreground text-sm">
                    {site.name}
                  </div>

                  <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <MapPin className="size-3 text-primary shrink-0" />
                    <span>{site.address}, {site.cityStateZip}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1.5 border-t border-border/40">
                    <span className="font-medium text-foreground">GC: {site.gcCompany}</span>
                    <span>Super: {site.superintendent}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right column: Site Emergency Detail */}
        <div className="lg:col-span-7">
          {selectedSite ? (
            <Card className="h-full flex flex-col justify-between">
              <CardHeader className="space-y-3 border-b border-border/60 pb-4">
                <div className="flex items-center justify-between">
                  <Badge className="bg-primary text-primary-foreground font-bold">
                    Job #{selectedSite.jobNumber}
                  </Badge>
                  <Badge variant="outline" className="text-emerald-600 border-emerald-500/20 bg-emerald-500/10">
                    {selectedSite.activeCrewCount} Workers Active Today
                  </Badge>
                </div>

                <div>
                  <CardTitle className="text-lg font-bold text-foreground">
                    {selectedSite.name}
                  </CardTitle>
                  <CardDescription className="text-xs flex items-center gap-1.5 mt-1">
                    <MapPin className="size-3.5 text-primary" />
                    <span>{selectedSite.address}, {selectedSite.cityStateZip}</span>
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-4 text-xs">
                {/* General Contractor & Safety Contacts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-muted/40 border border-border/60">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">GC Safety Lead:</span>
                    <span className="font-bold text-foreground block">{selectedSite.gcContact}</span>
                    <span className="text-[11px] text-muted-foreground">{selectedSite.gcCompany}</span>
                    <div className="text-[11px] text-primary flex items-center gap-1 mt-1">
                      <Phone className="size-3" />
                      {selectedSite.gcPhone}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Site Superintendent:</span>
                    <span className="font-bold text-foreground block">{selectedSite.superintendent}</span>
                    <span className="text-[11px] text-muted-foreground">Lead Field Supervisor</span>
                    <div className="text-[11px] text-primary flex items-center gap-1 mt-1">
                      <Phone className="size-3" />
                      {selectedSite.superPhone}
                    </div>
                  </div>
                </div>

                {/* Level-1 Trauma Hospital Emergency Route */}
                <div className="p-3.5 rounded-xl border border-destructive/20 bg-destructive/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-destructive flex items-center gap-1.5">
                      <Hospital className="size-4" />
                      Level-1 Trauma Center (Designated ER Route):
                    </div>
                    <Badge variant="outline" className="text-destructive border-destructive/30 text-[10px] bg-destructive/10">
                      {selectedSite.emergencyHospital.distanceMiles} Miles Away
                    </Badge>
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-semibold text-foreground">{selectedSite.emergencyHospital.name}</div>
                    <div className="text-muted-foreground text-[11px]">{selectedSite.emergencyHospital.address}</div>
                    <div className="text-destructive font-semibold text-[11px] flex items-center gap-1 mt-1">
                      <Phone className="size-3" />
                      Emergency Desk: {selectedSite.emergencyHospital.phone}
                    </div>
                  </div>
                </div>

                {/* Urgent Care & Occupational Clinic */}
                <div className="p-3.5 rounded-xl border border-border bg-card space-y-1">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <Hospital className="size-3.5 text-primary" />
                    Non-Emergency Occupational Urgent Care:
                  </div>
                  <div className="font-medium text-foreground">{selectedSite.urgentCare.name}</div>
                  <div className="text-muted-foreground text-[11px]">{selectedSite.urgentCare.address}</div>
                  <div className="text-primary text-[11px] flex items-center gap-1">
                    <Phone className="size-3" />
                    {selectedSite.urgentCare.phone}
                  </div>
                </div>

                {/* Muster Point & 811 DigAlert */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs">
                    <span className="font-semibold text-amber-700 dark:text-amber-400 block mb-0.5">
                      Emergency Muster Station:
                    </span>
                    <span className="text-muted-foreground">{selectedSite.musterPoint}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 text-xs">
                    <span className="font-semibold text-blue-700 dark:text-blue-400 block mb-0.5">
                      811 Utility & DigAlert:
                    </span>
                    <span className="text-muted-foreground">{selectedSite.utilityEmergency}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex items-center justify-between border-t border-border/60 pt-3">
                <span className="text-xs text-muted-foreground">
                  Trade: {selectedSite.trade}
                </span>
                <Button size="sm" className="text-xs font-semibold gap-1 bg-primary text-primary-foreground">
                  <Navigation className="size-3.5" />
                  Dispatch Emergency Route to Foremen
                </Button>
              </CardFooter>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}
