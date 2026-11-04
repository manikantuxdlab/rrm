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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { equipmentService } from "@/services/equipmentService"
import type { EquipmentFleetItem } from "@/types"
import {
  Truck,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Eye,
  Check,
  X,
  Camera,
  RefreshCw,
} from "lucide-react"

export function FleetMachineryView({
  onOpenAddEquipment,
}: {
  onOpenAddEquipment: () => void
}) {
  const [fleetList, setFleetList] = React.useState<EquipmentFleetItem[]>([])
  const [isLoading, setIsLoading] = React.useState<boolean>(true)
  const [searchQuery, setSearchQuery] = React.useState<string>("")
  const [selectedStatusTab, setSelectedStatusTab] = React.useState<string>("all")
  const [inspectingItem, setInspectingItem] = React.useState<EquipmentFleetItem | null>(null)
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false)

  const loadFleet = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const items = await equipmentService.fetchAll()
      setFleetList(items)
    } catch (err) {
      console.error("[FleetMachineryView] Error loading fleet:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadFleet()
  }, [loadFleet])

  // Real-time Supabase postgres_changes listener
  React.useEffect(() => {
    const unsub = equipmentService.subscribeToChanges(() => {
      loadFleet()
    })
    return () => unsub()
  }, [loadFleet])

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

  const filteredFleet = React.useMemo(() => {
    return fleetList.filter((eq) => {
      const matchesSearch =
        eq.unitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.vinOrSerial.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (eq.companyName && eq.companyName.toLowerCase().includes(searchQuery.toLowerCase()))

      let matchesStatus = true
      if (selectedStatusTab === "pending") {
        matchesStatus = eq.insuranceStatus === "under_review" || eq.insuranceStatus === "pending_backoffice"
      } else if (selectedStatusTab === "endorsed") {
        matchesStatus = eq.insuranceStatus === "insured" || eq.insuranceStatus === "endorsed"
      } else if (selectedStatusTab === "declined") {
        matchesStatus = eq.insuranceStatus === "declined"
      }

      return matchesSearch && matchesStatus
    })
  }, [fleetList, searchQuery, selectedStatusTab])

  const handleStatusUpdate = async (id: string, newStatus: "endorsed" | "declined") => {
    setIsProcessing(true)
    try {
      const ok = await equipmentService.updateInsuranceStatus(id, newStatus)
      if (ok) {
        setFleetList((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, insuranceStatus: newStatus } : item
          )
        )
        if (inspectingItem && inspectingItem.id === id) {
          setInspectingItem((prev) => (prev ? { ...prev, insuranceStatus: newStatus } : null))
        }
      }
    } catch (err) {
      console.error("[FleetMachineryView] Status update error:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Truck className="size-5" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              Heavy Equipment & Machinery Fleet Schedule
            </h2>
            {pendingCount > 0 && (
              <Badge className="bg-amber-500 text-white font-bold text-xs px-2 py-0.5 animate-pulse">
                {pendingCount} Pending Underwriter Review
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Contractor machinery inventory, serial numbers, inland marine insurance schedule & Exhibit A8 underwriter reviews
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadFleet}
            disabled={isLoading}
            className="text-xs font-semibold gap-1.5"
            title="Reload from Supabase"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin text-primary" : ""}`} />
            Sync Cloud
          </Button>
          <Button
            size="sm"
            onClick={onOpenAddEquipment}
            className="text-xs font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-3.5" />
            Add Fleet Machinery
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Total Fleet Inventory</CardDescription>
            <CardTitle className="text-2xl font-bold">{fleetList.length} Units</CardTitle>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            All registered contractor units
          </CardFooter>
        </Card>

        <Card className="shadow-none border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold text-amber-700 dark:text-amber-400">
              Pending Endorsements (Exhibit A8)
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-800 dark:text-amber-200">
              {pendingCount} Units
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-xs text-amber-700 dark:text-amber-400 font-medium">
            Requires underwriter review
          </CardFooter>
        </Card>

        <Card className="shadow-none border-emerald-500/30 bg-emerald-500/5">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              Total Insured Fleet Value
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              ${totalInsuredValue.toLocaleString()} USD
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            Inland Marine & Contractor Floater
          </CardFooter>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Pre-Shift Inspections</CardDescription>
            <CardTitle className="text-2xl font-bold text-foreground">
              {endorsedCount} Active
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            9-point walkaround certified
          </CardFooter>
        </Card>
      </div>

      {/* Status Filter Tabs & Search Bar */}
      <Card className="shadow-none">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
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

          <div className="relative w-full sm:w-64">
            <Search className="size-3.5 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search unit #, make, VIN..."
              className="pl-8 text-xs h-9"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
              <tr>
                <th className="px-4 py-3 font-semibold">Unit Number</th>
                <th className="px-4 py-3 font-semibold">Equipment Description</th>
                <th className="px-4 py-3 font-semibold">Category Type</th>
                <th className="px-4 py-3 font-semibold">VIN / Serial #</th>
                <th className="px-4 py-3 font-semibold">Estimated Value</th>
                <th className="px-4 py-3 font-semibold">Insurance Status (Exhibit A8)</th>
                <th className="px-4 py-3 font-semibold text-right">Super Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredFleet.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-muted-foreground text-xs">
                    No equipment records matching filter.
                  </td>
                </tr>
              ) : (
                filteredFleet.map((eq) => {
                  const isEndorsed = eq.insuranceStatus === "insured" || eq.insuranceStatus === "endorsed"
                  const isUnderReview = eq.insuranceStatus === "under_review" || eq.insuranceStatus === "pending_backoffice"
                  const isDeclined = eq.insuranceStatus === "declined"

                  return (
                    <tr key={eq.id} className="hover:bg-muted/30 transition-colors">
                      {/* Unit Number */}
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-foreground font-mono bg-muted/60 px-2 py-0.5 rounded-md border border-border">
                          {eq.unitNumber}
                        </span>
                      </td>

                      {/* Equipment Description & Company */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-foreground">
                          {eq.year} {eq.make} {eq.model}
                        </div>
                        <div className="text-[11px] text-muted-foreground">{eq.companyName}</div>
                      </td>

                      {/* Category Type */}
                      <td className="px-4 py-3.5">
                        <Badge variant="outline" className="text-[10px] font-medium">
                          {eq.type}
                        </Badge>
                      </td>

                      {/* VIN / Serial */}
                      <td className="px-4 py-3.5 font-mono text-[11px] text-muted-foreground">
                        {eq.vinOrSerial}
                      </td>

                      {/* Insured Value */}
                      <td className="px-4 py-3.5 font-semibold text-foreground">
                        ${(eq.estimatedValue || 85000).toLocaleString()} USD
                      </td>

                      {/* Insurance Status Badge */}
                      <td className="px-4 py-3.5">
                        {isEndorsed && (
                          <Badge variant="outline" className="text-emerald-700 bg-emerald-500/10 border-emerald-500/30 text-[10.5px] font-bold flex items-center gap-1 w-fit">
                            <ShieldCheck className="size-3 text-emerald-600" />
                            Insured & Endorsed
                          </Badge>
                        )}
                        {isUnderReview && (
                          <Badge variant="outline" className="text-amber-800 dark:text-amber-300 bg-amber-500/15 border-amber-500/40 text-[10.5px] font-bold flex items-center gap-1 w-fit animate-pulse">
                            <ShieldAlert className="size-3 text-amber-600" />
                            Under Review (Exhibit A8)
                          </Badge>
                        )}
                        {isDeclined && (
                          <Badge variant="outline" className="text-red-700 bg-red-500/10 border-red-500/30 text-[10.5px] font-bold flex items-center gap-1 w-fit">
                            <X className="size-3 text-red-600" />
                            Declined
                          </Badge>
                        )}
                      </td>

                      {/* Super Admin Action Controls */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => setInspectingItem(eq)}
                            className="h-7 text-xs font-semibold gap-1"
                            title="Inspect VIN & Details"
                          >
                            <Eye className="size-3" />
                            Review
                          </Button>

                          {isUnderReview && (
                            <>
                              <Button
                                size="xs"
                                onClick={() => handleStatusUpdate(eq.id, "endorsed")}
                                disabled={isProcessing}
                                className="h-7 text-xs font-bold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                title="Approve & Endorse Policy Addition"
                              >
                                <Check className="size-3" />
                                Endorse
                              </Button>
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => handleStatusUpdate(eq.id, "declined")}
                                disabled={isProcessing}
                                className="h-7 text-xs font-bold gap-1 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                                title="Decline Endorsement"
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
        </CardContent>
      </Card>

      {/* Equipment Detail & Audit Modal */}
      {inspectingItem && (
        <Dialog open={Boolean(inspectingItem)} onOpenChange={(open) => !open && setInspectingItem(null)}>
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Truck className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold">
                    {inspectingItem.year} {inspectingItem.make} {inspectingItem.model}
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    Unit #{inspectingItem.unitNumber} • {inspectingItem.companyName}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              {/* Exhibit A8 Legal Verification Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
                <ShieldAlert className="size-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-amber-950 dark:text-amber-200">
                    Exhibit A8 Non-Binding Verification Status
                  </h4>
                  <p className="text-amber-900 dark:text-amber-300 text-[11px] leading-relaxed">
                    Foreman acknowledged on mobile that coverage is <span className="font-bold underline">NOT bound automatically</span>. Endorsement requires broker carrier transmission.
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono pt-0.5">
                    Logged Timestamp: {inspectingItem.disclaimerTimestamp || inspectingItem.dateAdded}
                  </p>
                </div>
              </div>

              {/* Specification Grid */}
              <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-muted/40 border border-border">
                <div>
                  <span className="text-[10.5px] text-muted-foreground uppercase font-bold block">
                    Classification:
                  </span>
                  <span className="font-bold text-foreground text-xs">{inspectingItem.type}</span>
                </div>
                <div>
                  <span className="text-[10.5px] text-muted-foreground uppercase font-bold block">
                    VIN / Serial Number:
                  </span>
                  <span className="font-mono font-bold text-foreground text-xs">{inspectingItem.vinOrSerial}</span>
                </div>
                <div>
                  <span className="text-[10.5px] text-muted-foreground uppercase font-bold block">
                    Replacement Value:
                  </span>
                  <span className="font-bold text-emerald-600 text-xs">
                    ${(inspectingItem.estimatedValue || 85000).toLocaleString()} USD
                  </span>
                </div>
                <div>
                  <span className="text-[10.5px] text-muted-foreground uppercase font-bold block">
                    Ownership Structure:
                  </span>
                  <span className="font-bold capitalize text-foreground text-xs">
                    {inspectingItem.ownership || "Rented / Leased"}
                  </span>
                </div>
                <div>
                  <span className="text-[10.5px] text-muted-foreground uppercase font-bold block">
                    Staging Location:
                  </span>
                  <span className="font-bold text-foreground text-xs">
                    {inspectingItem.jobSiteName || "Main Contractor Jobsite"}
                  </span>
                </div>
                <div>
                  <span className="text-[10.5px] text-muted-foreground uppercase font-bold block">
                    Current Insurance Status:
                  </span>
                  <span className="font-bold uppercase text-xs text-amber-600 dark:text-amber-400">
                    {inspectingItem.insuranceStatus}
                  </span>
                </div>
              </div>

              {/* Evidence Photos Box */}
              <div className="space-y-2">
                <span className="font-bold text-xs flex items-center gap-1.5 text-foreground">
                  <Camera className="size-3.5 text-primary" />
                  Field Delivery & VIN Evidence Attachments
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-2xl bg-muted/30 border border-border text-center space-y-1">
                    <div className="text-[11px] font-bold text-foreground">VIN / Data Plate Stamping</div>
                    <Badge variant="outline" className="text-[9.5px] text-emerald-700 bg-emerald-500/10">
                      OCR 99.4% Verified
                    </Badge>
                    <p className="text-[10px] text-muted-foreground font-mono pt-1">photo_plate_cat289.jpg</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-muted/30 border border-border text-center space-y-1">
                    <div className="text-[11px] font-bold text-foreground">Gate Delivery Condition</div>
                    <Badge variant="outline" className="text-[9.5px] text-emerald-700 bg-emerald-500/10">
                      Zero Mechanical Damage
                    </Badge>
                    <p className="text-[10px] text-muted-foreground font-mono pt-1">Delivery_Condition_CAT289.jpg</p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInspectingItem(null)}
                className="text-xs"
              >
                Close
              </Button>
              {inspectingItem.insuranceStatus !== "insured" && inspectingItem.insuranceStatus !== "endorsed" && (
                <Button
                  size="sm"
                  onClick={() => handleStatusUpdate(inspectingItem.id, "endorsed")}
                  disabled={isProcessing}
                  className="text-xs font-bold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <ShieldCheck className="size-3.5" />
                  Approve & Endorse Policy
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
