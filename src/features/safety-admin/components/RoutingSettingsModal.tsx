import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Building,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { ClientCompany, CompanyRoutingConfig } from "@/types"
import { MOCK_COMPANY_ROUTING_CONFIGS } from "@/data/safetyMockData"

interface RoutingSettingsModalProps {
  company: ClientCompany | null
  isOpen: boolean
  onClose: () => void
  onSave: (config: CompanyRoutingConfig) => void
}

export function RoutingSettingsModal({
  company,
  isOpen,
  onClose,
  onSave,
}: RoutingSettingsModalProps) {
  const [configs, setConfigs] = React.useState<CompanyRoutingConfig>({
    companyId: company?.id || "comp-01",
    claimAlertEmail: "claims@titanconcrete-ca.com",
    claimAlertPhone: "+1 (213) 555-0142",
    checklistSubmissionsEmail: "inspections@titanconcrete-ca.com",
    toolboxRosterEmail: "training@titanconcrete-ca.com",
    nearMissHazardEmail: "safety-alerts@titanconcrete-ca.com",
    coiNotificationEmail: "coi@titanconcrete-ca.com",
    autoCcBroker: true,
  })

  React.useEffect(() => {
    if (company && MOCK_COMPANY_ROUTING_CONFIGS[company.id]) {
      setConfigs(MOCK_COMPANY_ROUTING_CONFIGS[company.id])
    } else if (company) {
      setConfigs({
        companyId: company.id,
        claimAlertEmail: company.routingEmail,
        claimAlertPhone: company.contactPhone,
        checklistSubmissionsEmail: company.routingEmail,
        toolboxRosterEmail: company.routingEmail,
        nearMissHazardEmail: company.routingEmail,
        coiNotificationEmail: company.routingEmail,
        autoCcBroker: true,
      })
    }
  }, [company])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(configs)
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl flex flex-col p-0 overflow-hidden h-full">
        <form onSubmit={handleSubmit} className="flex flex-col h-full justify-between overflow-hidden">
          {/* Header */}
          <SheetHeader className="px-6 py-5 border-b shrink-0 text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <SheetTitle className="text-base font-bold text-foreground">
                Configure Routing Destinations
              </SheetTitle>
              {company && (
                <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 text-[11px]">
                  {company.name}
                </Badge>
              )}
            </div>
            <SheetDescription className="text-xs text-muted-foreground mt-1">
              Section 7 Requirement: Define where field submissions, emergency SMS alerts, and ACORD requests route for this company.
            </SheetDescription>
          </SheetHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 text-xs">
            {/* Claim Emergency Alert */}
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <AlertTriangle className="size-4 text-amber-500" />
                  First Report of Injury & Claim SMS Alerts
                </span>
                <Badge variant="outline" className="text-[10px] text-amber-600 bg-amber-500/10 border-amber-500/30">
                  Immediate
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground font-medium">Emergency SMS Phone</label>
                  <Input
                    type="text"
                    required
                    value={configs.claimAlertPhone}
                    onChange={(e) => setConfigs({ ...configs, claimAlertPhone: e.target.value })}
                    placeholder="+1 (213) 555-0142"
                    className="h-9 text-xs bg-background"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground font-medium">Claim Inbox Email</label>
                  <Input
                    type="email"
                    required
                    value={configs.claimAlertEmail}
                    onChange={(e) => setConfigs({ ...configs, claimAlertEmail: e.target.value })}
                    placeholder="claims@contractor.com"
                    className="h-9 text-xs bg-background"
                  />
                </div>
              </div>
            </div>

            {/* Routine Submissions */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-primary" />
                Daily Audits & Signed Rosters
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground font-medium">Daily Checklists Email</label>
                  <Input
                    type="email"
                    required
                    value={configs.checklistSubmissionsEmail}
                    onChange={(e) => setConfigs({ ...configs, checklistSubmissionsEmail: e.target.value })}
                    placeholder="inspections@contractor.com"
                    className="h-9 text-xs bg-background"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground font-medium">Toolbox Rosters Email</label>
                  <Input
                    type="email"
                    required
                    value={configs.toolboxRosterEmail}
                    onChange={(e) => setConfigs({ ...configs, toolboxRosterEmail: e.target.value })}
                    placeholder="training@contractor.com"
                    className="h-9 text-xs bg-background"
                  />
                </div>
              </div>
            </div>

            {/* COI Insurance Renewals */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Building className="size-4 text-blue-500" />
                COI Requests & Certificate Dispatch
              </span>
              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground font-medium">Insurance Accounting Email</label>
                <Input
                  type="email"
                  required
                  value={configs.coiNotificationEmail}
                  onChange={(e) => setConfigs({ ...configs, coiNotificationEmail: e.target.value })}
                  placeholder="coi@contractor.com"
                  className="h-9 text-xs bg-background"
                />
              </div>
            </div>

            {/* Auto-CC Broker */}
            <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-foreground flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-semibold text-xs">Auto-CC Reliable Risk Management (Broker)</div>
                <div className="text-[11px] text-muted-foreground">
                  Copies broker underwriter & loss-control on claims & audits
                </div>
              </div>
              <input
                type="checkbox"
                checked={configs.autoCcBroker}
                onChange={(e) => setConfigs({ ...configs, autoCcBroker: e.target.checked })}
                className="size-4 accent-primary rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Footer (Pinned) */}
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
              type="submit"
              className="h-10 px-6 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-sm cursor-pointer"
            >
              Save Routing Destinations
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
