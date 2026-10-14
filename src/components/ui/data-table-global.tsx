import * as React from "react"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from "lucide-react"
import { cn } from "cn"

export interface DataTableColumn<T> {
  key: string
  header: React.ReactNode
  cell: (item: T, index: number) => React.ReactNode
  className?: string
  headerClassName?: string
  align?: "left" | "center" | "right"
  width?: string
}

export interface DataTablePaginationProps {
  currentPage: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  pageSizeOptions?: number[]
  itemLabel?: string
  className?: string
}

export function DataTablePagination({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  itemLabel = "items",
  className,
}: DataTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages)

  if (totalItems === 0) return null

  const startRecord = (safeCurrentPage - 1) * pageSize + 1
  const endRecord = Math.min(safeCurrentPage * pageSize, totalItems)

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 text-xs border-t border-border/50 select-none",
        className
      )}
    >
      {/* Summary Info */}
      <div className="text-muted-foreground text-xs">
        Showing <span className="font-semibold text-foreground">{startRecord}</span> to{" "}
        <span className="font-semibold text-foreground">{endRecord}</span> of{" "}
        <span className="font-semibold text-foreground">{totalItems}</span> {itemLabel}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Rows per page selector */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs whitespace-nowrap">
            Rows per page:
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(val) => {
              onPageSizeChange(Number(val))
              onPageChange(1)
            }}
          >
            <SelectTrigger className="h-8 w-18 text-xs bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="text-xs">
              {pageSizeOptions.map((opt) => (
                <SelectItem key={opt} value={String(opt)}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={safeCurrentPage === 1}
            className="size-8 p-0 cursor-pointer disabled:cursor-not-allowed border-border hover:bg-muted"
            title="First Page"
          >
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(1, safeCurrentPage - 1))}
            disabled={safeCurrentPage === 1}
            className="size-8 p-0 cursor-pointer disabled:cursor-not-allowed border-border hover:bg-muted"
            title="Previous Page"
          >
            <ChevronLeft className="size-4" />
          </Button>

          {/* Numbered Page Buttons */}
          <div className="flex items-center gap-1 mx-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => {
                if (totalPages <= 5) return true
                if (p === 1 || p === totalPages) return true
                return Math.abs(p - safeCurrentPage) <= 1
              })
              .map((p, idx, arr) => {
                const prev = arr[idx - 1]
                const showEllipsis = prev && p - prev > 1

                return (
                  <React.Fragment key={p}>
                    {showEllipsis && (
                      <span className="px-1 text-muted-foreground">...</span>
                    )}
                    <Button
                      variant={safeCurrentPage === p ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange(p)}
                      className={cn(
                        "size-8 p-0 text-xs font-semibold cursor-pointer transition-colors",
                        safeCurrentPage === p
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "border-border text-foreground hover:bg-muted"
                      )}
                    >
                      {p}
                    </Button>
                  </React.Fragment>
                )
              })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.min(totalPages, safeCurrentPage + 1))}
            disabled={safeCurrentPage === totalPages}
            className="size-8 p-0 cursor-pointer disabled:cursor-not-allowed border-border hover:bg-muted"
            title="Next Page"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={safeCurrentPage === totalPages}
            className="size-8 p-0 cursor-pointer disabled:cursor-not-allowed border-border hover:bg-muted"
            title="Last Page"
          >
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export interface GlobalDataTableProps<T> {
  data: T[]
  columns: DataTableColumn<T>[]
  keyExtractor: (item: T, index: number) => string | number
  isLoading?: boolean
  loadingMessage?: string
  emptyMessage?: string
  onRowClick?: (item: T) => void

  // Selection
  selectable?: boolean
  selectedIds?: (string | number)[]
  onToggleSelectRow?: (id: string | number) => void
  onToggleSelectAll?: () => void
  isAllSelected?: boolean

  // Row indexing
  showRowNumbers?: boolean
  startIndex?: number

  // Custom styling
  containerClassName?: string
  tableClassName?: string
  rowClassName?: (item: T, index: number) => string

  // Pagination integration (optional, can be passed to render with table)
  pagination?: {
    currentPage: number
    pageSize: number
    totalItems: number
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
    pageSizeOptions?: number[]
    itemLabel?: string
  }
}

export function GlobalDataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  loadingMessage = "Loading data...",
  emptyMessage = "No records found.",
  onRowClick,
  selectable = false,
  selectedIds = [],
  onToggleSelectRow,
  onToggleSelectAll,
  isAllSelected = false,
  showRowNumbers = false,
  startIndex = 1,
  containerClassName,
  tableClassName,
  rowClassName,
  pagination,
}: GlobalDataTableProps<T>) {
  const totalColSpan =
    columns.length + (selectable ? 1 : 0) + (showRowNumbers ? 1 : 0)

  return (
    <div className="space-y-3 w-full">
      {/* Clean Grid Table Container */}
      <div
        className={cn(
          "rounded-lg border border-border/80 bg-card overflow-hidden shadow-xs",
          containerClassName
        )}
      >
        <div className="overflow-x-auto">
          <Table className={cn("w-full border-collapse text-xs", tableClassName)}>
            {/* Table Header */}
            <TableHeader className="bg-muted/60 border-b border-border/80 sticky top-0 z-10">
              <TableRow className="h-8.5 hover:bg-transparent">
                {/* Optional Checkbox Header */}
                {selectable && (
                  <TableHead className="w-10 px-2.5 py-2 text-center border-r border-border/60">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={onToggleSelectAll}
                        aria-label="Select all"
                      />
                    </div>
                  </TableHead>
                )}

                {/* Optional Row Number Header */}
                {showRowNumbers && (
                  <TableHead className="w-11 px-2.5 py-2 font-semibold text-muted-foreground text-[11px] text-center uppercase tracking-wider border-r border-border/60">
                    #
                  </TableHead>
                )}

                {/* Dynamic Columns */}
                {columns.map((col, index) => {
                  const isLast = index === columns.length - 1
                  return (
                    <TableHead
                      key={col.key}
                      style={{ width: col.width }}
                      className={cn(
                        "px-3 py-2 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider whitespace-nowrap",
                        !isLast && "border-r border-border/60",
                        col.align === "center" && "text-center",
                        col.align === "right" && "text-right",
                        col.headerClassName
                      )}
                    >
                      {col.header}
                    </TableHead>
                  )
                })}
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-border/60">
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={totalColSpan}
                    className="px-4 py-12 text-center text-muted-foreground text-xs"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="size-5 animate-spin text-primary" />
                      <span className="font-medium text-foreground">
                        {loadingMessage}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={totalColSpan}
                    className="px-4 py-8 text-center text-muted-foreground text-xs font-medium"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, idx) => {
                  const key = keyExtractor(item, idx)
                  const isSelected = selectedIds.includes(key)
                  const rowNumber = startIndex + idx
                  const customRowClass = rowClassName ? rowClassName(item, idx) : ""

                  return (
                    <TableRow
                      key={key}
                      onClick={() => onRowClick && onRowClick(item)}
                      className={cn(
                        "h-9 hover:bg-primary/[0.04] dark:hover:bg-primary/[0.08] transition-colors group even:bg-muted/[0.12]",
                        onRowClick && "cursor-pointer",
                        isSelected && "bg-primary/[0.08] dark:bg-primary/[0.12]",
                        customRowClass
                      )}
                    >
                      {/* Checkbox Cell */}
                      {selectable && (
                        <TableCell
                          className="w-10 px-2.5 py-1.5 text-center border-r border-border/50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-center">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() =>
                                onToggleSelectRow && onToggleSelectRow(key)
                              }
                              aria-label={`Select item ${rowNumber}`}
                            />
                          </div>
                        </TableCell>
                      )}

                      {/* Row Number Cell */}
                      {showRowNumbers && (
                        <TableCell className="w-11 px-2.5 py-1.5 text-center font-mono text-[11px] text-muted-foreground/80 border-r border-border/50">
                          {rowNumber}
                        </TableCell>
                      )}

                      {/* Columns Cells */}
                      {columns.map((col, cIdx) => {
                        const isLast = cIdx === columns.length - 1
                        return (
                          <TableCell
                            key={col.key}
                            style={{ width: col.width }}
                            className={cn(
                              "px-3 py-1.5 text-xs text-foreground",
                              !isLast && "border-r border-border/50",
                              col.align === "center" && "text-center",
                              col.align === "right" && "text-right",
                              col.className
                            )}
                          >
                            {col.cell(item, idx)}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Embedded Pagination */}
      {pagination && (
        <DataTablePagination
          currentPage={pagination.currentPage}
          pageSize={pagination.pageSize}
          totalItems={pagination.totalItems}
          onPageChange={pagination.onPageChange}
          onPageSizeChange={pagination.onPageSizeChange}
          pageSizeOptions={pagination.pageSizeOptions}
          itemLabel={pagination.itemLabel}
        />
      )}
    </div>
  )
}
