import { useState, useEffect } from "react"
import { coiService } from "@/services/coiService"
import { downloadAcord25Pdf } from "@/lib/acord25Generator"
import type { CoiRequestRecord } from "@/types"
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Download,
  Send,
  Building,
  ShieldCheck,
  Loader2,
  FileText,
  Building2,
  User,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"

export function COIRequestsQueueView() {
  const [requests, setRequests] = useState<CoiRequestRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "issued">("all")

  // Selected request for issuance sheet
  const [selectedRequest, setSelectedRequest] = useState<CoiRequestRecord | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [underwriterNotes, setUnderwriterNotes] = useState("")
  const [customSigner, setCustomSigner] = useState("David A. Rosenthal, Certified Underwriter")

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    setIsLoading(true)
    const data = await coiService.fetchRequests()
    setRequests(data)
    setIsLoading(false)
  }

  const handleApproveAndIssue = async () => {
    if (!selectedRequest) return
    setIsProcessing(true)

    try {
      // 1. Mark as issued
      await coiService.updateStatus(selectedRequest.id, "issued", {
        issuedByName: customSigner,
        underwriterNotes: underwriterNotes.trim() || "Approved & ACORD 25 Certificate issued under active carrier lines.",
      })

      // 2. Download generated ACORD 25
      const updatedRecord: CoiRequestRecord = {
        ...selectedRequest,
        status: "issued",
        issuedByName: customSigner,
        issuedAt: new Date().toISOString(),
      }
      downloadAcord25Pdf(updatedRecord)

      // 3. Reload list
      await loadRequests()
      setSelectedRequest(null)
    } catch (err) {
      console.error("Error issuing certificate:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  const filtered = requests.filter((r) => {
    const matchesSearch =
      r.holderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.jobSiteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.requestedByName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.holderEmail.toLowerCase().includes(searchQuery.toLowerCase())

    if (filterStatus === "pending") return matchesSearch && r.status !== "issued"
    if (filterStatus === "issued") return matchesSearch && r.status === "issued"
    return matchesSearch
  })

  const pendingCount = requests.filter((r) => r.status !== "issued").length
  const urgentCount = requests.filter((r) => r.urgency === "crew_stopped" && r.status !== "issued").length
  const issuedCount = requests.filter((r) => r.status === "issued").length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-md">
              UNDERWRITER OPERATIONS
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">
              ACORD 25 Issuance Center
            </span>
          </div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            Customer COI Underwriter Queue
          </h1>
          <p className="text-xs text-muted-foreground">
            Review incoming Certificate Holder requests, verify carrier limits, and issue official ACORD 25 certificates.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Pending Card */}
        <Card className="shadow-none border-border">
          <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              PENDING UNDERWRITER
            </span>
            <div className="size-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="size-3.5" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {pendingCount}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Awaiting limit verification
            </div>
          </CardContent>
        </Card>

        {/* Crew Stopped Card */}
        <Card className="shadow-none border-border">
          <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1">
              <AlertTriangle className="size-3" /> CREW STOPPED (URGENT)
            </span>
            <div className="size-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="size-3.5" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
              {urgentCount}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Priority &lt; 2-hour SLA
            </div>
          </CardContent>
        </Card>

        {/* Issued Card */}
        <Card className="shadow-none border-border">
          <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              ISSUED &amp; DELIVERED
            </span>
            <div className="size-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="size-3.5" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {issuedCount}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Certified ACORD 25 delivered
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-muted/30 p-2.5 rounded-lg border border-border">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search holder, jobsite, foreman..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs bg-background"
          />
        </div>

        <div className="inline-flex rounded-lg border border-border bg-muted/60 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
              filterStatus === "all"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Requests ({requests.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("pending")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
              filterStatus === "pending"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("issued")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
              filterStatus === "issued"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Issued ({issuedCount})
          </button>
        </div>
      </div>

      {/* Requests Table */}
      {isLoading ? (
        <div className="p-10 text-center space-y-2 border border-border rounded-xl bg-card">
          <Loader2 className="size-6 animate-spin mx-auto text-primary" />
          <p className="text-xs text-muted-foreground">Loading Underwriter Queue...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-10 text-center space-y-2 border border-dashed rounded-xl border-border bg-card">
          <FileCheck2 className="size-8 mx-auto text-muted-foreground opacity-50" />
          <h3 className="text-sm font-semibold text-foreground">No Requests Matching Filters</h3>
          <p className="text-xs text-muted-foreground">
            No customer COI requests currently in this status queue.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden shadow-none">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
              <tr>
                <th className="py-2.5 px-3">CERTIFICATE HOLDER</th>
                <th className="py-2.5 px-3">JOBSITE / PROJECT</th>
                <th className="py-2.5 px-3">REQUESTED BY</th>
                <th className="py-2.5 px-3">LIMITS REQUIRED</th>
                <th className="py-2.5 px-3">PRIORITY</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((req) => (
                <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 px-3 align-top">
                    <div className="font-semibold text-foreground">{req.holderName}</div>
                    <div className="text-[11px] text-muted-foreground line-clamp-1 max-w-[220px]">
                      {req.holderAddress}
                    </div>
                    <div className="text-[10px] text-primary font-mono mt-0.5">
                      {req.holderEmail}
                    </div>
                  </td>

                  <td className="py-2.5 px-3 align-top">
                    <div className="font-medium text-foreground flex items-center gap-1">
                      <Building className="size-3 text-muted-foreground shrink-0" />
                      <span>{req.jobSiteName}</span>
                    </div>
                    <div className="text-[10.5px] font-mono text-muted-foreground">
                      Job #{req.jobNumber || "TST-2026"}
                    </div>
                  </td>

                  <td className="py-2.5 px-3 align-top">
                    <div className="font-medium text-foreground">{req.requestedByName}</div>
                    <div className="text-[10px] text-muted-foreground capitalize">
                      Role: {req.requestedByRole}
                    </div>
                  </td>

                  <td className="py-2.5 px-3 align-top">
                    <div className="flex flex-wrap gap-1 max-w-[190px]">
                      {req.coverages?.gl && (
                        <span className="text-[9px] font-mono bg-blue-500/10 text-blue-600 px-1 py-0.5 rounded">
                          GL $1M/$2M
                        </span>
                      )}
                      {req.coverages?.auto && (
                        <span className="text-[9px] font-mono bg-indigo-500/10 text-indigo-600 px-1 py-0.5 rounded">
                          Auto $1M
                        </span>
                      )}
                      {req.coverages?.umbrella && (
                        <span className="text-[9px] font-mono bg-purple-500/10 text-purple-600 px-1 py-0.5 rounded">
                          Excess $5M
                        </span>
                      )}
                      {req.coverages?.wc && (
                        <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-600 px-1 py-0.5 rounded">
                          WC $1M
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-2.5 px-3 align-top">
                    {req.urgency === "crew_stopped" ? (
                      <span className="text-[10px] font-bold text-red-600 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <AlertTriangle className="size-2.5" /> Crew Stopped
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        Standard 24h
                      </span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 align-top">
                    {req.status === "issued" ? (
                      <span className="text-[10.5px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md font-mono inline-flex items-center gap-1">
                        <CheckCircle2 className="size-3" />
                        Issued
                      </span>
                    ) : (
                      <span className="text-[10.5px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md font-mono inline-flex items-center gap-1">
                        <Clock className="size-3" />
                        Pending Review
                      </span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 align-top text-right">
                    {req.status === "issued" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadAcord25Pdf(req)}
                        className="h-8 text-xs gap-1 font-semibold text-primary border-primary/30"
                      >
                        <Download className="size-3" />
                        Download ACORD 25
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => setSelectedRequest(req)}
                        className="h-8 text-xs gap-1 font-bold bg-primary text-primary-foreground shadow-xs"
                      >
                        <ShieldCheck className="size-3.5" />
                        Process &amp; Issue
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Review & Issuance Side Sheet */}
      <Sheet open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <SheetContent side="right" className="sm:max-w-xl w-full flex flex-col p-0 gap-0 shadow-2xl bg-card">
          {/* Header */}
          <SheetHeader className="p-5 pb-4 border-b border-border bg-muted/20">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                ACORD 25 ISSUANCE WORKFLOW
              </span>
            </div>
            <SheetTitle className="text-base font-bold text-foreground tracking-tight">
              Issue Certificate: {selectedRequest?.holderName}
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              Verify policy limits, carrier endorsements and execute authorized digital certification.
            </SheetDescription>
          </SheetHeader>

          {/* Body Content */}
          {selectedRequest && (
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {/* Holder & Jobsite Context Summary */}
              <div className="rounded-xl border border-border bg-card p-3.5 space-y-2.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="size-3.5 text-primary" /> Certificate Holder Details
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Holder Name</span>
                    <span className="font-semibold text-foreground">{selectedRequest.holderName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Attention / Email</span>
                    <span className="font-mono text-primary text-[11px]">{selectedRequest.holderEmail}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-muted-foreground block">Mailing Address</span>
                    <span className="text-foreground">{selectedRequest.holderAddress}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <User className="size-3" /> Requested by: <span className="font-medium text-foreground">{selectedRequest.requestedByName}</span> ({selectedRequest.requestedByRole})
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground font-mono">
                    <Calendar className="size-3" /> Job #{selectedRequest.jobNumber || "TST-2026"}
                  </div>
                </div>
              </div>

              {/* Policy Matching Box */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="size-4" /> Active Policy Limits Verification
                  </span>
                  <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                    Live Verified
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-background border border-border">
                    <div className="font-bold text-foreground">Travelers Property &amp; Cas.</div>
                    <div className="text-muted-foreground font-mono text-[10px]">Policy #GL-994102-TRV</div>
                    <div className="text-emerald-600 font-semibold mt-1">✓ $1M / $2M GL Verified</div>
                  </div>
                  <div className="p-2 rounded-lg bg-background border border-border">
                    <div className="font-bold text-foreground">Liberty Mutual Fire</div>
                    <div className="text-muted-foreground font-mono text-[10px]">Policy #CA-881230-LIB</div>
                    <div className="text-emerald-600 font-semibold mt-1">✓ $1M Auto CSL Verified</div>
                  </div>
                  <div className="p-2 rounded-lg bg-background border border-border">
                    <div className="font-bold text-foreground">Berkshire Hathaway Spec.</div>
                    <div className="text-muted-foreground font-mono text-[10px]">Policy #UMB-441920-BH</div>
                    <div className="text-emerald-600 font-semibold mt-1">✓ $5M Umbrella Verified</div>
                  </div>
                  <div className="p-2 rounded-lg bg-background border border-border">
                    <div className="font-bold text-foreground">State Compensation Fund</div>
                    <div className="text-muted-foreground font-mono text-[10px]">Policy #WC-109482-SCIF</div>
                    <div className="text-emerald-600 font-semibold mt-1">✓ $1M Statutory WC Verified</div>
                  </div>
                </div>
              </div>

              {/* Endorsements Box */}
              <div className="p-3 rounded-xl border border-border bg-muted/30 space-y-1.5">
                <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                  <FileText className="size-3.5 text-muted-foreground" /> Mandatory Endorsements Applied:
                </span>
                <div className="space-y-1 text-muted-foreground text-[11px]">
                  <div>✓ Additional Insured (CG 20 10 04 13 &amp; CG 20 37 04 13)</div>
                  <div>✓ Waiver of Subrogation in favor of Certificate Holder</div>
                  <div>✓ Primary &amp; Non-Contributory coverage clause included</div>
                </div>
              </div>

              {/* Signer */}
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground text-xs">
                  Authorized Underwriter / Producer Signature
                </label>
                <Input
                  value={customSigner}
                  onChange={(e) => setCustomSigner(e.target.value)}
                  className="text-xs h-9 bg-background"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground text-xs">
                  Underwriter Approval Remarks
                </label>
                <Input
                  value={underwriterNotes}
                  onChange={(e) => setUnderwriterNotes(e.target.value)}
                  placeholder="e.g. Verified with Travelers policy schedule; certificate issued."
                  className="text-xs h-9 bg-background"
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <SheetFooter className="p-4 border-t border-border bg-muted/20 flex flex-row items-center justify-between gap-2 mt-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedRequest(null)}
              className="text-xs h-9 px-4"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isProcessing}
              onClick={handleApproveAndIssue}
              className="text-xs font-bold gap-1.5 bg-primary text-primary-foreground shadow-sm h-9 px-4"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Generating ACORD 25...
                </>
              ) : (
                <>
                  <Send className="size-3.5" />
                  Approve, Issue &amp; Email Certificate
                </>
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
