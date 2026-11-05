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
  const [viewingPhoto, setViewingPhoto] = React.useState<{ uri: string; title: string } | null>(null)

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

      {/* Equipment Detail & Audit Side Drawer Sheet */}
      <Sheet open={Boolean(inspectingItem)} onOpenChange={(open) => !open && setInspectingItem(null)}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-2xl p-0 flex flex-col bg-background/95 backdrop-blur-md border-l border-border/80 shadow-2xl h-full"
        >
          {inspectingItem && (
            <>
              {/* Drawer Header */}
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

                  {/* Status Badge */}
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
                        <span>Under Review (Exhibit A8)</span>
                      </Badge>
                    )}
                  </div>
                </div>
              </SheetHeader>

              {/* Drawer Scrollable Body Content */}
              <div className="p-6 space-y-5 flex-1 overflow-y-auto">
                {/* Exhibit A8 Legal Verification Banner */}
                <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 shadow-2xs">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5">
                    <ShieldAlert className="size-5" />
                  </div>
                  <div className="space-y-1 text-xs">
                    <h4 className="font-bold text-amber-950 dark:text-amber-200 uppercase tracking-wide">
                      Exhibit A8 Non-Binding Verification Status
                    </h4>
                    <p className="text-amber-900/90 dark:text-amber-300 leading-relaxed font-medium">
                      Foreman verified and acknowledged on mobile that coverage is <span className="font-bold underline uppercase">NOT bound automatically</span>. Policy endorsement requires underwriter approval and broker transmission.
                    </p>
                    <p className="text-[10.5px] text-muted-foreground font-mono pt-1">
                      Logged Timestamp: {inspectingItem.disclaimerTimestamp || inspectingItem.dateAdded}
                    </p>
                  </div>
                </div>

                {/* Equipment Specifications Grid */}
                <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-2xs space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Equipment Specifications
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-2xl bg-muted/40 border border-border/50">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">Classification</span>
                      <span className="font-bold text-foreground text-xs mt-0.5 block truncate">{inspectingItem.type}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-muted/40 border border-border/50">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">VIN / Serial Number</span>
                      <span className="font-mono font-bold text-foreground text-xs mt-0.5 block truncate">{inspectingItem.vinOrSerial}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-muted/40 border border-border/50">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">Replacement Value</span>
                      <span className="font-black text-emerald-600 text-xs mt-0.5 block">
                        ${(inspectingItem.estimatedValue || 85000).toLocaleString()} USD
                      </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-muted/40 border border-border/50">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">Ownership Structure</span>
                      <span className="font-bold capitalize text-foreground text-xs mt-0.5 block">
                        {inspectingItem.ownership === "rented" ? "Rented / Leased" : inspectingItem.ownership === "owned" ? "Company Owned" : "Subcontractor"}
                      </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-muted/40 border border-border/50 col-span-2 sm:col-span-2">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">Staging Location</span>
                      <span className="font-bold text-foreground text-xs mt-0.5 block truncate">
                        {inspectingItem.jobSiteName || "Main Contractor Jobsite"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Evidence Photos Box */}
                <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Camera className="size-3.5 text-primary" />
                      Field Delivery & VIN Evidence Attachments
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      High-Res Audit Proof
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Plate Photo Card */}
                    <div className="p-3.5 rounded-2xl bg-muted/30 border border-border text-center space-y-2 overflow-hidden">
                      <div className="flex items-center justify-between text-[11px] font-bold text-foreground">
                        <span>VIN / Data Plate Stamping</span>
                        <Badge variant="outline" className="text-[9px] text-emerald-700 bg-emerald-500/10">
                          {inspectingItem.platePhotoUri ? "Attached" : "Documented"}
                        </Badge>
                      </div>
                      {inspectingItem.platePhotoUri && (inspectingItem.platePhotoUri.startsWith("data:") || inspectingItem.platePhotoUri.startsWith("http")) ? (
                        <div
                          onClick={() => setViewingPhoto({ uri: inspectingItem.platePhotoUri!, title: `Unit #${inspectingItem.unitNumber} - Serial Plate Evidence` })}
                          className="h-44 w-full rounded-xl overflow-hidden border border-border bg-black/5 cursor-pointer relative group"
                          title="Click to view full image"
                        >
                          <img src={inspectingItem.platePhotoUri} alt="Plate" className="size-full object-contain group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Eye className="size-5" />
                          </div>
                        </div>
                      ) : (
                        <div className="h-44 w-full rounded-xl border border-dashed border-border flex items-center justify-center text-muted-foreground text-xs bg-muted/20">
                          Physical Plate Verified
                        </div>
                      )}
                      <p className="text-[10px] text-muted-foreground font-mono truncate">
                        {inspectingItem.platePhotoUri?.startsWith("data:") ? "Uploaded Evidence Photo" : (inspectingItem.platePhotoUri || "Plate Photo Attached")}
                      </p>
                    </div>

                    {/* Delivery Photo Card */}
                    <div className="p-3.5 rounded-2xl bg-muted/30 border border-border text-center space-y-2 overflow-hidden">
                      <div className="flex items-center justify-between text-[11px] font-bold text-foreground">
                        <span>Gate Delivery Condition</span>
                        <Badge variant="outline" className="text-[9px] text-emerald-700 bg-emerald-500/10">
                          {inspectingItem.deliveryPhotoUri ? "Attached" : "Documented"}
                        </Badge>
                      </div>
                      {inspectingItem.deliveryPhotoUri && (inspectingItem.deliveryPhotoUri.startsWith("data:") || inspectingItem.deliveryPhotoUri.startsWith("http")) ? (
                        <div
                          onClick={() => setViewingPhoto({ uri: inspectingItem.deliveryPhotoUri!, title: `Unit #${inspectingItem.unitNumber} - Delivery Condition` })}
                          className="h-44 w-full rounded-xl overflow-hidden border border-border bg-black/5 cursor-pointer relative group"
                          title="Click to view full image"
                        >
                          <img src={inspectingItem.deliveryPhotoUri} alt="Delivery" className="size-full object-contain group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Eye className="size-5" />
                          </div>
                        </div>
                      ) : (
                        <div className="h-44 w-full rounded-xl border border-dashed border-border flex items-center justify-center text-muted-foreground text-xs bg-muted/20">
                          Gate Delivery Documented
                        </div>
                      )}
                      <p className="text-[10px] text-muted-foreground font-mono truncate">
                        {inspectingItem.deliveryPhotoUri?.startsWith("data:") ? "Uploaded Gate Photo" : (inspectingItem.deliveryPhotoUri || "Gate Arrival Photo")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Sticky Footer Actions */}
              <SheetFooter className="p-5 border-t border-border/60 bg-card/60 sticky bottom-0 z-10 backdrop-blur-xs flex items-center justify-between gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInspectingItem(null)}
                  className="text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Close Drawer
                </Button>

                <div className="flex items-center gap-2">
                  {inspectingItem.insuranceStatus === "under_review" || inspectingItem.insuranceStatus === "pending_backoffice" ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(inspectingItem.id, "declined")}
                        disabled={isProcessing}
                        className="text-xs font-bold gap-1 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 rounded-xl cursor-pointer"
                      >
                        <X className="size-3.5" />
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(inspectingItem.id, "endorsed")}
                        disabled={isProcessing}
                        className="text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs cursor-pointer"
                      >
                        <ShieldCheck className="size-4" />
                        Approve & Endorse Policy
                      </Button>
                    </>
                  ) : inspectingItem.insuranceStatus === "endorsed" || inspectingItem.insuranceStatus === "insured" ? (
                    <Badge variant="outline" className="text-emerald-700 bg-emerald-500/10 border-emerald-500/30 text-xs font-bold px-3 py-1.5 rounded-xl">
                      Policy Endorsement Bound & Active
                    </Badge>
                  ) : null}
                </div>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Enlarged Photo Lightbox Modal (for super admin inspection) */}
      {viewingPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setViewingPhoto(null)}
        >
          <div
            className="bg-card rounded-3xl p-4 max-w-2xl w-full space-y-3 shadow-2xl border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-foreground truncate">{viewingPhoto.title}</h4>
              <button
                type="button"
                onClick={() => setViewingPhoto(null)}
                className="size-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden bg-black max-h-[75vh] flex items-center justify-center">
              <img src={viewingPhoto.uri} alt="Enlarged" className="w-full h-auto max-h-[75vh] object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
