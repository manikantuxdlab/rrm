import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import type { JobSite } from "@/types"

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
    if (!isSupabaseConfigured) return []
    const { data, error } = await supabase
      .from("jobsites")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) throw error
    return (data ?? []).map(mapRow)
  },

  async upsert(site: JobSite): Promise<{ ok: boolean; error?: string }> {
    if (!isSupabaseConfigured) return { ok: false, error: "Supabase not configured" }
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
    return error ? { ok: false, error: error.message } : { ok: true }
  },

  async remove(id: string): Promise<boolean> {
    const { error } = await supabase.from("jobsites").delete().eq("id", id)
    return !error
  },

  async fetchCompanyNames(): Promise<string[]> {
    const { data, error } = await supabase
      .from("profiles")
      .select("company_name")
      .not("company_name", "is", null)
    if (error) throw error
    return [...new Set((data ?? []).map((r: any) => r.company_name as string))].sort()
  },
}