export interface NavModuleItem {
  key: string
  title: string
  url: string
  badge?: string | number
  description: string
}

export interface DocumentNavItem {
  name: string
  url: string
}

export const SAFETY_MODULES: NavModuleItem[] = [
  {
    key: "dashboard",
    title: "Dashboard",
    url: "/dashboard",
    description: "Multi-tenant sync status, real-time metrics & field activity feed",
  },
  {
    key: "users",
    title: "Users",
    url: "/users",
    description: "Onboard foremen, grant mobile access & manage logins per jobsite",
  },
  {
    key: "jobsites",
    title: "Jobsites",
    url: "/jobsites",
    description: "Active/inactive sites, superintendent info & emergency contacts",
  },
  {
    key: "checklists",
    title: "Checklist",
    url: "/checklists",
    description: "Site-wise custom checklist builder, file importer (Excel/CSV/JSON/TXT) & live mobile sync",
  },
  {
    key: "toolbox-talks",
    title: "Toolbox",
    url: "/toolbox-talks",
    description: "26 OSHA weekly topics, foreman signed attendance rosters & minutes",
  },
  {
    key: "fleet",
    title: "Equipment",
    url: "/fleet",
    description: "Contractor machinery inventory, VIN endorsement & insurance review",
  },
  {
    key: "coi-requests",
    title: "COI",
    url: "/coi-requests",
    description: "Underwriter queue for ACORD 25 certificates, client endorsements & dispatch",
  },
  {
    key: "subcontractors",
    title: "Subcontractors",
    url: "/companies",
    description: "Trade contractors, vendor compliance matrix, active job allocations & COI tracking",
  },
  {
    key: "claims",
    title: "Claims",
    url: "/claims",
    description: "First reports of injury, Cal/OSHA 5020 & instant site incident triage queue",
  },
  {
    key: "near-miss",
    title: "Near-Miss",
    url: "/near-miss",
    description: "Multi-tenant hazard close-call logs, OSHA non-recordable audits & good catch rewards",
  },
  {
    key: "jha",
    title: "JHA / Risk",
    url: "/jha",
    description: "Activity Hazard Analysis (AHA) master templates, live field crew briefs & compliance sign-offs",
  },
  {
    key: "workforce",
    title: "Certificates",
    url: "/workforce",
    description: "OSHA 10/30, CPR credentials & 30-day advance expiration alerts",
  },
  {
    key: "faqs",
    title: "FAQ",
    url: "/faqs",
    description: "Manage frequently asked questions, compliance guidance & mobile help",
  },
  {
    key: "tickets",
    title: "Support",
    url: "/tickets",
    description: "Track, review, and resolve field safety inquiries & requests",
  },
  {
    key: "settings",
    title: "Settings",
    url: "/settings",
    description: "Weekly briefing schedules, site locking rules and compliance policies",
  },
  /*
  // Commented out per request:
  {
    key: "routing",
    title: "Routing",
    url: "/routing",
    description: "Destination emails & SMS contacts for claims, COIs & safety reports",
  },
  {
    key: "submissions",
    title: "Submissions",
    url: "/submissions",
    description: "Field claims, signed toolbox rosters, safety checklists & sync queue",
  },
  {
    key: "attendance",
    title: "Attendance",
    url: "/attendance",
    description: "Daily crew check-in/out, hours worked & site rosters",
  },
  */
]

export const SAFETY_DOCUMENTS: DocumentNavItem[] = []

export const CURRENT_USER = {
  name: "Marcus Vance",
  email: "safety@titanconcrete-ca.com",
  avatar: "/avatars/shadcn.jpg",
  role: "Safety Director",
}
