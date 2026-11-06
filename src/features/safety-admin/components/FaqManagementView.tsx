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

const CATEGORY_LABELS: Record<FAQCategory, { label: string; color: string; dotColor: string }> = {
  general: { label: "General & Account", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", dotColor: "bg-blue-500" },
  toolbox_talks: { label: "Toolbox Talks", color: "bg-amber-500/10 text-amber-600 border-amber-500/20", dotColor: "bg-amber-500" },
  coi_insurance: { label: "COI & Insurance", color: "bg-purple-500/10 text-purple-600 border-purple-500/20", dotColor: "bg-indigo-500" },
  incidents_claims: { label: "Incidents & Claims", color: "bg-rose-500/10 text-rose-600 border-rose-500/20", dotColor: "bg-rose-500" },
  mobile_app: { label: "Field Guidance", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", dotColor: "bg-emerald-500" },
  osha_compliance: { label: "OSHA Compliance", color: "bg-orange-500/10 text-orange-600 border-orange-500/20", dotColor: "bg-orange-500" },
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
      toast.success("FAQ deleted from Supabase")
      setDeletingFaq(null)
    }

    setIsDeleting(false)
  }

  return (
    <div className="space-y-4 animate-page-in">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <HelpCircle className="size-4.5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                FAQ & Knowledge Base
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Centralized answers, compliance procedures, and field instructions for foremen and contractors.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleOpenAdd}
            className="h-8.5 gap-1.5 bg-primary text-primary-foreground font-semibold text-xs px-3.5 shadow-2xs hover:bg-primary/90 cursor-pointer rounded-lg"
          >
            <Plus className="size-3.5" />
            Add New FAQ
          </Button>
        </div>
      </div>

      {/* 2. Unified Control Bar with Quick Tabs, Search & Dropdowns */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-2.5 rounded-xl bg-card border border-border/80 shadow-2xs">
        {/* Quick Segment Filter Buttons */}
        <div className="inline-flex rounded-lg border border-border bg-muted/60 p-1 text-xs gap-1 self-start lg:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => {
              setSelectedStatus("all")
              setSelectedAudience("all")
              setCurrentPage(1)
            }}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer whitespace-nowrap ${
              selectedStatus === "all" && selectedAudience === "all"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All FAQs ({faqs.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedStatus("published")
              setSelectedAudience("all")
              setCurrentPage(1)
            }}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              selectedStatus === "published"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CheckCircle2 className="size-3 text-emerald-600" />
            Published ({faqs.filter((f) => f.status === "published").length})
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedStatus("draft")
              setSelectedAudience("all")
              setCurrentPage(1)
            }}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              selectedStatus === "draft"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="size-3 text-amber-600" />
            Drafts ({faqs.filter((f) => f.status === "draft").length})
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedAudience("foreman")
              setSelectedStatus("all")
              setCurrentPage(1)
            }}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer whitespace-nowrap ${
              selectedAudience === "foreman"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Foremen SOPs ({faqs.filter((f) => f.targetAudience === "foreman").length})
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedAudience("boss")
              setSelectedStatus("all")
              setCurrentPage(1)
            }}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer whitespace-nowrap ${
              selectedAudience === "boss"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Boss Guides ({faqs.filter((f) => f.targetAudience === "boss").length})
          </button>
        </div>

        {/* Right Search, Category & View Mode */}
        <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-64 md:w-72">
            <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search question or answer..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-8 pr-7 text-xs h-8.5 bg-background rounded-lg border-border/80 shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer rounded-full p-0.5 hover:bg-muted"
                title="Clear search"
              >
                <span className="text-xs font-semibold">✕</span>
              </button>
            )}
          </div>

          {/* Category Filter */}
          <Select
            value={selectedCategory}
            onValueChange={(val) => {
              setSelectedCategory(val)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="h-8.5 w-[145px] text-xs bg-background rounded-lg border-border/80 shadow-2xs">
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

          {/* View Mode Toggle */}
          <div className="flex items-center border border-border/80 rounded-lg p-0.5 bg-muted/40 shrink-0 h-8.5">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Table View"
            >
              <List className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={`p-1 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                viewMode === "preview"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Card Preview"
            >
              <LayoutGrid className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Main Content: Table or Preview */}
      {viewMode === "table" ? (
        <div className="rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden">
          <GlobalDataTable<FAQItem>
            data={paginatedFaqs}
            keyExtractor={(faq) => faq.id}
            isLoading={isLoading}
            loadingMessage="Loading FAQs from Supabase..."
            showRowNumbers
            startIndex={(currentPage - 1) * pageSize + 1}
            emptyMessage="No FAQs found in Supabase matching your filters."
            onRowClick={(faq) => setViewingFaq(faq)}
            containerClassName="border-0 shadow-none rounded-none"
            columns={[
              {
                key: "question",
                header: "Question & Answer Snippet",
                className: "min-w-[340px]",
                cell: (faq) => (
                  <div className="space-y-1 py-1 cursor-pointer" onClick={() => setViewingFaq(faq)}>
                    <div className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {faq.question}
                    </div>
                    <div className="text-[11px] text-muted-foreground line-clamp-1 max-w-[540px]">
                      {faq.answer}
                    </div>
                  </div>
                ),
              },
              {
                key: "category",
                header: "Category",
                className: "w-[150px]",
                cell: (faq) => {
                  const conf = CATEGORY_LABELS[faq.category] || {
                    label: faq.category,
                    dotColor: "bg-slate-400",
                  }
                  return (
                    <div className="inline-flex items-center gap-1.5 text-xs text-foreground/90 max-w-[150px]">
                      <span className={`size-1.5 rounded-full shrink-0 ${conf.dotColor}`} />
                      <span className="font-medium text-[11px] truncate">{conf.label}</span>
                    </div>
                  )
                },
              },
              {
                key: "targetAudience",
                header: "Audience",
                className: "w-[120px]",
                cell: (faq) => {
                  const labelMap: Record<FAQTargetAudience, string> = {
                    all: "All Users",
                    foreman: "Field Foreman",
                    boss: "Company Boss",
                    super_admin: "Super Admin",
                  }
                  return (
                    <span className="text-xs text-muted-foreground font-medium">
                      {labelMap[faq.targetAudience] || faq.targetAudience}
                    </span>
                  )
                },
              },
              {
                key: "status",
                header: "Status",
                align: "center",
                className: "w-[110px] text-center",
                headerClassName: "text-center",
                cell: (faq) => {
                  if (faq.status === "published") {
                    return (
                      <div className="flex justify-center">
                        <span className="inline-flex items-center justify-center gap-1.5 w-[96px] h-6 rounded-full text-[10.5px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                          <CheckCircle2 className="size-3 text-emerald-600 shrink-0" />
                          Published
                        </span>
                      </div>
                    )
                  }
                  if (faq.status === "draft") {
                    return (
                      <div className="flex justify-center">
                        <span className="inline-flex items-center justify-center gap-1.5 w-[96px] h-6 rounded-full text-[10.5px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                          <Clock className="size-3 text-amber-600 shrink-0" />
                          Draft
                        </span>
                      </div>
                    )
                  }
                  return (
                    <div className="flex justify-center">
                      <span className="inline-flex items-center justify-center gap-1.5 w-[96px] h-6 rounded-full text-[10.5px] font-semibold bg-muted/70 text-muted-foreground border border-border/80">
                        <span className="size-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
                        Archived
                      </span>
                    </div>
                  )
                },
              },
              {
                key: "actions",
                header: "Actions",
                align: "right",
                className: "w-[85px]",
                cell: (faq) => (
                  <div
                    className="flex items-center justify-end gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setViewingFaq(faq)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg hover:bg-muted"
                      title="View FAQ"
                    >
                      <Eye className="size-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenEdit(faq)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-primary cursor-pointer rounded-lg hover:bg-primary/10"
                      title="Edit FAQ"
                    >
                      <Edit className="size-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeletingFaq(faq)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive cursor-pointer rounded-lg hover:bg-destructive/10"
                      title="Delete FAQ"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </div>
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
