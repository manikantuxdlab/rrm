import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ChecklistItem } from "@/types"
import { ClipboardCheck, Check } from "lucide-react"

interface ChecklistItemEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: ChecklistItem | null
  onSave: (item: ChecklistItem) => void
}

const CATEGORIES: Array<{ key: ChecklistItem["category"]; label: string }> = [
  { key: "ppe", label: "PPE & Personal Safety" },
  { key: "housekeeping", label: "Housekeeping & Access" },
  { key: "fall_protection", label: "Fall Protection & Guardrails" },
  { key: "ladders_scaffolds", label: "Ladders & Scaffolding" },
  { key: "electrical_tools", label: "Electrical, Power Tools & GFCI" },
  { key: "excavation", label: "Excavation, Trenches & Shoring" },
  { key: "heavy_equipment", label: "Heavy Equipment, Cranes & Rigging" },
  { key: "fire_hazards", label: "Fire Prevention & Flammables" },
]

export function ChecklistItemEditModal({
  open,
  onOpenChange,
  item,
  onSave,
}: ChecklistItemEditModalProps) {
  const [labelEn, setLabelEn] = React.useState("")
  const [labelEs, setLabelEs] = React.useState("")
  const [category, setCategory] = React.useState<ChecklistItem["category"]>("ppe")
  const [oshaRef, setOshaRef] = React.useState("1926 Standard")

  React.useEffect(() => {
    if (item) {
      setLabelEn(item.labelEn || "")
      setLabelEs(item.labelEs || "")
      setCategory(item.category || "ppe")
      setOshaRef(item.oshaRef || "1926 Standard")
    } else {
      setLabelEn("")
      setLabelEs("")
      setCategory("ppe")
      setOshaRef("1926 Standard")
    }
  }, [item, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!labelEn.trim()) return

    const updated: ChecklistItem = {
      id: item?.id || `chk-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      labelEn: labelEn.trim(),
      labelEs: labelEs.trim() || labelEn.trim(),
      category,
      oshaRef: oshaRef.trim() || "1926 Standard",
      status: item?.status || "unanswered",
    }

    onSave(updated)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <ClipboardCheck className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                {item ? "Edit Inspection Item" : "Add New Inspection Item"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Configure English standard, Spanish bilingual label, category, and OSHA reference code.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Inspection Standard (English)</Label>
            <textarea
              rows={2}
              required
              value={labelEn}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setLabelEn(e.target.value)}
              placeholder="e.g. 100% Hard Hats, Z87.1 Safety Glasses & High-Vis Vests worn by all crew & visitors"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Spanish Bilingual Label</Label>
            <textarea
              rows={2}
              value={labelEs}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setLabelEs(e.target.value)}
              placeholder="e.g. 100% Cascos, Lentes de Seguridad Z87.1 y Chalecos de Alta Visibilidad usados por todo el personal"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Safety Category</Label>
              <select
                value={category}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value as any)}
                className="w-full text-xs rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">OSHA / Cal-OSHA Code</Label>
              <Input
                value={oshaRef}
                onChange={(e) => setOshaRef(e.target.value)}
                placeholder="e.g. 1926.100 / 1926.501"
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!labelEn.trim()}
              className="text-xs gap-1.5 bg-primary text-primary-foreground font-semibold"
            >
              <Check className="size-4" />
              {item ? "Update Item" : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
