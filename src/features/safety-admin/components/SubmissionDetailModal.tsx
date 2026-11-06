import { toast } from "sonner"
import * as React from "react"
import type { SubmissionRecord, ChecklistItem } from "@/types"
import { submissionsService } from "@/services/submissionsService"
import { generateSafetyAuditPdf } from "@/services/pdfReportService"
import { sendBrandedAuditEmail } from "@/services/brandedEmailService"
import { VoiceAudioPlayer } from "./VoiceAudioPlayer"
import { DeleteSubmissionDialog } from "./DeleteSubmissionDialog"
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
  HardHat,
  Send,
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
  const [showRevisionForm, setShowRevisionForm] = React.useState(false)

  React.useEffect(() => {
    if (submission) {
      setApprovalStatus((submission.approvalStatus as any) || (submission.data?.approvalStatus as any) || "pending_approval")
      setApprovalNotes(submission.approvalNotes || submission.data?.approvalNotes || "")
      setApprovedBy(submission.approvedBy || submission.data?.approvedBy || "")
      setApprovedAt(submission.approvedAt || submission.data?.approvedAt || "")
      setShowRevisionForm(false)
    }
  }, [submission?.id, submission?.approvalStatus, submission?.data?.approvalStatus])

  const handleUpdateApproval = async (newStatus: "pending_approval" | "approved" | "revision_requested" | "rejected") => {
    if (!submission?.id) return
    setIsUpdatingApproval(true)
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

  const complianceScore = Math.round((passedCount / (passedCount + failedCount || 1)) * 100)

  const cleanTitle = React.useMemo(() => {
    if (!submission?.title) return "Daily Site Safety Inspection"
    const parts = submission.title.split(" - ")
    let main = parts[0]
    main = main.replace(/\(\d+\s*Items?\s*Verified\)/gi, "").trim()
    return main || submission.title
  }, [submission?.title])

  const locationSubtitle = React.useMemo(() => {
    if (submission?.jobSiteName) return submission.jobSiteName
    if (submission?.title?.includes(" - ")) {
      return submission.title.split(" - ").slice(1).join(" • ").trim()
    }
    return ""
  }, [submission?.jobSiteName, submission?.title])

  const foremanDisplayName =
    submission?.foremanName ||
    submission?.data?.foremanName ||
    "Diego Morales"

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
      "documentUrl",
      "document_url",
      "html",
      "reportHtml",
    ])
    return Object.entries(submission.data).filter(([key, val]) => {
      if (excludedKeys.has(key)) return false
      if (val === null || val === undefined) return false

      // Filter out raw base64 data URIs or raw HTML text strings
      if (typeof val === "string") {
        if (
          val.startsWith("data:text/html") ||
          val.startsWith("data:image/") ||
          val.startsWith("data:application/") ||
          val.includes("<!DOCTYPE html>") ||
          val.length > 500
        ) {
          return false
        }
      }
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
          {/* Executive Header */}
          <SheetHeader className="px-6 pt-5 pb-3 border-b shrink-0 text-left bg-card space-y-3">
            {/* Row 1: Soft Colored Status Pills + Quick Action Bar */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Approval Status Pill */}
                {approvalStatus === "approved" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    Certified by Admin
                  </span>
                )}
                {approvalStatus === "revision_requested" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                    <AlertTriangle className="size-3.5 text-amber-600 dark:text-amber-400" />
                    Revision Requested
                  </span>
                )}
                {approvalStatus === "rejected" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                    <XCircle className="size-3.5 text-rose-600 dark:text-rose-400" />
                    Rejected
                  </span>
                )}
                {approvalStatus === "pending_approval" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20">
                    <Clock className="size-3.5 text-sky-600 dark:text-sky-400" />
                    Pending Admin Approval
                  </span>
                )}

                {/* Compliance Score Pill */}
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
                    failedCount === 0
                      ? "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20"
                      : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                  }`}
                >
                  {complianceScore}% Compliant
                </span>

                {/* Cloud Sync Status Pill */}
                {submission.syncStatus === "synced" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    Synced
                  </span>
                )}
                {submission.syncStatus === "pending" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                    <Clock className="size-3.5 text-amber-600 dark:text-amber-400" />
                    Pending Sync
                  </span>
                )}
                {submission.syncStatus === "failed" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                    <AlertTriangle className="size-3.5 text-rose-600 dark:text-rose-400" />
                    Sync Failed
                  </span>
                )}
              </div>

              {/* Quick Actions (Print & PDF) */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handlePrint}
                  className="size-8 rounded-xl border-border/80 text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Print Audit"
                >
                  <Printer className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  onClick={handleDownload}
                  disabled={isGeneratingPdf}
                  className="h-8 px-3.5 text-xs font-bold rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="size-3.5" />
                  {isGeneratingPdf ? "Generating..." : "PDF Report"}
                </Button>
              </div>
            </div>

            {/* Row 2: Clean Inspection Title & Subtitle */}
            <div className="space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <SheetTitle className="text-lg sm:text-xl font-bold text-foreground tracking-tight leading-snug">
                  {cleanTitle}
                </SheetTitle>
                <span className="text-xs text-muted-foreground shrink-0 font-medium flex items-center gap-1">
                  <Calendar className="size-3.5" />
                  {submission.timestamp}
                </span>
              </div>

              <SheetDescription className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 text-foreground font-medium">
                  <HardHat className="size-3.5 text-amber-600 dark:text-amber-500" />
                  Foreman: <strong className="font-semibold">{foremanDisplayName}</strong>
                </span>
                {locationSubtitle && (
                  <>
                    <span className="text-muted-foreground/60">•</span>
                    <span className="text-foreground/90 font-medium">{locationSubtitle}</span>
                  </>
                )}
                {submission.companyName && (
                  <>
                    <span className="text-muted-foreground/60">•</span>
                    <span className="text-muted-foreground">{submission.companyName}</span>
                  </>
                )}
              </SheetDescription>
            </div>

            {/* Row 3: 4-Stat Metric Summary Strip */}
            <div className="rounded-2xl border border-border/70 bg-card p-2.5 grid grid-cols-4 divide-x divide-border/60 text-center shadow-2xs">
              <div className="px-2">
                <div className="text-base font-bold text-foreground leading-none mb-1">
                  {checklistItems.length}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Checked
                </div>
              </div>
              <div className="px-2">
                <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 leading-none mb-1">
                  {passedCount}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Passed
                </div>
              </div>
              <div className="px-2">
                <div
                  className={`text-base font-bold leading-none mb-1 ${
                    failedCount > 0
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {failedCount}
                </div>
                <div
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    failedCount > 0
                      ? "text-rose-700 dark:text-rose-400"
                      : "text-muted-foreground"
                  }`}
                >
                  Flagged
                </div>
              </div>
              <div className="px-2">
                <div
                  className={`text-base font-bold leading-none mb-1 ${
                    failedCount === 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-orange-600 dark:text-orange-400"
                  }`}
                >
                  {complianceScore}%
                </div>
                <div
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    failedCount === 0
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-orange-600 dark:text-orange-400"
                  }`}
                >
                  Score
                </div>
              </div>
            </div>

            {/* Row 4: View Switcher Tabs Bar (Segmented Control - No Clunky Blocks) */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border/50 self-start">
              {hasItems && (
                <button
                  type="button"
                  onClick={() => setActiveTab("markings")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "markings"
                      ? "bg-card text-foreground font-bold shadow-xs border border-border/60"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ClipboardList className="size-3.5 text-orange-600 dark:text-orange-500" />
                  Checklist Markings ({checklistItems.length})
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveTab("photos")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "photos"
                    ? "bg-card text-foreground font-bold shadow-xs border border-border/60"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Camera className="size-3.5 text-sky-600 dark:text-sky-500" />
                Evidence Photos ({visiblePhotos.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "overview"
                    ? "bg-card text-foreground font-bold shadow-xs border border-border/60"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="size-3.5 text-emerald-600 dark:text-emerald-500" />
                Overview & Sign-Off
              </button>
            </div>
          </SheetHeader>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-xs">
            {/* Super Admin Compliance Decision & Directive Ribbon */}
            <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/5 via-card to-card p-3.5 space-y-2.5 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold">
                    <ShieldCheck className="size-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">
                      Super Admin Compliance Attestation
                    </span>
                    <span className="text-[10.5px] text-muted-foreground block">
                      Review checkpoints and authorize this field submission
                    </span>
                  </div>
                </div>

                {/* 3 Executive Action Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    disabled={isUpdatingApproval}
                    onClick={() => handleUpdateApproval("approved")}
                    className={`h-7 px-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                      approvalStatus === "approved"
                        ? "bg-emerald-600 text-white shadow-2xs ring-2 ring-emerald-500/30"
                        : "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 border border-emerald-500/25"
                    }`}
                  >
                    <Check className="size-3 stroke-[2.5]" />
                    {approvalStatus === "approved" ? "Certified Approved" : "Approve & Certify"}
                  </button>

                  <button
                    type="button"
                    disabled={isUpdatingApproval}
                    onClick={() => setShowRevisionForm((prev) => !prev)}
                    className={`h-7 px-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                      approvalStatus === "revision_requested" || showRevisionForm
                        ? "bg-amber-600 text-white shadow-2xs ring-2 ring-amber-500/30"
                        : "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border border-amber-500/25"
                    }`}
                  >
                    <AlertTriangle className="size-3" />
                    {approvalStatus === "revision_requested" ? "Revision Required" : "Request Revision"}
                  </button>

                  <button
                    type="button"
                    disabled={isUpdatingApproval}
                    onClick={() => handleUpdateApproval("rejected")}
                    className={`h-7 px-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                      approvalStatus === "rejected"
                        ? "bg-rose-600 text-white shadow-2xs ring-2 ring-rose-500/30"
                        : "bg-rose-500/10 text-rose-700 hover:bg-rose-500/20 border border-rose-500/25"
                    }`}
                  >
                    <XCircle className="size-3" />
                    Reject
                  </button>
                </div>
              </div>

              {/* Revision Request Inline Drawer (Opened only when Request Revision button is clicked) */}
              {showRevisionForm && (
                <div className="pt-2.5 border-t border-amber-500/30 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[11.5px] font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <AlertTriangle className="size-3.5 text-amber-600 shrink-0" />
                      Specify Revision Directives for Foreman & Boss:
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowRevisionForm(false)}
                      className="text-[11px] text-muted-foreground hover:text-foreground font-medium cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    placeholder="e.g. Scaffolding guardrail deficiency requires photo remediation within 24h before clearance..."
                    className="w-full p-2.5 text-xs rounded-xl border border-amber-500/35 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-2xs resize-none"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowRevisionForm(false)}
                      className="h-7 px-2.5 text-xs cursor-pointer"
                    >
                      Dismiss
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      disabled={isUpdatingApproval || !approvalNotes.trim()}
                      onClick={async () => {
                        await handleUpdateApproval("revision_requested")
                        setShowRevisionForm(false)
                      }}
                      className="h-7 px-3 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-2xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Send className="size-3" />
                      Dispatch Revision Request
                    </Button>
                  </div>
                </div>
              )}

              {/* Active Revision Directive Display (Compact notice when form is closed) */}
              {!showRevisionForm && approvalStatus === "revision_requested" && approvalNotes && (
                <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between gap-2 text-xs bg-amber-500/10 px-3 py-2 rounded-xl text-amber-900 dark:text-amber-200">
                  <div className="flex items-start gap-2 min-w-0">
                    <AlertTriangle className="size-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span className="truncate">
                      <strong>Revision Directive:</strong> {approvalNotes}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRevisionForm(true)}
                    className="text-[11px] font-bold text-amber-800 dark:text-amber-300 hover:underline shrink-0 cursor-pointer"
                  >
                    Edit Directive
                  </button>
                </div>
              )}

              {(approvedBy || approvedAt) && (
                <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 px-0.5 pt-0.5">
                  <ShieldCheck className="size-3 text-emerald-600" />
                  <span>
                    Last reviewed by <strong className="text-foreground">{approvedBy || "Super Admin"}</strong>
                    {approvedAt ? ` on ${new Date(approvedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}` : ""}
                  </span>
                </div>
              )}
            </div>

            {/* TAB 1: CHECKLIST MARKINGS SCREEN */}
            {activeTab === "markings" && hasItems && (
              <div className="space-y-3.5">
                {/* Unified Executive Checkpoints Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 p-2 rounded-2xl bg-card border border-border/70 shadow-2xs">
                  {/* Left: Verified Checkpoints header */}
                  <div className="flex items-center gap-2 pl-1">
                    <span className="p-1 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-500">
                      <ClipboardList className="size-4" />
                    </span>
                    <span className="font-bold text-xs uppercase tracking-wider text-foreground">
                      Verified Checkpoints ({checklistItems.length})
                    </span>
                  </div>

                  {/* Interactive Status Filter Pills (NO BLACK BADGES) */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setMarkingStatusFilter("all")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        markingStatusFilter === "all"
                          ? "bg-orange-500/15 text-orange-700 dark:text-orange-400 border border-orange-500/30"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <span>All</span>
                      <span className="font-mono text-[11px] opacity-80">({checklistItems.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMarkingStatusFilter("pass")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        markingStatusFilter === "pass"
                          ? "bg-emerald-600 text-white shadow-2xs font-bold"
                          : "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20"
                      }`}
                    >
                      <CheckCircle2 className="size-3" />
                      <span>Passed</span>
                      <span className="font-mono text-[11px]">({passedCount})</span>
                    </button>

                    {failedCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setMarkingStatusFilter("fail")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          markingStatusFilter === "fail"
                            ? "bg-rose-600 text-white shadow-2xs font-bold"
                            : "text-rose-700 dark:text-rose-400 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30"
                        }`}
                      >
                        <AlertTriangle className="size-3" />
                        <span>Deficiencies</span>
                        <span className="font-mono text-[11px]">({failedCount})</span>
                      </button>
                    )}

                    {naCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setMarkingStatusFilter("na")}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          markingStatusFilter === "na"
                            ? "bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold"
                            : "text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <span>N/A</span>
                        <span className="font-mono text-[11px]">({naCount})</span>
                      </button>
                    )}

                    {categories.length > 0 && (
                      <select
                        value={markingCategoryFilter}
                        onChange={(e) => setMarkingCategoryFilter(e.target.value)}
                        className="h-8 px-2.5 text-xs font-medium rounded-xl border border-border/80 bg-background text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs ml-1"
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
                </div>

                {/* Clean, Generously Spaced Checkpoint Items */}
                <div className="space-y-3">
                  {filteredItems.map((item, idx) => {
                    const isPass = item.status === "pass"
                    const isFail = item.status === "fail"
                    const isNa = item.status === "na"

                    return (
                      <div
                        key={item.id || idx}
                        className={`p-4 rounded-2xl border text-xs space-y-2.5 transition-all shadow-2xs ${
                          isFail
                            ? "border-rose-500/35 bg-rose-500/[0.04] ring-1 ring-rose-500/15"
                            : isPass
                            ? "border-border/80 bg-card hover:border-border"
                            : "border-border/60 bg-muted/20"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-bold text-muted-foreground">
                                #{idx + 1}
                              </span>
                              {item.category && (
                                <span className="px-2 py-0.5 rounded-md text-[9.5px] uppercase font-bold tracking-wider bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/20">
                                  {item.category.replace("_", " ")}
                                </span>
                              )}
                              {item.oshaRef && (
                                <span className="px-2 py-0.5 rounded-md text-[9.5px] font-mono font-medium bg-muted text-muted-foreground border border-border/60">
                                  OSHA {item.oshaRef}
                                </span>
                              )}
                            </div>

                            <p className="font-semibold text-xs text-foreground leading-relaxed">
                              {item.labelEn}
                            </p>
                          </div>

                          {/* Status Marking Badge - Clean pastel pills (NO BLACK BADGES) */}
                          <div className="shrink-0 pt-0.5">
                            {isPass && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                                <Check className="size-2.5 stroke-[3]" /> PASS
                              </span>
                            )}
                            {isFail && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/40">
                                <AlertTriangle className="size-2.5" /> DEFICIENT
                              </span>
                            )}
                            {isNa && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-medium bg-muted text-muted-foreground border border-border/60">
                                N/A
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Field Remediation Note */}
                        {item.notes && (
                          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-900 dark:text-amber-200 space-y-0.5">
                            <span className="font-bold text-[10px] uppercase tracking-wider block text-amber-800 dark:text-amber-300">
                              Field Note / Remediation:
                            </span>
                            <p className="leading-relaxed">{item.notes}</p>
                          </div>
                        )}

                        {/* Attached Foreman Exact Voice Audio Player */}
                        {item.audioUri && (
                          <div className="pt-0.5 max-w-md">
                            <VoiceAudioPlayer
                              audioUri={item.audioUri}
                              duration={item.audioDuration}
                              label="Foreman Exact Voice Recording"
                            />
                          </div>
                        )}

                        {/* Attached Evidence Photo Proof */}
                        {item.photoUri && (
                          <div className="flex items-center gap-2.5 pt-1">
                            <div
                              onClick={() =>
                                setPreviewPhoto({
                                  uri: item.photoUri!,
                                  label: item.labelEn || "Item Hazard Photo",
                                })
                              }
                              className="group relative size-14 rounded-xl overflow-hidden border border-border cursor-pointer shadow-2xs hover:ring-2 hover:ring-primary transition-all shrink-0"
                            >
                              <img
                                src={item.photoUri}
                                alt="Evidence"
                                className="size-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <ZoomIn className="size-3.5" />
                              </div>
                            </div>
                            <div className="text-[11px] space-y-0.5">
                              <span className="font-semibold text-foreground block">
                                Attached Photo Proof
                              </span>
                              <span className="text-muted-foreground text-[10.5px]">
                                Tap thumbnail to view full-size
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {filteredItems.length === 0 && (
                    <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-2xl bg-muted/20">
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
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-background/90 backdrop-blur-xs text-[9px] font-bold uppercase text-foreground border border-border/70">
                              {photo.category.replace("_", " ")}
                            </span>
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

      {/* Delete Submission Custom Modal Dialog */}
      <DeleteSubmissionDialog
        submission={submission}
        open={isDeleteDialogOpen}
        isDeleting={isDeleting}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />

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
