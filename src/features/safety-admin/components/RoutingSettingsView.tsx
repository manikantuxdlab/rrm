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
  AlertTriangle,
  PhoneCall,
  Mail,
  CheckCircle2,
  Save,
  BellRing,
} from "lucide-react"
import type { CompanyRoutingConfig } from "@/types"
import { MOCK_COMPANIES, MOCK_COMPANY_ROUTING_CONFIGS } from "@/data/safetyMockData"

export function RoutingSettingsView() {
  const [selectedCompanyId, setSelectedCompanyId] = React.useState<string>(MOCK_COMPANIES[0]?.id || "comp-01")
  const [configs, setConfigs] = React.useState<Record<string, CompanyRoutingConfig>>(MOCK_COMPANY_ROUTING_CONFIGS)
  const [saveSuccess, setSaveSuccess] = React.useState(false)
  const [testSent, setTestSent] = React.useState<string | null>(null)

  const activeCompany = MOCK_COMPANIES.find((c) => c.id === selectedCompanyId) || MOCK_COMPANIES[0]
  const currentConfig: CompanyRoutingConfig = configs[selectedCompanyId] || {
    companyId: selectedCompanyId,
    claimAlertEmail: activeCompany?.routingEmail || "safety@example.com",
    claimAlertPhone: activeCompany?.contactPhone || "+1 (555) 0100",
    checklistSubmissionsEmail: activeCompany?.routingEmail || "inspections@example.com",
    toolboxRosterEmail: activeCompany?.routingEmail || "training@example.com",
    nearMissHazardEmail: activeCompany?.routingEmail || "hazards@example.com",
    coiNotificationEmail: activeCompany?.routingEmail || "coi@example.com",
    autoCcBroker: true,
  }

  const handleUpdateField = (field: keyof CompanyRoutingConfig, value: any) => {
    setConfigs((prev) => ({
      ...prev,
      [selectedCompanyId]: {
        ...currentConfig,
        [field]: value,
      },
    }))
    setSaveSuccess(false)
  }

  const handleSave = () => {
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const handleSendTest = (channel: string) => {
    setTestSent(channel)
    setTimeout(() => setTestSent(null), 3000)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/40 p-5 rounded-xl border">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BellRing className="size-5 text-primary" />
            Company Notification & Routing Hub
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Section 7 Requirement: Configure email and SMS notification recipients per company for field submissions. No code edits required.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 gap-1 py-1.5 px-3">
              <CheckCircle2 className="size-3.5" /> Saved Successfully
            </Badge>
          )}
          <Button onClick={handleSave} className="gap-2 shadow-sm">
            <Save className="size-4" /> Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Company Selector Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Select Client Company
          </label>
          <div className="flex flex-col gap-2">
            {MOCK_COMPANIES.map((company) => {
              const isSelected = company.id === selectedCompanyId
              return (
                <button
                  key={company.id}
                  onClick={() => setSelectedCompanyId(company.id)}
                  className={`flex flex-col text-left p-3.5 rounded-lg border transition-all ${
                    isSelected
                      ? "bg-primary/10 border-primary shadow-xs font-medium text-foreground"
                      : "bg-card hover:bg-muted/50 border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-foreground">{company.name}</span>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {company.trade}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Building className="size-3" /> {company.contactPerson}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Configuration Form */}
        <div className="lg:col-span-3 space-y-6">
          {/* Claim Alerts */}
          <Card className="border-amber-500/30 bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
                  <AlertTriangle className="size-4 text-amber-500" />
                  Urgent Claim & Incident Alerts (SMS & Email)
                </CardTitle>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">
                  Immediate Notice
                </Badge>
              </div>
              <CardDescription>
                When a field foreman submits a GL, Auto, WC, or Equipment claim, direct SMS and email notices are dispatched immediately.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Mail className="size-3.5 text-primary" /> Claim Alert Email
                </label>
                <Input
                  value={currentConfig.claimAlertEmail}
                  onChange={(e) => handleUpdateField("claimAlertEmail", e.target.value)}
                  placeholder="claims@contractor.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <PhoneCall className="size-3.5 text-primary" /> Emergency SMS Mobile Number
                </label>
                <Input
                  value={currentConfig.claimAlertPhone}
                  onChange={(e) => handleUpdateField("claimAlertPhone", e.target.value)}
                  placeholder="+1 (555) 019-2834"
                />
              </div>
            </CardContent>
          </Card>

          {/* Routine Safety Submissions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
                <ShieldCheck className="size-4 text-primary" />
                Daily Safety Submissions Routing
              </CardTitle>
              <CardDescription>
                Destination email inboxes for routine daily checklists, signed toolbox talk rosters, and near-miss reports.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Daily Safety Checklists Recipient Email
                  </label>
                  <Input
                    value={currentConfig.checklistSubmissionsEmail}
                    onChange={(e) => handleUpdateField("checklistSubmissionsEmail", e.target.value)}
                    placeholder="safety-checklists@contractor.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Toolbox Talk Signed Rosters Email
                  </label>
                  <Input
                    value={currentConfig.toolboxRosterEmail}
                    onChange={(e) => handleUpdateField("toolboxRosterEmail", e.target.value)}
                    placeholder="toolbox-talks@contractor.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Near-Miss & Hazard Reports Email
                  </label>
                  <Input
                    value={currentConfig.nearMissHazardEmail}
                    onChange={(e) => handleUpdateField("nearMissHazardEmail", e.target.value)}
                    placeholder="nearmiss@contractor.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    COI Requests & Insurance Destination
                  </label>
                  <Input
                    value={currentConfig.coiNotificationEmail}
                    onChange={(e) => handleUpdateField("coiNotificationEmail", e.target.value)}
                    placeholder="coi-servicing@reliablerisk.com"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t text-xs text-muted-foreground">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentConfig.autoCcBroker}
                    onChange={(e) => handleUpdateField("autoCcBroker", e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                  />
                  <span>Automatically CC Reliable Risk Management Safety Brokerage on all submissions</span>
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendTest("email")}
                  className="text-xs h-8 gap-1.5"
                >
                  <Send className="size-3" />
                  {testSent ? "Test Notification Sent!" : "Send Test Ping"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
