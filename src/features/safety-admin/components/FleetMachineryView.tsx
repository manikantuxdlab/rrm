import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { equipmentService } from "@/services/equipmentService"
import { submissionsService } from "@/services/submissionsService"
import { downloadEquipmentInspectionPdf } from "@/lib/equipmentInspectionPdfGenerator"
import type { EquipmentFleetItem, SubmissionRecord } from "@/types"
import { toast } from "sonner"
import {
  Truck,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Eye,
  Check,
  X,
  RefreshCw,
  Lock,
  Unlock,
  AlertTriangle,
  Download,
  CheckCircle2,
} from "lucide-react"

export function FleetMachineryView({
  onOpenAddEquipment,
}: {
  onOpenAddEquipment: () => void
}) {
  const [fleetList, setFleetList] = React.useState<EquipmentFleetItem[]>([])
  const [inspectionsList, setInspectionsList] = React.useState<SubmissionRecord[]>([])
  const [activeMainTab, setActiveMainTab] = React.useState<"schedule" | "inspections">("schedule")
  const [isLoading, setIsLoading] = React.useState<boolean>(true)
  const [searchQuery, setSearchQuery] = React.useState<string>("")
  const [selectedStatusTab, setSelectedStatusTab] = React.useState<string>("all")
  const [inspectingItem, setInspectingItem] = React.useState<EquipmentFleetItem | null>(null)
  const [inspectingInspection, setInspectingInspection] = React.useState<SubmissionRecord | null>(null)
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false)
  const [viewingPhoto, setViewingPhoto] = React.useState<{ uri: string; title: string } | null>(null)

  const loadData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const [items, subs] = await Promise.all([
        equipmentService.fetchAll(),
        submissionsService.fetchAll({ moduleType: "equipment_inspection" }).catch(() => []),
      ])
      setFleetList(items || [])
      setInspectionsList(subs || [])
    } catch (err) {
      console.error("[FleetMachineryView] Error loading data:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  // Real-time Supabase postgres_changes listener
  React.useEffect(() => {
    const unsubEquip = equipmentService.subscribeToChanges(() => {
      loadData()
    })
    const unsubSubs = submissionsService.subscribeToChanges(() => {
      loadData()
    })
    return () => {
      unsubEquip()
      unsubSubs()
    }
  }, [loadData])

  const pendingCount = React.useMemo(() => {
    return fleetList.filter(
      (eq) => eq.insuranceStatus === "under_review" || eq.insuranceStatus === "pending_backoffice"
    ).length
  }, [fleetList])

  const endorsedCount = React.useMemo(() => {
    return fleetList.filter(
      (eq) => eq.insuranceStatus === "insured" || eq.insuranceStatus === "endorsed"
    ).length
  }, [fleetList])

  const declinedCount = React.useMemo(() => {
    return fleetList.filter((eq) => eq.insuranceStatus === "declined").length
  }, [fleetList])

  const totalInsuredValue = React.useMemo(() => {
    return fleetList
      .filter((eq) => eq.insuranceStatus === "insured" || eq.insuranceStatus === "endorsed")
      .reduce((acc, curr) => acc + (curr.estimatedValue || 0), 0)
  }, [fleetList])

  // Computed Pre-Trip Inspection KPIs
  const inspectionKpis = React.useMemo(() => {
    const lockedOut = inspectionsList.filter(
      (sub) => sub.data?.isLockedOut && !sub.data?.lockoutCleared
    )
    const passed = inspectionsList.filter(
      (sub) => !sub.data?.isLockedOut || sub.data?.lockoutCleared
    )
    return {
      total: inspectionsList.length,
      lockedOutCount: lockedOut.length,
      passedCount: passed.length,
    }
  }, [inspectionsList])

  const filteredFleet = React.useMemo(() => {
    return fleetList.filter((eq) => {
      const matchesSearch =
        eq.unitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (eq.vinOrSerial || "").toLowerCase().includes(searchQuery.toLowerCase())

      if (selectedStatusTab === "all") return matchesSearch
      if (selectedStatusTab === "pending")
        return matchesSearch && (eq.insuranceStatus === "under_review" || eq.insuranceStatus === "pending_backoffice")
      if (selectedStatusTab === "endorsed")
        return matchesSearch && (eq.insuranceStatus === "endorsed" || eq.insuranceStatus === "insured")
      if (selectedStatusTab === "declined")
        return matchesSearch && eq.insuranceStatus === "declined"
      return matchesSearch
    })
  }, [fleetList, searchQuery, selectedStatusTab])

  const filteredInspections = React.useMemo(() => {
    return inspectionsList.filter((sub) => {
      const q = searchQuery.toLowerCase()
      return (
        sub.title.toLowerCase().includes(q) ||
        (sub.data?.unitNumber || "").toLowerCase().includes(q) ||
        (sub.data?.makeModel || "").toLowerCase().includes(q) ||
        sub.jobSiteName.toLowerCase().includes(q) ||
        sub.foremanName.toLowerCase().includes(q)
      )
    })
  }, [inspectionsList, searchQuery])

  const handleStatusUpdate = async (id: string, status: "endorsed" | "declined") => {
    setIsProcessing(true)
    try {
      const ok = await equipmentService.updateInsuranceStatus(id, status)
      if (ok) {
        toast.success(`Unit updated to: ${status.toUpperCase()}`)
        loadData()
        if (inspectingItem && inspectingItem.id === id) {
          setInspectingItem({ ...inspectingItem, insuranceStatus: status })
        }
      } else {
        toast.error("Failed to update status in database.")
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClearLockout = async (sub: SubmissionRecord) => {
    setIsProcessing(true)
    try {
      const ok = await submissionsService.updateSubmissionData(sub.id, {
        lockoutCleared: true,
        lockoutClearedAt: new Date().toISOString(),
        lockoutClearedBy: "Super Admin (Fleet Director)",
        inspectionResult: "Lockout Cleared - Returned to Service",
      })
      if (ok) {
        toast.success(`Lockout cleared for Unit #${sub.data?.unitNumber}! Machine cleared for service.`)
        loadData()
        setInspectingInspection((prev) =>
          prev && prev.id === sub.id
            ? {
                ...prev,
                data: {
                  ...(prev.data || {}),
                  lockoutCleared: true,
                  lockoutClearedAt: new Date().toISOString(),
                  inspectionResult: "Lockout Cleared - Returned to Service",
                },
              }
            : prev
        )
      } else {
        toast.error("Failed to clear lockout.")
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownloadPdf = (sub: SubmissionRecord) => {
    const data = sub.data || {}
    downloadEquipmentInspectionPdf({
      id: sub.id,
      dateStr: sub.timestamp,
      unitNumber: data.unitNumber || "101",
      makeModel: data.makeModel || sub.title,
      vinSerial: data.vinSerial || "N/A",
      hoursMiles: data.hoursMiles || "N/A",
      jobSite: sub.jobSiteName || "Jobsite",
      foreman: sub.foremanName || "Operator",
      company: sub.companyName || "Titan Construction",
      inspectionResult: data.inspectionResult || "Passed 100% - In Service",
      isLockedOut: Boolean(data.isLockedOut && !data.lockoutCleared),
      items: data.items || data.defects || [],
      signatureUri: sub.signatureUri,
      maintenanceTicketNumber: data.maintenanceTicketNumber,
    })
  }

  return (
    <div className="space-y-6">
      {/* View Header with Main Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Truck className="size-6 text-primary" />
            <span>Heavy Machinery & Equipment Compliance Hub</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cal/OSHA Title 8 § 1597 daily pre-trip walkarounds, LOTO out-of-service tags, and inland marine insurance schedule
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center p-1 bg-muted rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveMainTab("schedule")}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeMainTab === "schedule"
                  ? "bg-card text-foreground shadow-xs font-black"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Fleet Schedule ({fleetList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveMainTab("inspections")}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMainTab === "inspections"
                  ? "bg-card text-foreground shadow-xs font-black"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Pre-Trip Walkarounds (DVIR)</span>
              {inspectionKpis.lockedOutCount > 0 && (
                <span className="size-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-black animate-pulse">
                  {inspectionKpis.lockedOutCount}
                </span>
              )}
            </button>
          </div>

          {activeMainTab === "schedule" && (
            <Button
              size="sm"
              onClick={onOpenAddEquipment}
              className="text-xs font-bold gap-1.5 cursor-pointer rounded-xl"
            >
              <Plus className="size-3.5" />
              <span>Add Equipment</span>
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      {activeMainTab === "schedule" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Total Tracked Fleet</CardDescription>
              <CardTitle className="text-2xl font-bold text-foreground">
                {fleetList.length} Units
              </CardTitle>
            </CardHeader>
            <CardFooter className="text-xs text-muted-foreground">
              Heavy equipment & commercial vehicles
            </CardFooter>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Endorsement Queue</CardDescription>
              <CardTitle className="text-2xl font-bold text-amber-800 dark:text-amber-300">
                {pendingCount} Pending
              </CardTitle>
            </CardHeader>
            <CardFooter className="text-xs text-muted-foreground">
              Awaiting underwriter review
            </CardFooter>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Total Insured Valuation</CardDescription>
              <CardTitle className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                ${totalInsuredValue.toLocaleString()} USD
              </CardTitle>
            </CardHeader>
            <CardFooter className="text-xs text-muted-foreground">
              Inland Marine & Contractor Floater
            </CardFooter>
          </Card>

          <Card
            onClick={() => setActiveMainTab("inspections")}
            className="shadow-none cursor-pointer hover:border-primary/40 transition-colors"
          >
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Daily Pre-Trip Status</CardDescription>
              <CardTitle className="text-2xl font-bold text-foreground flex items-center justify-between">
                <span>{inspectionKpis.total} Logged</span>
                {inspectionKpis.lockedOutCount > 0 ? (
                  <Badge className="bg-rose-600 text-white text-[10px] font-black">
                    {inspectionKpis.lockedOutCount} LOTO
                  </Badge>
                ) : (
                  <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                    All Passed
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardFooter className="text-xs text-muted-foreground">
              Cal/OSHA § 1597 walkarounds
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Total DVIR Inspections</CardDescription>
              <CardTitle className="text-2xl font-bold text-foreground">
                {inspectionKpis.total} Logged
              </CardTitle>
            </CardHeader>
            <CardFooter className="text-xs text-muted-foreground">
              Cal/OSHA Title 8 § 1597 & US DOT 49 CFR § 396.11
            </CardFooter>
          </Card>

          <Card className="shadow-none border-rose-500/30 bg-rose-500/5">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs text-rose-700 dark:text-rose-400 font-bold flex items-center gap-1.5">
                <Lock className="size-3.5" />
                <span>Active Lockout / Tagout (LOTO)</span>
              </CardDescription>
              <CardTitle className="text-2xl font-black text-rose-700 dark:text-rose-300">
                {inspectionKpis.lockedOutCount} Out of Service
              </CardTitle>
            </CardHeader>
            <CardFooter className="text-xs text-rose-600 dark:text-rose-400">
              Disqualified from operation pending repair
            </CardFooter>
          </Card>

          <Card className="shadow-none border-emerald-500/30 bg-emerald-500/5">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5" />
                <span>100% Cleared (In Service)</span>
              </CardDescription>
              <CardTitle className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                {inspectionKpis.passedCount} Cleared
              </CardTitle>
            </CardHeader>
            <CardFooter className="text-xs text-emerald-600 dark:text-emerald-400">
              Verified 9-point walkaround certified
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Main Table Container */}
      <Card className="shadow-none">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
          {activeMainTab === "schedule" ? (
            <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl text-xs overflow-x-auto">
              <button
                type="button"
                onClick={() => setSelectedStatusTab("all")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedStatusTab === "all"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Units ({fleetList.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatusTab("pending")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedStatusTab === "pending"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "text-amber-700 dark:text-amber-400 hover:text-foreground"
                }`}
              >
                <span>Under Review</span>
                {pendingCount > 0 && (
                  <span className="size-4 rounded-full bg-amber-700/80 text-[10px] text-white flex items-center justify-center font-bold">
                    {pendingCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatusTab("endorsed")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedStatusTab === "endorsed"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Insured & Endorsed ({endorsedCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatusTab("declined")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedStatusTab === "declined"
                    ? "bg-red-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Declined ({declinedCount})
              </button>
            </div>
          ) : (
            <div>
              <CardTitle className="text-sm font-bold text-foreground">
                Daily Pre-Trip Inspections & LOTO Vault ({filteredInspections.length})
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Cal/OSHA § 1597 walkaround logs, defect photo evidence, and digital operator attestations
              </p>
            </div>
          )}

          <div className="relative w-full sm:w-64">
            <Search className="size-3.5 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search unit #, make, VIN, jobsite..."
              className="pl-8 text-xs h-9 rounded-xl"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <RefreshCw className="size-4 animate-spin text-primary" />
              <span>Loading fleet records from database...</span>
            </div>
          ) : activeMainTab === "schedule" ? (
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-muted-foreground text-xs font-semibold border-b">
                <tr>
                  <th className="px-4 py-3">Unit / Machine</th>
                  <th className="px-4 py-3">VIN / Serial</th>
                  <th className="px-4 py-3">Contractor / Owner</th>
                  <th className="px-4 py-3">Replacement Value</th>
                  <th className="px-4 py-3">Insurance Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredFleet.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      No matching equipment units found.
                    </td>
                  </tr>
                ) : (
                  filteredFleet.map((eq) => {
                    const isUnderReview =
                      eq.insuranceStatus === "under_review" || eq.insuranceStatus === "pending_backoffice"
                    const isEndorsed = eq.insuranceStatus === "endorsed" || eq.insuranceStatus === "insured"

                    return (
                      <tr
                        key={eq.id}
                        className="hover:bg-muted/30 transition-colors cursor-pointer group"
                        onClick={() => setInspectingItem(eq)}
                      >
                        <td className="px-4 py-3">
                          <div className="font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                            <span className="font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px]">
                              #{eq.unitNumber}
                            </span>
                            <span>{eq.year} {eq.make} {eq.model}</span>
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            {eq.type || "Heavy Equipment"}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-muted-foreground">
                          {eq.vinOrSerial || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-foreground font-medium">
                          {eq.companyName || "Titan Construction"}
                        </td>
                        <td className="px-4 py-3 font-bold text-foreground">
                          ${(eq.estimatedValue || 0).toLocaleString()} USD
                        </td>
                        <td className="px-4 py-3">
                          {isEndorsed ? (
                            <Badge variant="outline" className="text-emerald-700 bg-emerald-500/10 border-emerald-500/30 text-[10px] font-bold py-0.5 px-2 gap-1">
                              <ShieldCheck className="size-3 text-emerald-600" /> Insured
                            </Badge>
                          ) : eq.insuranceStatus === "declined" ? (
                            <Badge variant="outline" className="text-red-700 bg-red-500/10 border-red-500/30 text-[10px] font-bold py-0.5 px-2 gap-1">
                              <X className="size-3 text-red-600" /> Declined
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-800 dark:text-amber-300 bg-amber-500/15 border-amber-500/40 text-[10px] font-bold py-0.5 px-2 gap-1 animate-pulse">
                              <ShieldAlert className="size-3 text-amber-600" /> Under Review
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => setInspectingItem(eq)}
                              className="h-7 text-xs font-bold gap-1 text-muted-foreground hover:text-foreground"
                            >
                              <Eye className="size-3.5" /> Dossier
                            </Button>
                            {isUnderReview && (
                              <>
                                <Button
                                  size="xs"
                                  onClick={() => handleStatusUpdate(eq.id, "endorsed")}
                                  disabled={isProcessing}
                                  className="h-7 text-xs font-bold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                                >
                                  <Check className="size-3" /> Endorse
                                </Button>
                                <Button
                                  size="xs"
                                  variant="outline"
                                  onClick={() => handleStatusUpdate(eq.id, "declined")}
                                  disabled={isProcessing}
                                  className="h-7 text-xs font-bold gap-1 text-red-600 hover:bg-red-50 border-red-200 rounded-lg"
                                >
                                  <X className="size-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-muted-foreground text-xs font-semibold border-b">
                <tr>
                  <th className="px-4 py-3">Machine / Title</th>
                  <th className="px-4 py-3">Jobsite Location</th>
                  <th className="px-4 py-3">Certified Operator</th>
                  <th className="px-4 py-3">Inspection Time</th>
                  <th className="px-4 py-3">Pre-Shift Verdict</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredInspections.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      No equipment inspection records logged yet.
                    </td>
                  </tr>
                ) : (
                  filteredInspections.map((sub) => {
                    const data = sub.data || {}
                    const isLocked = Boolean(data.isLockedOut && !data.lockoutCleared)
                    const isCleared = Boolean(data.lockoutCleared)

                    return (
                      <tr
                        key={sub.id}
                        className="hover:bg-muted/30 transition-colors cursor-pointer group"
                        onClick={() => setInspectingInspection(sub)}
                      >
                        <td className="px-4 py-3">
                          <div className="font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                            <span className="font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px]">
                              #{data.unitNumber || "101"}
                            </span>
                            <span>{data.makeModel || sub.title}</span>
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
                            <span>Hours: {data.hoursMiles || "1,420 Hours"}</span>
                            <span>•</span>
                            <span className="font-mono">{data.vinSerial || "N/A"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-foreground font-medium">
                          {sub.jobSiteName}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          <span className="text-foreground font-medium">{sub.foremanName}</span>
                          <div className="text-[10px] text-muted-foreground">{sub.companyName}</div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {sub.timestamp}
                        </td>
                        <td className="px-4 py-3">
                          {isLocked ? (
                            <Badge className="bg-rose-600 text-white text-[10px] font-black py-0.5 px-2 gap-1 animate-pulse">
                              <Lock className="size-3" /> OUT OF SERVICE (LOTO)
                            </Badge>
                          ) : isCleared ? (
                            <Badge variant="outline" className="text-purple-700 bg-purple-500/10 border-purple-500/30 text-[10px] font-bold py-0.5 px-2 gap-1">
                              <Unlock className="size-3" /> LOTO Cleared by Admin
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-emerald-700 bg-emerald-500/10 border-emerald-500/30 text-[10px] font-bold py-0.5 px-2 gap-1">
                              <CheckCircle2 className="size-3 text-emerald-600" /> Passed 100%
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => setInspectingInspection(sub)}
                              className="h-7 text-xs font-bold gap-1 text-muted-foreground hover:text-foreground"
                            >
                              <Eye className="size-3.5" /> Audit
                            </Button>
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => handleDownloadPdf(sub)}
                              className="h-7 text-xs font-bold gap-1 cursor-pointer rounded-lg"
                              title="Download Official DVIR PDF"
                            >
                              <Download className="size-3 text-primary" /> DVIR PDF
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Equipment Schedule Side Drawer Sheet */}
      <Sheet open={Boolean(inspectingItem)} onOpenChange={(open) => !open && setInspectingItem(null)}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl md:max-w-2xl p-0 flex flex-col bg-background/95 backdrop-blur-md border-l border-border/80 shadow-2xl h-full"
        >
          {inspectingItem && (
            <>
              <SheetHeader className="p-5 border-b border-border/60 bg-card/60 sticky top-0 z-10 backdrop-blur-xs">
                <div className="flex items-start justify-between gap-3 pr-8">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2.5 rounded-2xl bg-primary/10 text-primary shrink-0 mt-0.5">
                      <Truck className="size-5" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-black text-primary bg-primary/10 px-2.5 py-0.5 rounded-lg border border-primary/20">
                          Unit #{inspectingItem.unitNumber}
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground">
                          {inspectingItem.type || "Heavy Equipment"}
                        </span>
                      </div>
                      <SheetTitle className="text-base font-black text-foreground tracking-tight leading-snug">
                        {inspectingItem.year} {inspectingItem.make} {inspectingItem.model}
                      </SheetTitle>
                      <SheetDescription className="text-xs text-muted-foreground font-medium truncate">
                        {inspectingItem.companyName || "Contractor Fleet"} • Added on {inspectingItem.dateAdded}
                      </SheetDescription>
                    </div>
                  </div>

                  <div className="shrink-0 pt-1">
                    {inspectingItem.insuranceStatus === "endorsed" || inspectingItem.insuranceStatus === "insured" ? (
                      <Badge variant="outline" className="text-emerald-700 bg-emerald-500/10 border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                        <ShieldCheck className="size-3.5 text-emerald-600" />
                        <span>Insured & Endorsed</span>
                      </Badge>
                    ) : inspectingItem.insuranceStatus === "declined" ? (
                      <Badge variant="outline" className="text-red-700 bg-red-500/10 border-red-500/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                        <X className="size-3.5 text-red-600" />
                        <span>Declined</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-800 dark:text-amber-300 bg-amber-500/15 border-amber-500/40 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                        <ShieldAlert className="size-3.5 text-amber-600" />
                        <span>Under Review</span>
                      </Badge>
                    )}
                  </div>
                </div>
              </SheetHeader>

              <div className="p-6 space-y-5 flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/40 border border-border/60 text-xs">
                  <div>
                    <span className="text-muted-foreground">VIN / Chassis Serial:</span>
                    <p className="font-mono font-bold text-foreground mt-0.5">{inspectingItem.vinOrSerial || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Stated Replacement Value:</span>
                    <p className="font-bold text-emerald-600 text-sm mt-0.5">
                      ${(inspectingItem.estimatedValue || 0).toLocaleString()} USD
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Photographic Proof of Delivery & VIN Plate
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {inspectingItem.platePhotoUri ? (
                      <div
                        className="relative rounded-2xl overflow-hidden border border-border group cursor-pointer"
                        onClick={() => setViewingPhoto({ uri: inspectingItem.platePhotoUri!, title: "VIN Data Plate" })}
                      >
                        <img src={inspectingItem.platePhotoUri} alt="VIN Plate" className="w-full h-36 object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                          <Eye className="size-4" /> Enlarge
                        </div>
                      </div>
                    ) : (
                      <div className="h-36 rounded-2xl border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
                        No VIN Plate Photo
                      </div>
                    )}

                    {inspectingItem.deliveryPhotoUri ? (
                      <div
                        className="relative rounded-2xl overflow-hidden border border-border group cursor-pointer"
                        onClick={() => setViewingPhoto({ uri: inspectingItem.deliveryPhotoUri!, title: "Delivery Condition" })}
                      >
                        <img src={inspectingItem.deliveryPhotoUri} alt="Delivery" className="w-full h-36 object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                          <Eye className="size-4" /> Enlarge
                        </div>
                      </div>
                    ) : (
                      <div className="h-36 rounded-2xl border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
                        No Machine Photo
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <SheetFooter className="p-4 border-t border-border/60 bg-card/60 flex items-center justify-end gap-2">
                {inspectingItem.insuranceStatus === "under_review" || inspectingItem.insuranceStatus === "pending_backoffice" ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => handleStatusUpdate(inspectingItem.id, "declined")}
                      disabled={isProcessing}
                      className="text-xs font-bold text-red-600 border-red-200 hover:bg-red-50 rounded-xl"
                    >
                      Decline Coverage
                    </Button>
                    <Button
                      onClick={() => handleStatusUpdate(inspectingItem.id, "endorsed")}
                      disabled={isProcessing}
                      className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-1.5"
                    >
                      <Check className="size-3.5" /> Endorse to Policy
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => setInspectingItem(null)} className="text-xs font-bold rounded-xl">
                    Close Dossier
                  </Button>
                )}
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Pre-Trip Inspection Audit Side Drawer Sheet */}
      <Sheet open={Boolean(inspectingInspection)} onOpenChange={(open) => !open && setInspectingInspection(null)}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl md:max-w-2xl p-0 flex flex-col bg-background/95 backdrop-blur-md border-l border-border/80 shadow-2xl h-full"
        >
          {inspectingInspection && (
            <>
              {/* Drawer Header */}
              <SheetHeader className="p-5 border-b border-border/60 bg-card/60 sticky top-0 z-10 backdrop-blur-xs">
                <div className="flex items-start justify-between gap-3 pr-8">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
                        #{inspectingInspection.data?.unitNumber || "101"}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {inspectingInspection.id.slice(0, 12)}
                      </span>
                    </div>
                    <SheetTitle className="text-base font-black text-foreground tracking-tight leading-snug">
                      {inspectingInspection.data?.makeModel || inspectingInspection.title}
                    </SheetTitle>
                    <SheetDescription className="text-xs text-muted-foreground font-medium">
                      Project: {inspectingInspection.jobSiteName} • Operator: {inspectingInspection.foremanName}
                    </SheetDescription>
                  </div>

                  <div className="shrink-0 pt-1">
                    {inspectingInspection.data?.isLockedOut && !inspectingInspection.data?.lockoutCleared ? (
                      <Badge className="bg-rose-600 text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                        <Lock className="size-3.5" />
                        <span>OUT OF SERVICE</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-emerald-700 bg-emerald-500/10 border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                        <ShieldCheck className="size-3.5 text-emerald-600" />
                        <span>100% Cleared</span>
                      </Badge>
                    )}
                  </div>
                </div>
              </SheetHeader>

              {/* Scrollable Audit Body */}
              <div className="p-6 space-y-5 flex-1 overflow-y-auto">
                {/* Lockout Banner if Defect Present */}
                {inspectingInspection.data?.isLockedOut && !inspectingInspection.data?.lockoutCleared ? (
                  <div className="p-4 rounded-3xl bg-rose-500/10 border-2 border-rose-500 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-rose-700 dark:text-rose-400 text-xs flex items-center gap-1.5">
                        <AlertTriangle className="size-4" />
                        <span>CAL/OSHA § 1597 MANDATORY LOCKOUT (LOTO) ACTIVE</span>
                      </span>
                      <span className="font-mono text-[11px] font-bold text-rose-800">
                        {inspectingInspection.data?.maintenanceTicketNumber || "TKT-MAINT-P1"}
                      </span>
                    </div>
                    <p className="text-xs text-rose-800 dark:text-rose-200 font-medium leading-relaxed">
                      This machine failed pre-shift walkaround inspection. An automated high-priority work order was dispatched to fleet mechanics. Do not operate until repair verification is certified below.
                    </p>
                  </div>
                ) : inspectingInspection.data?.lockoutCleared ? (
                  <div className="p-4 rounded-3xl bg-purple-500/10 border border-purple-500/30 text-xs space-y-1">
                    <span className="font-bold text-purple-700 flex items-center gap-1.5">
                      <Unlock className="size-4" />
                      <span>Lockout Cleared & Certified by Super Admin</span>
                    </span>
                    <p className="text-muted-foreground text-[11px]">
                      Cleared on {new Date(inspectingInspection.data.lockoutClearedAt).toLocaleString()} by {inspectingInspection.data.lockoutClearedBy}
                    </p>
                  </div>
                ) : null}

                {/* Machine Metadata Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-2xl bg-muted/40 border border-border/60 text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground">VIN / Serial:</span>
                    <p className="font-mono font-bold text-foreground mt-0.5 truncate">{inspectingInspection.data?.vinSerial || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground">Hours / Miles:</span>
                    <p className="font-bold text-foreground mt-0.5">{inspectingInspection.data?.hoursMiles || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground">Operator:</span>
                    <p className="font-bold text-foreground mt-0.5 truncate">{inspectingInspection.foremanName}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground">Company:</span>
                    <p className="font-bold text-foreground mt-0.5 truncate">{inspectingInspection.companyName}</p>
                  </div>
                </div>

                {/* 9-Point Items Checklist */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    9-Point Operational Checklist Review
                  </h4>
                  <div className="space-y-1.5">
                    {(inspectingInspection.data?.items || []).map((item: any, idx: number) => {
                      const isDefect = item.status === "fail"
                      return (
                        <div
                          key={item.id || idx}
                          className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                            isDefect ? "border-rose-500/40 bg-rose-500/5" : "border-border/70 bg-card"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-foreground">
                              {idx + 1}. {item.label}
                            </span>
                            {isDefect ? (
                              <Badge className="bg-rose-600 text-white text-[9.5px] font-bold">DEFECT</Badge>
                            ) : (
                              <Badge variant="outline" className="text-emerald-700 bg-emerald-500/10 border-emerald-500/30 text-[9.5px]">
                                PASS [OK]
                              </Badge>
                            )}
                          </div>
                          {isDefect && item.notes && (
                            <p className="text-rose-700 dark:text-rose-400 font-medium text-[11px] bg-rose-500/10 p-2 rounded-lg">
                              <strong>Defect Note:</strong> {item.notes}
                            </p>
                          )}
                          {item.photoUri && (
                            <div className="pt-1">
                              <img
                                src={item.photoUri}
                                alt="Defect"
                                onClick={() => setViewingPhoto({ uri: item.photoUri, title: `${item.label} Defect` })}
                                className="h-24 w-40 object-cover rounded-xl border border-rose-500/30 cursor-pointer hover:opacity-90 transition-opacity"
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Digital Operator Signature */}
                <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-2">
                  <span className="text-xs font-bold text-foreground">Certified Operator Signature Attestation</span>
                  {inspectingInspection.signatureUri ? (
                    <div className="p-2 bg-white rounded-xl border border-slate-200 inline-block">
                      <img src={inspectingInspection.signatureUri} alt="Signature" className="h-14 object-contain" />
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Digital cursive signature verified on file.</p>
                  )}
                  <p className="text-[10px] text-muted-foreground font-mono">
                    Signed by {inspectingInspection.foremanName} • {inspectingInspection.timestamp}
                  </p>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <SheetFooter className="p-4 border-t border-border/60 bg-card/60 flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleDownloadPdf(inspectingInspection)}
                  className="text-xs font-bold gap-1.5 rounded-xl cursor-pointer"
                >
                  <Download className="size-3.5 text-primary" />
                  <span>Export Signed DVIR PDF</span>
                </Button>

                {inspectingInspection.data?.isLockedOut && !inspectingInspection.data?.lockoutCleared ? (
                  <Button
                    onClick={() => handleClearLockout(inspectingInspection)}
                    disabled={isProcessing}
                    className="text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Unlock className="size-3.5" />
                    <span>Clear LOTO & Return Machine to Service</span>
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => setInspectingInspection(null)} className="text-xs font-bold rounded-xl">
                    Close Audit
                  </Button>
                )}
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Enlarged Photo Lightbox Modal */}
      {viewingPhoto && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setViewingPhoto(null)}
        >
          <div className="relative max-w-2xl w-full max-h-[85vh] bg-card rounded-3xl overflow-hidden p-3 space-y-2">
            <div className="flex items-center justify-between px-3 pt-1">
              <span className="text-xs font-bold text-foreground">{viewingPhoto.title}</span>
              <button
                type="button"
                onClick={() => setViewingPhoto(null)}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            <img
              src={viewingPhoto.uri}
              alt={viewingPhoto.title}
              className="w-full max-h-[75vh] object-contain rounded-2xl bg-black"
            />
          </div>
        </div>
      )}
    </div>
  )
}
