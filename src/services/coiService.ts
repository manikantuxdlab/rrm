import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import type { CoiRequestRecord } from "@/types"

const SYNC_BUS_TICKET_ID = "11499f1b-ef73-4160-ab81-09f09f85ba90"

export const coiService = {
  /**
   * Fetch COI requests for a specific jobsite (or all if empty)
   */
  async fetchRequests(jobSiteId?: string): Promise<CoiRequestRecord[]> {
    let list: CoiRequestRecord[] = []

    // 1. Primary: Fetch from dedicated Supabase 'coi_requests' table
    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from("coi_requests")
          .select("*")
          .order("created_at", { ascending: false })

        if (jobSiteId) {
          query = query.eq("job_site_id", jobSiteId)
        }

        const { data: dbRows, error: dbError } = await query

        if (!dbError && Array.isArray(dbRows) && dbRows.length > 0) {
          list = dbRows.map((row: any) => ({
            id: row.id,
            companyName: row.company_name,
            jobSiteId: row.job_site_id,
            jobSiteName: row.job_site_name,
            jobNumber: row.job_number,
            requestedByName: row.requested_by_name,
            requestedByRole: row.requested_by_role,
            holderName: row.holder_name,
            holderAddress: row.holder_address,
            holderContactName: row.holder_contact_name,
            holderEmail: row.holder_email,
            ccEmails: row.cc_emails || [],
            coverages: row.coverages_requested || {},
            endorsements: row.special_endorsements || {},
            urgency: row.urgency || "normal",
            notes: row.notes || "",
            contractDocUrl: row.contract_doc_url,
            status: row.status,
            underwriterNotes: row.underwriter_notes,
            issuedCoiUrl: row.issued_coi_url,
            issuedByName: row.issued_by_name,
            issuedAt: row.issued_at,
            createdAt: row.created_at,
          }))
        }

        // Also fetch any live submissions from Field App for subcontractor COIs
        const { data: subRows } = await supabase
          .from("submissions")
          .select("*")
          .eq("module_type", "subcontractor_coi")
          .order("created_at", { ascending: false })

        if (Array.isArray(subRows) && subRows.length > 0) {
          const subItems: CoiRequestRecord[] = subRows.map((r: any) => {
            const data = r.data || {}
            return {
              id: r.id,
              companyName: r.company_name || "General Contractor",
              jobSiteId: r.job_site_id,
              jobSiteName: r.job_site_name || "Active Project",
              jobNumber: "SUB-COI",
              requestedByName: r.foreman_name || "Field Foreman",
              requestedByRole: "foreman",
              holderName: data.subcontractorName || r.title || "Subcontractor Vendor",
              holderAddress: "Jobsite Location",
              holderContactName: data.contactPerson || "Lead Rep",
              holderEmail: data.email || "",
              ccEmails: r.recipients || [],
              coverages: {
                gl: Boolean(data.requiredCoverages?.generalLiability && data.requiredCoverages?.generalLiability !== "No"),
                auto: Boolean(data.requiredCoverages?.autoLiability && data.requiredCoverages?.autoLiability !== "No"),
                wc: Boolean(data.requiredCoverages?.workersComp && data.requiredCoverages?.workersComp !== "No"),
                umbrella: Boolean(data.requiredCoverages?.umbrella && data.requiredCoverages?.umbrella !== "No"),
              },
              endorsements: {
                additionalInsured: true,
                waiverSubrogation: true,
                primaryNonContributory: true,
              },
              urgency: "normal",
              notes: `Trade: ${data.trade || "Specialty Trade"} • Status: ${data.complianceStatus || "Pending Underwriter Audit"}`,
              contractDocUrl: data.documentUrl || null,
              status: data.complianceStatus === "verified" ? "issued" : "pending_underwriter",
              createdAt: r.created_at,
            }
          })
          list = [...subItems, ...list]
        }
      } catch (err) {
        console.warn("[coiService] Table fetch failed, falling back to sync bus:", err)
      }
    }

    // 2. If table returned results, cache and return
    if (list.length > 0) {
      localStorage.setItem("rrm_coi_requests", JSON.stringify(list))
      return list
    }

    // 3. Fallback: LocalStorage + Real-time Sync Bus
    list = this.getAllStoredRequests()
    list = list.filter((r) => !r.holderName?.toLowerCase().includes("turner") && r.id !== "coi-demo-101")

    if (isSupabaseConfigured) {
      try {
        const { data: messages, error } = await supabase
          .from("support_ticket_messages")
          .select("message, created_at")
          .eq("ticket_id", SYNC_BUS_TICKET_ID)
          .order("created_at", { ascending: true })

        if (!error && Array.isArray(messages)) {
          let updatedAny = false
          for (const msg of messages) {
            try {
              const payload = JSON.parse(msg.message)
              if (payload.type === "STATUS_UPDATE") {
                list = list.map((item) => {
                  const isMatch =
                    (payload.id && payload.id !== "ALL" && item.id === payload.id) ||
                    (payload.holderName && item.holderName?.toLowerCase().trim() === payload.holderName?.toLowerCase().trim())

                  if (isMatch) {
                    updatedAny = true
                    return {
                      ...item,
                      status: payload.status,
                      issuedByName: payload.issuedByName || item.issuedByName,
                      underwriterNotes: payload.underwriterNotes || item.underwriterNotes,
                      issuedAt: payload.issuedAt || item.issuedAt || msg.created_at,
                    }
                  }
                  return item
                })
              } else if (payload.type === "NEW_REQUEST" && payload.record) {
                const rec = payload.record
                if (
                  !rec.holderName?.toLowerCase().includes("turner") &&
                  !list.some((r) => r.id === rec.id)
                ) {
                  list = [rec, ...list]
                  updatedAny = true
                }
              }
            } catch {
              // ignore non-json messages
            }
          }
          if (updatedAny) {
            localStorage.setItem("rrm_coi_requests", JSON.stringify(list))
          }
        }
      } catch (err) {
        console.warn("[coiService] Sync bus fetch failed:", err)
      }
    }

    localStorage.setItem("rrm_coi_requests", JSON.stringify(list))

    if (jobSiteId) {
      return list.filter((r) => r.jobSiteId === jobSiteId)
    }
    return list
  },

  /**
   * Submit a new customer COI request from the Field Foreman or Boss
   */
  async submitRequest(payload: Omit<CoiRequestRecord, "id" | "createdAt" | "status">): Promise<CoiRequestRecord> {
    const newRecord: CoiRequestRecord = {
      ...payload,
      id: `coi-${Date.now()}`,
      status: "pending_underwriter",
      createdAt: new Date().toISOString(),
    }

    this.saveLocalRequest(newRecord)

    if (isSupabaseConfigured) {
      try {
        // Also persist into dedicated coi_requests table
        await supabase.from("coi_requests").insert({
          company_name: newRecord.companyName,
          job_site_id: newRecord.jobSiteId,
          job_site_name: newRecord.jobSiteName,
          job_number: newRecord.jobNumber || "",
          requested_by_name: newRecord.requestedByName,
          requested_by_role: newRecord.requestedByRole,
          holder_name: newRecord.holderName,
          holder_address: newRecord.holderAddress,
          holder_contact_name: newRecord.holderContactName || "",
          holder_email: newRecord.holderEmail,
          cc_emails: newRecord.ccEmails || [],
          coverages_requested: newRecord.coverages,
          special_endorsements: newRecord.endorsements,
          urgency: newRecord.urgency || "normal",
          notes: newRecord.notes || "",
          status: newRecord.status,
        })
      } catch (dbErr) {
        console.warn("[coiService] Insert into coi_requests table error:", dbErr)
      }

      try {
        await supabase.from("support_ticket_messages").insert({
          ticket_id: SYNC_BUS_TICKET_ID,
          sender_name: newRecord.requestedByName,
          sender_role: "foreman",
          message: JSON.stringify({
            type: "NEW_REQUEST",
            record: newRecord,
          }),
        })
      } catch (err) {
        console.error("[coiService] Sync bus broadcast failed:", err)
      }
    }

    return newRecord
  },

  /**
   * Upload contract requirement document (PDF or Image)
   */
  async uploadContractDoc(file: File): Promise<string | null> {
    if (!isSupabaseConfigured) return null
    try {
      const fileName = `coi-specs/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`
      const { error: uploadError } = await supabase.storage
        .from("safety-attachments")
        .upload(fileName, file, { cacheControl: "3600", upsert: true })

      if (uploadError) {
        console.warn("[coiService] Upload error:", uploadError.message)
        return null
      }

      const { data } = supabase.storage
        .from("safety-attachments")
        .getPublicUrl(fileName)

      return data.publicUrl || null
    } catch (err) {
      console.error("[coiService] Upload exception:", err)
      return null
    }
  },

  /**
   * Update status or issue certificate (Super-Admin / Underwriter)
   */
  async updateStatus(
    id: string,
    status: CoiRequestRecord["status"],
    issuedData?: {
      issuedCoiUrl?: string
      issuedByName?: string
      underwriterNotes?: string
    }
  ): Promise<boolean> {
    const updates = {
      status,
      ...issuedData,
      issuedAt: status === "issued" ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    }

    this.updateLocalRequest(id, updates)

    if (isSupabaseConfigured) {
      try {
        // Also update dedicated coi_requests table
        await supabase
          .from("coi_requests")
          .update({
            status,
            issued_by_name: issuedData?.issuedByName,
            underwriter_notes: issuedData?.underwriterNotes,
            issued_at: updates.issuedAt,
            updated_at: updates.updatedAt,
          })
          .match({ id })
      } catch (dbErr) {
        console.warn("[coiService] Update coi_requests table error:", dbErr)
      }

      try {
        await supabase.from("support_ticket_messages").insert({
          ticket_id: SYNC_BUS_TICKET_ID,
          sender_name: issuedData?.issuedByName || "Super Admin",
          sender_role: "super_admin",
          message: JSON.stringify({
            type: "STATUS_UPDATE",
            id,
            status,
            ...issuedData,
            issuedAt: updates.issuedAt,
          }),
        })
      } catch (err) {
        console.error("[coiService] Status update broadcast error:", err)
      }
    }

    return true
  },

  // ----------------------------------------------------
  // Purely User Submitted
  // ----------------------------------------------------
  getAllStoredRequests(): CoiRequestRecord[] {
    try {
      const stored = localStorage.getItem("rrm_coi_requests")
      const parsed: CoiRequestRecord[] = stored ? JSON.parse(stored) : []
      return parsed.filter((r) => !r.holderName?.toLowerCase().includes("turner") && r.id !== "coi-demo-101")
    } catch {
      return []
    }
  },

  saveLocalRequest(record: CoiRequestRecord): void {
    try {
      const current = this.getAllStoredRequests()
      const updated = [record, ...current.filter((r) => r.id !== record.id)]
      localStorage.setItem("rrm_coi_requests", JSON.stringify(updated))
    } catch (e) {
      console.warn("Could not save to localStorage:", e)
    }
  },

  updateLocalRequest(id: string, updates: Partial<CoiRequestRecord>): void {
    try {
      const current = this.getAllStoredRequests()
      const updated = current.map((r) => (r.id === id || id === "ALL" ? { ...r, ...updates } : r))
      localStorage.setItem("rrm_coi_requests", JSON.stringify(updated))
    } catch (e) {
      console.warn("Could not update localStorage:", e)
    }
  },
}
