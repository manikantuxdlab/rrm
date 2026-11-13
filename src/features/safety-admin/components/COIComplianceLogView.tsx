import * as React from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { GlobalDataTable } from "@/components/ui/data-table-global"
import { supabase } from "@/lib/supabase"

type CoiRecord = {
  id: string
  subcontractor_name: string
  trade: string | null
  project_name: string | null
  workflow_type: string
  status: "pending_broker" | "verified" | "deficient"
  carrier_name: string | null
  policy_number: string | null
  policy_exp_date: string | null
  deficiencies: string[] | null
  document_url: string | null
  created_at: string
}

const displayStatus = (r: CoiRecord) => {
  if (r.status === "verified" && r.policy_exp_date && new Date(r.policy_exp_date) < new Date()) {
    return { label: "Expired", cls: "bg-rose-500/15 text-rose-700 border-rose-500/30" }
  }
   if (r.status === "verified" && r.policy_exp_date) {
    const days = Math.ceil((new Date(r.policy_exp_date).getTime() - Date.now()) / 86400000)
    if (days <= 30) return { label: `Expiring (${days}d)`, cls: "bg-amber-500/15 text-amber-700 border-amber-500/30" }
  }
  if (r.status === "verified") return { label: "Verified", cls: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30" }
  if (r.status === "deficient") return { label: "Deficient", cls: "bg-rose-500/15 text-rose-700 border-rose-500/30" }
  return { label: "Pending Broker", cls: "bg-amber-500/15 text-amber-700 border-amber-500/30" }
}

export function COIComplianceLogView() {
  const [rows, setRows] = React.useState<CoiRecord[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    supabase
      .from("submissions")
      .select("*")
      .eq("module_type", "subcontractor_coi")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error(`Error: ${error.message}`)
        else
          setRows(
            (data ?? []).map((r: any) => ({
              id: r.id,
              subcontractor_name: r.data?.subcontractorName ?? r.title,
              trade: r.data?.trade ?? null,
              project_name: r.data?.projectName ?? r.job_site_name ?? null,
              workflow_type: r.data?.workflowType,
              status: r.data?.complianceStatus,
              carrier_name: r.data?.carrierName ?? null,
              policy_number: r.data?.policyNumber ?? null,
              policy_exp_date: r.data?.policyExpDate ?? null,
                   deficiencies: r.data?.deficiencies ?? null,
              document_url: r.data?.documentUrl ?? null,
              created_at: r.created_at,
            }))
          )
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="p-12 text-center text-xs text-muted-foreground">Loading compliance log...</div>

  return (
    <div className="space-y-4">
         <h2 className="text-xl font-bold">COI Compliance Log</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Verified", count: rows.filter((r) => displayStatus(r).label === "Verified").length, cls: "text-emerald-600" },
          { label: "Expiring Soon", count: rows.filter((r) => displayStatus(r).label.startsWith("Expiring")).length, cls: "text-amber-600" },
          { label: "Deficient / Expired", count: rows.filter((r) => ["Deficient", "Expired"].includes(displayStatus(r).label)).length, cls: "text-rose-600" },
          { label: "Pending Broker", count: rows.filter((r) => displayStatus(r).label === "Pending Broker").length, cls: "text-muted-foreground" },
        ].map((k) => (
          <div key={k.label} className="rounded-lg border border-border px-3.5 py-2.5">
            <div className="text-[11px] font-medium text-muted-foreground">{k.label}</div>
            <div className={`text-lg font-bold mt-0.5 ${k.cls}`}>{k.count}</div>
          </div>
        ))}
      </div>
      <GlobalDataTable<CoiRecord>
        data={rows}
        keyExtractor={(r) => r.id}
        showRowNumbers
        emptyMessage="No COI records yet."
        columns={[
          {
            key: "sub", header: "Subcontractor",
            cell: (r) => (
              <div>
                <div className="font-semibold">{r.subcontractor_name}</div>
                <div className="text-[11px] text-muted-foreground">{r.trade} • {r.project_name}</div>
              </div>
            ),
          },
          {
            key: "status", header: "Status",
            cell: (r) => {
              const s = displayStatus(r)
              return <Badge variant="outline" className={`text-[10px] ${s.cls}`}>{s.label}</Badge>
            },
          },
          {
            key: "policy", header: "Carrier / Policy",
            cell: (r) => (
              <div className="font-mono text-[11px]">
                <div>{r.carrier_name ?? "—"}</div>
                <div className="text-muted-foreground">{r.policy_number ?? "—"}</div>
              </div>
            ),
          },
          { key: "exp", header: "Expires", cell: (r) => r.policy_exp_date ?? "—" },
          {
            key: "def", header: "Deficiencies",
            cell: (r) => (r.deficiencies?.length ? r.deficiencies.join(", ") : "—"),
          },
                   {
            key: "doc", header: "Document",
            cell: (r) =>
              r.document_url ? (
                <a href={r.document_url} target="_blank" rel="noreferrer" className="text-primary text-xs font-semibold hover:underline">
                  View
                </a>
              ) : (
                "—"
              ),
          },
          { key: "date", header: "Logged", cell: (r) => new Date(r.created_at).toLocaleDateString() },
        ]}
      />
    </div>
  )
}