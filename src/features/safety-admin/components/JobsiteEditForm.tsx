import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { JobSite } from "@/types"

interface Props {
  draft: JobSite
  isNew: boolean
  companies: string[]
  saving: boolean
  error: string
  onChange: (site: JobSite) => void
  onSave: () => void
  onCancel: () => void
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
      {children}
    </label>
  )
}

const selectCls =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-xs"

export function JobsiteEditForm({ draft, isNew, companies, saving, error, onChange, onSave, onCancel }: Props) {
  const set = (patch: Partial<JobSite>) => onChange({ ...draft, ...patch })
  const setHosp = (p: Partial<JobSite["emergencyHospital"]>) =>
    set({ emergencyHospital: { ...draft.emergencyHospital, ...p } })
  const setCare = (p: Partial<JobSite["urgentCare"]>) =>
    set({ urgentCare: { ...draft.urgentCare, ...p } })

  const companyOptions =
    draft.companyName && !companies.includes(draft.companyName)
      ? [draft.companyName, ...companies]
      : companies

  const inp = "h-9 text-xs"

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-5 text-xs">
      <h3 className="text-base font-bold text-foreground">
        {isNew ? "Add Jobsite" : "Edit Jobsite & Emergency Info"}
      </h3>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Company *">
          <select
            className={selectCls}
            value={draft.companyName || ""}
            onChange={(e) => set({ companyName: e.target.value })}
          >
            <option value="">Select company...</option>
            {companyOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select
            className={selectCls}
            value={draft.status}
            onChange={(e) => set({ status: e.target.value as JobSite["status"] })}
          >
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
        </Field>
        <Field label="Jobsite name *">
          <Input className={inp} value={draft.name} onChange={(e) => set({ name: e.target.value })} />
        </Field>
        <Field label="Job number *">
          <Input className={inp} value={draft.jobNumber} onChange={(e) => set({ jobNumber: e.target.value })} />
        </Field>
        <Field label="Trade">
          <Input className={inp} value={draft.trade} onChange={(e) => set({ trade: e.target.value })} />
        </Field>
      </section>

      <section className="space-y-3">
        <h4 className="font-bold text-foreground">Address for 911 dispatch</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Street address">
            <Input className={inp} value={draft.address} onChange={(e) => set({ address: e.target.value })} />
          </Field>
          <Field label="City, State ZIP">
            <Input className={inp} value={draft.cityStateZip} onChange={(e) => set({ cityStateZip: e.target.value })} />
          </Field>
        </div>
        <Field label="Access gate instructions">
          <Input
            className={inp}
            value={draft.accessGateInstructions || ""}
            onChange={(e) => set({ accessGateInstructions: e.target.value })}
          />
        </Field>
      </section>

      <section className="space-y-3">
        <h4 className="font-bold text-foreground">Contacts</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Superintendent">
            <Input className={inp} value={draft.superintendent} onChange={(e) => set({ superintendent: e.target.value })} />
          </Field>
          <Field label="Superintendent phone">
            <Input className={inp} value={draft.superPhone} onChange={(e) => set({ superPhone: e.target.value })} />
          </Field>
          <Field label="GC company">
            <Input className={inp} value={draft.gcCompany} onChange={(e) => set({ gcCompany: e.target.value })} />
          </Field>
          <Field label="GC safety contact">
            <Input className={inp} value={draft.gcContact} onChange={(e) => set({ gcContact: e.target.value })} />
          </Field>
          <Field label="GC phone">
            <Input className={inp} value={draft.gcPhone} onChange={(e) => set({ gcPhone: e.target.value })} />
          </Field>
          <Field label="GC email">
            <Input className={inp} value={draft.gcEmail} onChange={(e) => set({ gcEmail: e.target.value })} />
          </Field>
        </div>
      </section>

      <section className="space-y-3">
        <h4 className="font-bold text-foreground">Nearest trauma hospital</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Name">
            <Input className={inp} value={draft.emergencyHospital.name} onChange={(e) => setHosp({ name: e.target.value })} />
          </Field>
          <Field label="Phone">
            <Input className={inp} value={draft.emergencyHospital.phone} onChange={(e) => setHosp({ phone: e.target.value })} />
          </Field>
          <Field label="Address">
            <Input className={inp} value={draft.emergencyHospital.address} onChange={(e) => setHosp({ address: e.target.value })} />
          </Field>
          <Field label="Distance (miles)">
            <Input
              className={inp}
              type="number"
              step="0.1"
              value={draft.emergencyHospital.distanceMiles}
              onChange={(e) => setHosp({ distanceMiles: parseFloat(e.target.value) || 0 })}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-3">
        <h4 className="font-bold text-foreground">Occupational urgent care</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Name">
            <Input className={inp} value={draft.urgentCare.name} onChange={(e) => setCare({ name: e.target.value })} />
          </Field>
          <Field label="Phone">
            <Input className={inp} value={draft.urgentCare.phone} onChange={(e) => setCare({ phone: e.target.value })} />
          </Field>
          <Field label="Address">
            <Input className={inp} value={draft.urgentCare.address} onChange={(e) => setCare({ address: e.target.value })} />
          </Field>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Emergency muster point">
          <Input className={inp} value={draft.musterPoint} onChange={(e) => set({ musterPoint: e.target.value })} />
        </Field>
        <Field label="Utility emergency hotline">
          <Input className={inp} value={draft.utilityEmergency} onChange={(e) => set({ utilityEmergency: e.target.value })} />
        </Field>
      </section>

      {error && <p className="text-destructive font-semibold">{error}</p>}

      <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="button" size="sm" onClick={onSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  )
}