import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import type { JobSite, ChecklistItem } from "@/types"
import { MOCK_DAILY_CHECKLIST_ITEMS } from "@/data/safetyMockData"

const mapRow = (r: any): JobSite => ({
  id: r.id,
  name: r.name,
  jobNumber: r.job_number,
  companyName: r.company_name,
  address: r.address || "",
  cityStateZip: r.city_state_zip || "",
  superintendent: r.superintendent || "",
  superPhone: r.super_phone || "",
  gcCompany: r.gc_company || "",
  gcContact: r.gc_contact || "",
  gcPhone: r.gc_phone || "",
  gcEmail: r.gc_email || "",
  trade: r.trade || "",
  status: (r.status || "active") as JobSite["status"],
  emergencyHospital: {
    name: r.emergency_hospital?.name || "",
    address: r.emergency_hospital?.address || "",
    phone: r.emergency_hospital?.phone || "",
    distanceMiles: r.emergency_hospital?.distanceMiles ?? 0,
  },
  urgentCare: {
    name: r.urgent_care?.name || "",
    address: r.urgent_care?.address || "",
    phone: r.urgent_care?.phone || "",
  },
  musterPoint: r.muster_point || "",
  utilityEmergency: r.utility_emergency || "",
  accessGateInstructions: r.access_gate_instructions || "",
  activeCrewCount: r.active_crew_count || 0,
})

export const jobsitesService = {
  async fetchAll(): Promise<JobSite[]> {
    if (!isSupabaseConfigured) {
      console.error("[jobsitesService] Supabase not configured in .env")
      return []
    }
    const { data, error } = await supabase
      .from("jobsites")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) {
      console.error("[jobsitesService] Error fetching jobsites from Supabase:", error.message)
      throw error
    }
    return (data ?? [])
      .filter((r: any) => r.id !== "global-checklist-template")
      .map(mapRow)
  },

  async upsert(site: JobSite): Promise<{ ok: boolean; error?: string }> {
    if (!isSupabaseConfigured) return { ok: false, error: "Supabase not configured in .env" }
    
    const { error } = await supabase.from("jobsites").upsert({
      id: site.id,
      name: site.name,
      job_number: site.jobNumber,
      company_name: site.companyName,
      address: site.address,
      city_state_zip: site.cityStateZip,
      superintendent: site.superintendent,
      super_phone: site.superPhone,
      gc_company: site.gcCompany,
      gc_contact: site.gcContact,
      gc_phone: site.gcPhone,
      gc_email: site.gcEmail,
      trade: site.trade,
      status: site.status,
      emergency_hospital: site.emergencyHospital,
      urgent_care: site.urgentCare,
      muster_point: site.musterPoint,
      utility_emergency: site.utilityEmergency,
      access_gate_instructions: site.accessGateInstructions || null,
      active_crew_count: site.activeCrewCount,
      updated_at: new Date().toISOString(),
    })
    
    if (error) {
      console.error("[jobsitesService] Upsert error:", error.message)
      return { ok: false, error: error.message }
    }
    return { ok: true }
  },

  async remove(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false
    const { error } = await supabase.from("jobsites").delete().eq("id", id)
    if (error) {
      console.error("[jobsitesService] Remove error:", error.message)
      return false
    }
    return true
  },

  async fetchCompanyNames(): Promise<string[]> {
    if (!isSupabaseConfigured) return []
    const { data, error } = await supabase
      .from("profiles")
      .select("company_name")
      .not("company_name", "is", null)
    if (error) {
      console.error("[jobsitesService] fetchCompanyNames error:", error.message)
      return []
    }
    return [...new Set((data ?? []).map((r: any) => r.company_name as string))].sort()
  },

  async fetchChecklist(jobsiteId: string): Promise<ChecklistItem[]> {
    if (!isSupabaseConfigured) return MOCK_DAILY_CHECKLIST_ITEMS
    try {
      if (jobsiteId === "global") {
        const { data } = await supabase
          .from("jobsites")
          .select("emergency_hospital")
          .eq("id", "global-checklist-template")
          .maybeSingle()
        if (data?.emergency_hospital?.customChecklist?.length) {
          return data.emergency_hospital.customChecklist
        }
        return MOCK_DAILY_CHECKLIST_ITEMS
      }

      // Fetch site specific checklist
      const { data } = await supabase
        .from("jobsites")
        .select("emergency_hospital")
        .eq("id", jobsiteId)
        .maybeSingle()

      if (data?.emergency_hospital?.customChecklist?.length) {
        return data.emergency_hospital.customChecklist
      }

      // Fallback to global template
      const { data: globalData } = await supabase
        .from("jobsites")
        .select("emergency_hospital")
        .eq("id", "global-checklist-template")
        .maybeSingle()

      if (globalData?.emergency_hospital?.customChecklist?.length) {
        return globalData.emergency_hospital.customChecklist
      }

      return MOCK_DAILY_CHECKLIST_ITEMS
    } catch (e) {
      console.error("[jobsitesService] Error fetching checklist:", e)
      return MOCK_DAILY_CHECKLIST_ITEMS
    }
  },

  async saveChecklist(jobsiteId: string, items: ChecklistItem[]): Promise<{ ok: boolean; error?: string }> {
    if (!isSupabaseConfigured) return { ok: false, error: "Supabase not configured" }
    try {
      if (jobsiteId === "global") {
        const { data: existing } = await supabase
          .from("jobsites")
          .select("emergency_hospital")
          .eq("id", "global-checklist-template")
          .maybeSingle()

        const currentHospital = existing?.emergency_hospital || {}
        const { error } = await supabase.from("jobsites").upsert({
          id: "global-checklist-template",
          name: "Global Default Checklist Template",
          job_number: "GLOBAL-TEMPLATE",
          company_name: "All Contractors",
          status: "active",
          emergency_hospital: {
            ...currentHospital,
            customChecklist: items,
          },
          updated_at: new Date().toISOString(),
        })
        if (error) throw error
        return { ok: true }
      }

      // Site specific
      const { data: site } = await supabase
        .from("jobsites")
        .select("emergency_hospital")
        .eq("id", jobsiteId)
        .maybeSingle()

      const currentHospital = site?.emergency_hospital || {}
      const { error } = await supabase
        .from("jobsites")
        .update({
          emergency_hospital: {
            ...currentHospital,
            customChecklist: items,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobsiteId)

      if (error) throw error
      return { ok: true }
    } catch (e: any) {
      console.error("[jobsitesService] saveChecklist error:", e)
      return { ok: false, error: e?.message || "Failed to save checklist" }
    }
  },
}
