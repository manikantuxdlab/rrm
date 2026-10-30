import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Building2,
  MapPin,
  Phone,
  Hospital,
  Navigation,
  Pencil,
  Trash2,
  AlertTriangle,
  Radio,
} from "lucide-react"
import type { JobSite } from "@/types"

interface Props {
  jobsite: JobSite | null
  open: boolean
  onClose: () => void
  onEdit: (jobsite: JobSite) => void
  onDelete: (jobsite: JobSite) => void
}

export function JobsiteDetailModal({ jobsite, open, onClose, onEdit, onDelete }: Props) {
  if (!jobsite) return null

  return (
    <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col h-full bg-card">
        <SheetHeader className="p-5 border-b border-border/60 bg-muted/20">
          <div className="flex items-center justify-between pr-8">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground font-mono text-xs">
                Job #{jobsite.jobNumber}
              </Badge>
              {jobsite.status === "active" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#00c800]/12 text-[#008a00] dark:text-[#00e600] border border-[#00c800]/30">
                  <span className="size-1.5 rounded-full bg-[#00c800] animate-pulse"></span>
                  Active ({jobsite.activeCrewCount} Crew)
                </span>
              )}
              {jobsite.status === "paused" && (
                <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/10 text-xs">
                  Paused
                </Badge>
              )}
              {jobsite.status === "completed" && (
                <Badge variant="secondary" className="text-muted-foreground text-xs">
                  Completed
                </Badge>
              )}
            </div>
            <Badge variant="outline" className="text-[11px] font-medium">
              Trade: {jobsite.trade || "General"}
            </Badge>
          </div>
          <SheetTitle className="text-lg font-bold text-foreground mt-2">
            {jobsite.name}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <MapPin className="size-3.5 text-primary shrink-0" />
            <span>{jobsite.address ? `${jobsite.address}, ` : ""}{jobsite.cityStateZip || "No address specified"}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
          {/* Company Assignment Card */}
          <div className="p-3.5 rounded-xl bg-card border border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Building2 className="size-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-semibold text-muted-foreground">Assigned Company</div>
                <div className="text-sm font-bold text-foreground">{jobsite.companyName || "Unassigned"}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase font-semibold text-muted-foreground">Active Crew</div>
              <div className="text-sm font-bold text-foreground">{jobsite.activeCrewCount} on site</div>
            </div>
          </div>

          {/* GC & Superintendent Contacts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-muted/40 border border-border/60">
            <div>
              <span className="text-muted-foreground block text-[11px] font-medium">GC Safety Lead:</span>
              <span className="font-bold text-foreground block text-sm">{jobsite.gcContact || "—"}</span>
              <span className="text-[11px] text-muted-foreground">{jobsite.gcCompany || "General Contractor"}</span>
              {jobsite.gcPhone && (
                <div className="text-[11px] text-primary flex items-center gap-1 mt-1.5">
                  <Phone className="size-3" />
                  <span>{jobsite.gcPhone}</span>
                </div>
              )}
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px] font-medium">Site Superintendent:</span>
              <span className="font-bold text-foreground block text-sm">{jobsite.superintendent || "—"}</span>
              <span className="text-[11px] text-muted-foreground">Lead Field Supervisor</span>
              {jobsite.superPhone && (
                <div className="text-[11px] text-primary flex items-center gap-1 mt-1.5">
                  <Phone className="size-3" />
                  <span>{jobsite.superPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Level-1 Trauma Hospital Emergency Route */}
          <div className="p-4 rounded-xl border border-destructive/25 bg-destructive/5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-bold text-destructive flex items-center gap-1.5">
                <Hospital className="size-4" />
                Level-1 Trauma Center (Designated ER Route):
              </div>
              {jobsite.emergencyHospital?.distanceMiles !== undefined && (
                <Badge variant="outline" className="text-destructive border-destructive/30 text-[10px] bg-destructive/10">
                  {jobsite.emergencyHospital.distanceMiles} Miles Away
                </Badge>
              )}
            </div>
            <div className="space-y-0.5">
              <div className="font-semibold text-foreground text-sm">
                {jobsite.emergencyHospital?.name || "Trauma center not designated"}
              </div>
              <div className="text-muted-foreground text-[11px]">
                {jobsite.emergencyHospital?.address || "Address not provided"}
              </div>
              {jobsite.emergencyHospital?.phone && (
                <div className="text-destructive font-semibold text-[11px] flex items-center gap-1.5 mt-1.5">
                  <Phone className="size-3" />
                  <span>Emergency Desk: {jobsite.emergencyHospital.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Urgent Care & Occupational Clinic */}
          <div className="p-3.5 rounded-xl border border-border bg-card space-y-1">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <Hospital className="size-3.5 text-primary" />
              Non-Emergency Occupational Urgent Care:
            </div>
            <div className="font-medium text-foreground">{jobsite.urgentCare?.name || "Not designated"}</div>
            {jobsite.urgentCare?.address && (
              <div className="text-muted-foreground text-[11px]">{jobsite.urgentCare.address}</div>
            )}
            {jobsite.urgentCare?.phone && (
              <div className="text-primary text-[11px] flex items-center gap-1 mt-1">
                <Phone className="size-3" />
                <span>{jobsite.urgentCare.phone}</span>
              </div>
            )}
          </div>

          {/* Access Gate */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1 mb-1">
              <Navigation className="size-3.5 text-primary" />
              Access Gate Instructions:
            </span>
            <span className="text-muted-foreground">
              {jobsite.accessGateInstructions || "No gate instructions provided."}
            </span>
          </div>

          {/* Muster Point & 811 DigAlert */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs">
              <span className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1 mb-1">
                <AlertTriangle className="size-3.5" />
                Emergency Muster Station:
              </span>
              <span className="text-muted-foreground">{jobsite.musterPoint || "Not set"}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/20 text-xs">
              <span className="font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-1 mb-1">
                <Radio className="size-3.5" />
                811 Utility & DigAlert:
              </span>
              <span className="text-muted-foreground">{jobsite.utilityEmergency || "Not set"}</span>
            </div>
          </div>
        </div>

        <SheetFooter className="p-4 border-t border-border/60 bg-muted/20 flex flex-row items-center justify-between sm:justify-between mt-auto">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onClose()
              onDelete(jobsite)
            }}
            className="text-destructive hover:bg-destructive/10 text-xs gap-1.5"
          >
            <Trash2 className="size-3.5" />
            Delete Site
          </Button>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
              Close
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onClose()
                onEdit(jobsite)
              }}
              className="text-xs gap-1.5 bg-primary text-primary-foreground font-semibold"
            >
              <Pencil className="size-3.5" />
              Edit Jobsite
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
