import type { SubmissionRecord } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Building2,
  Calendar,
  CheckCircle2,
  Download,
  Mail,
  ShieldAlert,
  User,
  X,
  Printer,
  Share2,
} from "lucide-react"

interface SubmissionDetailModalProps {
  submission: SubmissionRecord | null
  onClose: () => void
}

export function SubmissionDetailModal({
  submission,
  onClose,
}: SubmissionDetailModalProps) {
  if (!submission) return null

  const handleDownload = () => {
    alert(`Downloading signed compliance PDF for "${submission.title}" (Ref: ${submission.id})`)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl text-card-foreground space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border/60 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant={
                  submission.moduleType === "claim_alert"
                    ? "destructive"
                    : "outline"
                }
                className="uppercase text-[10px] tracking-wider"
              >
                {submission.moduleType.replace("_", " ")}
              </Badge>
              <Badge variant="outline" className="text-[10px] font-mono">
                {submission.id}
              </Badge>

              {/* Dynamic Sync Status Badge */}
              {submission.syncStatus === "synced" && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="size-3" />
                  Synced to Cloud
                </span>
              )}
              {submission.syncStatus === "pending" && (
                <span className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  ⌛ Pending Sync (Offline Queue)
                </span>
              )}
              {submission.syncStatus === "failed" && (
                <span className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                  ✕ Sync Failed
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              {submission.title}
            </h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
              <Building2 className="size-3.5 text-primary" />
              <span>{submission.jobSiteName}</span>
              <span>•</span>
              <Calendar className="size-3.5" />
              <span>{submission.timestamp}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Company & Foreman Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded-xl bg-muted/40 border border-border/60 text-xs">
          <div>
            <span className="text-muted-foreground block text-[11px]">Contractor Entity:</span>
            <span className="font-semibold text-foreground">{submission.companyName}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Field Lead / Foreman:</span>
            <span className="font-semibold text-foreground flex items-center gap-1">
              <User className="size-3 text-primary" />
              {submission.foremanName} ({submission.foremanEmail})
            </span>
          </div>
        </div>

        {/* Submission Payload Data */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
            Record Data & Safety Documentation
          </h3>

          {/* Attendees if toolbox talk */}
          {submission.data?.attendees && (
            <div className="p-3.5 rounded-xl border border-border/80 bg-background/50 space-y-2 text-xs">
              <span className="font-bold text-foreground">
                Crew Attendance Roster ({submission.data.attendees.length} Verified Signatures):
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {submission.data.attendees.map((att: string, i: number) => (
                  <Badge key={i} variant="secondary" className="text-xs font-normal">
                    {att}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Key Notes / Hazards */}
          {submission.data?.keyNotes && (
            <div className="p-3.5 rounded-xl border border-border/80 bg-background/50 text-xs space-y-1">
              <span className="font-bold text-foreground">Foreman Discussion & Meeting Notes:</span>
              <p className="text-muted-foreground leading-relaxed">{submission.data.keyNotes}</p>
            </div>
          )}

          {/* OSHA Standard */}
          {submission.data?.oshaStandard && (
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs flex items-center justify-between">
              <span className="text-muted-foreground font-medium">OSHA Standard Applied:</span>
              <span className="font-mono font-bold text-primary">{submission.data.oshaStandard}</span>
            </div>
          )}

          {/* Checklist Deficiencies */}
          {submission.data?.deficiencies && (
            <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold">
                <ShieldAlert className="size-4" />
                <span>Flagged Deficiencies & Immediate Corrective Actions ({submission.data.deficiencies.length})</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {submission.data.deficiencies.map((d: string, i: number) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Claim Alert specifics */}
          {submission.data?.injuredWorker && (
            <div className="p-3.5 rounded-xl border border-destructive/30 bg-destructive/5 space-y-2 text-xs">
              <div className="font-bold text-destructive flex items-center gap-1.5">
                <ShieldAlert className="size-4" />
                <span>Injury Incident Report Details</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                <div><strong className="text-foreground">Worker:</strong> {submission.data.injuredWorker}</div>
                <div><strong className="text-foreground">Type:</strong> {submission.data.incidentType}</div>
                <div><strong className="text-foreground">Body Part:</strong> {submission.data.bodyPart}</div>
                <div><strong className="text-foreground">Lost Time:</strong> {submission.data.lostTime}</div>
              </div>
              <p className="pt-1 text-foreground leading-relaxed">
                <strong>Immediate Action:</strong> {submission.data.immediateAction}
              </p>
            </div>
          )}

          {/* Near Miss specifics */}
          {submission.data?.hazardIdentified && (
            <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2 text-xs">
              <p className="text-foreground"><strong>Hazard Identified:</strong> {submission.data.hazardIdentified}</p>
              <p className="text-muted-foreground"><strong>Action Taken:</strong> {submission.data.correctiveActionTaken}</p>
            </div>
          )}

          {/* Endorsements / COI */}
          {submission.data?.certificateHolder && (
            <div className="p-3.5 rounded-xl border border-border/80 bg-background/50 space-y-2 text-xs">
              <p className="text-foreground"><strong>Certificate Holder:</strong> {submission.data.certificateHolder}</p>
              <p className="text-muted-foreground"><strong>Required Limits:</strong> {submission.data.limitRequirements}</p>
              <p className="text-muted-foreground"><strong>Endorsements:</strong> {submission.data.specialEndorsements}</p>
            </div>
          )}

          {/* Routing Logs */}
          <div className="p-3 rounded-xl bg-muted/30 border border-border/40 text-xs space-y-1">
            <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
              <Mail className="size-3" />
              Automated Email Dispatch Distribution ({submission.recipients.length} recipients):
            </span>
            <div className="flex flex-wrap gap-1">
              {submission.recipients.map((email, i) => (
                <span key={i} className="font-mono text-[10.5px] bg-background px-2 py-0.5 rounded border border-border/60">
                  {email}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border/60 pt-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1 text-xs">
              <Printer className="size-3.5" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={() => alert("Shareable audit link copied to clipboard")} className="gap-1 text-xs">
              <Share2 className="size-3.5" />
              Share Link
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
              Close
            </Button>
            <Button size="sm" onClick={handleDownload} className="gap-1 text-xs font-semibold">
              <Download className="size-3.5" />
              Download Signed PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
