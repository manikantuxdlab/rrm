import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Send,
  Building,
  ShieldCheck,
  X,
  AlertTriangle,
  FileCheck,
} from "lucide-react"
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

  if (!isOpen || !company) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(configs)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-xl bg-card border-border shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-4">
          <div>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Send className="size-5 text-primary" />
              Notification Recipients & Routing Destinations
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Configure where field mobile submissions & emergency alerts are routed for <strong className="text-foreground">{company.name}</strong>
            </CardDescription>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-4 text-xs max-h-[70vh] overflow-y-auto pr-1">
            {/* Claims & Urgent Injury Routing */}
            <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="size-3.5" />
                  First Report of Injury & Claim Alerts (Urgent)
                </span>
                <Badge variant="outline" className="text-[10px] border-red-500/30 text-red-600">
                  Direct SMS + Email
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">Emergency Claim Email</label>
                  <Input
                    type="email"
                    required
                    value={configs.claimAlertEmail}
                    onChange={(e) => setConfigs({ ...configs, claimAlertEmail: e.target.value })}
                    className="h-8 text-xs bg-background"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">Immediate SMS Text Alert Phone</label>
                  <Input
                    required
                    value={configs.claimAlertPhone}
                    onChange={(e) => setConfigs({ ...configs, claimAlertPhone: e.target.value })}
                    className="h-8 text-xs bg-background"
                  />
                </div>
              </div>
            </div>

            {/* Daily Checklists & Inspections */}
            <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-2">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <FileCheck className="size-3.5 text-primary" />
                Daily Safety Audits & Inspections Destination
              </span>
              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground">Checklists Notification Email(s)</label>
                <Input
                  type="email"
                  required
                  value={configs.checklistSubmissionsEmail}
                  onChange={(e) => setConfigs({ ...configs, checklistSubmissionsEmail: e.target.value })}
                  className="h-8 text-xs bg-background"
                />
              </div>
            </div>

            {/* Toolbox Talks Rosters */}
            <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-2">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-emerald-600" />
                Toolbox Safety Talks & Signed Crew Rosters
              </span>
              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground">Training Compliance Email</label>
                <Input
                  type="email"
                  required
                  value={configs.toolboxRosterEmail}
                  onChange={(e) => setConfigs({ ...configs, toolboxRosterEmail: e.target.value })}
                  className="h-8 text-xs bg-background"
                />
              </div>
            </div>

            {/* Near-Miss & Hazard Alerts */}
            <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-2">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <AlertTriangle className="size-3.5 text-amber-500" />
                Near-Miss & Field Hazard Notices
              </span>
              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground">Safety Committee Dispatch Email</label>
                <Input
                  type="email"
                  required
                  value={configs.nearMissHazardEmail}
                  onChange={(e) => setConfigs({ ...configs, nearMissHazardEmail: e.target.value })}
                  className="h-8 text-xs bg-background"
                />
              </div>
            </div>

            {/* COI Insurance Renewals */}
            <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-2">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Building className="size-3.5 text-blue-500" />
                COI Requests & Certificate Dispatch
              </span>
              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground">Insurance Accounting Email</label>
                <Input
                  type="email"
                  required
                  value={configs.coiNotificationEmail}
                  onChange={(e) => setConfigs({ ...configs, coiNotificationEmail: e.target.value })}
                  className="h-8 text-xs bg-background"
                />
              </div>
            </div>

            {/* Auto-CC Broker */}
            <div className="p-2.5 rounded-md bg-primary/5 border border-primary/20 text-foreground flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-semibold text-xs">Auto-CC Reliable Risk Management (Broker)</div>
                <div className="text-[11px] text-muted-foreground">
                  Copies broker underwriter & loss-control engineers on all claims & critical audits
                </div>
              </div>
              <input
                type="checkbox"
                checked={configs.autoCcBroker}
                onChange={(e) => setConfigs({ ...configs, autoCcBroker: e.target.checked })}
                className="size-4 accent-primary rounded cursor-pointer"
              />
            </div>
          </CardContent>

          <div className="flex items-center justify-end gap-2 border-t border-border/60 p-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cursor-pointer"
            >
              Save Routing Destinations
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
