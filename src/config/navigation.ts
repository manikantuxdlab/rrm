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
    key: "checklists",
    title: "Checklists",
    url: "/checklists",
    description: "Site-wise custom checklist builder, file importer (Excel/CSV/JSON/TXT) & live mobile sync",
  },
  {
    key: "toolbox-talks",
    title: "Toolbox Safety Talks",
    url: "/toolbox-talks",
    description: "26 OSHA weekly topics, foreman signed attendance rosters & minutes",
  },
  {
    key: "jobsites",
    title: "Jobsites",
    url: "/jobsites",
    description: "Active/inactive sites, superintendent info & emergency contacts",
  },
  {
    key: "users",
    title: "Users",
    url: "/users",
    description: "Onboard foremen, grant mobile access & manage logins per jobsite",
  },
  {
    key: "routing",
    title: "Routing",
    url: "/routing",
    description: "Destination emails & SMS contacts for claims, COIs & safety reports",
  },
  {
    key: "coi-requests",
    title: "Customer COI Queue",
    url: "/coi-requests",
    description: "Underwriter queue for ACORD 25 certificates, client endorsements & dispatch",
  },
  {
    key: "workforce",
    title: "Certifications",
    url: "/workforce",
    description: "OSHA 10/30, CPR credentials & 30-day advance expiration alerts",
  },
  {
    key: "fleet",
    title: "Equipment & Fleet",
    url: "/fleet",
    description: "Contractor machinery inventory, VIN endorsement & insurance review",
  },
  {
    key: "submissions",
    title: "Submissions",
    url: "/submissions",
    description: "Field claims, signed toolbox rosters, safety checklists & sync queue",
  },
  {
    key: "faqs",
    title: "FAQs",
    url: "/faqs",
    description: "Manage frequently asked questions, compliance guidance & mobile help",
  },
  {
    key: "tickets",
    title: "Tickets",
    url: "/tickets",
    description: "Track, review, and resolve field safety inquiries & requests",
  },
  {
    key: "settings",
    title: "Settings",
    url: "/settings",
    description: "Weekly briefing schedules, site locking rules and compliance policies",
  },
  {
    key: "attendance",
    title: "Attendance",
    url: "/attendance",
    description: "Daily crew check-in/out, hours worked & site rosters",
  },
]

export const SAFETY_DOCUMENTS: DocumentNavItem[] = []

export const CURRENT_USER = {
  name: "Marcus Vance",
  email: "safety@titanconcrete-ca.com",
  avatar: "/avatars/shadcn.jpg",
  role: "Safety Director",
}
