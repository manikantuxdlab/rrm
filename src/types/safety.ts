export type UserRole = "foreman" | "boss" | "super_admin" | "underwriter" | "safety_director"
export type Language = "en" | "es"
export type SyncStatus = "draft" | "pending" | "synced" | "failed"

export interface JobSite {
  id: string
  name: string
  jobNumber: string
  address: string
  cityStateZip: string
  superintendent: string
  superPhone: string
  gcCompany: string
  gcContact: string
  gcPhone: string
  gcEmail: string
  trade: string
  status: "active" | "completed" | "paused"
  emergencyHospital: {
    name: string
    address: string
    phone: string
    distanceMiles: number
  }
  urgentCare: {
    name: string
    address: string
    phone: string
  }
  musterPoint: string
  utilityEmergency: string
  activeCrewCount: number
}

export interface Worker {
  id: string
  name: string
  role: string
  phone: string
  trade: string
  active: boolean
  companyName: string
  certifications: {
    name: string
    issuedDate: string
    expiresDate: string
    status: "valid" | "expiring_soon" | "expired"
  }[]
}

export interface ToolboxTopic {
  id: string
  number: number
  trade: string
  titleEn: string
  titleEs: string
  durationMinutes: number
  lastCovered?: string
  keyHazards: string[]
  discussionPoints: string[]
  oshaStandard: string
  recommendedActionItems: string[]
}

export interface ChecklistItem {
  id: string
  category: "ppe" | "housekeeping" | "fall_protection" | "ladders_scaffolds" | "electrical_tools" | "excavation" | "heavy_equipment" | "fire_hazards"
  labelEn: string
  labelEs: string
  tradeSpecific?: string
  status: "pass" | "fail" | "na" | "unanswered"
  notes?: string
  photoUri?: string
  severity?: "low" | "medium" | "high" | "critical"
}

export type ModuleType =
  | "daily_checklist"
  | "toolbox_talk"
  | "customer_coi"
  | "subcontractor_coi"
  | "claim_alert"
  | "add_equipment"
  | "loss_control"
  | "schedule_meeting"
  | "referral"
  | "near_miss"
  | "jha"
  | "equipment_inspection"

export interface SubmissionRecord {
  id: string
  moduleType: ModuleType
  title: string
  companyName: string
  foremanName: string
  foremanEmail: string
  jobSiteId: string
  jobSiteName: string
  timestamp: string
  syncStatus: SyncStatus
  data: any
  recipients: string[]
  signatureUri?: string
  pdfGenerated?: boolean
  severity?: "low" | "medium" | "high" | "critical"
}

export interface CertificationRecord {
  id: string
  workerId: string
  workerName: string
  companyName: string
  certType: string
  certNumber: string
  issueDate: string
  expirationDate: string
  issuer: string
  cardPhotoUri?: string
  status: "valid" | "expiring_soon" | "expired"
}

export interface EquipmentFleetItem {
  id: string
  companyName: string
  unitNumber: string
  year: string
  make: string
  model: string
  type: string
  vinOrSerial: string
  estimatedValue: number
  dateAdded: string
  status: "active" | "in_repair" | "inspection_due"
  insuranceStatus: "insured" | "pending_backoffice"
  lastInspectionDate?: string
  photoUri?: string
}

export interface ClientCompany {
  id: string
  name: string
  trade: string
  routingEmail: string
  usersCount: number
  activeJobsCount: number
  safetyScore: number
  status: "active" | "pending_setup" | "on_hold"
  contactPerson: string
  contactPhone: string
  policyNumber: string
  policyExpires: string
}

export interface SubcontractorInfo {
  id: string
  name: string
  contact: string
  email: string
  phone: string
  trade: string
  defaultLimits: string
  coiStatus: "approved" | "expiring" | "missing"
  expiresDate: string
}

export interface JHATemplate {
  id: string
  activity: string
  trade: string
  hazards: string[]
  requiredPPE: string[]
  controlMeasures: string[]
}

export interface EmailDispatchLog {
  id: string
  to: string[]
  cc?: string[]
  subject: string
  bodySummary: string
  timestamp: string
  priority: "normal" | "high" | "critical"
  type: string
}
