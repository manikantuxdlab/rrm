import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader2 } from "lucide-react"
import type { JobSite } from "@/types"

interface Props {
  jobsite: JobSite | null
  open: boolean
  isDeleting: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DeleteJobsiteDialog({
  jobsite,
  open,
  isDeleting,
  onClose,
  onConfirm,
}: Props) {
  if (!jobsite) return null

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-md p-5">
        <DialogHeader className="space-y-2">
          <div className="size-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <AlertTriangle className="size-5" />
          </div>
          <DialogTitle className="text-base font-bold text-foreground">
            Delete Jobsite?
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Are you sure you want to delete <span className="font-semibold text-foreground">"{jobsite.name}"</span> (Job #{jobsite.jobNumber})? This will permanently remove its emergency action plans and safety details.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={isDeleting}
            className="text-xs gap-1.5 font-semibold"
          >
            {isDeleting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Deleting...
              </>
            ) : (
              "Yes, Delete Jobsite"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

