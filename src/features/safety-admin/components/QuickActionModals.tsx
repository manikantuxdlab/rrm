import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TRADES_LIST } from "@/data/safetyMockData"
import { X, Send, Plus, ShieldCheck, Truck } from "lucide-react"

// 1. Dispatch Safety Notice Modal
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

  if (!isOpen) return null

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <Send className="size-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Dispatch Urgent Safety Alert</h3>
              <p className="text-xs text-muted-foreground">Broadcast directly to field foremen mobile apps</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted cursor-pointer">
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="text-muted-foreground font-semibold block mb-1">Alert Title / Topic:</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mandatory Heat Illness & Hydration Stand-Down"
              className="text-xs h-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-muted-foreground font-semibold block mb-1">Target Trade:</label>
              <select
                value={trade}
                onChange={(e) => setTrade(e.target.value)}
                className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs"
              >
                <option value="All Trades (Company-Wide)">All Trades (Company-Wide)</option>
                {TRADES_LIST.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-muted-foreground font-semibold block mb-1">Urgency Priority:</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs font-semibold text-amber-600"
              >
                <option value="normal">Normal Information</option>
                <option value="high">High Priority Action</option>
                <option value="critical">CRITICAL (Immediate Stand-Down)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-muted-foreground font-semibold block mb-1">Instructions & Specific Action Items:</label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Detail required controls, PPE guidelines, or emergency protocols..."
              className="w-full rounded-xl border border-input bg-background p-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-3">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button size="sm" onClick={handleSend} className="text-xs font-bold gap-1.5 bg-amber-600 hover:bg-amber-700 text-white">
            <Send className="size-3.5" />
            Dispatch Broadcast
          </Button>
        </div>
      </div>
    </div>
  )
}

// 2. Add New Contractor Modal
export function AddCompanyModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean
  onClose: () => void
  onAdd: (company: { name: string; trade: string; routingEmail: string; contactPerson: string; contactPhone: string }) => void
}) {
  const [name, setName] = React.useState("")
  const [trade, setTrade] = React.useState(TRADES_LIST[0])
  const [routingEmail, setRoutingEmail] = React.useState("")
  const [contactPerson, setContactPerson] = React.useState("")
  const [contactPhone, setContactPhone] = React.useState("")

  if (!isOpen) return null

  const handleSave = () => {
    if (!name || !routingEmail) {
      alert("Please provide Company Name and Routing Email.")
      return
    }
    onAdd({ name, trade, routingEmail, contactPerson: contactPerson || "Safety Officer", contactPhone: contactPhone || "(555) 000-0000" })
    setName("")
    setRoutingEmail("")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Plus className="size-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Onboard Contractor Account</h3>
              <p className="text-xs text-muted-foreground">Setup multi-tenant safety portal</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted cursor-pointer">
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="text-muted-foreground font-semibold block mb-1">Company Legal Entity Name:</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Apex Mechanical & Piping Inc"
              className="text-xs h-9"
            />
          </div>

          <div>
            <label className="text-muted-foreground font-semibold block mb-1">Primary Construction Trade:</label>
            <select
              value={trade}
              onChange={(e) => setTrade(e.target.value)}
              className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs"
            >
              {TRADES_LIST.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-muted-foreground font-semibold block mb-1">Safety Notification Routing Email:</label>
            <Input
              type="email"
              value={routingEmail}
              onChange={(e) => setRoutingEmail(e.target.value)}
              placeholder="safety@apexpiping.com"
              className="text-xs h-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-muted-foreground font-semibold block mb-1">Safety Contact Person:</label>
              <Input
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="David Miller"
                className="text-xs h-9"
              />
            </div>
            <div>
              <label className="text-muted-foreground font-semibold block mb-1">Phone Number:</label>
              <Input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="(213) 555-0199"
                className="text-xs h-9"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-3">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} className="text-xs font-bold gap-1">
            <Plus className="size-3.5" />
            Create Account & Load 26 Topics
          </Button>
        </div>
      </div>
    </div>
  )
}

// 3. Add Heavy Equipment Modal
export function AddEquipmentModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean
  onClose: () => void
  onAdd: (eq: { unitNumber: string; make: string; model: string; year: string; type: string; vinOrSerial: string; estimatedValue: number }) => void
}) {
  const [unitNumber, setUnitNumber] = React.useState("")
  const [make, setMake] = React.useState("")
  const [model, setModel] = React.useState("")
  const [year, setYear] = React.useState("2024")
  const [type, setType] = React.useState("Rough Terrain Telehandler")
  const [vinOrSerial, setVinOrSerial] = React.useState("")
  const [estimatedValue, setEstimatedValue] = React.useState("120000")

  if (!isOpen) return null

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Truck className="size-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Register Fleet Equipment</h3>
              <p className="text-xs text-muted-foreground">Add machinery to insurance schedule</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted cursor-pointer">
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-muted-foreground font-semibold block mb-1">Unit Number #:</label>
              <Input
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                placeholder="e.g. CRANE-02"
                className="text-xs h-9"
              />
            </div>
            <div>
              <label className="text-muted-foreground font-semibold block mb-1">Model Year:</label>
              <Input
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2025"
                className="text-xs h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-muted-foreground font-semibold block mb-1">Manufacturer / Make:</label>
              <Input
                value={make}
                onChange={(e) => setMake(e.target.value)}
                placeholder="e.g. Caterpillar"
                className="text-xs h-9"
              />
            </div>
            <div>
              <label className="text-muted-foreground font-semibold block mb-1">Model Description:</label>
              <Input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. 336 Excavator"
                className="text-xs h-9"
              />
            </div>
          </div>

          <div>
            <label className="text-muted-foreground font-semibold block mb-1">Machinery Category:</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs"
            >
              <option value="Rough Terrain Telehandler">Rough Terrain Telehandler</option>
              <option value="Concrete Line Pump">Concrete Line Pump</option>
              <option value="Hydrostatic Power Trowel">Hydrostatic Power Trowel</option>
              <option value="Commercial Service Truck">Commercial Service Truck</option>
              <option value="Aerial Boom / Scissor Lift">Aerial Boom / Scissor Lift</option>
              <option value="Hydraulic Excavator">Hydraulic Excavator</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-muted-foreground font-semibold block mb-1">VIN / Serial #:</label>
              <Input
                value={vinOrSerial}
                onChange={(e) => setVinOrSerial(e.target.value)}
                placeholder="e.g. CAT0336X88902"
                className="text-xs h-9"
              />
            </div>
            <div>
              <label className="text-muted-foreground font-semibold block mb-1">Insured Value ($ USD):</label>
              <Input
                type="number"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                placeholder="150000"
                className="text-xs h-9"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-3">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} className="text-xs font-bold gap-1">
            <Plus className="size-3.5" />
            Save Equipment
          </Button>
        </div>
      </div>
    </div>
  )
}

// 4. Issue COI Request Modal
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

  if (!isOpen) return null

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Issue Certificate of Insurance (COI)</h3>
              <p className="text-xs text-muted-foreground">Automated ACORD 25 Certificate Generation</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted cursor-pointer">
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="text-muted-foreground font-semibold block mb-1">Certificate Holder (GC / Owner):</label>
            <Input
              value={holder}
              onChange={(e) => setHolder(e.target.value)}
              placeholder="e.g. Turner Construction Company & City of LA"
              className="text-xs h-9"
            />
          </div>

          <div>
            <label className="text-muted-foreground font-semibold block mb-1">Holder Delivery Email:</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="certificates@turnerconstruction.com"
              className="text-xs h-9"
            />
          </div>

          <div>
            <label className="text-muted-foreground font-semibold block mb-1">Associated Project / Jobsite:</label>
            <Input
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="text-xs h-9"
            />
          </div>

          <div>
            <label className="text-muted-foreground font-semibold block mb-1">Endorsed Policy Limits:</label>
            <Input
              value={limits}
              onChange={(e) => setLimits(e.target.value)}
              className="text-xs h-9"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-3">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button size="sm" onClick={handleIssue} className="text-xs font-bold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white">
            <ShieldCheck className="size-3.5" />
            Generate & Dispatch COI
          </Button>
        </div>
      </div>
    </div>
  )
}
