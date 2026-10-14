import { supabase, isSupabaseConfigured, createIsolatedClient } from "@/lib/supabase"
import type {
  UserRecord,
  DBUserProfile,
  CreateUserInput,
  UpdateUserInput,
  UserFilters,
  UserStatus,
  UserRole,
  LanguagePreference,
} from "@/types"

/**
 * Maps Supabase snake_case profiles row to frontend UserRecord
 */
export function mapDBProfileToUserRecord(row: DBUserProfile): UserRecord {
  const assigned = Array.isArray(row.assigned_jobsites) ? row.assigned_jobsites : []

  return {
    id: row.id,
    email: row.email || "",
    fullName: row.full_name || "Unknown User",
    phone: row.phone || "",
    companyId: row.company_id || undefined,
    companyName: row.company_name || "General Contractor",
    role: (row.role as UserRole) || "foreman",
    status: (row.status === "inactive" || (row.status as string) === "deactivated") ? "inactive" : (row.status || "active"),
    languagePreference: (row.language_preference as LanguagePreference) || "en",
    assignedJobsites: assigned,
    avatarUrl: row.avatar_url || undefined,
    lastLoginAt: row.last_login_at || undefined,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || undefined,
    submissionsCount: 0,
  }
}

export const userService = {
  /**
   * Fetch users strictly from Supabase public.profiles with optional filters.
   * NO mock fallback.
   */
  async getUsers(filters?: UserFilters): Promise<{
    data: UserRecord[]
    error: Error | null
  }> {
    if (!isSupabaseConfigured) {
      const err = new Error("Supabase is not configured. Please verify your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.")
      console.error("[userService]", err.message)
      return { data: [], error: err }
    }

    try {
      let query = supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })

      if (filters?.role && filters.role !== "all") {
        query = query.eq("role", filters.role)
      }

      if (filters?.status && filters.status !== "all") {
        const dbStatus = filters.status === "deactivated" ? "inactive" : filters.status
        query = query.eq("status", dbStatus)
      }

      if (filters?.companyName && filters.companyName !== "all") {
        query = query.eq("company_name", filters.companyName)
      }

      const { data, error } = await query

      if (error) {
        console.error("[userService] Error querying public.profiles:", error.message)
        return { data: [], error: new Error(error.message) }
      }

      if (!data || data.length === 0) {
        return { data: [], error: null }
      }

      let users = (data as DBUserProfile[]).map(mapDBProfileToUserRecord)

      // Optional client-side search across fields
      if (filters?.search && filters.search.trim()) {
        const term = filters.search.toLowerCase().trim()
        users = users.filter(
          (u) =>
            u.fullName.toLowerCase().includes(term) ||
            u.email.toLowerCase().includes(term) ||
            u.companyName.toLowerCase().includes(term) ||
            u.phone.includes(term)
        )
      }

      return { data: users, error: null }
    } catch (err) {
      console.error("[userService] Unexpected error in getUsers:", err)
      return {
        data: [],
        error: err instanceof Error ? err : new Error("Failed to load users from Supabase"),
      }
    }
  },

  /**
   * Create a new user profile record directly in Supabase public.profiles.
   * NO mock fallback.
   */
  async createUser(input: CreateUserInput): Promise<{
    data: UserRecord | null
    error: Error | null
  }> {
    if (!isSupabaseConfigured) {
      return {
        data: null,
        error: new Error("Supabase is not configured. Cannot create user in database."),
      }
    }

    const newId = crypto.randomUUID ? crypto.randomUUID() : `usr-${Date.now()}`

    try {
      // 1. Generate clean temporary password
      const tempPassword = `RRM@${Math.floor(100000 + Math.random() * 900000)}!`

      // CRITICAL: Use isolated client without localStorage session persistence
      // so creating a user DOES NOT overwrite or log out the admin's session!
      const isolatedClient = createIsolatedClient()
      const { data: authData, error: authErr } = await isolatedClient.auth.signUp({
        email: input.email.trim().toLowerCase(),
        password: tempPassword,
        options: {
          data: {
            full_name: input.fullName.trim(),
            company_name: input.companyName || "General Contractor",
            role: input.role,
            phone: input.phone?.trim() || "",
            language_preference: input.languagePreference || "en",
          },
        },
      })

      if (authErr) {
        console.warn("[userService] Auth signup notice:", authErr.message)
      }

      const userId = authData?.user?.id || newId

      const payload: Partial<DBUserProfile> = {
        id: userId,
        email: input.email.trim().toLowerCase(),
        full_name: input.fullName.trim(),
        phone: input.phone?.trim() || "",
        company_id: input.companyId || null,
        company_name: input.companyName || "General Contractor",
        role: input.role,
        status: input.status || "active",
        language_preference: input.languagePreference || "en",
        assigned_jobsites: input.assignedJobsites || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // 2. Ensure profile record is inserted/updated in profiles table
      const { data, error } = await supabase
        .from("profiles")
        .upsert(payload)
        .select()
        .single()

      if (error && !authData?.user) {
        console.error("[userService] Error inserting profile:", error.message)
        return { data: null, error: new Error(error.message) }
      }

      // 3. Dispatch Email with credentials via Supabase Edge Function (or local fallback)
      try {
        const emailPayload = {
          to: input.email.trim().toLowerCase(),
          fullName: input.fullName.trim(),
          temporaryPassword: tempPassword,
          role: input.role,
          companyName: input.companyName,
          appUrl: "https://service-safety.pages.dev/login",
        }

        // Try Supabase Edge Function first
        const { error: fnErr } = await supabase.functions.invoke("send-email", {
          body: emailPayload,
        })

        // If Edge function is not deployed yet or returns error, fallback to local Vite email API
        if (fnErr) {
          await fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(emailPayload),
          })
        }
      } catch (mailErr) {
        console.warn("[userService] Background email dispatch notice:", mailErr)
      }

      const userRecord = mapDBProfileToUserRecord((data as DBUserProfile) || payload)
      // Attach temporary password for UI toast / confirmation dialog
      ;(userRecord as unknown as Record<string, unknown>).temporaryPassword = tempPassword

      return {
        data: userRecord,
        error: null,
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error("Failed to create user in database"),
      }
    }
  },

  /**
   * Update an existing user strictly in Supabase public.profiles.
   * NO mock fallback.
   */
  async updateUser(
    id: string,
    updates: UpdateUserInput
  ): Promise<{ data: UserRecord | null; error: Error | null }> {
    if (!isSupabaseConfigured) {
      return {
        data: null,
        error: new Error("Supabase is not configured. Cannot update user in database."),
      }
    }

    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (updates.fullName !== undefined) payload.full_name = updates.fullName
    if (updates.phone !== undefined) payload.phone = updates.phone
    if (updates.companyId !== undefined) payload.company_id = updates.companyId
    if (updates.companyName !== undefined) payload.company_name = updates.companyName
    if (updates.role !== undefined) payload.role = updates.role
    if (updates.status !== undefined) payload.status = updates.status
    if (updates.languagePreference !== undefined) payload.language_preference = updates.languagePreference
    if (updates.assignedJobsites !== undefined) payload.assigned_jobsites = updates.assignedJobsites
    if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("[userService] Error updating profile:", error.message)
        return { data: null, error: new Error(error.message) }
      }

      return {
        data: mapDBProfileToUserRecord(data as DBUserProfile),
        error: null,
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error("Failed to update user in database"),
      }
    }
  },

  /**
   * Toggle user active/inactive status in Supabase public.profiles.
   * NO mock fallback.
   */
  async toggleUserStatus(
    id: string,
    newStatus: UserStatus
  ): Promise<{ success: boolean; error: Error | null }> {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        error: new Error("Supabase is not configured. Cannot toggle status."),
      }
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) {
        console.error("[userService] Error toggling status:", error.message)
        return { success: false, error: new Error(error.message) }
      }

      return { success: true, error: null }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err : new Error("Failed to update status in database"),
      }
    }
  },

  /**
   * Trigger password reset link via Supabase Auth.
   * NO mock fallback.
   */
  async sendPasswordReset(email: string): Promise<{ success: boolean; error: Error | null }> {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        error: new Error("Supabase is not configured. Cannot send password reset."),
      }
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase())
      if (error) {
        return { success: false, error: new Error(error.message) }
      }
      return { success: true, error: null }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err : new Error("Failed to dispatch reset email"),
      }
    }
  },

  /**
   * Delete user directly from Supabase public.profiles.
   * NO mock fallback.
   */
  async deleteUser(id: string): Promise<{ success: boolean; error: Error | null }> {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        error: new Error("Supabase is not configured. Cannot delete user."),
      }
    }

    try {
      const { error } = await supabase.from("profiles").delete().eq("id", id)
      if (error) {
        console.error("[userService] Error deleting profile:", error.message)
        return { success: false, error: new Error(error.message) }
      }
      return { success: true, error: null }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err : new Error("Failed to delete user in database"),
      }
    }
  },

  /**
   * Realtime subscription for Supabase public.profiles
   */
  subscribeToProfiles(onChange: () => void): () => void {
    if (!isSupabaseConfigured) {
      return () => {}
    }

    const channel = supabase
      .channel("realtime-profiles-sync")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
        },
        () => {
          onChange()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },
}
