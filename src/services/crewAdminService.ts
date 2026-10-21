import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import type { Worker } from "@/types"

const DEFAULT_TRADES = [
  "Journeyman Carpenter",
  "Concrete Finisher",
  "Ironworker / Rigger",
  "Scaffold Erector",
  "Crane / Heavy Operator",
  "Apprentice Laborer",
  "Electrician",
  "Welder / Fabricator",
  "Mason / Bricklayer",
]

const STARTER_WORKERS: Worker[] = [
  {
    id: "w-01",
    name: "Carlos Mendez",
    role: "Journeyman Concrete Finisher",
    phone: "(213) 555-4011",
    trade: "Concrete & Masonry",
    jobSiteId: "job-101",
    active: true,
    documentUrl: null,
    certifications: [
      { name: "OSHA 30 Construction", issuedDate: "2024-03-15", expiresDate: "2027-03-15", status: "valid" },
      { name: "First Aid & CPR/AED", issuedDate: "2025-05-10", expiresDate: "2027-05-10", status: "valid" },
      { name: "Rough Terrain Forklift (Telehandler)", issuedDate: "2023-10-20", expiresDate: "2026-10-20", status: "expiring_soon" },
    ],
  },
  {
    id: "w-02",
    name: "Jose Luis Ramirez",
    role: "Concrete Pump Operator",
    phone: "(323) 555-8912",
    trade: "Concrete & Masonry",
    jobSiteId: "job-101",
    active: true,
    documentUrl: null,
    certifications: [
      { name: "Concrete Pump Safety Certified (ACPA)", issuedDate: "2024-01-18", expiresDate: "2027-01-18", status: "valid" },
      { name: "OSHA 10 Construction", issuedDate: "2023-04-12", expiresDate: "2028-04-12", status: "valid" },
    ],
  },
  {
    id: "w-03",
    name: "Mateo Gutierrez",
    role: "Rebar & Formwork Specialist",
    phone: "(818) 555-2384",
    trade: "Concrete & Masonry",
    jobSiteId: "job-102",
    active: true,
    documentUrl: null,
    certifications: [
      { name: "Competent Person: Fall Protection", issuedDate: "2024-06-01", expiresDate: "2026-06-01", status: "expiring_soon" },
      { name: "OSHA 30 Construction", issuedDate: "2023-08-11", expiresDate: "2026-08-11", status: "valid" },
    ],
  },
  {
    id: "w-04",
    name: "Hector Morales",
    role: "Journeyman Carpenter / Scaffold Erector",
    phone: "(626) 555-7193",
    trade: "Concrete & Masonry",
    jobSiteId: "job-102",
    active: true,
    documentUrl: null,
    certifications: [
      { name: "OSHA 10 Construction", issuedDate: "2024-09-05", expiresDate: "2029-09-05", status: "valid" },
      { name: "Aerial Boom & Scissor Lift", issuedDate: "2023-11-12", expiresDate: "2026-11-12", status: "valid" },
    ],
  },
]

export interface CreateWorkerInput {
  name: string;
  role: string;
  trade: string;
  phone?: string;
  companyName: string;
  jobSiteId?: string | null;
  foremanId?: string | null;
  foremanName?: string | null;
  active?: boolean;
  certifications?: { name: string; issuedDate: string; expiresDate: string; status: any }[];
}

export const crewAdminService = {
  /**
   * Fetch all crew workers for the company from Supabase.
   * Returns only real registered workers (empty array if none exist yet).
   */
  async fetchAll(): Promise<Worker[]> {
    if (!isSupabaseConfigured) return []
    try {
      const { data, error } = await supabase
        .from("workers")
        .select("*")
        .order("name", { ascending: true })

      if (error) {
        console.warn("[crewAdminService] Fetch notice:", error.message)
        return []
      }

      if (!data || data.length === 0) {
        return []
      }

      return data.map((row: any) => ({
        id: row.id,
        name: row.name,
        role: row.role || "Worker",
        phone: row.phone || "",
        trade: row.trade || "General",
        companyName: row.company_name || "General Contractor",
        foremanId: row.foreman_id || null,
        foremanName: row.foreman_name || null,
        jobSiteId: row.job_site_id || null,
        active: Boolean(row.active),
        documentUrl: row.document_url || null,
        certifications: row.certifications || [],
      }))
    } catch (err) {
      console.error("[crewAdminService] Error fetching crew:", err)
      return []
    }
  },

  /**
   * Seeds starter crew workers into Supabase
   */
  async seedDefaultWorkers(): Promise<void> {
    if (!isSupabaseConfigured) return
    try {
      const rows = STARTER_WORKERS.map((w) => ({
        id: w.id,
        company_name: (w as any).companyName || 'General Contractor',
        foreman_id: (w as any).foremanId || null,
        foreman_name: (w as any).foremanName || null,
        job_site_id: w.jobSiteId || "job-101",
        name: w.name,
        role: w.role,
        trade: w.trade,
        phone: w.phone,
        active: w.active,
        certifications: w.certifications,
      }))
      const { error } = await supabase.from("workers").upsert(rows, { onConflict: "id" })
      if (error) {
        console.error("[crewAdminService] Seed failed:", error.message)
      }
    } catch (e) {
      console.error("[crewAdminService] Seeding error:", e)
    }
  },

  /**
   * Insert or update a worker in Supabase public.workers table
   */
  async insertWorker(worker: Worker): Promise<boolean> {
    if (!isSupabaseConfigured) return true
    try {
      const payload: any = {
        id: worker.id,
        company_name: (worker as any).companyName || 'General Contractor',
        foreman_id: (worker as any).foremanId || null,
        foreman_name: (worker as any).foremanName || null,
        name: worker.name,
        role: worker.role,
        trade: worker.trade,
        job_site_id: worker.jobSiteId,
        phone: worker.phone,
        active: worker.active,
        document_url: worker.documentUrl || null,
        certifications: worker.certifications,
      }
      const { error } = await supabase.from("workers").upsert(payload, { onConflict: "id" })
      if (error) {
        console.error("[crewAdminService] Insert worker failed:", error.message)
        return false
      }
      return true
    } catch (err) {
      console.error("[crewAdminService] Error adding worker:", err)
      return false
    }
  },

  /**
   * Bulk insert workers into Supabase public.workers table
   */
  async bulkInsertWorkers(workers: Worker[]): Promise<{ count: number; error?: string }> {
    if (!isSupabaseConfigured) return { count: workers.length }
    try {
      const rows = workers.map((w) => ({
        id: w.id,
        company_name: (w as any).companyName || 'General Contractor',
        foreman_id: (w as any).foremanId || null,
        foreman_name: (w as any).foremanName || null,
        name: w.name,
        role: w.role,
        trade: w.trade,
        job_site_id: w.jobSiteId || "job-101",
        phone: w.phone || "",
        active: w.active !== false,
        document_url: w.documentUrl || null,
        certifications: w.certifications || [],
      }))
      const { error } = await supabase.from("workers").upsert(rows, { onConflict: "id" })
      if (error) {
        console.error("[crewAdminService] Bulk insert failed:", error.message)
        return { count: 0, error: error.message }
      }
      return { count: workers.length }
    } catch (err: any) {
      console.error("[crewAdminService] Bulk insert error:", err)
      return { count: 0, error: err?.message || "Failed to import workers" }
    }
  },

  /**
   * Update an existing worker in Supabase public.workers table
   */
  async updateWorker(worker: Worker): Promise<boolean> {
    if (!isSupabaseConfigured) return true
    try {
      const payload: any = {
        name: worker.name,
        role: worker.role,
        trade: worker.trade,
        job_site_id: worker.jobSiteId,
        phone: worker.phone,
        active: worker.active,
        document_url: worker.documentUrl || null,
        certifications: worker.certifications,
      }
      const { error } = await supabase.from("workers").update(payload).eq("id", worker.id)
      if (error) {
        console.error("[crewAdminService] Update worker failed:", error.message)
        return false
      }
      return true
    } catch (err) {
      console.error("[crewAdminService] Error updating worker:", err)
      return false
    }
  },

  /**
   * Delete a worker from Supabase public.workers table
   */
  async deleteWorker(workerId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true
    try {
      const { error } = await supabase.from("workers").delete().eq("id", workerId)
      if (error) {
        console.error("[crewAdminService] Delete worker error:", error.message)
        return false
      }
      return true
    } catch (err) {
      console.error("[crewAdminService] Error deleting worker:", err)
      return false
    }
  },

  /**
   * Fetch dynamic list of company trades from Supabase company_trades table
   */
  async fetchCompanyTrades(companyName: string): Promise<string[]> {
    if (!isSupabaseConfigured) return DEFAULT_TRADES
    try {
      const { data, error } = await supabase
        .from("company_trades")
        .select("trade_name")
        .eq("company_name", companyName)
        .order("trade_name", { ascending: true })

      if (error || !data || data.length === 0) {
        return DEFAULT_TRADES
      }

      const dbTrades = data.map((row: any) => row.trade_name)
      return Array.from(new Set([...DEFAULT_TRADES, ...dbTrades]))
    } catch (err) {
      console.warn("[crewAdminService] Notice fetching trades:", err)
      return DEFAULT_TRADES
    }
  },

  /**
   * Save a newly created custom trade to Supabase company_trades table
   */
  async addCompanyTrade(companyName: string, tradeName: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true
    try {
      const { error } = await supabase.from("company_trades").upsert(
        {
          company_name: companyName,
          trade_name: tradeName,
        },
        { onConflict: "company_name,trade_name" }
      )
      if (error) {
        console.warn("[crewAdminService] Add trade notice:", error.message)
        return false
      }
      return true
    } catch (err) {
      console.warn("[crewAdminService] Error saving trade:", err)
      return false
    }
  },

  /**
   * Upload worker photo or certification document to Supabase Storage bucket 'worker-documents'
   * Returns the public or signed URL of the uploaded document.
   */
  async uploadWorkerDocument(workerId: string, file: File): Promise<string | null> {
    if (!isSupabaseConfigured) return file.name
    try {
      const bucketName = "worker-documents"

      // 1. Ensure bucket exists automatically, create if missing
      try {
        await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 10485760, // 10MB limit
        })
      } catch {
        // Bucket might already exist or handled by RLS, proceed safely
      }

      const fileExt = file.name.split(".").pop() || "pdf"
      const fileName = `${workerId}_${Date.now()}.${fileExt}`
      const filePath = `certs/${fileName}`

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        })

      if (error) {
        console.warn("[crewAdminService] Storage upload notice:", error.message)
        return file.name
      }

      // Get public URL of the uploaded document
      const { data: urlData } = supabase.storage
        .from("worker-documents")
        .getPublicUrl(data.path)

      return urlData?.publicUrl || file.name
    } catch (err) {
      console.warn("[crewAdminService] Error uploading file:", err)
      return file.name
    }
  },
  async fetchForemenList(companyName?: string): Promise<{ id: string; fullName: string; email: string; companyName: string }[]> {
    if (!isSupabaseConfigured) return []
    try {
      let query = supabase.from('profiles').select('id, full_name, email, company_name').eq('role', 'foreman')
      if (companyName && companyName !== 'all') {
        query = query.eq('company_name', companyName)
      }
      const { data, error } = await query
      if (error) return []
      return (data || []).map((p: any) => ({
        id: p.id,
        fullName: p.full_name || p.email?.split('@')[0] || 'Foreman',
        email: p.email || '',
        companyName: p.company_name || '',
      }))
    } catch {
      return []
    }
  },
}