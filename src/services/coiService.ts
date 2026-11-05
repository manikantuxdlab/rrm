import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import type { CoiRequestRecord } from "@/types"

const SYNC_BUS_TICKET_ID = "11499f1b-ef73-4160-ab81-09f09f85ba90"

export const coiService = {
  /**
   * Fetch COI requests for a specific jobsite (or all if empty)
   */
  async fetchRequests(jobSiteId?: string): Promise<CoiRequestRecord[]> {
    let list = this.getAllStoredRequests()
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
