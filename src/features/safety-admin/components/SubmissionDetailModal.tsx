import { toast } from "sonner"
import * as React from "react"
import type { SubmissionRecord, ChecklistItem } from "@/types"
import { submissionsService } from "@/services/submissionsService"
import { generateSafetyAuditPdf } from "@/services/pdfReportService"
import { sendBrandedAuditEmail } from "@/services/brandedEmailService"
import { DeleteSubmissionDialog } from "./DeleteSubmissionDialog"
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
  AlertTriangle,
  MinusCircle,
  Camera,
  Image as ImageIcon,
  ZoomIn,
  FileText,
  ClipboardList,
  Trash2,
  Check,
  XCircle,
  Clock,
  ShieldCheck,
  Loader2,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SubmissionDetailModalProps {
  submission: SubmissionRecord | null
  onClose: () => void
}

export function SubmissionDetailModal({
  submission,
  onClose,
}: SubmissionDetailModalProps) {
  if (!submission) return null

  // Extract checklist items from data payload
  const checklistItems: ChecklistItem[] = React.useMemo(() => {
    if (!submission?.data?.items) return []
    if (Array.isArray(submission.data.items)) return submission.data.items
    return []
  }, [submission])

  const hasItems = checklistItems.length > 0

  // Extract all photos attached to inspection
  const allPhotos = React.useMemo(() => {
    const list: { uri: string; label: string; category?: string; id?: string }[] = []

    checklistItems.forEach((item, idx) => {
      if (item.photoUri) {
        list.push({
          uri: item.photoUri,
          label: item.labelEn || `Checklist Item #${idx + 1}`,
          category: item.category,
          id: item.id,
        })
      }
      const extraPhotos = (item as any).photos
      if (Array.isArray(extraPhotos)) {
        extraPhotos.forEach((p: string, pIdx: number) => {
          list.push({
            uri: p,
            label: `${item.labelEn || "Item"} - Photo ${pIdx + 1}`,
            category: item.category,
            id: `${item.id}-${pIdx}`,
          })
        })
      }
    })

    if (Array.isArray(submission?.data?.photos)) {
      submission.data.photos.forEach((p: string, idx: number) => {
        if (!list.some((existing) => existing.uri === p)) {
          list.push({
            uri: p,
            label: `Evidence Photo #${idx + 1}`,
          })
        }
      })
    }

    if (Array.isArray(submission?.data?.photoUrls)) {
      submission.data.photoUrls.forEach((p: string, idx: number) => {
        if (!list.some((existing) => existing.uri === p)) {
          list.push({
            uri: p,
            label: `Evidence Photo #${idx + 1}`,
          })
        }
      })
    }

    return list
  }, [checklistItems, submission])

  // Active view tab in modal
  const [activeTab, setActiveTab] = React.useState<"markings" | "photos" | "overview">(
    hasItems ? "markings" : "overview"
  )

  // Reset active tab whenever a different submission is selected
  React.useEffect(() => {
    if (hasItems) {
      setActiveTab("markings")
    } else {
      setActiveTab("overview")
    }
  }, [submission?.id, hasItems])

  // Filters for checklist markings
  const [markingStatusFilter, setMarkingStatusFilter] = React.useState<"all" | "pass" | "fail" | "na">("all")
  const [markingCategoryFilter, setMarkingCategoryFilter] = React.useState<string>("all")

  // Selected photo for fullscreen lightbox
  const [previewPhoto, setPreviewPhoto] = React.useState<{ uri: string; label: string } | null>(null)

  // Super Admin Approval State
  const [approvalStatus, setApprovalStatus] = React.useState<"pending_approval" | "approved" | "revision_requested" | "rejected">(
    (submission?.approvalStatus as any) || (submission?.data?.approvalStatus as any) || "pending_approval"
  )
  const [approvalNotes, setApprovalNotes] = React.useState<string>(
    submission?.approvalNotes || submission?.data?.approvalNotes || ""
  )
  const [approvedBy, setApprovedBy] = React.useState<string>(
    submission?.approvedBy || submission?.data?.approvedBy || ""
  )
  const [approvedAt, setApprovedAt] = React.useState<string>(
    submission?.approvedAt || submission?.data?.approvedAt || ""
  )
  const [isUpdatingApproval, setIsUpdatingApproval] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [approvalFeedbackMessage, setApprovalFeedbackMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (submission) {
      setApprovalStatus((submission.approvalStatus as any) || (submission.data?.approvalStatus as any) || "pending_approval")
      setApprovalNotes(submission.approvalNotes || submission.data?.approvalNotes || "")
      setApprovedBy(submission.approvedBy || submission.data?.approvedBy || "")
      setApprovedAt(submission.approvedAt || submission.data?.approvedAt || "")
      setApprovalFeedbackMessage(null)
    }
  }, [submission?.id, submission?.approvalStatus, submission?.data?.approvalStatus])

  const handleUpdateApproval = async (newStatus: "pending_approval" | "approved" | "revision_requested" | "rejected") => {
    if (!submission?.id) return
    setIsUpdatingApproval(true)
    setApprovalFeedbackMessage(null)
    try {
      const ok = await submissionsService.updateApprovalStatus(submission.id, newStatus, {
        reviewerName: "Safety Director / Super Admin",
        reviewerEmail: "safety.admin@titanconcrete.com",
        notes: approvalNotes.trim(),
      })
      if (ok) {
        setApprovalStatus(newStatus)
        setApprovedBy("Safety Director / Super Admin")
        setApprovedAt(new Date().toISOString())
        toast.success(`Status updated: ${newStatus.replace("_", " ").toUpperCase()}`)
      } else {
        toast.error("Failed to update approval status. Please verify your connection.")
      }
    } catch (err) {
      console.error("Error updating approval:", err)
    } finally {
      setIsUpdatingApproval(false)
    }
  }

  // Computed counts
  const passedCount = React.useMemo(
    () => checklistItems.filter((i) => i.status === "pass").length,
    [checklistItems]
  )
  const failedCount = React.useMemo(
    () => checklistItems.filter((i) => i.status === "fail").length,
    [checklistItems]
  )
  const naCount = React.useMemo(
    () => checklistItems.filter((i) => i.status === "na").length,
    [checklistItems]
  )

  // Available categories
  const categories = React.useMemo(() => {
    const set = new Set<string>()
    checklistItems.forEach((i) => {
      if (i.category) set.add(i.category)
    })
    return Array.from(set)
  }, [checklistItems])

  // Filtered items
  const filteredItems = React.useMemo(() => {
    return checklistItems.filter((item) => {
      const matchesStatus =
        markingStatusFilter === "all" ||
        (markingStatusFilter === "pass" && item.status === "pass") ||
        (markingStatusFilter === "fail" && item.status === "fail") ||
        (markingStatusFilter === "na" && item.status === "na")

      const matchesCat =
        markingCategoryFilter === "all" || item.category === markingCategoryFilter

      return matchesStatus && matchesCat
    })
  }, [checklistItems, markingStatusFilter, markingCategoryFilter])

  // Clean scalar summary entries (FILTER OUT items, failedItems, photos, signatureUri, trade, inspectingArea to eliminate duplicates and [object Object])
  const cleanSummaryEntries = React.useMemo(() => {
    if (!submission?.data) return []
    const excludedKeys = new Set([
      "items",
      "failedItems",
      "photos",
      "photoUrls",
      "signatureUri",
      "signature_uri",
      "signature",
      "data",
      "trade",
      "inspectingArea",
      "photoCount",
      "passedCount",
      "failedCount",
      "naCount",
      "totalItems",
    ])
    return Object.entries(submission.data).filter(([key, val]) => {
      if (excludedKeys.has(key)) return false
      if (val === null || val === undefined) return false
      if (typeof val === "object") {
        if (Array.isArray(val)) {
          // If array contains any objects, skip it
          if (val.some((v) => typeof v === "object" && v !== null)) return false
          if (val.length === 0) return false
          return true
        }
        return false
      }
      return true
    })
  }, [submission?.data])

  // Signature data check
  const signatureData =
    submission.signatureUri ||
    submission.data?.signatureUri ||
    submission.data?.signature
  // Deleted photos tracking state
  const [deletedPhotoUris, setDeletedPhotoUris] = React.useState<string[]>([])
  const [isDeleting, setIsDeleting] = React.useState(false)

  // Visible photos list (excluding locally deleted)
  const visiblePhotos = React.useMemo(() => {
    return allPhotos.filter((p) => !deletedPhotoUris.includes(p.uri))
  }, [allPhotos, deletedPhotoUris])

  const handleDeletePhoto = async (photo: { uri: string; label: string; id?: string }) => {
    if (!confirm(`Delete this evidence photo?\n"${photo.label}"`)) {
      return
    }
    setIsDeleting(true)
    try {
      const ok = await submissionsService.deletePhoto(submission.id, photo.uri, photo.id)
      if (ok) {
        setDeletedPhotoUris((prev) => [...prev, photo.uri])
        if (previewPhoto?.uri === photo.uri) {
          setPreviewPhoto(null)
        }
        toast.success("Photo removed from checklist.")
      } else {
        toast.error("Failed to delete photo. Please try again.")
      }
    } catch (err) {
      console.error("Delete photo error:", err)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteSubmission = () => {
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!submission?.id) return
    setIsDeleting(true)
    try {
      const ok = await submissionsService.deleteSubmission(submission.id)
      if (ok) {
        setIsDeleteDialogOpen(false)
        onClose()
      } else {
        toast.error("Failed to delete submission.")
      }
    } catch (err) {
      console.error("Delete submission error:", err)
    } finally {
      setIsDeleting(false)
    }
  }

  const isImageSignature =
    typeof signatureData === "string" &&
    (signatureData.startsWith("data:image") || signatureData.startsWith("http"))

  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false)
  const [isSendingEmail, setIsSendingEmail] = React.useState(false)

  const handleSendEmail = async () => {
    setIsSendingEmail(true)
    try {
      const ok = await sendBrandedAuditEmail(submission)
      if (ok) {
        toast.success("Branded Cal/OSHA compliance email with attached PDF was dispatched!")
      } else {
        toast.info("Email dispatch completed. Please verify SMTP delivery logs.")
      }
    } catch (err) {
      console.error("Email send failed:", err)
      toast.error("Failed to send email. Check network or server configuration.")
    } finally {
      setIsSendingEmail(false)
    }
  }

  const handleDownload = async () => {
    setIsGeneratingPdf(true)
    try {
      await generateSafetyAuditPdf(submission, visiblePhotos)
      toast.success("Safety Audit PDF downloaded successfully!")
    } catch (err) {
      console.error("PDF generation failed:", err)
      toast.error("Failed to generate PDF. Please try again.")
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      <Sheet open={Boolean(submission)} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="right" className="w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl flex flex-col p-0 overflow-hidden h-full">
          {/* Header */}
          <SheetHeader className="px-6 py-4 border-b shrink-0 text-left bg-card">
            <div className="flex items-center gap-2 flex-wrap mb-1">
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

              {/* Super Admin Approval Status Badge */}
              {approvalStatus === "approved" && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  <ShieldCheck className="size-3" />
                  Approved & Certified
                </span>
              )}
              {approvalStatus === "revision_requested" && (
                <span className="flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 font-bold bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  <AlertTriangle className="size-3" />
                  Revision Requested
                </span>
              )}
              {approvalStatus === "rejected" && (
                <span className="flex items-center gap-1 text-[11px] text-rose-700 dark:text-rose-400 font-bold bg-rose-500/15 px-2.5 py-0.5 rounded-full border border-rose-500/30">
                  <XCircle className="size-3" />
                  Rejected
                </span>
              )}
              {approvalStatus === "pending_approval" && (
                <span className="flex items-center gap-1 text-[11px] text-sky-700 dark:text-sky-400 font-bold bg-sky-500/15 px-2.5 py-0.5 rounded-full border border-sky-500/30">
                  <Clock className="size-3" />
                  Pending Admin Approval
                </span>
              )}
            </div>

            <SheetTitle className="text-base sm:text-lg font-bold text-foreground leading-snug">
              {submission.title}
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground flex flex-wrap items-center gap-3 mt-0.5">
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

            {/* View Switcher Tabs Bar */}
            <div className="flex items-center gap-1 pt-3 border-t border-border/50 mt-3">
              {hasItems && (
                <button
                  onClick={() => setActiveTab("markings")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    activeTab === "markings"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <ClipboardList className="size-3.5" />
                  Checklist Markings ({checklistItems.length})
                </button>
              )}

              <button
                onClick={() => setActiveTab("photos")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === "photos"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Camera className="size-3.5" />
                Evidence Photos ({visiblePhotos.length})
              </button>

              <button
                onClick={() => setActiveTab("overview")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === "overview"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <FileText className="size-3.5" />
                Overview & Sign-Off
              </button>
            </div>
          </SheetHeader>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs">
            {/* SUPER ADMIN APPROVAL CONSOLE */}
            <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card p-4 space-y-3.5 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-xs">
                    <ShieldCheck className="size-4.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                      Super Admin Audit Approval & Compliance Sign-Off
                      {approvalStatus === "approved" && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 border border-emerald-500/30">
                          CERTIFIED COMPLIANT
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Review checkpoints and authorize this field submission for OSHA recordkeeping
                    </p>
                  </div>
                </div>

                {approvedAt && (
                  <div className="text-[10.5px] font-mono text-muted-foreground bg-muted px-2.5 py-1 rounded-lg border border-border/60">
                    Reviewed: {new Date(approvedAt).toLocaleDateString()} by {approvedBy || "Super Admin"}
                  </div>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={isUpdatingApproval}
                  onClick={() => handleUpdateApproval("approved")}
                  className={`h-8 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer gap-1.5 ${
                    approvalStatus === "approved"
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs ring-2 ring-emerald-500/30"
                      : "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 border border-emerald-500/30"
                  }`}
                >
                  <Check className="size-3.5" />
                  {approvalStatus === "approved" ? "Audit Certified & Approved" : "Approve & Certify"}
                </Button>

                <Button
                  type="button"
                  size="sm"
                  disabled={isUpdatingApproval}
                  onClick={() => handleUpdateApproval("revision_requested")}
                  className={`h-8 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer gap-1.5 ${
                    approvalStatus === "revision_requested"
                      ? "bg-amber-600 hover:bg-amber-700 text-white shadow-xs ring-2 ring-amber-500/30"
                      : "bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 border border-amber-500/30"
                  }`}
                >
                  <AlertTriangle className="size-3.5" />
                  {approvalStatus === "revision_requested" ? "Revision Required" : "Request Revision"}
                </Button>

                <Button
                  type="button"
                  size="sm"
                  disabled={isUpdatingApproval}
                  onClick={() => handleUpdateApproval("rejected")}
                  className={`h-8 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer gap-1.5 ${
                    approvalStatus === "rejected"
                      ? "bg-rose-600 hover:bg-rose-700 text-white shadow-xs ring-2 ring-rose-500/30"
                      : "bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 border border-rose-500/30"
                  }`}
                >
                  <XCircle className="size-3.5" />
                  {approvalStatus === "rejected" ? "Audit Rejected" : "Reject Audit"}
                </Button>

                {approvalStatus !== "pending_approval" && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={isUpdatingApproval}
                    onClick={() => handleUpdateApproval("pending_approval")}
                    className="h-8 px-2.5 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Reset to Pending
                  </Button>
                )}

                {isUpdatingApproval && (
                  <div className="flex items-center gap-1.5 text-xs text-primary font-semibold animate-pulse ml-2">
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Saving Decision...</span>
                  </div>
                )}
              </div>

              {/* Reviewer Directives / Notes Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
                  <span>Reviewer Notes & Compliance Directives (Sent to Foreman & Boss):</span>
                  {approvalFeedbackMessage && (
                    <span className="text-emerald-600 font-bold animate-in fade-in">
                      {approvalFeedbackMessage}
                    </span>
                  )}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    placeholder="e.g. Scaffolding guardrail deficiency requires photo remediation within 24h before clearance..."
                    className="flex-1 h-8 px-3 text-xs rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isUpdatingApproval}
                    onClick={() => handleUpdateApproval(approvalStatus)}
                    className="h-8 px-3 text-xs font-semibold rounded-xl border-border/80 hover:bg-muted cursor-pointer shrink-0"
                  >
                    Save Notes
                  </Button>
                </div>
              </div>
            </div>
            {/* TAB 1: CHECKLIST MARKINGS SCREEN */}
            {activeTab === "markings" && hasItems && (
              <div className="space-y-4">
                {/* Tally Stats Card */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl border border-border bg-card">
                    <span className="text-[11px] text-muted-foreground block">Total Verified</span>
                    <span className="text-lg font-bold text-foreground mt-0.5 block">
                      {checklistItems.length}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium block flex items-center gap-1">
                      <CheckCircle2 className="size-3" /> Passed
                    </span>
                    <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mt-0.5 block">
                      {passedCount}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10">
                    <span className="text-[11px] text-rose-700 dark:text-rose-400 font-medium block flex items-center gap-1">
                      <AlertTriangle className="size-3" /> Deficiencies
                    </span>
                    <span className="text-lg font-bold text-rose-700 dark:text-rose-400 mt-0.5 block">
                      {failedCount}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl border border-border bg-muted/40">
                    <span className="text-[11px] text-muted-foreground block flex items-center gap-1">
                      <MinusCircle className="size-3" /> N/A Marked
                    </span>
                    <span className="text-lg font-bold text-foreground mt-0.5 block">
                      {naCount}
                    </span>
                  </div>
                </div>

                {/* Filter Controls Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-2 px-3 rounded-xl bg-muted/40 border border-border">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-semibold text-muted-foreground mr-1">Status:</span>
                    <button
                      onClick={() => setMarkingStatusFilter("all")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                        markingStatusFilter === "all"
                          ? "bg-card text-foreground shadow-2xs border border-border"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      All ({checklistItems.length})
                    </button>
                    <button
                      onClick={() => setMarkingStatusFilter("pass")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                        markingStatusFilter === "pass"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Passed ({passedCount})
                    </button>
                    <button
                      onClick={() => setMarkingStatusFilter("fail")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                        markingStatusFilter === "fail"
                          ? "bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Deficiencies ({failedCount})
                    </button>
                    <button
                      onClick={() => setMarkingStatusFilter("na")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                        markingStatusFilter === "na"
                          ? "bg-card text-foreground shadow-2xs border border-border"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      N/A ({naCount})
                    </button>
                  </div>

                  {categories.length > 0 && (
                    <select
                      value={markingCategoryFilter}
                      onChange={(e) => setMarkingCategoryFilter(e.target.value)}
                      className="h-7 px-2.5 text-[11px] rounded-md border border-border bg-card text-foreground"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c.replace("_", " ").toUpperCase()}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Markings List */}
                <div className="space-y-2.5">
                  {filteredItems.map((item, idx) => {
                    const isPass = item.status === "pass"
                    const isFail = item.status === "fail"
                    const isNa = item.status === "na"

                    return (
                      <div
                        key={item.id || idx}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isFail
                            ? "border-rose-500/30 bg-rose-500/5"
                            : isPass
                            ? "border-border bg-card hover:border-emerald-500/30"
                            : "border-border/60 bg-muted/20"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-bold text-muted-foreground">
                                #{idx + 1}
                              </span>
                              <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0">
                                {item.category?.replace("_", " ")}
                              </Badge>
                              {item.oshaRef && (
                                <Badge variant="outline" className="text-[9px] font-mono text-muted-foreground px-1.5 py-0">
                                  {item.oshaRef}
                                </Badge>
                              )}
                            </div>

                            <p className="font-medium text-xs text-foreground leading-snug">
                              {item.labelEn}
                            </p>

                            {item.labelEs && item.labelEs !== item.labelEn && (
                              <p className="text-[11px] text-muted-foreground italic leading-snug">
                                {item.labelEs}
                              </p>
                            )}

                            {/* Deficiency notes / corrective action */}
                            {item.notes && (
                              <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-[11px] space-y-0.5">
                                <span className="font-semibold block flex items-center gap-1">
                                  <AlertTriangle className="size-3" /> Field Note / Corrective Action:
                                </span>
                                <p>{item.notes}</p>
                              </div>
                            )}

                            {/* Attached Photo Thumbnail in item */}
                            {item.photoUri && (
                              <div className="mt-2 flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreviewPhoto({
                                      uri: item.photoUri!,
                                      label: item.labelEn || "Item Hazard Photo",
                                    })
                                  }
                                  className="relative group rounded-lg overflow-hidden border border-border size-16 shrink-0 bg-muted cursor-pointer"
                                  title="Click to view full image"
                                >
                                  <img
                                    src={item.photoUri}
                                    alt="Evidence"
                                    className="size-full object-cover group-hover:scale-105 transition-transform"
                                  />
                                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                    <ZoomIn className="size-4" />
                                  </div>
                                </button>
                                <div className="text-[11px] text-muted-foreground">
                                  <span className="font-medium text-foreground block">
                                    Evidence Photo Attached
                                  </span>
                                  <span>Click thumbnail to view full image</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Status Marking Badge */}
                          <div className="shrink-0 self-start sm:self-center">
                            {isPass && (
                              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold gap-1 py-1 px-2.5">
                                <CheckCircle2 className="size-3" /> PASS
                              </Badge>
                            )}
                            {isFail && (
                              <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 text-[11px] font-semibold gap-1 py-1 px-2.5">
                                <AlertTriangle className="size-3" /> DEFICIENT
                              </Badge>
                            )}
                            {isNa && (
                              <Badge variant="outline" className="text-muted-foreground text-[11px] font-medium gap-1 py-1 px-2.5">
                                <MinusCircle className="size-3" /> N/A
                              </Badge>
                            )}
                            {!isPass && !isFail && !isNa && (
                              <Badge variant="outline" className="text-muted-foreground text-[11px]">
                                Unanswered
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {filteredItems.length === 0 && (
                    <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
                      No checklist items match the selected filter.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: EVIDENCE PHOTOS SCREEN */}
            {activeTab === "photos" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Camera className="size-3.5 text-primary" />
                    Uploaded Evidence Photos ({visiblePhotos.length})
                  </h4>
                  {allPhotos.length > 0 && (
                    <span className="text-[11px] text-muted-foreground">
                      Click any photo to zoom in
                    </span>
                  )}
                </div>

                {visiblePhotos.length === 0 ? (
                  <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/40 flex flex-col items-center justify-center space-y-2">
                    <div className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      <ImageIcon className="size-5 opacity-60" />
                    </div>
                    <div className="font-semibold text-foreground text-xs">No Uploaded Photos</div>
                    <p className="max-w-xs text-[11px] text-muted-foreground">
                      No hazard or evidence photos attached to this inspection report.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {visiblePhotos.map((photo, i) => (
                      <div
                        key={i}
                        onClick={() => setPreviewPhoto(photo)}
                        className="group relative rounded-xl border border-border bg-card overflow-hidden hover:border-primary/50 transition-all cursor-pointer shadow-2xs"
                      >
                        <div className="aspect-4/3 w-full bg-muted overflow-hidden relative">
                          <img
                            src={photo.uri}
                            alt={photo.label}
                            className="size-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 font-medium text-xs">
                            <ZoomIn className="size-4" />
                            <span>View Full</span>
                          </div>
                          {photo.category && (
                            <Badge
                              variant="outline"
                              className="absolute top-2 left-2 bg-background/90 backdrop-blur-xs text-[9px] font-bold uppercase"
                            >
                              {photo.category.replace("_", " ")}
                            </Badge>
                          )}
                          <button
                            type="button"
                            title="Delete Photo"
                            disabled={isDeleting}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeletePhoto(photo)
                            }}
                            className="absolute top-2 right-2 z-10 size-7 rounded-lg bg-background/85 hover:bg-rose-600 hover:text-white text-muted-foreground backdrop-blur-xs flex items-center justify-center transition-colors shadow-xs"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                        <div className="p-2.5 flex items-center justify-between gap-1">
                          <div className="min-w-0">
                            <p className="font-medium text-xs text-foreground truncate" title={photo.label}>
                              {photo.label}
                            </p>
                            <span className="text-[10px] text-muted-foreground">
                              Inspection Attachment
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: OVERVIEW & SIGN-OFF SCREEN */}
            {activeTab === "overview" && (
              <div className="space-y-4">
                {/* Meta Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-muted/40 p-4 rounded-xl border border-border">
                  <div>
                    <span className="text-muted-foreground font-semibold">Active Jobsite:</span>
                    <p className="font-semibold text-foreground mt-0.5 text-xs flex items-center gap-1.5">
                      <Building2 className="size-3.5 text-primary shrink-0" />
                      {submission.jobSiteName}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                      Ref ID: {submission.jobSiteId}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-semibold">Submitting Lead / Foreman:</span>
                    <p className="font-semibold text-foreground mt-0.5 text-xs flex items-center gap-1.5">
                      <User className="size-3.5 text-primary shrink-0" />
                      {submission.foremanName}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {submission.foremanEmail || "Direct Mobile Submission"}
                    </p>
                  </div>
                </div>

                {/* Clean Key-Value Payload (Clean summary without [object Object]) */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Inspection Scope & Metadata
                  </h4>

                  <div className="rounded-xl border border-border bg-card p-4 space-y-2 text-xs">
                    {/* Primary inspection values */}
                    {submission.data?.trade && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1.5 border-b border-border/40">
                        <span className="font-semibold text-muted-foreground">Trade:</span>
                        <span className="font-medium text-foreground sm:text-right">
                          {submission.data.trade}
                        </span>
                      </div>
                    )}

                    {submission.data?.inspectingArea && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1.5 border-b border-border/40">
                        <span className="font-semibold text-muted-foreground">Inspecting Area:</span>
                        <span className="font-medium text-foreground sm:text-right">
                          {submission.data.inspectingArea}
                        </span>
                      </div>
                    )}

                    {typeof submission.data?.passedCount === "number" && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1.5 border-b border-border/40">
                        <span className="font-semibold text-muted-foreground">Passed Items:</span>
                        <span className="font-bold text-emerald-600 sm:text-right">
                          {submission.data.passedCount} items compliant
                        </span>
                      </div>
                    )}

                    {typeof submission.data?.failedCount === "number" && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1.5 border-b border-border/40">
                        <span className="font-semibold text-muted-foreground">Failed / Corrected:</span>
                        <span className={`font-bold sm:text-right ${submission.data.failedCount > 0 ? "text-rose-600" : "text-foreground"}`}>
                          {submission.data.failedCount} deficiencies
                        </span>
                      </div>
                    )}

                    {typeof submission.data?.naCount === "number" && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1.5 border-b border-border/40">
                        <span className="font-semibold text-muted-foreground">N/A Items:</span>
                        <span className="font-medium text-foreground sm:text-right">
                          {submission.data.naCount}
                        </span>
                      </div>
                    )}

                    {/* Additional scalar entries */}
                    {cleanSummaryEntries.map(([key, val]) => (
                      <div
                        key={key}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1.5 border-b border-border/40 last:border-0"
                      >
                        <span className="font-semibold text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}:
                        </span>
                        <span className="font-medium text-foreground sm:text-right max-w-sm break-words">
                          {Array.isArray(val)
                            ? val.filter((v) => typeof v !== "object").join(", ")
                            : typeof val === "boolean"
                            ? val
                              ? "Yes"
                              : "No"
                            : String(val)}
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

                    {isImageSignature ? (
                      <div className="h-20 rounded-lg border border-dashed border-border bg-white dark:bg-zinc-950 flex flex-col items-center justify-center p-2">
                        <img
                          src={signatureData}
                          alt="Foreman Signature"
                          className="max-h-12 max-w-full object-contain filter dark:invert"
                        />
                        <span className="text-[10px] text-muted-foreground mt-1">
                          {submission.foremanName} • Timestamped: {submission.timestamp}
                        </span>
                      </div>
                    ) : (
                      <div className="h-20 rounded-lg border border-dashed border-border bg-muted/30 flex flex-col items-center justify-center text-center p-2">
                        <span className="font-serif italic text-base text-foreground font-bold">
                          {submission.foremanName}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Timestamped: {submission.timestamp}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Notification Route Recipients */}
                  <div className="rounded-xl border border-border bg-card p-3.5 space-y-2">
                    <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Mail className="size-3.5 text-emerald-600" />
                      Dispatched Email Recipients
                    </span>
                    <div className="space-y-1">
                      {submission.recipients && submission.recipients.length > 0 ? (
                        submission.recipients.map((r, i) => (
                          <div
                            key={i}
                            className="text-[11px] font-mono text-muted-foreground truncate bg-muted/40 px-2 py-0.5 rounded"
                          >
                            {r}
                          </div>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-[11px]">
                          Standard Safety Routing
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions Footer (Pinned) */}
          <SheetFooter className="px-6 py-4 border-t bg-card shrink-0 flex flex-row items-center justify-between gap-3 mt-auto">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-9 px-4 text-xs font-medium cursor-pointer"
              >
                Close
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleDeleteSubmission}
                disabled={isDeleting}
                className="h-9 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-500/10 hover:text-rose-700 cursor-pointer gap-1.5"
              >
                <Trash2 className="size-3.5" />
                Delete Audit
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrint}
                className="h-9 px-3 text-xs gap-1.5 cursor-pointer"
              >
                <Printer className="size-3.5" />
                Print
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSendEmail}
                disabled={isSendingEmail}
                className="h-9 px-3 text-xs gap-1.5 cursor-pointer text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 font-medium"
              >
                <Mail className="size-3.5" />
                {isSendingEmail ? "Dispatching..." : "Dispatch Branded Email"}
              </Button>
              <Button
                type="button"
                onClick={handleDownload}
                disabled={isGeneratingPdf}
                className="h-9 px-4 text-xs font-bold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm cursor-pointer"
              >
                {isGeneratingPdf ? (
                  <>
                    <div className="size-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating PDF...
                    {/* Delete Submission Custom Modal Dialog */}
      <DeleteSubmissionDialog
        submission={submission}
        open={isDeleteDialogOpen}
        isDeleting={isDeleting}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
                ) : (
                  <>
                    <Download className="size-3.5" />
                    Download Official PDF
                  </>
                )}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Lightbox Dialog for Full Image Preview */}
      <Dialog open={Boolean(previewPhoto)} onOpenChange={(open) => !open && setPreviewPhoto(null)}>
        <DialogContent className="max-w-3xl p-4">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-sm font-semibold text-foreground">
              {previewPhoto?.label || "Evidence Photo"}
            </DialogTitle>
            {previewPhoto && (
              <Button
                size="sm"
                variant="destructive"
                disabled={isDeleting}
                className="h-7 text-xs gap-1.5 cursor-pointer mr-6"
                onClick={() => handleDeletePhoto(previewPhoto)}
              >
                <Trash2 className="size-3.5" />
                Delete Photo
              </Button>
            )}
          </DialogHeader>
          <div className="mt-2 rounded-xl overflow-hidden bg-black/90 flex items-center justify-center max-h-[75vh]">
            {previewPhoto && (
              <img
                src={previewPhoto.uri}
                alt={previewPhoto.label}
                className="max-h-[70vh] max-w-full object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
