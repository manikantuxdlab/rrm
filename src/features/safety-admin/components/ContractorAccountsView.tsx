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
import { MOCK_COMPANIES } from "@/data/safetyMockData"
import type { ClientCompany } from "@/types"
import {
  Building,
  Plus,
  Search,
  CheckCircle2,
  Settings2,
  X,
} from "lucide-react"
import { RoutingSettingsModal } from "./RoutingSettingsModal"

export function ContractorAccountsView({
  onOpenAddCompany,
}: {
  onOpenAddCompany: () => void
}) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCompanyForRouting, setSelectedCompanyForRouting] = React.useState<ClientCompany | null>(null)
  const [successToast, setSuccessToast] = React.useState<string | null>(null)
  const companies: ClientCompany[] = MOCK_COMPANIES

  const filteredCompanies = React.useMemo(() => {
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.trade.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.routingEmail.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [companies, searchQuery])

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Building className="size-6 text-primary" />
            Contractor Accounts & Policy Entities
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Multi-tenant contractor accounts, automated dispatch routing emails, policy schedules, and safety scores
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={onOpenAddCompany}
            className="text-xs font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-3.5" />
            Onboard Contractor Entity
          </Button>
        </div>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 cursor-pointer"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Insured Contractors</CardDescription>
            <CardTitle className="text-2xl font-bold">{companies.length} Companies</CardTitle>
          </CardHeader>
          <CardFooter className="text-xs text-emerald-600 font-medium">
            100% active underwriter policy binders
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Safety Compliance Rating</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600">97.2%</CardTitle>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            Top tier group captive qualification
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Automated Email Routing</CardDescription>
            <CardTitle className="text-2xl font-bold">100% Configured</CardTitle>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            Direct instant delivery to safety directors & brokers
          </CardFooter>
        </Card>
      </div>

      {/* Search & List of Companies */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
          <CardTitle className="text-base font-bold">Contractor Directory</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="size-3.5 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search entity, trade, contact..."
              className="pl-8 text-xs h-9"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
              <tr>
                <th className="px-4 py-3 font-semibold">Company Name</th>
                <th className="px-4 py-3 font-semibold">Primary Trade</th>
                <th className="px-4 py-3 font-semibold">Safety Routing Dispatch</th>
                <th className="px-4 py-3 font-semibold">Policy Number & Expiry</th>
                <th className="px-4 py-3 font-semibold">Active Jobs</th>
                <th className="px-4 py-3 font-semibold">Safety Score</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredCompanies.map((comp) => (
                <tr key={comp.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-foreground">{comp.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      Contact: {comp.contactPerson} ({comp.contactPhone})
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant="outline" className="text-[10px]">
                      {comp.trade}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-primary">
                    {comp.routingEmail}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[11px]">
                    <div className="text-foreground font-semibold">{comp.policyNumber}</div>
                    <div className="text-muted-foreground text-[10px]">Expires: {comp.policyExpires}</div>
                  </td>
                  <td className="px-4 py-3.5 text-foreground font-medium">
                    {comp.activeJobsCount} Active Sites
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge className="bg-emerald-600/10 text-emerald-600 border border-emerald-500/20 font-bold text-[11px]">
                      {comp.safetyScore}%
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedCompanyForRouting(comp)}
                      className="h-7 text-xs border-primary/40 text-primary hover:bg-primary/10 gap-1 cursor-pointer"
                    >
                      <Settings2 className="size-3" />
                      Configure Routing
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Routing Configuration Modal */}
      <RoutingSettingsModal
        company={selectedCompanyForRouting}
        isOpen={!!selectedCompanyForRouting}
        onClose={() => setSelectedCompanyForRouting(null)}
        onSave={() => {
          setSuccessToast(
            `✅ Custom routing destinations updated for ${selectedCompanyForRouting?.name}!`
          )
          setTimeout(() => setSuccessToast(null), 4000)
        }}
      />
    </div>
  )
}

