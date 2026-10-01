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
import { MOCK_EQUIPMENT_FLEET } from "@/data/safetyMockData"
import type { EquipmentFleetItem } from "@/types"
import {
  Truck,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Search,
} from "lucide-react"

export function FleetMachineryView({
  onOpenAddEquipment,
}: {
  onOpenAddEquipment: () => void
}) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const fleetList: EquipmentFleetItem[] = MOCK_EQUIPMENT_FLEET

  const filteredFleet = React.useMemo(() => {
    return fleetList.filter(
      (eq) =>
        eq.unitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.vinOrSerial.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [fleetList, searchQuery])

  const totalInsuredValue = fleetList.reduce((acc, curr) => acc + (curr.estimatedValue || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Truck className="size-6 text-primary" />
            Heavy Equipment & Machinery Fleet Schedule
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Contractor machinery inventory, serial numbers, inland marine insurance schedule & inspection dates
          </p>
        </div>
        <div className="flex items-center gap-2">
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Fleet Inventory</CardDescription>
            <CardTitle className="text-2xl font-bold">{fleetList.length} Units</CardTitle>
          </CardHeader>
          <CardFooter className="text-xs text-emerald-600 font-medium">
            100% active on commercial job sites
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Insured Fleet Value</CardDescription>
            <CardTitle className="text-2xl font-bold">
              ${totalInsuredValue.toLocaleString()} USD
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            Inland Marine & Contractor Equipment Endorsement
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pre-Shift Inspections Passed</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600">100% Passed</CardTitle>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            Daily pre-trip inspection logs verified
          </CardFooter>
        </Card>
      </div>

      {/* Fleet Search & Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
          <CardTitle className="text-base font-bold">Equipment Schedule</CardTitle>
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
                <th className="px-4 py-3 font-semibold">Insured Value</th>
                <th className="px-4 py-3 font-semibold">Last Inspection</th>
                <th className="px-4 py-3 font-semibold">Insurance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredFleet.map((eq) => {
                const isInsured = eq.insuranceStatus === "insured"

                return (
                  <tr key={eq.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-foreground font-mono bg-muted/60 px-2 py-0.5 rounded-md border border-border">
                        {eq.unitNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-foreground">
                        {eq.year} {eq.make} {eq.model}
                      </div>
                      <div className="text-[11px] text-muted-foreground">{eq.companyName}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant="outline" className="text-[10px]">
                        {eq.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px] text-muted-foreground">
                      {eq.vinOrSerial}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-foreground">
                      ${eq.estimatedValue.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {eq.lastInspectionDate || "Today (Pre-Shift)"}
                    </td>
                    <td className="px-4 py-3.5">
                      {isInsured ? (
                        <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 bg-emerald-500/10 text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="size-3" />
                          Insured & Endorsed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/10 text-[10px] flex items-center gap-1">
                          <AlertTriangle className="size-3" />
                          Pending Binder
                        </Badge>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
