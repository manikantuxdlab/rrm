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
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import type { ChecklistItem } from "@/types"
import * as XLSX from "xlsx"
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  FileCode,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"

interface ChecklistImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (items: ChecklistItem[], mode: "replace" | "append") => void
  currentSiteName: string
}

export function ChecklistImportModal({
  open,
  onOpenChange,
  onImport,
  currentSiteName,
}: ChecklistImportModalProps) {
  const [importMode, setImportMode] = React.useState<"replace" | "append">("replace")
  const [activeTab, setActiveTab] = React.useState<"file" | "paste">("file")
  const [pasteText, setPasteText] = React.useState("")
  const [parsedItems, setParsedItems] = React.useState<ChecklistItem[]>([])
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [fileName, setFileName] = React.useState<string | null>(null)
  const [isProcessing, setIsProcessing] = React.useState(false)

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Auto-detect category based on text content
  const detectCategory = (text: string): ChecklistItem["category"] => {
    const lower = text.toLowerCase()
    if (lower.includes("hard hat") || lower.includes("ppe") || lower.includes("glass") || lower.includes("vest") || lower.includes("boot") || lower.includes("glove")) {
      return "ppe"
    }
    if (lower.includes("fall") || lower.includes("harness") || lower.includes("lanyard") || lower.includes("guardrail") || lower.includes("deck") || lower.includes("leading edge")) {
      return "fall_protection"
    }
    if (lower.includes("ladder") || lower.includes("scaffold") || lower.includes("plank") || lower.includes("rungs")) {
      return "ladders_scaffolds"
    }
    if (lower.includes("electric") || lower.includes("cord") || lower.includes("gfci") || lower.includes("tool") || lower.includes("saw") || lower.includes("power")) {
      return "electrical_tools"
    }
    if (lower.includes("trench") || lower.includes("excavat") || lower.includes("shoring") || lower.includes("shield")) {
      return "excavation"
    }
    if (lower.includes("crane") || lower.includes("forklift") || lower.includes("excavator") || lower.includes("loader") || lower.includes("rigging") || lower.includes("sling")) {
      return "heavy_equipment"
    }
    if (lower.includes("fire") || lower.includes("extinguisher") || lower.includes("flammable") || lower.includes("combustible")) {
      return "fire_hazards"
    }
    return "housekeeping"
  }

  // Parse raw text lines into checklist items
  const parseRawText = (raw: string): ChecklistItem[] => {
    const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0)
    const items: ChecklistItem[] = []

    lines.forEach((line, idx) => {
      // Strip leading numbers or bullets e.g. "1. ", "1) ", "- ", "* "
      const cleanLine = line.replace(/^(\d+[\.\)]|\-|\*)\s*/, "").trim()
      if (!cleanLine) return

      let labelEn = cleanLine
      let labelEs = ""
      let category: ChecklistItem["category"] = "housekeeping"
      let oshaRef = ""

      // Check for delimiter like "|" or ";" or tab
      if (cleanLine.includes("|")) {
        const parts = cleanLine.split("|").map((p) => p.trim())
        labelEn = parts[0] || ""
        labelEs = parts[1] || ""
        if (parts[2]) category = (parts[2].toLowerCase().replace(/\s+/g, "_") as any) || detectCategory(labelEn)
        if (parts[3]) oshaRef = parts[3]
      } else if (cleanLine.includes("\t")) {
        const parts = cleanLine.split("\t").map((p) => p.trim())
        labelEn = parts[0] || ""
        labelEs = parts[1] || ""
        if (parts[2]) category = (parts[2].toLowerCase().replace(/\s+/g, "_") as any) || detectCategory(labelEn)
        if (parts[3]) oshaRef = parts[3]
      } else {
        category = detectCategory(labelEn)
      }

      items.push({
        id: `chk-imp-${Date.now().toString(36)}-${idx + 1}`,
        labelEn,
        labelEs: labelEs || labelEn,
        category,
        oshaRef: oshaRef || "1926 Standard",
        status: "unanswered",
      })
    })

    return items
  }

  // Handle file reading (JSON, CSV, XLSX, XLS, TXT)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    setErrorMsg(null)
    setFileName(file.name)

    const ext = file.name.split(".").pop()?.toLowerCase()

    try {
      if (ext === "json") {
        const text = await file.text()
        const parsed = JSON.parse(text)
        const rawArray = Array.isArray(parsed) ? parsed : (parsed.items || parsed.checklist || [])

        if (!Array.isArray(rawArray) || rawArray.length === 0) {
          throw new Error("JSON file must contain an array of checklist items or an object with an 'items' array.")
        }

        const items: ChecklistItem[] = rawArray.map((row: any, i: number) => ({
          id: row.id || `chk-${Date.now().toString(36)}-${i + 1}`,
          labelEn: row.labelEn || row.label || row.title || row.description || `Inspection item #${i + 1}`,
          labelEs: row.labelEs || row.labelEn || row.label || row.title || "",
          category: row.category ? (row.category.toLowerCase().replace(/\s+/g, "_") as any) : detectCategory(row.labelEn || ""),
          oshaRef: row.oshaRef || row.osha || "OSHA 1926",
          status: "unanswered",
        }))

        setParsedItems(items)
      } else if (ext === "xlsx" || ext === "xls" || ext === "csv") {
        const buffer = await file.arrayBuffer()
        const workbook = XLSX.read(buffer, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

        if (!rows || rows.length === 0) {
          throw new Error("The spreadsheet is empty.")
        }

        // Determine if row 0 is header
        let startIndex = 0
        const firstRowStr = (rows[0] || []).join(" ").toLowerCase()
        if (
          firstRowStr.includes("item") ||
          firstRowStr.includes("description") ||
          firstRowStr.includes("title") ||
          firstRowStr.includes("category") ||
          firstRowStr.includes("standard")
        ) {
          startIndex = 1
        }

        const items: ChecklistItem[] = []
        for (let i = startIndex; i < rows.length; i++) {
          const row = rows[i]
          if (!row || row.length === 0) continue

          const col0 = String(row[0] ?? "").trim()
          const col1 = String(row[1] ?? "").trim()
          const col2 = String(row[2] ?? "").trim()
          const col3 = String(row[3] ?? "").trim()

          // If col0 is just a number like "1", then col1 is likely the label
          let labelEn = ""
          let labelEs = ""
          let oshaRef = "OSHA 1926"

          if (/^\d+$/.test(col0) && col1) {
            labelEn = col1
            labelEs = col2 || col1
          } else {
            labelEn = col0
            labelEs = col1 || col0
            if (col3) oshaRef = col3
          }

          if (labelEn) {
            items.push({
              id: `chk-xls-${Date.now().toString(36)}-${i}`,
              labelEn,
              labelEs: labelEs || labelEn,
              category: detectCategory(labelEn),
              oshaRef,
              status: "unanswered",
            })
          }
        }

        if (items.length === 0) {
          throw new Error("Could not parse any checklist items from this spreadsheet.")
        }

        setParsedItems(items)
      } else {
        // Plain text / .txt or markdown
        const text = await file.text()
        const items = parseRawText(text)
        if (items.length === 0) {
          throw new Error("No checklist items detected in the text file.")
        }
        setParsedItems(items)
      }
    } catch (err: any) {
      console.error("[ChecklistImportModal] parse error:", err)
      setErrorMsg(err.message || "Failed to parse file. Please verify format.")
      setParsedItems([])
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePasteChange = (text: string) => {
    setPasteText(text)
    setErrorMsg(null)
    if (!text.trim()) {
      setParsedItems([])
      return
    }

    try {
      // Check if it's JSON
      if (text.trim().startsWith("[") || text.trim().startsWith("{")) {
        const parsed = JSON.parse(text)
        const rawArray = Array.isArray(parsed) ? parsed : (parsed.items || parsed.checklist || [])
        const items: ChecklistItem[] = rawArray.map((row: any, i: number) => ({
          id: row.id || `chk-${Date.now().toString(36)}-${i + 1}`,
          labelEn: row.labelEn || row.label || row.title || row.description || `Inspection item #${i + 1}`,
          labelEs: row.labelEs || row.labelEn || "",
          category: row.category ? (row.category.toLowerCase().replace(/\s+/g, "_") as any) : detectCategory(row.labelEn || ""),
          oshaRef: row.oshaRef || "OSHA 1926",
          status: "unanswered",
        }))
        setParsedItems(items)
        return
      }

      // Otherwise parse line by line
      const items = parseRawText(text)
      setParsedItems(items)
    } catch {
      setErrorMsg("Could not parse JSON. Falling back to plain text line parser...")
      const items = parseRawText(text)
      setParsedItems(items)
    }
  }

  const handleApply = () => {
    if (parsedItems.length === 0) return
    onImport(parsedItems, importMode)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <UploadCloud className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                Import Safety Checklist
              </DialogTitle>
              <DialogDescription className="text-xs">
                Import inspection items for <span className="font-semibold text-foreground">{currentSiteName}</span>. Accepts Excel (.xlsx/.xls), CSV, JSON, or Plain Text.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Tabs: Upload File vs Paste Text */}
          <div className="flex items-center gap-2 border-b border-border/60 pb-2">
            <button
              onClick={() => setActiveTab("file")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "file"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileSpreadsheet className="size-3.5" />
              Upload File (Excel / CSV / JSON / TXT)
            </button>
            <button
              onClick={() => setActiveTab("paste")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "paste"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="size-3.5" />
              Paste Raw Text / List
            </button>
          </div>

          {activeTab === "file" ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border/80 hover:border-primary/60 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-muted/20 hover:bg-muted/40"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv,.json,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <UploadCloud className="size-8" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {fileName ? fileName : "Click to browse or drag & drop checklist file"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Excel (.xlsx, .xls), CSV, JSON array, or plain numbered text files (.txt)
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-[10px] gap-1">
                    <FileSpreadsheet className="size-3 text-emerald-600" /> Excel .xlsx
                  </Badge>
                  <Badge variant="outline" className="text-[10px] gap-1">
                    <FileText className="size-3 text-blue-600" /> CSV
                  </Badge>
                  <Badge variant="outline" className="text-[10px] gap-1">
                    <FileCode className="size-3 text-purple-600" /> JSON
                  </Badge>
                  <Badge variant="outline" className="text-[10px] gap-1">
                    <FileText className="size-3 text-amber-600" /> Text / Word list
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Paste checklist items (one per line, e.g. &quot;1. Check fall arrest harnesses&quot;, or tab/pipe-delimited):
              </Label>
              <textarea
                rows={6}
                value={pasteText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handlePasteChange(e.target.value)}
                placeholder={`1. 100% Hard Hats and Z87 Safety Glasses worn by all crew\n2. Scaffold base plates secured and pinned to solid mudsills\n3. GFCI protection on all 120V temporary power receptacles\n4. Rebar impalement protection caps installed on exposed dowels`}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
              />
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Import Strategy Options */}
          {parsedItems.length > 0 && (
            <div className="p-3 rounded-xl border border-border/80 bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  Successfully Parsed {parsedItems.length} Checklist Items
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Choose how these items should be applied to the current checklist.
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setImportMode("replace")}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium border transition-colors ${
                    importMode === "replace"
                      ? "border-primary bg-primary/10 text-primary font-bold"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Replace All
                </button>
                <button
                  onClick={() => setImportMode("append")}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium border transition-colors ${
                    importMode === "append"
                      ? "border-primary bg-primary/10 text-primary font-bold"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Append to Existing
                </button>
              </div>
            </div>
          )}

          {/* Preview Table */}
          {parsedItems.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold uppercase tracking-wider text-[10px]">
                  Live Preview ({parsedItems.length} items)
                </span>
                <span>Ready to commit to cloud database</span>
              </div>
              <div className="max-h-56 overflow-y-auto rounded-xl border border-border/60">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted text-muted-foreground text-[10px] uppercase sticky top-0">
                    <tr>
                      <th className="px-3 py-2 w-12 font-semibold">#</th>
                      <th className="px-3 py-2 w-28 font-semibold">Category</th>
                      <th className="px-3 py-2 font-semibold">Inspection Standard (English)</th>
                      <th className="px-3 py-2 font-semibold">Spanish Translation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {parsedItems.slice(0, 50).map((item, idx) => (
                      <tr key={item.id} className="hover:bg-muted/30">
                        <td className="px-3 py-2 font-mono text-muted-foreground text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant="outline" className="text-[9px] uppercase">
                            {item.category.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 font-medium text-foreground">
                          {item.labelEn}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground italic text-[11px]">
                          {item.labelEs}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedItems.length > 50 && (
                <div className="text-[11px] text-muted-foreground text-center">
                  Showing first 50 of {parsedItems.length} items. All will be imported.
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={parsedItems.length === 0 || isProcessing}
            className="text-xs gap-1.5 bg-primary text-primary-foreground font-semibold"
          >
            <CheckCircle2 className="size-4" />
            Apply & Import {parsedItems.length} Items ({importMode === "replace" ? "Replace" : "Append"})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
