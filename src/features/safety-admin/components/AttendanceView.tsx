import * as React from "react"
import {
    Card,
    CardContent,
    CardHeader,
    CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
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
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import {
    ClipboardCheck,
    Building2,
    HardHat,
    Search,
    X,
    MoreVertical,
    Eye,
    Edit,
    Download,
    Calendar,
    MapPin,
    QrCode,
    PenLine,
    LayoutGrid,
    List,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Timer,
    LogIn,
    LogOut,
} from "lucide-react"

/* ----------------------------- Types & Mock Data ----------------------------- */

type AttendanceStatus = "present" | "late" | "absent" | "on_leave"
type CheckInMethod = "GPS" | "QR Code" | "Manual"

interface AttendanceRecord {
    id: string
    fullName: string
    role: "foreman" | "boss" | "worker"
    companyId: string
    companyName: string
    jobsiteId: string
    jobsiteName: string
    status: AttendanceStatus
    checkIn: string | null
    checkOut: string | null
    hoursWorked: number
    method: CheckInMethod | null
    notes: string
}

const COMPANIES = [
    { id: "c1", name: "Titan Concrete CA" },
    { id: "c2", name: "Summit Steel & Rebar" },
    { id: "c3", name: "Pacific Framing Co." },
    { id: "c4", name: "BlueLine Electrical" },
]

const JOBSITES = [
    { id: "j1", name: "Harbor Point Tower" },
    { id: "j2", name: "Westside Medical Plaza" },
    { id: "j3", name: "Riverside Lofts" },
    { id: "j4", name: "Metro Rail Station 4" },
    { id: "j5", name: "Oakview Elementary" },
]

const NAMES = [
    "Sergio Ramos", "Carlos Mendez", "Luis Hernandez", "Miguel Torres",
    "Jose Alvarez", "Diego Castillo", "Ricardo Flores", "Andres Vargas",
    "Mateo Gutierrez", "Javier Ortiz", "Pedro Navarro", "Fernando Reyes",
    "Eduardo Silva", "Manuel Ruiz", "Rafael Morales", "Hector Jimenez",
    "Oscar Delgado", "Victor Salazar", "Raul Medina", "Arturo Campos",
    "Daniel Rivera", "Gabriel Cruz", "Tomas Aguilar", "Emilio Herrera",
    "Jorge Pena", "Alberto Soto", "Ivan Lozano", "Marco Duarte",
    "Samuel Rojas", "Julian Cabrera", "Adrian Fuentes", "Nicolas Ibarra",
    "Esteban Mora", "Rodrigo Pineda", "Leonardo Vega", "Cesar Montoya",
    "Pablo Santos", "Enrique Acosta", "Felipe Roman", "Gustavo Leon",
    "Ruben Paredes", "Alex Cardenas", "Sebastian Rios", "Martin Escobar",
    "Hugo Barrera", "Ernesto Solis", "Ismael Guerrero", "Lorenzo Cortes",
]

const NOTES_BY_STATUS: Record<AttendanceStatus, string[]> = {
    present: ["", "", "Completed pre-shift safety talk.", "Assigned to level 3 formwork."],
    late: ["Traffic delay reported by foreman.", "Arrived after toolbox talk.", "Vehicle issue, notified supervisor."],
    absent: ["No call, no show.", "Unexcused absence.", "Could not be reached."],
    on_leave: ["Approved PTO.", "Medical leave on file.", "Approved personal day."],
}

function seededRandom(seed: number) {
    let s = seed % 2147483647
    if (s <= 0) s += 2147483646
    return () => {
        s = (s * 16807) % 2147483647
        return (s - 1) / 2147483646
    }
}

function formatTime(totalMinutes: number) {
    const h24 = Math.floor(totalMinutes / 60)
    const m = totalMinutes % 60
    const suffix = h24 >= 12 ? "PM" : "AM"
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12
    return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${suffix}`
}

function generateRecords(date: Date): AttendanceRecord[] {
    const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
    const rand = seededRandom(seed)

    return NAMES.map((name, i) => {
        const r = rand()
        const status: AttendanceStatus =
            r < 0.62 ? "present" : r < 0.8 ? "late" : r < 0.92 ? "absent" : "on_leave"

        const company = COMPANIES[i % COMPANIES.length]
        const jobsite = JOBSITES[(i * 3 + 1) % JOBSITES.length]
        const attended = status === "present" || status === "late"

        const inMinutes =
            status === "present"
                ? 360 + Math.floor(rand() * 55)
                : 435 + Math.floor(rand() * 90)
        const stillOnSite = rand() > 0.7
        const outMinutes = 930 + Math.floor(rand() * 90)

        const hoursWorked = attended
            ? stillOnSite
                ? 0
                : Math.round(((outMinutes - inMinutes) / 60) * 10) / 10
            : 0

        const methodRoll = rand()
        const method: CheckInMethod | null = attended
            ? methodRoll < 0.5 ? "GPS" : methodRoll < 0.85 ? "QR Code" : "Manual"
            : null

        const noteOptions = NOTES_BY_STATUS[status]

        return {
            id: `att-${seed}-${i}`,
            fullName: name,
            role: i % 8 === 0 ? "foreman" : i % 11 === 0 ? "boss" : "worker",
            companyId: company.id,
            companyName: company.name,
            jobsiteId: jobsite.id,
            jobsiteName: jobsite.name,
            status,
            checkIn: attended ? formatTime(inMinutes) : null,
            checkOut: attended && !stillOnSite ? formatTime(outMinutes) : null,
            hoursWorked,
            method,
            notes: noteOptions[Math.floor(rand() * noteOptions.length)],
        }
    })
}

const STATUS_META: Record<
    AttendanceStatus,
    { label: string; badge: string; dot: string }
> = {
    present: {
        label: "Present",
        badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        dot: "bg-emerald-500",
    },
    late: {
        label: "Late",
        badge: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
        dot: "bg-amber-500",
    },
    absent: {
        label: "Absent",
        badge: "bg-destructive/10 text-destructive border-destructive/20",
        dot: "bg-destructive",
    },
    on_leave: {
        label: "On Leave",
        badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        dot: "bg-blue-500",
    },
}

const ROLE_LABEL: Record<AttendanceRecord["role"], string> = {
    foreman: "Foreman",
    boss: "Company Boss",
    worker: "Worker",
}

function StatusPill({ status }: { status: AttendanceStatus }) {
    const meta = STATUS_META[status]
    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${meta.badge}`}
        >
            <span className={`size-1.5 rounded-full ${meta.dot}`}></span>
            {meta.label}
        </span>
    )
}

function MethodIcon({ method }: { method: CheckInMethod | null }) {
    if (method === "GPS") return <MapPin className="size-3 text-primary shrink-0" />
    if (method === "QR Code") return <QrCode className="size-3 text-primary shrink-0" />
    if (method === "Manual") return <PenLine className="size-3 text-muted-foreground shrink-0" />
    return null
}

function initials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
}

/* --------------------------------- Component --------------------------------- */

export function AttendanceView() {
    const [selectedDate, setSelectedDate] = React.useState<Date>(() => new Date())
    const [searchQuery, setSearchQuery] = React.useState("")
    const [selectedStatusFilter, setSelectedStatusFilter] = React.useState<"all" | AttendanceStatus>("all")
    const [selectedCompanyFilter, setSelectedCompanyFilter] = React.useState<string>("all")
    const [selectedJobsiteFilter, setSelectedJobsiteFilter] = React.useState<string>("all")
    const [viewMode, setViewMode] = React.useState<"table" | "grid">("table")
    const [selectedIds, setSelectedIds] = React.useState<string[]>([])
    const [viewingRecord, setViewingRecord] = React.useState<AttendanceRecord | null>(null)

    // Pagination
    const [currentPage, setCurrentPage] = React.useState(1)
    const [pageSize, setPageSize] = React.useState(10)

    const records = React.useMemo(() => generateRecords(selectedDate), [selectedDate])

    const isToday = selectedDate.toDateString() === new Date().toDateString()
    const dateLabel = selectedDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    })

    const shiftDate = (days: number) => {
        setSelectedDate((prev) => {
            const next = new Date(prev)
            next.setDate(next.getDate() + days)
            return next
        })
    }

    const filteredRecords = React.useMemo(() => {
        const q = searchQuery.toLowerCase()
        return records.filter((r) => {
            const matchesSearch =
                r.fullName.toLowerCase().includes(q) ||
                r.companyName.toLowerCase().includes(q) ||
                r.jobsiteName.toLowerCase().includes(q)
            const matchesStatus = selectedStatusFilter === "all" || r.status === selectedStatusFilter
            const matchesCompany = selectedCompanyFilter === "all" || r.companyId === selectedCompanyFilter
            const matchesJobsite = selectedJobsiteFilter === "all" || r.jobsiteId === selectedJobsiteFilter
            return matchesSearch && matchesStatus && matchesCompany && matchesJobsite
        })
    }, [records, searchQuery, selectedStatusFilter, selectedCompanyFilter, selectedJobsiteFilter])

    React.useEffect(() => {
        setCurrentPage(1)
        setSelectedIds([])
    }, [searchQuery, selectedStatusFilter, selectedCompanyFilter, selectedJobsiteFilter, pageSize, selectedDate])

    const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize))
    const safeCurrentPage = Math.min(currentPage, totalPages)

    const paginatedRecords = React.useMemo(() => {
        const start = (safeCurrentPage - 1) * pageSize
        return filteredRecords.slice(start, start + pageSize)
    }, [filteredRecords, safeCurrentPage, pageSize])

    const isAllCurrentPageSelected =
        paginatedRecords.length > 0 && paginatedRecords.every((r) => selectedIds.includes(r.id))

    const handleToggleSelectAll = () => {
        const pageIds = paginatedRecords.map((r) => r.id)
        if (isAllCurrentPageSelected) {
            setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)))
        } else {
            setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])))
        }
    }

    const handleToggleSelect = (id: string) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
    }

    const totalPresent = records.filter((r) => r.status === "present").length
    const totalLate = records.filter((r) => r.status === "late").length
    const totalAbsent = records.filter((r) => r.status === "absent").length
    const totalOnLeave = records.filter((r) => r.status === "on_leave").length
    const attendanceRate = records.length
        ? Math.round(((totalPresent + totalLate) / records.length) * 100)
        : 0

    return (
        <div className="space-y-6">
            {/* Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-3">
                <div>
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <ClipboardCheck className="size-5 text-primary" />
                        Attendance
                    </h2>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Date Navigator */}
                    <div className="flex items-center gap-1 border border-border/80 rounded-lg p-0.5 bg-muted/30 h-8.5">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => shiftDate(-1)}
                            className="size-7 p-0 cursor-pointer"
                            title="Previous day"
                        >
                            <ChevronLeft className="size-3.5" />
                        </Button>
                        <div className="flex items-center gap-1.5 px-2 text-xs font-medium text-foreground min-w-[150px] justify-center">
                            <Calendar className="size-3.5 text-primary" />
                            {dateLabel}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => shiftDate(1)}
                            disabled={isToday}
                            className="size-7 p-0 cursor-pointer disabled:cursor-not-allowed"
                            title="Next day"
                        >
                            <ChevronRight className="size-3.5" />
                        </Button>
                    </div>
                    {!isToday && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedDate(new Date())}
                            className="h-8 px-3 text-xs cursor-pointer border-border"
                        >
                            Today
                        </Button>
                    )}
                    <Button
                        size="sm"
                        className="h-8 px-3 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs transition-all cursor-pointer rounded-md"
                    >
                        <Download className="size-3.5 shrink-0" />
                        <span>Export</span>
                    </Button>
                </div>
            </div>

            {/* KPI Stats Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="border-border py-2.5 px-3.5 flex flex-col justify-between">
                    <div className="text-[11px] font-medium text-muted-foreground">Attendance Rate</div>
                    <div className="text-lg font-bold text-foreground mt-0.5">{attendanceRate}%</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                        {totalPresent + totalLate} of {records.length} expected on site
                    </div>
                </Card>

                <Card className="border-border py-2.5 px-3.5 flex flex-col justify-between">
                    <div className="text-[11px] font-medium text-muted-foreground">Present</div>
                    <div className="text-lg font-bold text-foreground mt-0.5">{totalPresent} Present</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Checked in on time</div>
                </Card>

                <Card className="border-border py-2.5 px-3.5 flex flex-col justify-between">
                    <div className="text-[11px] font-medium text-muted-foreground">Late Arrivals</div>
                    <div className="text-lg font-bold text-foreground mt-0.5">{totalLate} Late</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Checked in after 7:00 AM</div>
                </Card>

                <Card className="border-border py-2.5 px-3.5 flex flex-col justify-between">
                    <div className="text-[11px] font-medium text-muted-foreground">Absent / On Leave</div>
                    <div className="text-lg font-bold text-foreground mt-0.5">
                        {totalAbsent} / {totalOnLeave}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Not on site today</div>
                </Card>
            </div>

            {/* Search & Filters Toolbar */}
            <div className="flex flex-col lg:flex-row gap-2.5 items-stretch lg:items-center justify-between">
                <div className="relative w-full lg:w-64 xl:w-72 shrink-0">
                    <Search className="size-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search name, company, jobsite..."
                        className="pl-8 pr-7 text-xs h-8.5 bg-background rounded-lg border-border"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2 top-2 text-muted-foreground hover:text-foreground cursor-pointer rounded-full p-0.5 hover:bg-muted"
                            title="Clear search"
                        >
                            <X className="size-3" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap justify-start lg:justify-end">
                    {/* Status */}
                    <Select
                        value={selectedStatusFilter}
                        onValueChange={(val) => setSelectedStatusFilter(val as "all" | AttendanceStatus)}
                    >
                        <SelectTrigger className="h-8.5 min-w-[125px] text-xs bg-background rounded-lg border-border">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                            <SelectItem value="all">All Status ({records.length})</SelectItem>
                            {(Object.keys(STATUS_META) as AttendanceStatus[]).map((s) => (
                                <SelectItem key={s} value={s}>
                                    <span className="flex items-center gap-1.5">
                                        <span className={`size-1.5 rounded-full ${STATUS_META[s].dot}`}></span>
                                        {STATUS_META[s].label} ({records.filter((r) => r.status === s).length})
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Company */}
                    <Select value={selectedCompanyFilter} onValueChange={setSelectedCompanyFilter}>
                        <SelectTrigger className="h-8.5 min-w-[145px] text-xs bg-background rounded-lg border-border">
                            <SelectValue placeholder="All Companies" />
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                            <SelectItem value="all">All Companies</SelectItem>
                            {COMPANIES.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                    {c.name.length > 22 ? c.name.substring(0, 22) + "..." : c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Jobsite */}
                    <Select value={selectedJobsiteFilter} onValueChange={setSelectedJobsiteFilter}>
                        <SelectTrigger className="h-8.5 min-w-[145px] text-xs bg-background rounded-lg border-border">
                            <SelectValue placeholder="All Jobsites" />
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                            <SelectItem value="all">All Jobsites</SelectItem>
                            {JOBSITES.map((j) => (
                                <SelectItem key={j.id} value={j.id}>
                                    {j.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* View Toggle */}
                    <div className="flex items-center border border-border/80 rounded-lg p-0.5 bg-muted/30 shrink-0 h-8.5">
                        <button
                            type="button"
                            onClick={() => setViewMode("table")}
                            className={`p-1.5 rounded-md flex items-center justify-center transition-all cursor-pointer ${viewMode === "table"
                                    ? "bg-background text-foreground shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                            title="Table View"
                        >
                            <List className="size-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode("grid")}
                            className={`p-1.5 rounded-md flex items-center justify-center transition-all cursor-pointer ${viewMode === "grid"
                                    ? "bg-background text-foreground shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                            title="Grid View"
                        >
                            <LayoutGrid className="size-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Bulk Action Bar */}
            {selectedIds.length > 0 && (
                <div className="flex items-center justify-between px-3.5 py-2 rounded-lg bg-primary/10 border border-primary/20 text-xs animate-in fade-in duration-150">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-primary">
                            {selectedIds.length} record{selectedIds.length > 1 ? "s" : ""} selected
                        </span>
                        <span className="text-muted-foreground text-[11px]">
                            (on current page: {paginatedRecords.filter((r) => selectedIds.includes(r.id)).length} of {paginatedRecords.length})
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs px-2.5 gap-1.5 bg-background hover:bg-muted cursor-pointer border-border"
                        >
                            <Download className="size-3" />
                            Export Selected
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedIds([])}
                            className="h-7 text-xs px-2.5 bg-background hover:bg-muted cursor-pointer border-border"
                        >
                            Clear Selection
                        </Button>
                    </div>
                </div>
            )}

            {/* Grid View vs Table View */}
            {viewMode === "grid" ? (
                filteredRecords.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground text-xs border rounded-xl bg-card">
                        No attendance records match your filters.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                        {paginatedRecords.map((r) => {
                            const inactive = r.status === "absent" || r.status === "on_leave"
                            return (
                                <Card
                                    key={r.id}
                                    onClick={() => setViewingRecord(r)}
                                    className={`border-border hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group ${inactive ? "bg-muted/10" : "bg-card"
                                        }`}
                                >
                                    <CardHeader className="p-3.5 pb-2.5 space-y-2.5">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="size-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                    {initials(r.fullName)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-semibold text-foreground text-xs flex items-center gap-1 truncate group-hover:text-primary transition-colors">
                                                        <span className="truncate">{r.fullName}</span>
                                                        {r.role === "foreman" && <HardHat className="size-3 text-amber-500 shrink-0" />}
                                                    </div>
                                                    <Badge variant="outline" className="text-[9px] mt-0.5 border-border h-4 px-1.5 font-medium">
                                                        {ROLE_LABEL[r.role]}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="size-7 p-0 rounded-md hover:bg-muted cursor-pointer shrink-0"
                                                        >
                                                            <MoreVertical className="size-3.5 text-muted-foreground hover:text-foreground" />
                                                            <span className="sr-only">Actions</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 text-xs">
                                                        <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase font-semibold">
                                                            Record Actions
                                                        </DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => setViewingRecord(r)} className="cursor-pointer gap-2">
                                                            <Eye className="size-3.5 text-primary" />
                                                            <span>View Details</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="cursor-pointer gap-2">
                                                            <Edit className="size-3.5 text-blue-500" />
                                                            <span>Edit Record</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="p-3.5 pt-0 space-y-2.5 text-xs flex-1">
                                        <div className="space-y-1 p-2 rounded-lg bg-muted/30 border border-border/40 text-[11px]">
                                            <div className="flex items-center gap-1.5 font-medium text-foreground truncate">
                                                <Building2 className="size-3 shrink-0 text-primary" />
                                                <span className="truncate">{r.companyName}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-muted-foreground truncate">
                                                <HardHat className="size-2.5 shrink-0" />
                                                <span className="truncate">{r.jobsiteName}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                                            <div className="space-y-0.5">
                                                <div className="text-[10px] uppercase font-semibold text-muted-foreground">Check In</div>
                                                <div className="flex items-center gap-1 font-medium text-foreground">
                                                    <LogIn className="size-3 text-emerald-600 shrink-0" />
                                                    {r.checkIn ?? "—"}
                                                </div>
                                            </div>
                                            <div className="space-y-0.5">
                                                <div className="text-[10px] uppercase font-semibold text-muted-foreground">Check Out</div>
                                                <div className="flex items-center gap-1 font-medium text-foreground">
                                                    <LogOut className="size-3 text-amber-600 shrink-0" />
                                                    {r.checkIn && !r.checkOut ? "On site" : r.checkOut ?? "—"}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-1 text-[10px]">
                                            <Badge variant="secondary" className="text-[9px] font-mono gap-1 h-5 px-1.5">
                                                <MethodIcon method={r.method} />
                                                {r.method ?? "No check-in"}
                                            </Badge>
                                            <div className="text-muted-foreground">
                                                <span className="font-bold text-foreground">{r.hoursWorked.toFixed(1)}</span> hrs
                                            </div>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="p-3.5 pt-2 border-t border-border/40 flex items-center justify-between text-xs">
                                        <StatusPill status={r.status} />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setViewingRecord(r)}
                                            className="h-6.5 text-[10px] px-2 gap-1 cursor-pointer hover:bg-primary/10 hover:text-primary border-border"
                                        >
                                            <Eye className="size-3" />
                                            View Details
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )
                        })}
                    </div>
                )
            ) : (
                <div className="rounded-lg border border-border/80 bg-card overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <Table className="w-full border-collapse text-xs">
                            <TableHeader className="bg-muted/60 border-b border-border/80 sticky top-0 z-10">
                                <TableRow className="h-8.5 hover:bg-transparent">
                                    <TableHead className="w-10 px-2.5 py-2 text-center border-r border-border/60">
                                        <div className="flex items-center justify-center">
                                            <Checkbox
                                                checked={isAllCurrentPageSelected}
                                                onCheckedChange={handleToggleSelectAll}
                                                aria-label="Select all rows on current page"
                                            />
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-11 px-2.5 py-2 font-semibold text-muted-foreground text-[11px] text-center uppercase tracking-wider border-r border-border/60">
                                        #
                                    </TableHead>
                                    <TableHead className="min-w-[170px] px-3 py-2 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider border-r border-border/60">
                                        Full Name
                                    </TableHead>
                                    <TableHead className="min-w-[170px] px-3 py-2 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider border-r border-border/60">
                                        Company
                                    </TableHead>
                                    <TableHead className="min-w-[160px] px-3 py-2 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider border-r border-border/60">
                                        Jobsite
                                    </TableHead>
                                    <TableHead className="min-w-[100px] px-3 py-2 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider border-r border-border/60 text-center">
                                        Check In
                                    </TableHead>
                                    <TableHead className="min-w-[100px] px-3 py-2 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider border-r border-border/60 text-center">
                                        Check Out
                                    </TableHead>
                                    <TableHead className="w-20 px-3 py-2 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider border-r border-border/60 text-center">
                                        Hours
                                    </TableHead>
                                    <TableHead className="min-w-[100px] px-3 py-2 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider border-r border-border/60 text-center">
                                        Method
                                    </TableHead>
                                    <TableHead className="min-w-[95px] px-3 py-2 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider border-r border-border/60 text-center">
                                        Status
                                    </TableHead>
                                    <TableHead className="w-12 px-2 py-2 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider text-center">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody className="divide-y divide-border/60">
                                {filteredRecords.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={11} className="px-4 py-8 text-center text-muted-foreground text-xs">
                                            No attendance records match your filters.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedRecords.map((r, idx) => {
                                        const rowNumber = (safeCurrentPage - 1) * pageSize + idx + 1
                                        const isSelected = selectedIds.includes(r.id)
                                        const inactive = r.status === "absent" || r.status === "on_leave"

                                        return (
                                            <TableRow
                                                key={r.id}
                                                onClick={() => setViewingRecord(r)}
                                                className={`h-9 hover:bg-primary/[0.04] dark:hover:bg-primary/[0.08] transition-colors cursor-pointer group even:bg-muted/[0.12] ${isSelected ? "bg-primary/[0.08] dark:bg-primary/[0.12]" : ""
                                                    } ${inactive ? "bg-muted/20" : ""}`}
                                            >
                                                <TableCell
                                                    className="w-10 px-2.5 py-1.5 text-center border-r border-border/50"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <div className="flex items-center justify-center">
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onCheckedChange={() => handleToggleSelect(r.id)}
                                                            aria-label={`Select ${r.fullName}`}
                                                        />
                                                    </div>
                                                </TableCell>

                                                <TableCell className="w-11 px-2.5 py-1.5 text-center font-mono text-[11px] text-muted-foreground/80 border-r border-border/50">
                                                    {rowNumber}
                                                </TableCell>

                                                <TableCell className="min-w-[170px] px-3 py-1.5 border-r border-border/50">
                                                    <div className="flex items-center gap-1.5 font-medium text-foreground text-xs">
                                                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                                            {r.fullName}
                                                        </span>
                                                        {r.role === "foreman" && <HardHat className="size-3 text-amber-500 shrink-0" />}
                                                    </div>
                                                </TableCell>

                                                <TableCell className="min-w-[170px] px-3 py-1.5 border-r border-border/50">
                                                    <div
                                                        className="flex items-center gap-1.5 text-foreground truncate max-w-[180px]"
                                                        title={r.companyName}
                                                    >
                                                        <Building2 className="size-3 text-primary shrink-0 opacity-70" />
                                                        <span className="truncate font-medium">{r.companyName}</span>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="min-w-[160px] px-3 py-1.5 border-r border-border/50">
                                                    <span
                                                        className="text-[11px] text-foreground font-medium truncate block max-w-[160px]"
                                                        title={r.jobsiteName}
                                                    >
                                                        {r.jobsiteName}
                                                    </span>
                                                </TableCell>

                                                <TableCell className="min-w-[100px] px-3 py-1.5 border-r border-border/50 text-center whitespace-nowrap">
                                                    <span className="font-mono text-[11px] text-foreground">{r.checkIn ?? "—"}</span>
                                                </TableCell>

                                                <TableCell className="min-w-[100px] px-3 py-1.5 border-r border-border/50 text-center whitespace-nowrap">
                                                    {r.checkIn && !r.checkOut ? (
                                                        <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                                                            On site
                                                        </span>
                                                    ) : (
                                                        <span className="font-mono text-[11px] text-foreground">{r.checkOut ?? "—"}</span>
                                                    )}
                                                </TableCell>

                                                <TableCell className="w-20 px-3 py-1.5 border-r border-border/50 text-center whitespace-nowrap">
                                                    <span className="font-mono text-[11px] text-foreground">
                                                        {r.hoursWorked > 0 ? r.hoursWorked.toFixed(1) : "—"}
                                                    </span>
                                                </TableCell>

                                                <TableCell className="min-w-[100px] px-3 py-1.5 border-r border-border/50 text-center whitespace-nowrap">
                                                    {r.method ? (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
                                                            <MethodIcon method={r.method} />
                                                            {r.method}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">—</span>
                                                    )}
                                                </TableCell>

                                                <TableCell className="min-w-[95px] px-3 py-1.5 border-r border-border/50 text-center whitespace-nowrap">
                                                    <StatusPill status={r.status} />
                                                </TableCell>

                                                <TableCell
                                                    className="w-12 px-2 py-1.5 text-center whitespace-nowrap"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <div className="flex items-center justify-center">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="size-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer rounded-md"
                                                                    aria-label="Record actions"
                                                                >
                                                                    <MoreVertical className="size-3.5" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48 text-xs">
                                                                <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase font-semibold">
                                                                    Record Options
                                                                </DropdownMenuLabel>
                                                                <DropdownMenuItem
                                                                    onClick={() => setViewingRecord(r)}
                                                                    className="cursor-pointer gap-2"
                                                                >
                                                                    <Eye className="size-3.5 text-primary" />
                                                                    <span>View Details</span>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem className="cursor-pointer gap-2">
                                                                    <Edit className="size-3.5 text-blue-500" />
                                                                    <span>Edit Record</span>
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            {/* Pagination Bar */}
            {filteredRecords.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs border-t border-border/40">
                    <div className="text-muted-foreground text-xs">
                        Showing <span className="font-semibold text-foreground">{(safeCurrentPage - 1) * pageSize + 1}</span> to{" "}
                        <span className="font-semibold text-foreground">
                            {Math.min(safeCurrentPage * pageSize, filteredRecords.length)}
                        </span>{" "}
                        of <span className="font-semibold text-foreground">{filteredRecords.length}</span> records
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-muted-foreground text-xs">Rows per page:</span>
                            <Select
                                value={String(pageSize)}
                                onValueChange={(val) => {
                                    setPageSize(Number(val))
                                    setCurrentPage(1)
                                }}
                            >
                                <SelectTrigger className="h-8 w-18 text-xs bg-background">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="text-xs">
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(1)}
                                disabled={safeCurrentPage === 1}
                                className="size-8 p-0 cursor-pointer disabled:cursor-not-allowed border-border"
                                title="First Page"
                            >
                                <ChevronsLeft className="size-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={safeCurrentPage === 1}
                                className="size-8 p-0 cursor-pointer disabled:cursor-not-allowed border-border"
                                title="Previous Page"
                            >
                                <ChevronLeft className="size-4" />
                            </Button>

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
                                                {showEllipsis && <span className="px-1 text-muted-foreground">...</span>}
                                                <Button
                                                    variant={safeCurrentPage === p ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setCurrentPage(p)}
                                                    className={`size-8 p-0 text-xs font-semibold cursor-pointer ${safeCurrentPage === p
                                                            ? "bg-primary text-primary-foreground"
                                                            : "border-border text-foreground hover:bg-muted"
                                                        }`}
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
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={safeCurrentPage === totalPages}
                                className="size-8 p-0 cursor-pointer disabled:cursor-not-allowed border-border"
                                title="Next Page"
                            >
                                <ChevronRight className="size-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={safeCurrentPage === totalPages}
                                className="size-8 p-0 cursor-pointer disabled:cursor-not-allowed border-border"
                                title="Last Page"
                            >
                                <ChevronsRight className="size-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Attendance Details Sheet */}
            <Sheet open={!!viewingRecord} onOpenChange={(open) => !open && setViewingRecord(null)}>
                <SheetContent
                    side="right"
                    className="w-full sm:max-w-2xl md:max-w-3xl lg:max-w-[760px] xl:max-w-[800px] flex flex-col p-0 overflow-hidden h-full shadow-2xl"
                >
                    {viewingRecord && (
                        <div className="flex flex-col h-full justify-between overflow-hidden">
                            <SheetHeader className="px-8 py-5.5 border-b border-border/80 bg-muted/15 shrink-0 text-left">
                                <div className="flex items-center gap-3.5">
                                    <div className="size-12 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0 border border-primary/20">
                                        {initials(viewingRecord.fullName)}
                                    </div>
                                    <div>
                                        <SheetTitle className="text-lg font-bold text-foreground flex items-center gap-2.5">
                                            {viewingRecord.fullName}
                                            <StatusPill status={viewingRecord.status} />
                                        </SheetTitle>
                                        <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                                            {viewingRecord.companyName} • {ROLE_LABEL[viewingRecord.role]} • {dateLabel}
                                        </SheetDescription>
                                    </div>
                                </div>
                            </SheetHeader>

                            <div className="flex-1 overflow-y-auto px-8 py-7 space-y-6 text-xs">
                                {/* Shift times */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 pb-0.5">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                            Shift Times
                                        </span>
                                        <div className="h-px bg-border/60 flex-1"></div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="p-3.5 rounded-xl border border-border/70 bg-muted/25">
                                            <div className="text-[11px] text-muted-foreground font-medium">Check In</div>
                                            <div className="font-semibold text-foreground text-sm mt-1 flex items-center gap-2">
                                                <LogIn className="size-3.5 text-emerald-600" />
                                                {viewingRecord.checkIn ?? "—"}
                                            </div>
                                        </div>
                                        <div className="p-3.5 rounded-xl border border-border/70 bg-muted/25">
                                            <div className="text-[11px] text-muted-foreground font-medium">Check Out</div>
                                            <div className="font-semibold text-foreground text-sm mt-1 flex items-center gap-2">
                                                <LogOut className="size-3.5 text-amber-600" />
                                                {viewingRecord.checkIn && !viewingRecord.checkOut
                                                    ? "Still on site"
                                                    : viewingRecord.checkOut ?? "—"}
                                            </div>
                                        </div>
                                        <div className="p-3.5 rounded-xl border border-border/70 bg-muted/25">
                                            <div className="text-[11px] text-muted-foreground font-medium">Hours Worked</div>
                                            <div className="font-semibold text-foreground text-sm mt-1 flex items-center gap-2">
                                                <Timer className="size-3.5 text-primary" />
                                                {viewingRecord.hoursWorked > 0 ? `${viewingRecord.hoursWorked.toFixed(1)} hrs` : "—"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Location & method */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 pb-0.5">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                            Jobsite & Verification
                                        </span>
                                        <div className="h-px bg-border/60 flex-1"></div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="p-3.5 rounded-xl border border-border/70 bg-muted/25 flex items-center justify-between">
                                            <div>
                                                <div className="text-[11px] text-muted-foreground font-medium">Assigned Jobsite</div>
                                                <div className="font-semibold text-foreground text-xs mt-1 flex items-center gap-2">
                                                    <Building2 className="size-3.5 text-primary" />
                                                    {viewingRecord.jobsiteName}
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-[10px] px-2 py-0.5">Primary Site</Badge>
                                        </div>
                                        <div className="p-3.5 rounded-xl border border-border/70 bg-muted/25">
                                            <div className="text-[11px] text-muted-foreground font-medium">Check-in Method</div>
                                            <div className="font-semibold text-foreground text-xs mt-1 flex items-center gap-2">
                                                {viewingRecord.method ? (
                                                    <>
                                                        <MethodIcon method={viewingRecord.method} />
                                                        {viewingRecord.method}
                                                    </>
                                                ) : (
                                                    "No check-in recorded"
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Notes */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 pb-0.5">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                            Notes
                                        </span>
                                        <div className="h-px bg-border/60 flex-1"></div>
                                    </div>
                                    <div className="p-3.5 rounded-xl border border-border/70 bg-muted/25 text-xs text-foreground leading-relaxed min-h-[64px]">
                                        {viewingRecord.notes || (
                                            <span className="text-muted-foreground">No notes for this record.</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <SheetFooter className="px-8 py-4.5 border-t border-border/80 bg-muted/20 shrink-0 flex flex-row items-center justify-between gap-3 mt-auto">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="text-xs gap-1.5 cursor-pointer rounded-lg border-border"
                                >
                                    <Edit className="size-3.5 text-blue-500" />
                                    Edit Record
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => setViewingRecord(null)}
                                    className="text-xs cursor-pointer rounded-lg px-4"
                                >
                                    Close
                                </Button>
                            </SheetFooter>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}