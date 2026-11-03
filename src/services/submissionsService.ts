import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import type { SubmissionRecord } from "@/types"

export const submissionsService = {
  /**
   * Fetch submissions with optional filtering by moduleType and jobSiteId
   */
  async fetchAll(filters?: {
    moduleType?: string
    jobSiteId?: string
  }): Promise<SubmissionRecord[]> {
    if (!isSupabaseConfigured) return []

    try {
      let query = supabase
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false })

      if (filters?.moduleType && filters.moduleType !== "all") {
        query = query.eq("module_type", filters.moduleType)
      }

      if (filters?.jobSiteId && filters.jobSiteId !== "global" && filters.jobSiteId !== "all") {
        query = query.eq("job_site_id", filters.jobSiteId)
      }

      const { data, error } = await query

      if (error) {
        console.warn("[submissionsService] Error fetching submissions:", error.message)
        return []
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        moduleType: row.module_type,
        title: row.title || "Daily Safety Checklist Inspection",
        companyName: row.company_name || "General Contractor",
        foremanName: row.foreman_name || "Safety Lead",
        foremanEmail: row.foreman_email || "",
        jobSiteId: row.job_site_id || "",
        jobSiteName: row.job_site_name || "Active Jobsite",
        timestamp: row.created_at
          ? new Date(row.created_at).toLocaleString([], {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Recently",
        syncStatus: (row.sync_status || "synced") as any,
        isArchived: row.sync_status === "archived" || Boolean(row.data?.archived),
        recipients: row.recipients || [],
        data: row.data || {},
        signatureUri: row.signature_uri || row.data?.signatureUri,
        pdfGenerated: true,
      }))
    } catch (err) {
      console.error("[submissionsService] Unexpected fetch error:", err)
      return []
    }
  },

  /**
   * Toggle archive status for a submission
   */
  async toggleArchive(id: string, currentArchived: boolean): Promise<boolean> {
    if (!isSupabaseConfigured) return false
    try {
      const newArchived = !currentArchived
      const { data: row } = await supabase.from("submissions").select("data").eq("id", id).single()
      const updatedData = { ...(row?.data || {}), archived: newArchived }
      const { error } = await supabase
        .from("submissions")
        .update({
          sync_status: newArchived ? "archived" : "synced",
          data: updatedData,
        })
        .eq("id", id)

      if (error) {
        console.error("[submissionsService] Failed to toggle archive:", error.message)
        return false
      }
      return true
    } catch (err) {
      console.error("[submissionsService] Error toggling archive:", err)
      return false
    }
  },

  /**
   * Delete a submission permanently
   */
  async deleteSubmission(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false
    try {
      const { error } = await supabase.from("submissions").delete().eq("id", id)
      if (error) {
        console.error("[submissionsService] Failed to delete submission:", error.message)
        return false
      }
      return true
    } catch (err) {
      console.error("[submissionsService] Error deleting submission:", err)
      return false
    }
  },

  /**
   * Remove an evidence photo from a submission's payload
   */
  async deletePhoto(submissionId: string, photoUri: string, itemId?: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false
    try {
      const { data: row, error: fetchErr } = await supabase
        .from("submissions")
        .select("data")
        .eq("id", submissionId)
        .single()

      if (fetchErr || !row) {
        console.error("[submissionsService] Failed to fetch submission for photo removal:", fetchErr?.message)
        return false
      }

      const updatedData = { ...row.data }

      // 1. Remove from item if matching
      if (Array.isArray(updatedData.items)) {
        updatedData.items = updatedData.items.map((item: any) => {
          if ((itemId && item.id === itemId) || item.photoUri === photoUri) {
            return { ...item, photoUri: undefined }
          }
          if (Array.isArray(item.photos)) {
            return { ...item, photos: item.photos.filter((p: string) => p !== photoUri) }
          }
          return item
        })
      }

      // 2. Remove from root photos / photoUrls
      if (Array.isArray(updatedData.photos)) {
        updatedData.photos = updatedData.photos.filter((p: string) => p !== photoUri)
      }
      if (Array.isArray(updatedData.photoUrls)) {
        updatedData.photoUrls = updatedData.photoUrls.filter((p: string) => p !== photoUri)
      }

      // Recompute photoCount
      let count = 0
      if (Array.isArray(updatedData.items)) {
        count += updatedData.items.filter((i: any) => Boolean(i.photoUri)).length
      }
      if (Array.isArray(updatedData.photos)) {
        count += updatedData.photos.length
      }
      updatedData.photoCount = count

      const { error: updateErr } = await supabase
        .from("submissions")
        .update({ data: updatedData })
        .eq("id", submissionId)

      if (updateErr) {
        console.error("[submissionsService] Failed to update after photo deletion:", updateErr.message)
        return false
      }

      return true
    } catch (err) {
      console.error("[submissionsService] Error deleting photo:", err)
      return false
    }
  },

  /**
   * Subscribe to real-time changes on submissions table
   */
  subscribeToChanges(onUpdate: () => void) {
    if (!isSupabaseConfigured) return () => {}

    const channel = supabase
      .channel("realtime-submissions-all")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "submissions",
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
