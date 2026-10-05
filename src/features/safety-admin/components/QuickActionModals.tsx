import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TRADES_LIST } from "@/data/safetyMockData"
import { Send, Plus, ShieldCheck, Truck } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

// 1. Dispatch Safety Notice Sheet
export function DispatchAlertModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { title: string; trade: string; priority: string; message: string }) => void
}) {
  const [title, setTitle] = React.useState("")
  const [trade, setTrade] = React.useState("All Trades (Company-Wide)")
  const [priority, setPriority] = React.useState("high")
  const [message, setMessage] = React.useState("")

  const handleSend = () => {
    if (!title || !message) {
      alert("Please enter title and message content.")
      return
    }
    onSubmit({ title, trade, priority, message })
    setTitle("")
    setMessage("")
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl flex flex-col p-0 overflow-hidden h-full">
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b shrink-0 text-left">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
              <Send className="size-5" />
            </div>
            <div>
              <SheetTitle className="text-base font-bold text-foreground">
                Dispatch Urgent Safety Alert
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                Broadcast directly to field foremen mobile apps
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Form Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 text-xs">
          <div className="space-y-1.5">
            <label className="text-foreground font-semibold block text-xs">
              Alert Title / Topic:
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mandatory Heat Illness & Hydration Stand-Down"
              className="text-xs h-10"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-foreground font-semibold block text-xs">
                Target Trade:
              </label>
              <select
                value={trade}
                onChange={(e) => setTrade(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="All Trades (Company-Wide)">All Trades (Company-Wide)</option>
                {TRADES_LIST.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-foreground font-semibold block text-xs">
                Urgency Priority:
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-xs font-semibold text-amber-600 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="normal">Normal Information</option>
                <option value="high">High Priority Action</option>
                <option value="critical">CRITICAL (Stand-Down)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-foreground font-semibold block text-xs">
              Instructions & Specific Action Items:
            </label>
            <textarea
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Detail required controls, PPE guidelines, or emergency protocols..."
              className="w-full rounded-md border border-input bg-background p-3.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground leading-relaxed"
            />
          </div>
        </div>

        {/* Footer (Pinned to bottom) */}
        <SheetFooter className="px-6 py-4 border-t bg-card shrink-0 flex flex-row items-center justify-end gap-3 mt-auto">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-10 px-5 text-xs font-medium cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSend}
            className="h-10 px-6 text-xs font-bold gap-2 bg-amber-600 hover:bg-amber-700 text-white cursor-pointer shadow-sm"
          >
            <Send className="size-4" />
            Dispatch Broadcast
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

// 2. Add New Contractor Sheet (Onboard Contractor Account)
export function AddCompanyModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean
  onClose: () => void
  onAdd: (company: {
    name: string
    trade: string
    routingEmail: string
    contactPerson: string
    contactPhone: string
  }) => void
}) {
  const [name, setName] = React.useState("")
  const [trade, setTrade] = React.useState(TRADES_LIST[0])
  const [routingEmail, setRoutingEmail] = React.useState("")
  const [contactPerson, setContactPerson] = React.useState("")
  const [contactPhone, setContactPhone] = React.useState("")

  const handleSave = () => {
    if (!name || !routingEmail) {
      alert("Please provide Company Name and Routing Email.")
      return
    }
    onAdd({
      name,
      trade,
      routingEmail,
      contactPerson: contactPerson || "Safety Officer",
      contactPhone: contactPhone || "(555) 000-0000",
    })
    setName("")
    setRoutingEmail("")
    setContactPerson("")
    setContactPhone("")
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl flex flex-col p-0 overflow-hidden h-full">
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b shrink-0 text-left">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Plus className="size-5" />
            </div>
            <div>
              <SheetTitle className="text-base font-bold text-foreground">
                Onboard Contractor Account
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                Setup multi-tenant safety portal entity
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Form Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 text-xs">
          <div className="space-y-1.5">
            <label className="text-foreground font-semibold block text-xs">
              Company Legal Entity Name:
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Apex Mechanical & Piping Inc"
              className="text-xs h-10"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-foreground font-semibold block text-xs">
              Primary Construction Trade:
            </label>
            <select
              value={trade}
              onChange={(e) => setTrade(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {TRADES_LIST.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-foreground font-semibold block text-xs">
              Safety Notification Routing Email:
            </label>
            <Input
              type="email"
              value={routingEmail}
              onChange={(e) => setRoutingEmail(e.target.value)}
              placeholder="safety@apexpiping.com"
              className="text-xs h-10"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-foreground font-semibold block text-xs">
                Safety Contact Person:
              </label>
              <Input
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="David Miller"
                className="text-xs h-10"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-foreground font-semibold block text-xs">
                Phone Number:
              </label>
              <Input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="(213) 555-0199"
                className="text-xs h-10"
              />
            </div>
          </div>
        </div>

        {/* Footer (Pinned to bottom) */}
        <SheetFooter className="px-6 py-4 border-t bg-card shrink-0 flex flex-row items-center justify-end gap-3 mt-auto">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-10 px-5 text-xs font-medium cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="h-10 px-6 text-xs font-bold gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm cursor-pointer"
          >
            <Plus className="size-4" />
            Onboard Contractor
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

// 3. Add Heavy Equipment Sheet
export function AddEquipmentModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean
  onClose: () => void
  onAdd: (eq: {
    unitNumber: string
    make: string
    model: string
    year: string
    type: string
    vinOrSerial: string
    estimatedValue: number
  }) => void
}) {
  const [unitNumber, setUnitNumber] = React.useState("")
  const [make, setMake] = React.useState("")
  const [model, setModel] = React.useState("")
  const [year, setYear] = React.useState("2025")
  const [type, setType] = React.useState("Rough Terrain Telehandler")
  const [vinOrSerial, setVinOrSerial] = React.useState("")
  const [estimatedValue, setEstimatedValue] = React.useState("120000")

  const handleSave = () => {
    if (!unitNumber || !make || !model) {
      alert("Please fill in Unit #, Make, and Model.")
      return
    }
    onAdd({
      unitNumber,
      make,
      model,
      year,
      type,
      vinOrSerial: vinOrSerial || `SN-${Math.floor(Math.random() * 900000 + 100000)}`,
      estimatedValue: parseFloat(estimatedValue) || 100000,
    })
    setUnitNumber("")
    setMake("")
    setModel("")
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl flex flex-col p-0 overflow-hidden h-full">
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b shrink-0 text-left">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Truck className="size-5" />
            </div>
            <div>
              <SheetTitle className="text-base font-bold text-foreground">
                Register Fleet Equipment
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                Add machinery to insurance schedule
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Form Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-foreground font-semibold block text-xs">
                Unit Number #:
              </label>
              <Input
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                placeholder="e.g. CRANE-02"
                className="text-xs h-10"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-foreground font-semibold block text-xs">
                Model Year:
              </label>
              <Input
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2025"
                className="text-xs h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-foreground font-semibold block text-xs">
                Manufacturer / Make:
              </label>
              <Input
                value={make}
                onChange={(e) => setMake(e.target.value)}
                placeholder="e.g. Caterpillar"
                className="text-xs h-10"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-foreground font-semibold block text-xs">
                Model Description:
              </label>
              <Input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. 336 Excavator"
                className="text-xs h-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-foreground font-semibold block text-xs">
              Machinery Category:
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="Rough Terrain Telehandler">Rough Terrain Telehandler</option>
              <option value="Concrete Line Pump">Concrete Line Pump</option>
              <option value="Hydrostatic Power Trowel">Hydrostatic Power Trowel</option>
              <option value="Commercial Service Truck">Commercial Service Truck</option>
              <option value="Aerial Boom / Scissor Lift">Aerial Boom / Scissor Lift</option>
              <option value="Hydraulic Excavator">Hydraulic Excavator</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-foreground font-semibold block text-xs">
                VIN / Serial #:
              </label>
              <Input
                value={vinOrSerial}
                onChange={(e) => setVinOrSerial(e.target.value)}
                placeholder="e.g. CAT0336X88902"
                className="text-xs h-10"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-foreground font-semibold block text-xs">
                Insured Value ($ USD):
              </label>
              <Input
                type="number"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                placeholder="150000"
                className="text-xs h-10"
              />
            </div>
          </div>
        </div>

        {/* Footer (Pinned to bottom) */}
        <SheetFooter className="px-6 py-4 border-t bg-card shrink-0 flex flex-row items-center justify-end gap-3 mt-auto">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-10 px-5 text-xs font-medium cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="h-10 px-6 text-xs font-bold gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm cursor-pointer"
          >
            <Plus className="size-4" />
            Save Equipment
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

// 4. Issue COI Request Sheet
export function IssueCoiModal({
  isOpen,
  onClose,
  onIssue,
}: {
  isOpen: boolean
  onClose: () => void
  onIssue: (coi: { holder: string; email: string; project: string; limits: string }) => void
}) {
  const [holder, setHolder] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [project, setProject] = React.useState("Apex Tower Phase 2 - Downtown High-Rise")
  const [limits, setLimits] = React.useState("GL $2M / Auto $1M / WC $1M / Umbrella $10M")

  const handleIssue = () => {
    if (!holder || !email) {
      alert("Please specify Certificate Holder Name and Recipient Email.")
      return
    }
    onIssue({ holder, email, project, limits })
    setHolder("")
    setEmail("")
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl flex flex-col p-0 overflow-hidden h-full">
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b shrink-0 text-left">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <SheetTitle className="text-base font-bold text-foreground">
                Issue Certificate of Insurance (COI)
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                Automated ACORD 25 Certificate Generation
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Form Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 text-xs">
          <div className="space-y-1.5">
            <label className="text-foreground font-semibold block text-xs">
              Certificate Holder (GC / Owner):
            </label>
            <Input
              value={holder}
              onChange={(e) => setHolder(e.target.value)}
              placeholder="e.g. Turner Construction Company & City of LA"
              className="text-xs h-10"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-foreground font-semibold block text-xs">
              Holder Delivery Email:
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="certificates@turnerconstruction.com"
              className="text-xs h-10"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-foreground font-semibold block text-xs">
              Associated Project / Jobsite:
            </label>
            <Input
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="text-xs h-10"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-foreground font-semibold block text-xs">
              Endorsed Policy Limits:
            </label>
            <Input
              value={limits}
              onChange={(e) => setLimits(e.target.value)}
              className="text-xs h-10"
            />
          </div>
        </div>

        {/* Footer (Pinned to bottom) */}
        <SheetFooter className="px-6 py-4 border-t bg-card shrink-0 flex flex-row items-center justify-end gap-3 mt-auto">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-10 px-5 text-xs font-medium cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleIssue}
            className="h-10 px-6 text-xs font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm"
          >
            <ShieldCheck className="size-4" />
            Generate & Dispatch COI
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

