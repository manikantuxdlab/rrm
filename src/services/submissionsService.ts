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
