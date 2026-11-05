import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader2, Trash2 } from "lucide-react"
import type { SubmissionRecord } from "@/types"

interface DeleteSubmissionDialogProps {
  submission: SubmissionRecord | null
  open: boolean
  isDeleting: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DeleteSubmissionDialog({
  submission,
  open,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteSubmissionDialogProps) {
  if (!submission) return null

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-md p-6 rounded-2xl bg-card border border-border/80 shadow-2xl">
        <DialogHeader className="space-y-3">
          <div className="size-11 rounded-2xl bg-rose-500/15 text-rose-600 flex items-center justify-center border border-rose-500/25">
            <Trash2 className="size-5.5" />
          </div>
          <div>
            <DialogTitle className="text-base font-bold text-foreground">
              Delete Audit Submission Permanently?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed mt-2 space-y-2.5">
              <span>
                Are you sure you want to permanently delete this safety audit record?
              </span>
              <div className="p-3 rounded-xl bg-muted/60 border border-border/70 text-foreground font-medium text-xs space-y-1.5 my-2">
                <p className="font-bold text-xs text-foreground line-clamp-2">{submission.title}</p>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                  <span>ID: {submission.id}</span>
                  <span>{submission.timestamp}</span>
                </div>
                {submission.jobSiteName && (
                  <p className="text-[11px] text-muted-foreground truncate">
                    Site: {submission.jobSiteName}
                  </p>
                )}
              </div>
              <span className="text-rose-600 dark:text-rose-400 font-semibold text-[11px] flex items-center gap-1.5 pt-1">
                <AlertTriangle className="size-3.5 shrink-0" />
                This action cannot be undone. All photo evidence and signatures will be purged.
              </span>
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="mt-5 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
            className="text-xs font-semibold rounded-xl h-9 px-4 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={isDeleting}
            className="text-xs font-bold rounded-xl h-9 px-4 gap-1.5 bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-xs"
          >
            {isDeleting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Deleting Audit...
              </>
            ) : (
              <>
                <Trash2 className="size-3.5" />
                Yes, Delete Audit
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
