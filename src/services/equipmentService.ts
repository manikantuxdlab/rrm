import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import type { EquipmentFleetItem } from "@/types"
import { MOCK_EQUIPMENT_FLEET } from "@/data/safetyMockData"

export const equipmentService = {
  /**
   * Fetch all equipment records from Supabase
   */
  async fetchAll(companyName?: string): Promise<EquipmentFleetItem[]> {
    if (!isSupabaseConfigured) return MOCK_EQUIPMENT_FLEET

    try {
      let query = supabase
        .from("equipment_fleet")
        .select("*")
        .order("created_at", { ascending: false })

      if (companyName && companyName !== "all") {
        query = query.eq("company_name", companyName)
      }

      const { data, error } = await query

      if (error) {
        console.warn("[equipmentService] Supabase fetch error:", error.message)
        return MOCK_EQUIPMENT_FLEET
      }

      if (!data || data.length === 0) {
        return MOCK_EQUIPMENT_FLEET
      }

      return data.map((row: any) => {
        let parsedNotes: any = {}
        if (row.notes && typeof row.notes === "string" && row.notes.startsWith("{")) {
          try {
            parsedNotes = JSON.parse(row.notes)
          } catch {
            parsedNotes = {}
          }
        }

        const makeModelParts = (row.make_model || "").split(" ")
        const inferredYear = parsedNotes.year || (makeModelParts[0]?.match(/^\d{4}$/) ? makeModelParts[0] : "2024")
        const inferredMake = parsedNotes.make || makeModelParts[1] || "Equipment"
        const inferredModel = parsedNotes.model || makeModelParts.slice(2).join(" ") || row.make_model || ""

        return {
          id: row.id,
          companyName: row.company_name || "General Contractor",
          unitNumber: row.tag_number || "UNIT-01",
          year: inferredYear,
          make: inferredMake,
          model: inferredModel,
          type: row.equipment_type || "Heavy Equipment",
          vinOrSerial: row.serial_vin || "N/A",
          estimatedValue: parsedNotes.estimatedValue || 85000,
          dateAdded: row.created_at ? row.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
          status: (row.status === "operational" ? "active" : row.status) || "active",
          insuranceStatus: (row.insurance_status || "under_review") as EquipmentFleetItem["insuranceStatus"],
          jobSiteId: row.job_site_id || "",
          ownership: parsedNotes.ownership || "rented",
          disclaimerAcknowledged: Boolean(parsedNotes.disclaimerAcknowledged),
          disclaimerTimestamp: parsedNotes.disclaimerTimestamp || row.created_at,
          platePhotoUri: parsedNotes.platePhotoUri,
          deliveryPhotoUri: parsedNotes.deliveryPhotoUri,
          lastInspectionDate: parsedNotes.lastInspectionDate || "Pre-Shift Verified",
        }
      })
    } catch (err) {
      console.error("[equipmentService] Unexpected error in fetchAll:", err)
      return MOCK_EQUIPMENT_FLEET
    }
  },

  /**
   * Super Admin action: Endorse or Decline equipment policy addition
   */
  async updateInsuranceStatus(
    id: string,
    newStatus: "endorsed" | "declined" | "under_review",
    endorsementNotes?: string
  ): Promise<boolean> {
    if (!isSupabaseConfigured) return false

    try {
      // 1. Fetch current row notes to preserve metadata
      const { data: row } = await supabase
        .from("equipment_fleet")
        .select("notes")
        .eq("id", id)
        .maybeSingle()

      let existingNotes = {}
      if (row?.notes && typeof row.notes === "string" && row.notes.startsWith("{")) {
        try {
          existingNotes = JSON.parse(row.notes)
        } catch {}
      }

      const updatedNotes = JSON.stringify({
        ...existingNotes,
        endorsementStatusDate: new Date().toISOString(),
        endorsementNotes: endorsementNotes || "",
        reviewedBy: "Super Admin (RRM Broker Desk)",
      })

      const { error } = await supabase
        .from("equipment_fleet")
        .update({
          insurance_status: newStatus,
          notes: updatedNotes,
        })
        .eq("id", id)

      if (error) {
        console.error("[equipmentService] Update insurance status error:", error.message)
        return false
      }

      // 2. Also update matching submission in submissions table if exists
      try {
        await supabase
          .from("submissions")
          .update({
            sync_status: newStatus === "endorsed" ? "synced" : "archived",
          })
          .ilike("title", `%${id}%`)
      } catch {}

      return true
    } catch (err) {
      console.error("[equipmentService] Error updating equipment status:", err)
      return false
    }
  },

  /**
   * Realtime Postgres changes subscription
   */
  subscribeToChanges(onUpdate: () => void) {
    if (!isSupabaseConfigured) return () => {}

    const channel = supabase
      .channel("realtime-equipment-fleet")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "equipment_fleet",
        },
        () => {
          onUpdate()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },
}

