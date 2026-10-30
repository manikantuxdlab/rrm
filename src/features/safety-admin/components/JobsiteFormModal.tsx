import * as React from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Building2,
  HardHat,
  MapPin,
  Hospital,
  Loader2,
  ShieldCheck,
} from "lucide-react"
import type { JobSite } from "@/types"

interface Props {
  open: boolean
  isNew: boolean
  initialData?: JobSite | null
  companies: string[]
  saving: boolean
  onClose: () => void
  onSave: (site: JobSite) => Promise<boolean>
}

function SectionHeading({ title, icon: Icon }: { title: string; icon: any }) {
  return (
    <div className="flex items-center gap-1.5 pb-1 border-b border-border/60 text-xs font-semibold text-foreground">
      <Icon className="size-3.5 text-primary" />
      <span>{title}</span>
    </div>
  )
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-0.5">
        <span>{label}</span>
        {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  )
}

export function JobsiteFormModal({
  open,
  isNew,
  initialData,
  companies,
  saving,
  onClose,
  onSave,
}: Props) {
  const [name, setName] = React.useState("")
  const [jobNumber, setJobNumber] = React.useState("")
  const [companyName, setCompanyName] = React.useState("")
  const [isCustomCompany, setIsCustomCompany] = React.useState(false)
  const [customCompanyName, setCustomCompanyName] = React.useState("")
  const [status, setStatus] = React.useState<JobSite["status"]>("active")
  const [trade, setTrade] = React.useState("")
  const [activeCrewCount, setActiveCrewCount] = React.useState(0)

  // Address
  const [address, setAddress] = React.useState("")
  const [cityStateZip, setCityStateZip] = React.useState("")
  const [accessGateInstructions, setAccessGateInstructions] = React.useState("")

  // Site Contacts
  const [superintendent, setSuperintendent] = React.useState("")
  const [superPhone, setSuperPhone] = React.useState("")
  const [gcCompany, setGcCompany] = React.useState("")
  const [gcContact, setGcContact] = React.useState("")
  const [gcPhone, setGcPhone] = React.useState("")
  const [gcEmail, setGcEmail] = React.useState("")

  // Emergency Plan
  const [emergencyHospitalName, setEmergencyHospitalName] = React.useState("")
  const [emergencyHospitalAddress, setEmergencyHospitalAddress] = React.useState("")
  const [emergencyHospitalPhone, setEmergencyHospitalPhone] = React.useState("")
  const [emergencyHospitalDistance, setEmergencyHospitalDistance] = React.useState(0)

  const [urgentCareName, setUrgentCareName] = React.useState("")
  const [urgentCareAddress, setUrgentCareAddress] = React.useState("")
  const [urgentCarePhone, setUrgentCarePhone] = React.useState("")

  const [musterPoint, setMusterPoint] = React.useState("")
  const [utilityEmergency, setUtilityEmergency] = React.useState("")

  const [errorMsg, setErrorMsg] = React.useState("")

  // Populate state on open or initialData change
  React.useEffect(() => {
    if (!open) return
    setErrorMsg("")
    if (initialData && !isNew) {
      setName(initialData.name || "")
      setJobNumber(initialData.jobNumber || "")
      const comp = initialData.companyName || ""
      setCompanyName(comp)
      if (comp && !companies.includes(comp)) {
        setIsCustomCompany(true)
        setCustomCompanyName(comp)
      } else {
        setIsCustomCompany(false)
        setCustomCompanyName("")
      }
      setStatus(initialData.status || "active")
      setTrade(initialData.trade || "")
      setActiveCrewCount(initialData.activeCrewCount || 0)
      setAddress(initialData.address || "")
      setCityStateZip(initialData.cityStateZip || "")
      setAccessGateInstructions(initialData.accessGateInstructions || "")
      setSuperintendent(initialData.superintendent || "")
      setSuperPhone(initialData.superPhone || "")
      setGcCompany(initialData.gcCompany || "")
      setGcContact(initialData.gcContact || "")
      setGcPhone(initialData.gcPhone || "")
      setGcEmail(initialData.gcEmail || "")
      setEmergencyHospitalName(initialData.emergencyHospital?.name || "")
      setEmergencyHospitalAddress(initialData.emergencyHospital?.address || "")
      setEmergencyHospitalPhone(initialData.emergencyHospital?.phone || "")
      setEmergencyHospitalDistance(initialData.emergencyHospital?.distanceMiles || 0)
      setUrgentCareName(initialData.urgentCare?.name || "")
      setUrgentCareAddress(initialData.urgentCare?.address || "")
      setUrgentCarePhone(initialData.urgentCare?.phone || "")
      setMusterPoint(initialData.musterPoint || "")
      setUtilityEmergency(initialData.utilityEmergency || "")
    } else {
      // Default new
      setName("")
      setJobNumber(`TST-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`)
      setCompanyName(companies[0] || "")
      setIsCustomCompany(false)
      setCustomCompanyName("")
      setStatus("active")
      setTrade("")
      setActiveCrewCount(0)
      setAddress("")
      setCityStateZip("")
      setAccessGateInstructions("")
      setSuperintendent("")
      setSuperPhone("")
      setGcCompany("")
      setGcContact("")
      setGcPhone("")
      setGcEmail("")
      setEmergencyHospitalName("")
      setEmergencyHospitalAddress("")
      setEmergencyHospitalPhone("")
      setEmergencyHospitalDistance(0)
      setUrgentCareName("")
      setUrgentCareAddress("")
      setUrgentCarePhone("")
      setMusterPoint("")
      setUtilityEmergency("")
    }
  }, [open, isNew, initialData, companies])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const selectedCompany = isCustomCompany ? customCompanyName.trim() : companyName.trim()

    if (!name.trim()) {
      setErrorMsg("Jobsite Name is required.")
      return
    }
    if (!jobNumber.trim()) {
      setErrorMsg("Job Number is required.")
      return
    }
    if (!selectedCompany) {
      setErrorMsg("Please select or specify a Company.")
      return
    }

    const payload: JobSite = {
      id: initialData?.id || `job-${Date.now()}`,
      name: name.trim(),
      jobNumber: jobNumber.trim(),
      companyName: selectedCompany,
      status,
      trade: trade.trim(),
      activeCrewCount: Number(activeCrewCount) || 0,
      address: address.trim(),
      cityStateZip: cityStateZip.trim(),
      accessGateInstructions: accessGateInstructions.trim(),
      superintendent: superintendent.trim(),
      superPhone: superPhone.trim(),
      gcCompany: gcCompany.trim(),
      gcContact: gcContact.trim(),
      gcPhone: gcPhone.trim(),
      gcEmail: gcEmail.trim(),
      emergencyHospital: {
        name: emergencyHospitalName.trim(),
        address: emergencyHospitalAddress.trim(),
        phone: emergencyHospitalPhone.trim(),
        distanceMiles: Number(emergencyHospitalDistance) || 0,
      },
      urgentCare: {
        name: urgentCareName.trim(),
        address: urgentCareAddress.trim(),
        phone: urgentCarePhone.trim(),
      },
      musterPoint: musterPoint.trim(),
      utilityEmergency: utilityEmergency.trim(),
    }

    const success = await onSave(payload)
    if (success) {
      onClose()
    }
  }

  const selectCls =
    "h-8.5 w-full rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-primary"
  const inputCls = "h-8.5 text-xs bg-background"

  return (
    <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col h-full bg-card">
        <SheetHeader className="p-5 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Building2 className="size-5" />
            </div>
            <div>
              <SheetTitle className="text-base font-bold text-foreground">
                {isNew ? "Add New Jobsite" : "Edit Jobsite Details"}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                Configure jobsite profile, assigned contractor company, site leadership, and emergency action plans.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 space-y-5 text-xs overflow-y-auto flex-1">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                {errorMsg}
              </div>
            )}

            {/* 1. Basic Site Info & Company Assignment */}
            <div className="space-y-3">
              <SectionHeading title="1. Project Profile & Company Assignment" icon={Building2} />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Assigned Company" required>
                  {!isCustomCompany ? (
                    <div className="space-y-1.5">
                      <select
                        className={selectCls}
                        value={companyName}
                        onChange={(e) => {
                          if (e.target.value === "__custom__") {
                            setIsCustomCompany(true)
                            setCustomCompanyName("")
                          } else {
                            setCompanyName(e.target.value)
                          }
                        }}
                      >
                        <option value="">Select Company...</option>
                        {companies.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                        <option value="__custom__">+ Enter Custom Company...</option>
                      </select>
                    </div>
                  ) : (
                    <div className="flex gap-1.5 items-center">
                      <Input
                        className={inputCls}
                        placeholder="Enter company name..."
                        value={customCompanyName}
                        onChange={(e) => setCustomCompanyName(e.target.value)}
                        autoFocus
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsCustomCompany(false)
                          setCompanyName(companies[0] || "")
                        }}
                        className="h-8.5 text-[11px] px-2 text-muted-foreground hover:text-foreground shrink-0"
                      >
                        Choose Existing
                      </Button>
                    </div>
                  )}
                </FormField>

                <FormField label="Status">
                  <select
                    className={selectCls}
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                  </select>
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <FormField label="Jobsite Name" required>
                    <Input
                      className={inputCls}
                      placeholder="e.g. Test Site Alpha - Downtown Tower"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </FormField>
                </div>
                <FormField label="Job Number" required>
                  <Input
                    className={inputCls}
                    placeholder="e.g. TST-2026-001"
                    value={jobNumber}
                    onChange={(e) => setJobNumber(e.target.value)}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Trade / Scope">
                  <Input
                    className={inputCls}
                    placeholder="e.g. Concrete & Masonry, Framing"
                    value={trade}
                    onChange={(e) => setTrade(e.target.value)}
                  />
                </FormField>
                <FormField label="Active Crew Count">
                  <Input
                    type="number"
                    min="0"
                    className={inputCls}
                    placeholder="0"
                    value={activeCrewCount}
                    onChange={(e) => setActiveCrewCount(Number(e.target.value) || 0)}
                  />
                </FormField>
              </div>
            </div>

            {/* 2. Physical Location / Address */}
            <div className="space-y-3">
              <SectionHeading title="2. Physical Location (911 Dispatch)" icon={MapPin} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Street Address">
                  <Input
                    className={inputCls}
                    placeholder="450 South Grand Ave"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </FormField>
                <FormField label="City, State ZIP">
                  <Input
                    className={inputCls}
                    placeholder="Los Angeles, CA 90071"
                    value={cityStateZip}
                    onChange={(e) => setCityStateZip(e.target.value)}
                  />
                </FormField>
              </div>
              <FormField label="Access Gate Instructions">
                <Input
                  className={inputCls}
                  placeholder="Gate 3 on Grand Ave (Opposite Construction Trailer)"
                  value={accessGateInstructions}
                  onChange={(e) => setAccessGateInstructions(e.target.value)}
                />
              </FormField>
            </div>

            {/* 3. Leadership & GC Contacts */}
            <div className="space-y-3">
              <SectionHeading title="3. Site Leadership & General Contractor Contacts" icon={HardHat} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Site Superintendent">
                  <Input
                    className={inputCls}
                    placeholder="John Miller"
                    value={superintendent}
                    onChange={(e) => setSuperintendent(e.target.value)}
                  />
                </FormField>
                <FormField label="Superintendent Phone">
                  <Input
                    className={inputCls}
                    placeholder="(213) 555-0101"
                    value={superPhone}
                    onChange={(e) => setSuperPhone(e.target.value)}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="General Contractor (GC) Company">
                  <Input
                    className={inputCls}
                    placeholder="Test GC Builders"
                    value={gcCompany}
                    onChange={(e) => setGcCompany(e.target.value)}
                  />
                </FormField>
                <FormField label="GC Safety Director / Lead">
                  <Input
                    className={inputCls}
                    placeholder="Dave Kettler"
                    value={gcContact}
                    onChange={(e) => setGcContact(e.target.value)}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="GC Phone">
                  <Input
                    className={inputCls}
                    placeholder="(213) 555-0199"
                    value={gcPhone}
                    onChange={(e) => setGcPhone(e.target.value)}
                  />
                </FormField>
                <FormField label="GC Email">
                  <Input
                    className={inputCls}
                    placeholder="safety@gcbuilders.com"
                    value={gcEmail}
                    onChange={(e) => setGcEmail(e.target.value)}
                  />
                </FormField>
              </div>
            </div>

            {/* 4. Emergency Action Plan */}
            <div className="space-y-3">
              <SectionHeading title="4. Emergency Action Plan & Trauma Center" icon={Hospital} />

              <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/5 space-y-2.5">
                <div className="text-[11px] font-semibold text-destructive flex items-center gap-1.5">
                  <Hospital className="size-3.5" />
                  <span>Level-1 Trauma Center (Designated ER Route)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <FormField label="Hospital Name">
                    <Input
                      className={inputCls}
                      placeholder="Good Samaritan Hospital - Level 1 Trauma"
                      value={emergencyHospitalName}
                      onChange={(e) => setEmergencyHospitalName(e.target.value)}
                    />
                  </FormField>
                  <FormField label="Emergency Desk Phone">
                    <Input
                      className={inputCls}
                      placeholder="(213) 977-2121"
                      value={emergencyHospitalPhone}
                      onChange={(e) => setEmergencyHospitalPhone(e.target.value)}
                    />
                  </FormField>
                  <FormField label="Hospital Address">
                    <Input
                      className={inputCls}
                      placeholder="1225 Wilshire Blvd, Los Angeles, CA 90017"
                      value={emergencyHospitalAddress}
                      onChange={(e) => setEmergencyHospitalAddress(e.target.value)}
                    />
                  </FormField>
                  <FormField label="Distance (Miles)">
                    <Input
                      type="number"
                      step="0.1"
                      className={inputCls}
                      placeholder="1.2"
                      value={emergencyHospitalDistance}
                      onChange={(e) => setEmergencyHospitalDistance(Number(e.target.value) || 0)}
                    />
                  </FormField>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-border bg-card space-y-2.5">
                <div className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                  <Hospital className="size-3.5 text-primary" />
                  <span>Non-Emergency Occupational Urgent Care</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <FormField label="Clinic Name">
                    <Input
                      className={inputCls}
                      placeholder="Downtown Urgent Care"
                      value={urgentCareName}
                      onChange={(e) => setUrgentCareName(e.target.value)}
                    />
                  </FormField>
                  <FormField label="Address">
                    <Input
                      className={inputCls}
                      placeholder="835 S Flower St, Los Angeles, CA"
                      value={urgentCareAddress}
                      onChange={(e) => setUrgentCareAddress(e.target.value)}
                    />
                  </FormField>
                  <FormField label="Phone">
                    <Input
                      className={inputCls}
                      placeholder="(213) 623-2825"
                      value={urgentCarePhone}
                      onChange={(e) => setUrgentCarePhone(e.target.value)}
                    />
                  </FormField>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Emergency Muster Station">
                  <Input
                    className={inputCls}
                    placeholder="East Parking Lot B (Assembly Post)"
                    value={musterPoint}
                    onChange={(e) => setMusterPoint(e.target.value)}
                  />
                </FormField>
                <FormField label="811 Utility & DigAlert Hotline">
                  <Input
                    className={inputCls}
                    placeholder="1-800-DIAL-DWP / 811"
                    value={utilityEmergency}
                    onChange={(e) => setUtilityEmergency(e.target.value)}
                  />
                </FormField>
              </div>
            </div>
          </div>

          <SheetFooter className="p-4 border-t border-border/60 bg-muted/20 flex flex-row items-center justify-end gap-2 mt-auto">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={saving} className="text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={saving}
              className="text-xs font-semibold gap-1.5 bg-primary text-primary-foreground shadow-xs"
            >
              {saving ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Saving Jobsite...
                </>
              ) : (
                <>
                  <ShieldCheck className="size-3.5" />
                  {isNew ? "Create Jobsite" : "Save Changes"}
                </>
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
