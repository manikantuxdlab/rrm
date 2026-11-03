import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import type { ToolboxTopic, SubmissionRecord } from "@/types"

export const toolboxAdminService = {
  /**
   * Fetch all 26 safety topics from Supabase
   */
  async fetchTopics(): Promise<ToolboxTopic[]> {
    if (!isSupabaseConfigured) return []

    try {
      const { data, error } = await supabase
        .from("toolbox_topics")
        .select("*")
        .order("number", { ascending: true })

      if (error) {
        console.error("[toolboxAdminService] Error fetching topics:", error.message)
        return []
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        number: row.number,
        titleEn: row.title_en,
        titleEs: row.title_es,
        trade: row.trade || "Concrete & Masonry",
        oshaStandard: row.osha_standard,
        durationMinutes: row.duration_minutes || 15,
        keyHazards: Array.isArray(row.key_hazards) ? row.key_hazards : [],
        discussionPoints: Array.isArray(row.discussion_points) ? row.discussion_points : [],
        recommendedActionItems: Array.isArray(row.recommended_action_items) ? row.recommended_action_items : [],
        lastCovered: row.last_covered || undefined,
        status: (row.status?.toLowerCase() === "inactive" || row.status === "no") ? "inactive" : "active",
      }))
    } catch (err) {
      console.error("[toolboxAdminService] Unexpected error:", err)
      return []
    }
  },

  /**
   * Add a new safety topic to Supabase
   */
  async createTopic(topic: Omit<ToolboxTopic, "id">): Promise<ToolboxTopic | null> {
    if (!isSupabaseConfigured) return null

    try {
      const id = `tt-${Date.now()}`
      const payload = {
        id,
        number: topic.number,
        status: topic.status || "active",
        title_en: topic.titleEn,
        title_es: topic.titleEs,
        trade: topic.trade || "Concrete & Masonry",
        osha_standard: topic.oshaStandard,
        duration_minutes: topic.durationMinutes || 15,
        key_hazards: topic.keyHazards || [],
        discussion_points: topic.discussionPoints || [],
        recommended_action_items: topic.recommendedActionItems || [],
      }

      const { data, error } = await supabase
        .from("toolbox_topics")
        .insert(payload)
        .select()
        .single()

      if (error) {
        console.error("[toolboxAdminService] Error creating topic:", error.message)
        return null
      }

      return {
        id: data.id,
        number: data.number,
        titleEn: data.title_en,
        titleEs: data.title_es,
        trade: data.trade,
        oshaStandard: data.osha_standard,
        durationMinutes: data.duration_minutes,
        keyHazards: data.key_hazards,
        discussionPoints: data.discussion_points,
        recommendedActionItems: data.recommended_action_items,
      }
    } catch (err) {
      console.error("[toolboxAdminService] Topic insert exception:", err)
      return null
    }
  },

  /**
   * Update topic content in Supabase
   */
  async updateTopic(id: string, updates: Partial<ToolboxTopic>): Promise<boolean> {
    if (!isSupabaseConfigured) return false

    try {
      const payload: any = {}
      if (updates.number !== undefined) payload.number = updates.number
      if (updates.status !== undefined) payload.status = updates.status
      if (updates.titleEn !== undefined) payload.title_en = updates.titleEn
      if (updates.titleEs !== undefined) payload.title_es = updates.titleEs
      if (updates.oshaStandard !== undefined) payload.osha_standard = updates.oshaStandard
      if (updates.trade !== undefined) payload.trade = updates.trade
      if (updates.durationMinutes !== undefined) payload.duration_minutes = updates.durationMinutes
      if (updates.keyHazards !== undefined) payload.key_hazards = updates.keyHazards
      if (updates.discussionPoints !== undefined) payload.discussion_points = updates.discussionPoints
      if (updates.recommendedActionItems !== undefined) payload.recommended_action_items = updates.recommendedActionItems
      if ("lastCovered" in updates) payload.last_covered = updates.lastCovered || null

      const { error } = await supabase
        .from("toolbox_topics")
        .update(payload)
        .eq("id", id)

      if (error) {
        console.error("[toolboxAdminService] Topic update error:", error.message)
        return false
      }
      return true
    } catch (err) {
      console.error("[toolboxAdminService] Topic update exception:", err)
      return false
    }
  },

  /**
   * Toggle or update active status for a topic
   */
  async setTopicStatus(id: string, newStatus: "active" | "inactive"): Promise<boolean> {
    if (!isSupabaseConfigured) return false

    try {
      const { error } = await supabase
        .from("toolbox_topics")
        .update({ status: newStatus })
        .eq("id", id)

      if (error) {
        console.error("[toolboxAdminService] Status update error:", error.message)
        return false
      }
      return true
    } catch (err) {
      console.error("[toolboxAdminService] Status update exception:", err)
      return false
    }
  },

  /**
   * Toggle or update covered status for a topic (backward compatibility)
   */
  async setTopicCoveredStatus(id: string, isCovered: boolean): Promise<boolean> {
    if (!isSupabaseConfigured) return false

    try {
      const { error } = await supabase
        .from("toolbox_topics")
        .update({ last_covered: isCovered ? new Date().toISOString() : null })
        .eq("id", id)

      if (error) {
        console.error("[toolboxAdminService] Status update error:", error.message)
        return false
      }
      return true
    } catch (err) {
      console.error("[toolboxAdminService] Status update exception:", err)
      return false
    }
  },

  /**
   * Delete a topic from Supabase
   */
  async deleteTopic(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false

    try {
      const { error } = await supabase
        .from("toolbox_topics")
        .delete()
        .eq("id", id)

      if (error) {
        console.error("[toolboxAdminService] Topic delete error:", error.message)
        return false
      }
      return true
    } catch (err) {
      console.error("[toolboxAdminService] Topic delete exception:", err)
      return false
    }
  },

  /**
   * Fetch real toolbox talk submissions logged by foremen in the field
   */
  async fetchToolboxSubmissions(): Promise<SubmissionRecord[]> {
    if (!isSupabaseConfigured) return []

    try {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("module_type", "toolbox_talk")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[toolboxAdminService] Error fetching submissions:", error.message)
        return []
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        moduleType: row.module_type,
        title: row.title,
        companyName: row.company_name,
        foremanName: row.foreman_name,
        foremanEmail: row.foreman_email,
        jobSiteId: row.job_site_id || "",
        jobSiteName: row.job_site_name || "",
        timestamp: row.created_at
          ? new Date(row.created_at).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Recently",
        syncStatus: (row.sync_status || "synced") as any,
        recipients: row.recipients || [],
        data: row.data || {},
        pdfGenerated: true,
      }))
    } catch (err) {
      console.error("[toolboxAdminService] Submissions fetch error:", err)
      return []
    }
  },
}
