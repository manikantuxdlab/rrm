import { supabase } from "@/lib/supabase"
import type { ClientCompany } from "@/types"

const fromRow = (r: any): ClientCompany => ({
  id: r.id,
  name: r.name,
  trade: r.trade,
  contactPerson: r.contact_person ?? "",
  contactPhone: r.contact_phone ?? "",
  routingEmail: r.routing_email ?? "",
  policyNumber: r.policy_number ?? "",
  policyExpires: r.policy_expires ?? "",
  safetyScore: r.safety_score,
  status: r.status,
  activeJobsCount: 0,
  usersCount: 0,
} as ClientCompany)

const toRow = (c: Partial<ClientCompany>) => ({
  name: c.name,
  trade: c.trade,
  contact_person: c.contactPerson,
  contact_phone: c.contactPhone,
  routing_email: c.routingEmail,
  policy_number: c.policyNumber,
  policy_expires: c.policyExpires || null,
  safety_score: c.safetyScore,
  status: c.status,
})

export async function fetchCompanies() {
  const { data, error } = await supabase
    .from("companies").select("*").order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []).map(fromRow)
}

export async function createCompany(c: Partial<ClientCompany>) {
  const { data, error } = await supabase
    .from("companies").insert(toRow(c)).select().single()
  if (error) throw error
  return fromRow(data)
}

export async function updateCompany(id: string, c: Partial<ClientCompany>) {
  const { data, error } = await supabase
    .from("companies").update(toRow(c)).eq("id", id).select().single()
  if (error) throw error
  return fromRow(data)
}

export async function deleteCompany(id: string) {
  const { error } = await supabase.from("companies").delete().eq("id", id)
  if (error) throw error
}