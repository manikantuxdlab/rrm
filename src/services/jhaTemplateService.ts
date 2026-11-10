import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { MOCK_JHA_TEMPLATES } from "@/data/safetyMockData"

export interface DynamicJHATemplate {
  id: string
  activity: string
  trade: string
  oshaStandard?: string
  hazards: string[]
  requiredPPE: string[]
  controlMeasures: string[]
  status: "active" | "inactive"
  createdAt?: string
  updatedAt?: string
  createdBy?: string
}

// Initial core seeds to populate if database is currently empty
const INITIAL_SEEDS: Omit<DynamicJHATemplate, "id">[] = [
  {
    activity: "Deep Foundation Trenching & Footing Excavation",
    trade: "Excavation & Earthwork",
    oshaStandard: "Cal/OSHA Title 8 § 1541 & 29 CFR 1926 Subpart P",
    hazards: [
      "Trench wall cave-in or soil collapse burying workers",
      "Struck-by hydraulic excavator boom or bucket swing radius",
      "Underground utility strike (high-pressure gas line, electrical feed)",
      "Hazardous atmospheric accumulation in deep trench (> 4 ft)",
      "Water accumulation undermining trench shoring stability",
    ],
    requiredPPE: [
      "Hard Hat (ANSI Z89.1 Type 1/2 with chin strap)",
      "High-Visibility Class 3 vest with reflective striping",
      "Heavy duty waterproof leather work boots with steel/composite toe",
      "Safety glasses (ANSI Z87.1) and cut-resistant Level A4 gloves",
      "4-Gas atmospheric monitor for confined trenches",
    ],
    controlMeasures: [
      "811 DigAlert ticket verified active with utility paint markings visible",
      "Competent person daily soil classification and pre-shift trench inspection",
      "Engineered trench box shield or 1.5:1 sloping installed for trenches > 5 ft",
      "Access ladders placed within 25 ft of lateral travel, extending 3 ft above lip",
      "Excavator tracks and spoil pile maintained minimum 2 ft back from trench edge",
    ],
    status: "active",
  },
  {
    activity: "Elevated Deck Concrete Placement & Pumping",
    trade: "Concrete & Masonry",
    oshaStandard: "Cal/OSHA Title 8 § 1712 & 29 CFR 1926.700",
    hazards: [
      "High-pressure concrete slickline hose whip causing blunt trauma or fall",
      "Caustic wet alkaline concrete contact causing severe skin/eye chemical burns",
      "Leading edge fall hazard during perimeter placement (> 6 ft elevation)",
      "Tripping and impalement risks over dense rebar mats and embedded conduits",
      "Formwork blowout or shoring failure under hydraulic concrete head pressure",
    ],
    requiredPPE: [
      "Hard Hat (ANSI Z89.1 Type 1)",
      "Sealed safety goggles + clear polycarbonate face shield for hose man",
      "Waterproof heavy rubber work boots with steel safety toe",
      "Heavy-duty waterproof nitrile/PVC gauntlet chemical gloves",
      "Full body fall arrest harness with self-retracting lifeline (SRL)",
      "Hearing protection (earplugs/muffs) near pump hopper",
    ],
    controlMeasures: [
      "Safety whip-check cables and cotter pins secured across all line couplings",
      "Hose man tied off 100% to certified anchorage when within 6 ft of deck edge",
      "Fresh potable water emergency wash station operational on active pour deck",
      "Continuous two-way radio communication between nozzle crew and pump operator",
      "Competent shoring inspector monitors formwork gauges during pump discharge",
    ],
    status: "active",
  },
  {
    activity: "Commercial Flat & Sloped Roofing Installation",
    trade: "Roofing & Waterproofing",
    oshaStandard: "Cal/OSHA Title 8 § 1730 & 29 CFR 1926.502",
    hazards: [
      "Leading edge fall hazard from roof perimeter (> 15 ft fall distance)",
      "Unprotected roof opening / skylight penetration drop hazard",
      "Thermal burn hazard from hot asphalt kettle and torch-down membrane",
      "Material hoist and boom truck swing radius pinch points at roof edge",
      "Heat stress, dehydration, and sun radiation on reflective deck",
    ],
    requiredPPE: [
      "Hard Hat with chinstrap for high wind exposure",
      "Full body harness with trailing rope grab or leading-edge SRL",
      "High-temperature thermal burn gauntlet gloves for hot work",
      "Slip-resistant roofing work boots with puncture-resistant soles",
      "UV-blocking safety glasses and neck protection sun shroud",
    ],
    controlMeasures: [
      "Continuous warning line system with stanchions erected 6 ft back from edge",
      "All roof penetrations and skylight curbs covered with secured 3/4\" plywood marked 'HOLE'",
      "Dedicated safety monitor assigned when working outside warning lines",
      "10 lb ABC fire extinguisher stationed within 10 ft of all open flame torch work",
      "Hydration shade canopy and mandatory 15-minute cool-down breaks scheduled",
    ],
    status: "active",
  },
  {
    activity: "Structural Steel Crane Erection & Critical Tandem Lift",
    trade: "Crane & Heavy Rigging",
    oshaStandard: "Cal/OSHA Title 8 § 5000 & 29 CFR 1926.1400",
    hazards: [
      "Uncontrolled suspended load swing, rigging failure, or wire rope snapping",
      "Crane overturning or outrigger ground subsidence under dynamic load",
      "Electrocution from crane boom or hoist cable contacting overhead power lines",
      "Pinch point and crush hazards between swinging steel columns and structure",
      "Worker fall from height while connecting structural steel beams",
    ],
    requiredPPE: [
      "ANSI Type II Hard Hat with 4-point chin strap",
      "Full body positioning harness with dual 6-ft shock-absorbing lanyards",
      "High-dexterity cut level A5 leather palm rigging gloves",
      "High-visibility Class 3 harness vest with integrated D-ring pass-through",
      "Steel toe puncture-resistant metatarsal guard work boots",
    ],
    controlMeasures: [
      "Critical lift plan calculated and signed by licensed PE for loads > 75% capacity",
      "Ground bearing pressure verified with hardwood crane outrigger timber mats",
      "Minimum 20-foot dedicated clearance boundary enforced from high-voltage lines",
      "Designated certified signal person in high-vis vest communicating via two-way radio",
      "Tag lines attached to all structural members to prevent hand contact during swing",
    ],
    status: "active",
  },
]

export const jhaTemplateService = {
  /**
   * Fetch all JHA templates from Supabase.
   * Auto-seeds initial templates into database if table has 0 templates.
   */
  async fetchAll(): Promise<DynamicJHATemplate[]> {
    if (!isSupabaseConfigured) {
      return MOCK_JHA_TEMPLATES.map((t) => ({ ...t, status: "active" as const }))
    }

    try {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("module_type", "jha_template")
        .order("created_at", { ascending: true })

      if (error) {
        console.error("[jhaTemplateService] Error fetching templates:", error.message)
        return MOCK_JHA_TEMPLATES.map((t) => ({ ...t, status: "active" as const }))
      }

      // If empty in Supabase, seed initial templates immediately
      if (!data || data.length === 0) {
        console.log("[jhaTemplateService] No templates in database. Seeding initial OSHA templates...")
        const seeded = await this.seedInitialTemplates()
        return seeded
      }

      return data.map((row: any) => {
        const d = row.data || {}
        return {
          id: row.id,
          activity: d.activity || row.title,
          trade: d.trade || "Specialty Construction",
          oshaStandard: d.oshaStandard || "Cal/OSHA Title 8",
          hazards: Array.isArray(d.hazards) ? d.hazards : [],
          requiredPPE: Array.isArray(d.requiredPPE) ? d.requiredPPE : [],
          controlMeasures: Array.isArray(d.controlMeasures) ? d.controlMeasures : [],
          status: d.status === "inactive" ? "inactive" : "active",
          createdAt: row.created_at,
          updatedAt: d.updatedAt,
          createdBy: row.foreman_name,
        }
      })
    } catch (err) {
      console.error("[jhaTemplateService] Exception in fetchAll:", err)
      return MOCK_JHA_TEMPLATES.map((t) => ({ ...t, status: "active" as const }))
    }
  },

  /**
   * Fetch only active templates for mobile field crews
   */
  async fetchActive(): Promise<DynamicJHATemplate[]> {
    const all = await this.fetchAll()
    return all.filter((t) => t.status !== "inactive")
  },

  /**
   * Create a new dynamic JHA template in Supabase
   */
  async create(template: Omit<DynamicJHATemplate, "id">): Promise<DynamicJHATemplate | null> {
    if (!isSupabaseConfigured) return null

    try {
      const id = `tpl-${Date.now()}`
      const payload = {
        id,
        module_type: "jha_template",
        title: template.activity,
        company_name: "Reliable Risk Management",
        foreman_name: "Super Admin",
        foreman_email: "admin@rrm-safety.com",
        job_site_id: "global",
        job_site_name: "Enterprise Template Library",
        sync_status: "synced",
        data: {
          activity: template.activity,
          trade: template.trade,
          oshaStandard: template.oshaStandard || "Cal/OSHA Title 8 § 1509",
          hazards: template.hazards,
          requiredPPE: template.requiredPPE,
          controlMeasures: template.controlMeasures,
          status: template.status || "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }

      const { data, error } = await supabase
        .from("submissions")
        .insert(payload)
        .select()
        .single()

      if (error) {
        console.error("[jhaTemplateService] Create template error:", error.message)
        return null
      }

      const d = data.data || {}
      return {
        id: data.id,
        activity: d.activity || data.title,
        trade: d.trade,
        oshaStandard: d.oshaStandard,
        hazards: d.hazards || [],
        requiredPPE: d.requiredPPE || [],
        controlMeasures: d.controlMeasures || [],
        status: d.status || "active",
        createdAt: data.created_at,
      }
    } catch (err) {
      console.error("[jhaTemplateService] Exception in create:", err)
      return null
    }
  },

  /**
   * Update an existing JHA template
   */
  async update(id: string, updates: Partial<DynamicJHATemplate>): Promise<boolean> {
    if (!isSupabaseConfigured) return false

    try {
      const { data: current, error: fetchErr } = await supabase
        .from("submissions")
        .select("data, title")
        .eq("id", id)
        .single()

      if (fetchErr || !current) {
        console.error("[jhaTemplateService] Template not found for update:", id)
        return false
      }

      const mergedData = {
        ...(current.data || {}),
        ...updates,
        updatedAt: new Date().toISOString(),
      }

      const { error: updateErr } = await supabase
        .from("submissions")
        .update({
          title: updates.activity || current.title,
          data: mergedData,
        })
        .eq("id", id)

      if (updateErr) {
        console.error("[jhaTemplateService] Error updating template:", updateErr.message)
        return false
      }

      return true
    } catch (err) {
      console.error("[jhaTemplateService] Exception in update:", err)
      return false
    }
  },

  /**
   * Delete a JHA template
   */
  async delete(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false

    try {
      const { error } = await supabase
        .from("submissions")
        .delete()
        .eq("id", id)

      if (error) {
        console.error("[jhaTemplateService] Error deleting template:", error.message)
        return false
      }

      return true
    } catch (err) {
      console.error("[jhaTemplateService] Exception in delete:", err)
      return false
    }
  },

  /**
   * Seed initial 4 OSHA templates into Supabase
   */
  async seedInitialTemplates(): Promise<DynamicJHATemplate[]> {
    const results: DynamicJHATemplate[] = []
    for (const seed of INITIAL_SEEDS) {
      const created = await this.create(seed)
      if (created) results.push(created)
    }
    return results
  },
}
