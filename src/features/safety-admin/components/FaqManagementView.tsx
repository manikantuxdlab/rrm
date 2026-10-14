import * as React from "react"
import {
  HelpCircle,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Layers,
  LayoutGrid,
  List,
  BookOpen,
  Sparkles,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { GlobalDataTable, DataTablePagination } from "@/components/ui/data-table-global"
import { faqService } from "@/services"
import { toast } from "sonner"
import type { FAQItem, FAQCategory, FAQTargetAudience } from "@/types"

const CATEGORY_LABELS: Record<FAQCategory, { label: string; color: string }> = {
  general: { label: "General & Account", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  toolbox_talks: { label: "Toolbox Talks", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  coi_insurance: { label: "COI & Insurance", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  incidents_claims: { label: "Incidents & Claims", color: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
  mobile_app: { label: "Field Guidance", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  osha_compliance: { label: "OSHA Compliance", color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
}

const AUDIENCE_LABELS: Record<FAQTargetAudience, { label: string; badge: string }> = {
  all: { label: "All Users", badge: "bg-muted text-muted-foreground" },
  foreman: { label: "Field Foreman", badge: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  boss: { label: "Company Boss", badge: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  super_admin: { label: "Super Admin Only", badge: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
}

export function FaqManagementView() {
  const [faqs, setFaqs] = React.useState<FAQItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all")
  const [selectedAudience, setSelectedAudience] = React.useState<string>("all")
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all")
  const [viewMode, setViewMode] = React.useState<"table" | "preview">("table")

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(20)

  // Selection state
  const [selectedIds, setSelectedIds] = React.useState<(string | number)[]>([])

  // Modal / Sheet States
  const [isEditorOpen, setIsEditorOpen] = React.useState(false)
  const [editingFaq, setEditingFaq] = React.useState<FAQItem | null>(null)
  const [viewingFaq, setViewingFaq] = React.useState<FAQItem | null>(null)
  const [deletingFaq, setDeletingFaq] = React.useState<FAQItem | null>(null)

  // Form Fields State
  const [formQuestion, setFormQuestion] = React.useState("")
  const [formAnswer, setFormAnswer] = React.useState("")
  const [formCategory, setFormCategory] = React.useState<FAQCategory>("general")
  const [formAudience, setFormAudience] = React.useState<FAQTargetAudience>("all")
  const [formStatus, setFormStatus] = React.useState<"published" | "draft" | "archived">("published")
  const [formOrderIndex, setFormOrderIndex] = React.useState<number>(1)
  const [formErrors, setFormErrors] = React.useState<{
    question?: string
    answer?: string
    orderIndex?: string
  }>({})

  // Load from Supabase on mount
  const loadFaqs = React.useCallback(async () => {
    setIsLoading(true)
    const { data, error } = await faqService.getFaqs()
    if (error) {
      toast.error(`Failed to load FAQs: ${error.message}`)
    } else {
      setFaqs(data)
    }
    setIsLoading(false)
  }, [])

  React.useEffect(() => {
    loadFaqs()
  }, [loadFaqs])

  // Filtering
  const filteredFaqs = React.useMemo(() => {
    return faqs
      .filter((faq) => {
        const matchesSearch =
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory =
          selectedCategory === "all" || faq.category === selectedCategory
        const matchesAudience =
          selectedAudience === "all" || faq.targetAudience === selectedAudience
        const matchesStatus =
          selectedStatus === "all" || faq.status === selectedStatus
        return matchesSearch && matchesCategory && matchesAudience && matchesStatus
      })
      .sort((a, b) => a.orderIndex - b.orderIndex)
  }, [faqs, searchQuery, selectedCategory, selectedAudience, selectedStatus])

  // Pagination slice
  const paginatedFaqs = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredFaqs.slice(start, start + pageSize)
  }, [filteredFaqs, currentPage, pageSize])

  // Handlers
  const handleOpenAdd = () => {
    setEditingFaq(null)
    setFormQuestion("")
    setFormAnswer("")
    setFormCategory("general")
    setFormAudience("all")
    setFormStatus("published")
    setFormOrderIndex(faqs.length + 1)
    setFormErrors({})
    setIsEditorOpen(true)
  }

  const handleOpenEdit = (faq: FAQItem) => {
    setEditingFaq(faq)
    setFormQuestion(faq.question)
    setFormAnswer(faq.answer)
    setFormCategory(faq.category)
    setFormAudience(faq.targetAudience)
    setFormStatus(faq.status)
    setFormOrderIndex(faq.orderIndex)
    setFormErrors({})
    setIsEditorOpen(true)
  }

  const validateForm = (): boolean => {
    const errors: { question?: string; answer?: string; orderIndex?: string } = {}

    if (!formQuestion.trim()) {
      errors.question = "FAQ Question is required"
    } else if (formQuestion.trim().length < 8) {
      errors.question = "Question must be at least 8 characters long"
    }

    if (!formAnswer.trim()) {
      errors.answer = "Detailed Answer / Guidance is required"
    } else if (formAnswer.trim().length < 15) {
      errors.answer = "Answer must be at least 15 characters to provide clear instructions"
    }

    if (!formOrderIndex || Number(formOrderIndex) < 1) {
      errors.orderIndex = "Order index must be a positive number (1 or greater)"
    }

    setFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0]
      toast.error(firstError)
      return false
    }

    return true
  }

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)

    if (editingFaq) {
      // Direct Supabase Update
      const { data, error } = await faqService.updateFaq(editingFaq.id, {
        question: formQuestion.trim(),
        answer: formAnswer.trim(),
        category: formCategory,
        targetAudience: formAudience,
        status: formStatus,
        orderIndex: Number(formOrderIndex),
      })

      if (error) {
        toast.error(`Update failed: ${error.message}`)
      } else if (data) {
        setFaqs((prev) => prev.map((f) => (f.id === editingFaq.id ? data : f)))
        toast.success("FAQ updated successfully in Supabase")
        setIsEditorOpen(false)
      }
    } else {
      // Direct Supabase Insert
      const { data, error } = await faqService.createFaq({
        question: formQuestion.trim(),
        answer: formAnswer.trim(),
        category: formCategory,
        targetAudience: formAudience,
        status: formStatus,
        orderIndex: Number(formOrderIndex),
      })

      if (error) {
        toast.error(`Failed to create FAQ: ${error.message}`)
      } else if (data) {
        setFaqs((prev) => [data, ...prev])
        toast.success("FAQ created and saved to Supabase")
        setIsEditorOpen(false)
      }
    }

    setIsSubmitting(false)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingFaq) return
    setIsDeleting(true)

    const { error } = await faqService.deleteFaq(deletingFaq.id)
    if (error) {
      toast.error(`Delete failed: ${error.message}`)
    } else {
      setFaqs((prev) => prev.filter((f) => f.id !== deletingFaq.id))
      setSelectedIds((prev) => prev.filter((id) => id !== deletingFaq.id))
      toast.success("FAQ deleted from Supabase")
      setDeletingFaq(null)
    }

    setIsDeleting(false)
  }

  const handleToggleSelectRow = (id: string | number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleToggleSelectAll = () => {
    const currentIds = paginatedFaqs.map((f) => f.id)
    const isAllSelected = currentIds.every((id) => selectedIds.includes(id))
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentIds.includes(String(id))))
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentIds])))
    }
  }

  return (
    <div className="space-y-5">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <HelpCircle className="size-5 text-primary" />
              FAQ Management
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Centralized answers, compliance procedures & offline instructions accessible by Foremen, Bosses & Contractors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleOpenAdd}
            className="h-9 gap-1.5 bg-primary text-primary-foreground font-semibold text-xs px-3.5 shadow-sm hover:bg-primary/90 cursor-pointer"
          >
            <Plus className="size-4" />
            Add New FAQ
          </Button>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        {/* Left Side: Search Bar (Same width as User Management) */}
        <div className="relative w-full sm:w-64 md:w-72 shrink-0">
          <Search className="size-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input
            placeholder="Search FAQ question or answer..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-8 pr-7 text-xs h-8.5 bg-background rounded-lg border-border"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-2 text-muted-foreground hover:text-foreground cursor-pointer rounded-full p-0.5 hover:bg-muted"
              title="Clear search"
            >
              <span className="text-xs font-semibold">✕</span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-start sm:justify-end">
          {/* Category Filter */}
          <Select
            value={selectedCategory}
            onValueChange={(val) => {
              setSelectedCategory(val)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="h-9 w-[160px] text-xs bg-background">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="general">General & Account</SelectItem>
              <SelectItem value="toolbox_talks">Toolbox Talks</SelectItem>
              <SelectItem value="coi_insurance">COI & Insurance</SelectItem>
              <SelectItem value="incidents_claims">Incidents & Claims</SelectItem>
              <SelectItem value="mobile_app">Field Guidance</SelectItem>
              <SelectItem value="osha_compliance">OSHA Compliance</SelectItem>
            </SelectContent>
          </Select>

          {/* Target Audience Filter */}
          <Select
            value={selectedAudience}
            onValueChange={(val) => {
              setSelectedAudience(val)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="h-9 w-[140px] text-xs bg-background">
              <SelectValue placeholder="Audience" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="all">All Audiences</SelectItem>
              <SelectItem value="foreman">Field Foreman</SelectItem>
              <SelectItem value="boss">Company Boss</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={selectedStatus}
            onValueChange={(val) => {
              setSelectedStatus(val)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="h-9 w-[130px] text-xs bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-border/80 rounded-lg p-0.5 bg-muted/30 shrink-0 h-9">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Table Grid View"
            >
              <List className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={`p-1.5 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                viewMode === "preview"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Card Preview Mode"
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Bulk Selection Indicator */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between px-3.5 py-2 rounded-lg bg-primary/10 border border-primary/20 text-xs">
          <span className="font-semibold text-primary">
            {selectedIds.length} FAQ{selectedIds.length > 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedIds([])}
              className="h-7 text-xs px-2.5 bg-background hover:bg-muted border-border cursor-pointer"
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* 4. Main Content: Table or Preview */}
      {viewMode === "table" ? (
        <GlobalDataTable<FAQItem>
          data={paginatedFaqs}
          keyExtractor={(faq) => faq.id}
          isLoading={isLoading}
          loadingMessage="Loading FAQs from Supabase..."
          selectable
          selectedIds={selectedIds}
          onToggleSelectRow={handleToggleSelectRow}
          onToggleSelectAll={handleToggleSelectAll}
          isAllSelected={
            paginatedFaqs.length > 0 &&
            paginatedFaqs.every((f) => selectedIds.includes(f.id))
          }
          showRowNumbers
          startIndex={(currentPage - 1) * pageSize + 1}
          emptyMessage="No FAQs found in Supabase matching your filters."
          onRowClick={(faq) => setViewingFaq(faq)}
          columns={[
            {
              key: "question",
              header: "Question & Answer Snippet",
              className: "min-w-[280px]",
              cell: (faq) => (
                <div className="space-y-0.5">
                  <div className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {faq.question}
                  </div>
                  <div className="text-[11px] text-muted-foreground line-clamp-1 max-w-[420px]">
                    {faq.answer}
                  </div>
                </div>
              ),
            },
            {
              key: "category",
              header: "Category",
              className: "min-w-[150px]",
              cell: (faq) => {
                const conf = CATEGORY_LABELS[faq.category] || {
                  label: faq.category,
                  color: "bg-muted text-muted-foreground",
                }
                return (
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-medium border ${conf.color}`}
                  >
                    {conf.label}
                  </Badge>
                )
              },
            },
            {
              key: "targetAudience",
              header: "Target Role",
              className: "min-w-[130px]",
              cell: (faq) => {
                const aud = AUDIENCE_LABELS[faq.targetAudience] || {
                  label: faq.targetAudience,
                  badge: "bg-muted text-muted-foreground",
                }
                return (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${aud.badge}`}
                  >
                    {aud.label}
                  </span>
                )
              },
            },
            {
              key: "orderIndex",
              header: "Order",
              className: "w-16 text-center font-mono text-[11px]",
              headerClassName: "text-center",
              align: "center",
              cell: (faq) => (
                <span className="text-muted-foreground font-semibold">
                  #{faq.orderIndex}
                </span>
              ),
            },
            {
              key: "status",
              header: "Status",
              className: "w-28 text-center",
              headerClassName: "text-center",
              align: "center",
              cell: (faq) => {
                if (faq.status === "published") {
                  return (
                    <Badge
                      variant="outline"
                      className="text-emerald-600 border-emerald-500/30 bg-emerald-500/10 text-[10px] inline-flex items-center gap-1"
                    >
                      <CheckCircle2 className="size-3" />
                      Published
                    </Badge>
                  )
                }
                if (faq.status === "draft") {
                  return (
                    <Badge
                      variant="outline"
                      className="text-amber-600 border-amber-500/30 bg-amber-500/10 text-[10px] inline-flex items-center gap-1"
                    >
                      <Clock className="size-3" />
                      Draft
                    </Badge>
                  )
                }
                return (
                  <Badge variant="outline" className="text-muted-foreground text-[10px]">
                    Archived
                  </Badge>
                )
              },
            },
            {
              key: "actions",
              header: "Actions",
              className: "w-12 text-center",
              headerClassName: "text-center",
              align: "center",
              cell: (faq) => (
                <div
                  className="flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="size-7 p-0 rounded-md hover:bg-muted cursor-pointer text-muted-foreground hover:text-foreground"
                      >
                        <span className="font-bold">•••</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 text-xs">
                      <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase font-semibold">
                        FAQ Options
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => setViewingFaq(faq)}
                        className="cursor-pointer gap-2"
                      >
                        <Eye className="size-3.5 text-primary" />
                        <span>View FAQ Card</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleOpenEdit(faq)}
                        className="cursor-pointer gap-2"
                      >
                        <Edit className="size-3.5 text-blue-500" />
                        <span>Edit FAQ</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeletingFaq(faq)}
                        className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                      >
                        <Trash2 className="size-3.5 text-destructive" />
                        <span className="font-semibold text-destructive">Delete FAQ</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ),
            },
          ]}
        />
      ) : (
        /* Preview Accordion / Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {paginatedFaqs.map((faq) => {
            const conf = CATEGORY_LABELS[faq.category]
            const aud = AUDIENCE_LABELS[faq.targetAudience]
            return (
              <Card
                key={faq.id}
                className="hover:border-primary/40 transition-colors flex flex-col justify-between"
              >
                <CardHeader className="p-4 pb-2 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className={`text-[10px] border ${conf.color}`}>
                      {conf.label}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      #{faq.orderIndex} • {aud.label}
                    </span>
                  </div>
                  <CardTitle className="text-sm font-bold text-foreground">
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-1 text-xs text-muted-foreground">
                  <p className="line-clamp-4 leading-relaxed">{faq.answer}</p>
                </CardContent>
                <CardFooter className="p-4 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Updated: {faq.updatedAt}</span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(faq)}
                      className="h-6.5 text-[10px] px-2 gap-1 cursor-pointer hover:bg-primary/10 hover:text-primary"
                    >
                      <Edit className="size-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingFaq(faq)}
                      className="h-6.5 text-[10px] px-2 gap-1 cursor-pointer hover:bg-muted"
                    >
                      <Eye className="size-3" />
                      Preview
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {/* 5. Global Pagination */}
      <DataTablePagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={filteredFaqs.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[20, 50, 100]}
        itemLabel="FAQs"
      />

      {/* ================= ADD / EDIT FAQ SHEET ================= */}
      <Sheet open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <SheetContent className="w-full sm:max-w-2xl lg:max-w-3xl p-0 flex flex-col h-full bg-card">
          <form onSubmit={handleSaveFaq} className="flex flex-col h-full min-h-0">
            {/* Sheet Header */}
            <SheetHeader className="px-6 py-5 border-b border-border/70 shrink-0 bg-muted/20">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <HelpCircle className="size-4.5" />
                </div>
                <div>
                  <SheetTitle className="text-base font-bold text-foreground">
                    {editingFaq ? "Edit FAQ Item" : "Create New FAQ"}
                  </SheetTitle>
                  <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                    Provide clear, actionable safety instructions or platform guidance for field crews.
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            {/* Scrollable Form Body with clean spacing */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 text-xs">
              {/* Section 1: Question & Answer */}
              <div className="p-4 rounded-xl border border-border/70 bg-card space-y-4 shadow-2xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 pb-1 border-b border-border/50">
                  <BookOpen className="size-3.5 text-primary" />
                  FAQ Content
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="question" className="text-xs font-semibold text-foreground">
                      FAQ Question <span className="text-destructive">*</span>
                    </Label>
                    <span className="text-[10px] text-muted-foreground">
                      {formQuestion.trim().length}/8 min chars
                    </span>
                  </div>
                  <Input
                    id="question"
                    value={formQuestion}
                    onChange={(e) => {
                      setFormQuestion(e.target.value)
                      if (formErrors.question) {
                        setFormErrors((prev) => ({ ...prev, question: undefined }))
                      }
                    }}
                    placeholder="e.g., How do foremen sign off on hot work permits while offline?"
                    className={`h-9.5 text-xs bg-background ${
                      formErrors.question ? "border-destructive focus-visible:ring-destructive" : ""
                    }`}
                  />
                  {formErrors.question && (
                    <p className="text-[11px] text-destructive font-medium flex items-center gap-1 animate-in fade-in duration-150">
                      <span>⚠</span> {formErrors.question}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="answer" className="text-xs font-semibold text-foreground">
                      Detailed Answer / Guidance <span className="text-destructive">*</span>
                    </Label>
                    <span className="text-[10px] text-muted-foreground">
                      {formAnswer.trim().length}/15 min chars
                    </span>
                  </div>
                  <textarea
                    id="answer"
                    value={formAnswer}
                    onChange={(e) => {
                      setFormAnswer(e.target.value)
                      if (formErrors.answer) {
                        setFormErrors((prev) => ({ ...prev, answer: undefined }))
                      }
                    }}
                    placeholder="Provide the exact step-by-step guidance, compliance standards, or instructions..."
                    rows={7}
                    className={`w-full rounded-md border bg-background p-3 text-xs leading-relaxed shadow-xs focus-visible:outline-hidden focus-visible:ring-1 ${
                      formErrors.answer
                        ? "border-destructive focus-visible:ring-destructive"
                        : "border-input focus-visible:ring-ring"
                    }`}
                  />
                  {formErrors.answer ? (
                    <p className="text-[11px] text-destructive font-medium flex items-center gap-1 animate-in fade-in duration-150">
                      <span>⚠</span> {formErrors.answer}
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">
                      Tip: Write clear, concise instructions that workers can easily scan on mobile devices.
                    </p>
                  )}
                </div>
              </div>

              {/* Section 2: Classification & Target Role */}
              <div className="p-4 rounded-xl border border-border/70 bg-card space-y-4 shadow-2xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 pb-1 border-b border-border/50">
                  <Layers className="size-3.5 text-primary" />
                  Targeting & Classification
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Category</Label>
                    <Select
                      value={formCategory}
                      onValueChange={(val) => setFormCategory(val as FAQCategory)}
                    >
                      <SelectTrigger className="h-9.5 text-xs bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="text-xs">
                        <SelectItem value="general">General & Account</SelectItem>
                        <SelectItem value="toolbox_talks">Toolbox Talks</SelectItem>
                        <SelectItem value="coi_insurance">COI & Insurance</SelectItem>
                        <SelectItem value="incidents_claims">Incidents & Claims</SelectItem>
                        <SelectItem value="mobile_app">Field Guidance</SelectItem>
                        <SelectItem value="osha_compliance">OSHA Compliance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Target Audience</Label>
                    <Select
                      value={formAudience}
                      onValueChange={(val) => setFormAudience(val as FAQTargetAudience)}
                    >
                      <SelectTrigger className="h-9.5 text-xs bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="text-xs">
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="foreman">Field Foreman</SelectItem>
                        <SelectItem value="boss">Company Boss</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Section 3: Publishing & Display Index */}
              <div className="p-4 rounded-xl border border-border/70 bg-card space-y-4 shadow-2xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 pb-1 border-b border-border/50">
                  <Sparkles className="size-3.5 text-primary" />
                  Publishing & Display Order
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Publish Status</Label>
                    <Select
                      value={formStatus}
                      onValueChange={(val) => setFormStatus(val as "published" | "draft" | "archived")}
                    >
                      <SelectTrigger className="h-9.5 text-xs bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="text-xs">
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="order" className="text-xs font-semibold text-foreground">
                      Display Order Index <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="order"
                      type="number"
                      min={1}
                      value={formOrderIndex}
                      onChange={(e) => {
                        setFormOrderIndex(Number(e.target.value))
                        if (formErrors.orderIndex) {
                          setFormErrors((prev) => ({ ...prev, orderIndex: undefined }))
                        }
                      }}
                      className={`h-9.5 text-xs bg-background ${
                        formErrors.orderIndex ? "border-destructive focus-visible:ring-destructive" : ""
                      }`}
                    />
                    {formErrors.orderIndex && (
                      <p className="text-[11px] text-destructive font-medium flex items-center gap-1 animate-in fade-in duration-150">
                        <span>⚠</span> {formErrors.orderIndex}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Sheet Footer */}
            <SheetFooter className="px-6 py-4 border-t border-border/70 bg-card/95 backdrop-blur-xs shrink-0 flex flex-row items-center justify-end gap-3 mt-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                onClick={() => setIsEditorOpen(false)}
                className="h-9 text-xs px-4 cursor-pointer border-border hover:bg-muted"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="h-9 text-xs px-5 bg-primary text-primary-foreground font-semibold cursor-pointer hover:bg-primary/90 shadow-xs flex items-center gap-1.5"
              >
                {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
                {isSubmitting
                  ? "Saving to Supabase..."
                  : editingFaq
                  ? "Save Changes"
                  : "Create FAQ"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* ================= VIEW FAQ SHEET ================= */}
      <Sheet open={!!viewingFaq} onOpenChange={(open) => !open && setViewingFaq(null)}>
        <SheetContent className="w-full sm:max-w-2xl lg:max-w-3xl p-0 flex flex-col h-full bg-card">
          {viewingFaq && (
            <div className="flex flex-col h-full min-h-0">
              {/* Sheet Header */}
              <SheetHeader className="px-6 py-5 border-b border-border/70 shrink-0 bg-muted/20">
                <div className="flex items-center justify-between gap-3 pr-6">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <BookOpen className="size-4.5" />
                    </div>
                    <div>
                      <SheetTitle className="text-base font-bold text-foreground">
                        FAQ Details & Preview
                      </SheetTitle>
                      <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                        Inspect published guidance and field compliance instructions.
                      </SheetDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-[10px] font-medium border ${CATEGORY_LABELS[viewingFaq.category]?.color}`}>
                      {CATEGORY_LABELS[viewingFaq.category]?.label}
                    </Badge>
                  </div>
                </div>
              </SheetHeader>

              {/* Scrollable Sheet Body with card sections */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 text-xs">
                {/* Section 1: Question & Answer Card */}
                <div className="p-5 rounded-xl border border-border/70 bg-card space-y-4 shadow-2xs">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 pb-2 border-b border-border/50">
                    <HelpCircle className="size-3.5 text-primary" />
                    Question & Guidance
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] text-muted-foreground uppercase font-semibold block">
                      FAQ Question
                    </span>
                    <h2 className="text-base font-bold text-foreground leading-snug">
                      {viewingFaq.question}
                    </h2>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <span className="text-[11px] text-muted-foreground uppercase font-semibold block">
                      Detailed Answer / Step-by-Step Instructions
                    </span>
                    <div className="p-4 rounded-lg bg-muted/30 border border-border/60 text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                      {viewingFaq.answer}
                    </div>
                  </div>
                </div>

                {/* Section 2: Metadata & Target Specifications */}
                <div className="p-5 rounded-xl border border-border/70 bg-card space-y-4 shadow-2xs">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 pb-2 border-b border-border/50">
                    <Layers className="size-3.5 text-primary" />
                    Settings & Visibility
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3 rounded-lg bg-muted/20 border border-border/40">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                        Category
                      </span>
                      <span className="font-semibold text-foreground text-xs mt-1 block">
                        {CATEGORY_LABELS[viewingFaq.category]?.label}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-muted/20 border border-border/40">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                        Target Audience
                      </span>
                      <span className="font-semibold text-foreground text-xs mt-1 block">
                        {AUDIENCE_LABELS[viewingFaq.targetAudience]?.label}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-muted/20 border border-border/40">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                        Status & Order
                      </span>
                      <div className="flex items-center gap-1.5 mt-1">
                        {viewingFaq.status === "published" ? (
                          <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 bg-emerald-500/10 text-[10px]">
                            Published
                          </Badge>
                        ) : viewingFaq.status === "draft" ? (
                          <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/10 text-[10px]">
                            Draft
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground text-[10px]">
                            Archived
                          </Badge>
                        )}
                        <span className="text-xs font-mono text-muted-foreground">#{viewingFaq.orderIndex}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                    <span>Created By: <strong className="text-foreground">{viewingFaq.createdByName || "Super Admin"}</strong></span>
                    <span>Last Updated: <strong className="text-foreground">{viewingFaq.updatedAt}</strong></span>
                  </div>
                </div>
              </div>

              {/* Sticky Sheet Footer */}
              <SheetFooter className="px-6 py-4 border-t border-border/70 bg-card/95 backdrop-blur-xs shrink-0 flex flex-row items-center justify-between gap-3 mt-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingFaq(null)}
                  className="h-9 text-xs px-4 cursor-pointer border-border hover:bg-muted"
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const toEdit = viewingFaq
                    setViewingFaq(null)
                    handleOpenEdit(toEdit)
                  }}
                  className="h-9 text-xs px-4 bg-primary text-primary-foreground font-semibold cursor-pointer hover:bg-primary/90 shadow-xs gap-1.5"
                >
                  <Edit className="size-3.5" />
                  Edit This FAQ
                </Button>
              </SheetFooter>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ================= DELETE CONFIRMATION DIALOG ================= */}
      <Dialog open={!!deletingFaq} onOpenChange={(open) => !open && setDeletingFaq(null)}>
        <DialogContent className="sm:max-w-md">
          {deletingFaq && (
            <>
              <DialogHeader className="space-y-2">
                <div className="size-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
                  <AlertTriangle className="size-5" />
                </div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Confirm Deletion
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Are you sure you want to permanently delete this FAQ item?
                  <span className="block mt-2 font-medium text-foreground p-2 rounded bg-muted/50 border border-border">
                    "{deletingFaq.question}"
                  </span>
                </DialogDescription>
              </DialogHeader>

              <DialogFooter className="pt-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isDeleting}
                  onClick={() => setDeletingFaq(null)}
                  className="h-8 text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isDeleting}
                  onClick={handleDeleteConfirm}
                  className="h-8 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                >
                  {isDeleting && <Loader2 className="size-3 animate-spin" />}
                  {isDeleting ? "Deleting from Supabase..." : "Delete FAQ"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
