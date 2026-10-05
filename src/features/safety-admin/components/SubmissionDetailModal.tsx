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
  Printer,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

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
    <Sheet open={Boolean(submission)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl md:max-w-3xl flex flex-col p-0 overflow-hidden h-full">
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b shrink-0 text-left">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <Badge
              variant={
                submission.moduleType === "claim_alert"
                  ? "destructive"
                  : "outline"
              }
              className="uppercase text-[10px] tracking-wider font-semibold"
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
                Synced
              </span>
            )}
            {submission.syncStatus === "pending" && (
              <span className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                ⌛ Pending Sync
              </span>
            )}
            {submission.syncStatus === "failed" && (
              <span className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                ⚠️ Sync Failed
              </span>
            )}
          </div>

          <SheetTitle className="text-lg font-bold text-foreground">
            {submission.title}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground flex flex-wrap items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-foreground font-medium">
              <Building2 className="size-3.5 text-muted-foreground" />
              {submission.companyName}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" />
              {submission.timestamp}
            </span>
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 text-xs">
          {/* Meta Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-muted/40 p-4 rounded-xl border border-border">
            <div>
              <span className="text-muted-foreground font-semibold">Active Jobsite:</span>
              <p className="font-medium text-foreground mt-0.5">
                {submission.jobSiteName}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Ref ID: {submission.jobSiteId}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground font-semibold">Submitting Lead / Foreman:</span>
              <p className="font-medium text-foreground mt-0.5 flex items-center gap-1">
                <User className="size-3.5 text-primary" />
                {submission.foremanName}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {submission.foremanEmail}
              </p>
            </div>
          </div>

          {/* Dynamic Payload Data */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Inspection / Form Submission Data
            </h4>
            <div className="rounded-xl border border-border bg-card p-4 space-y-3 text-xs">
              {Object.entries(submission.data || {}).map(([key, val]) => (
                <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1.5 border-b border-border/40 last:border-0">
                  <span className="font-semibold text-muted-foreground capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}:
                  </span>
                  <span className="font-medium text-foreground sm:text-right max-w-sm break-words">
                    {Array.isArray(val) ? val.join(", ") : typeof val === "boolean" ? (val ? "Yes" : "No") : String(val)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Electronic Signature & Notification Recipients */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Signature */}
            <div className="rounded-xl border border-border bg-card p-3.5 space-y-2">
              <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
                <ShieldAlert className="size-3.5 text-primary" />
                Foreman Digital Sign-Off
              </span>
              <div className="h-16 rounded-lg border border-dashed border-border bg-muted/30 flex flex-col items-center justify-center text-center p-2">
                <span className="font-serif italic text-base text-foreground font-bold">
                  {submission.foremanName}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Timestamped: {submission.timestamp}
                </span>
              </div>
            </div>

            {/* Notification Route Recipients */}
            <div className="rounded-xl border border-border bg-card p-3.5 space-y-2">
              <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
                <Mail className="size-3.5 text-emerald-600" />
                Dispatched Email Recipients
              </span>
              <div className="space-y-1">
                {submission.recipients?.map((r, i) => (
                  <div key={i} className="text-[11px] font-mono text-muted-foreground truncate bg-muted/40 px-2 py-0.5 rounded">
                    {r}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions Footer (Pinned) */}
        <SheetFooter className="px-6 py-4 border-t bg-card shrink-0 flex flex-row items-center justify-between gap-3 mt-auto">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-10 px-5 text-xs font-medium cursor-pointer"
          >
            Close
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
              className="h-10 px-4 text-xs gap-1.5 cursor-pointer"
            >
              <Printer className="size-3.5" />
              Print
            </Button>
            <Button
              type="button"
              onClick={handleDownload}
              className="h-10 px-6 text-xs font-bold gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm cursor-pointer"
            >
              <Download className="size-4" />
              Download ACORD PDF
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
