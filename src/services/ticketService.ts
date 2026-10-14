import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import type {
  SupportTicket,
  SupportTicketMessage,
  TicketCategory,
  TicketPriority,
  TicketStatus,
  TicketStage,
} from "@/types"

export interface DBTicketRecord {
  id: string
  ticket_number: string
  subject: string
  description: string
  category: string
  priority: string
  status: string
  stage: string
  user_id?: string | null
  user_name: string
  user_email: string
  user_role: string
  company_name: string
  jobsite_name?: string | null
  assigned_to?: string | null
  resolution_notes?: string | null
  resolved_by?: string | null
  resolved_at?: string | null
  created_at: string
  updated_at: string
}

export interface DBMessageRecord {
  id: string
  ticket_id: string
  sender_name: string
  sender_role: string
  message: string
  created_at: string
}

function mapDBTicketToItem(row: DBTicketRecord, messages?: SupportTicketMessage[]): SupportTicket {
  return {
    id: row.id,
    ticketNumber: row.ticket_number || "TKT-0000",
    subject: row.subject || "",
    description: row.description || "",
    category: (row.category as TicketCategory) || "general",
    priority: (row.priority as TicketPriority) || "medium",
    status: (row.status as TicketStatus) || "open",
    stage: (row.stage as TicketStage) || "company_level",
    userId: row.user_id,
    userName: row.user_name || "Unknown User",
    userEmail: row.user_email || "",
    userRole: (row.user_role as "foreman" | "boss" | "super_admin") || "foreman",
    companyName: row.company_name || "",
    jobsiteName: row.jobsite_name,
    assignedTo: row.assigned_to,
    resolutionNotes: row.resolution_notes,
    resolvedBy: row.resolved_by,
    resolvedAt: row.resolved_at,
    createdAt: row.created_at ? row.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
    updatedAt: row.updated_at ? row.updated_at.split("T")[0] : new Date().toISOString().split("T")[0],
    messages: messages || [],
  }
}

export const ticketService = {
  /**
   * Fetch all tickets from Supabase with optional filters.
   */
  async getTickets(filters?: {
    status?: string
    priority?: string
    stage?: string
    search?: string
  }): Promise<{ data: SupportTicket[]; error: Error | null }> {
    if (!isSupabaseConfigured) {
      return { data: [], error: new Error("Supabase is not configured.") }
    }

    try {
      let query = supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false })

      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status)
      }
      if (filters?.priority && filters.priority !== "all") {
        query = query.eq("priority", filters.priority)
      }
      if (filters?.stage && filters.stage !== "all") {
        query = query.eq("stage", filters.stage)
      }

      const { data, error } = await query

      if (error) {
        console.error("[ticketService.getTickets]", error)
        return { data: [], error: new Error(error.message) }
      }

      let items = (data || []).map((row) => mapDBTicketToItem(row as DBTicketRecord))

      if (filters?.search && filters.search.trim()) {
        const q = filters.search.toLowerCase()
        items = items.filter(
          (t) =>
            t.ticketNumber.toLowerCase().includes(q) ||
            t.subject.toLowerCase().includes(q) ||
            t.companyName.toLowerCase().includes(q) ||
            t.userName.toLowerCase().includes(q) ||
            (t.jobsiteName && t.jobsiteName.toLowerCase().includes(q))
        )
      }

      return { data: items, error: null }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err))
      console.error("[ticketService.getTickets exception]", error)
      return { data: [], error }
    }
  },

  /**
   * Fetch ticket details and full message thread.
   */
  async getTicketDetails(ticketId: string): Promise<{ data: SupportTicket | null; error: Error | null }> {
    if (!isSupabaseConfigured) {
      return { data: null, error: new Error("Supabase is not configured.") }
    }

    try {
      const { data: ticketData, error: ticketError } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("id", ticketId)
        .single()

      if (ticketError) {
        return { data: null, error: new Error(ticketError.message) }
      }

      const { data: msgData, error: msgError } = await supabase
        .from("support_ticket_messages")
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true })

      if (msgError) {
        console.warn("[ticketService.getTicketDetails] Message fetch warning:", msgError)
      }

      const messages: SupportTicketMessage[] = (msgData || []).map((m: DBMessageRecord) => ({
        id: m.id,
        ticketId: m.ticket_id,
        senderName: m.sender_name,
        senderRole: (m.sender_role as "foreman" | "boss" | "super_admin") || "foreman",
        message: m.message,
        createdAt: m.created_at,
      }))

      return {
        data: mapDBTicketToItem(ticketData as DBTicketRecord, messages),
        error: null,
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err))
      return { data: null, error }
    }
  },

  /**
   * Update status & resolution for a ticket.
   */
  async updateTicketStatus(
    id: string,
    status: TicketStatus,
    resolutionNotes?: string,
    resolvedBy?: string
  ): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured) {
      return { error: new Error("Supabase is not configured.") }
    }

    try {
      const payload: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
      }

      if (status === "resolved" || status === "closed") {
        payload.stage = "resolved_by_admin"
        payload.resolved_at = new Date().toISOString()
        if (resolvedBy) payload.resolved_by = resolvedBy
        if (resolutionNotes) payload.resolution_notes = resolutionNotes
      }

      const { error } = await supabase.from("support_tickets").update(payload).eq("id", id)

      if (error) {
        return { error: new Error(error.message) }
      }
      return { error: null }
    } catch (err: unknown) {
      return { error: err instanceof Error ? err : new Error(String(err)) }
    }
  },

  /**
   * Update priority.
   */
  async updateTicketPriority(id: string, priority: TicketPriority): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured) {
      return { error: new Error("Supabase is not configured.") }
    }

    try {
      const { error } = await supabase
        .from("support_tickets")
        .update({ priority, updated_at: new Date().toISOString() })
        .eq("id", id)

      if (error) return { error: new Error(error.message) }
      return { error: null }
    } catch (err: unknown) {
      return { error: err instanceof Error ? err : new Error(String(err)) }
    }
  },

  /**
   * Send a reply message to the ticket conversation.
   */
  async addTicketMessage(
    ticketId: string,
    message: string,
    senderName = "Super Admin",
    senderRole: "foreman" | "boss" | "super_admin" = "super_admin"
  ): Promise<{ data: SupportTicketMessage | null; error: Error | null }> {
    if (!isSupabaseConfigured) {
      return { data: null, error: new Error("Supabase is not configured.") }
    }

    try {
      const payload = {
        ticket_id: ticketId,
        sender_name: senderName,
        sender_role: senderRole,
        message: message.trim(),
      }

      const { data, error } = await supabase
        .from("support_ticket_messages")
        .insert(payload)
        .select()
        .single()

      if (error) return { data: null, error: new Error(error.message) }

      // Update ticket updated_at
      await supabase
        .from("support_tickets")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", ticketId)

      const msg: SupportTicketMessage = {
        id: data.id,
        ticketId: data.ticket_id,
        senderName: data.sender_name,
        senderRole: data.sender_role,
        message: data.message,
        createdAt: data.created_at,
      }

      return { data: msg, error: null }
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
    }
  },

  /**
   * Delete a ticket.
   */
  async deleteTicket(id: string): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured) {
      return { error: new Error("Supabase is not configured.") }
    }

    try {
      const { error } = await supabase.from("support_tickets").delete().eq("id", id)
      if (error) return { error: new Error(error.message) }
      return { error: null }
    } catch (err: unknown) {
      return { error: err instanceof Error ? err : new Error(String(err)) }
    }
  },
}
