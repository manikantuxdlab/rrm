import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import type { FAQItem, FAQCategory, FAQTargetAudience } from "@/types"

export interface DBFaqRecord {
  id: string
  question: string
  answer: string
  category: string
  target_audience: string
  order_index: number
  status: string
  created_by?: string | null
  created_at?: string
  updated_at?: string
}

export function mapDBFaqToItem(row: DBFaqRecord): FAQItem {
  return {
    id: row.id,
    question: row.question || "",
    answer: row.answer || "",
    category: (row.category as FAQCategory) || "general",
    targetAudience: (row.target_audience as FAQTargetAudience) || "all",
    orderIndex: Number(row.order_index ?? 0),
    status: (row.status as "published" | "draft" | "archived") || "published",
    updatedAt: row.updated_at ? row.updated_at.split("T")[0] : new Date().toISOString().split("T")[0],
    createdByName: "Administrator",
  }
}

export const faqService = {
  /**
   * Fetch FAQs directly from Supabase public.faqs.
   * NO fallback, NO mock data, strictly Supabase.
   */
  async getFaqs(): Promise<{ data: FAQItem[]; error: Error | null }> {
    if (!isSupabaseConfigured) {
      return { data: [], error: new Error("Supabase is not configured.") }
    }

    try {
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .order("order_index", { ascending: true })

      if (error) {
        console.error("[faqService.getFaqs]", error)
        return { data: [], error: new Error(error.message) }
      }

      return {
        data: (data || []).map((row) => mapDBFaqToItem(row as DBFaqRecord)),
        error: null,
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err))
      console.error("[faqService.getFaqs exception]", error)
      return { data: [], error }
    }
  },

  /**
   * Insert a new FAQ into Supabase.
   */
  async createFaq(faq: Omit<FAQItem, "id" | "updatedAt">): Promise<{ data: FAQItem | null; error: Error | null }> {
    if (!isSupabaseConfigured) {
      return { data: null, error: new Error("Supabase is not configured.") }
    }

    try {
      const { data: authData } = await supabase.auth.getUser()

      const payload = {
        question: faq.question.trim(),
        answer: faq.answer.trim(),
        category: faq.category,
        target_audience: faq.targetAudience,
        order_index: Number(faq.orderIndex ?? 1),
        status: faq.status,
        created_by: authData?.user?.id || null,
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from("faqs")
        .insert(payload)
        .select()
        .single()

      if (error) {
        console.error("[faqService.createFaq]", error)
        return { data: null, error: new Error(error.message) }
      }

      return {
        data: mapDBFaqToItem(data as DBFaqRecord),
        error: null,
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err))
      console.error("[faqService.createFaq exception]", error)
      return { data: null, error }
    }
  },

  /**
   * Update an existing FAQ in Supabase.
   */
  async updateFaq(
    id: string,
    updates: Partial<Omit<FAQItem, "id">>
  ): Promise<{ data: FAQItem | null; error: Error | null }> {
    if (!isSupabaseConfigured) {
      return { data: null, error: new Error("Supabase is not configured.") }
    }

    try {
      const payload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      }

      if (updates.question !== undefined) payload.question = updates.question.trim()
      if (updates.answer !== undefined) payload.answer = updates.answer.trim()
      if (updates.category !== undefined) payload.category = updates.category
      if (updates.targetAudience !== undefined) payload.target_audience = updates.targetAudience
      if (updates.orderIndex !== undefined) payload.order_index = Number(updates.orderIndex)
      if (updates.status !== undefined) payload.status = updates.status

      const { data, error } = await supabase
        .from("faqs")
        .update(payload)
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("[faqService.updateFaq]", error)
        return { data: null, error: new Error(error.message) }
      }

      return {
        data: mapDBFaqToItem(data as DBFaqRecord),
        error: null,
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err))
      console.error("[faqService.updateFaq exception]", error)
      return { data: null, error }
    }
  },

  /**
   * Delete an FAQ from Supabase.
   */
  async deleteFaq(id: string): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured) {
      return { error: new Error("Supabase is not configured.") }
    }

    try {
      const { error } = await supabase
        .from("faqs")
        .delete()
        .eq("id", id)

      if (error) {
        console.error("[faqService.deleteFaq]", error)
        return { error: new Error(error.message) }
      }

      return { error: null }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err))
      console.error("[faqService.deleteFaq exception]", error)
      return { error }
    }
  },
}
