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
    description: "Real-time compliance analytics, jobsite feeds & OSHA risk monitoring",
  },
  {
    key: "checklists",
    title: "Daily Checklists",
    url: "/checklists",
    description: "Pre-pour inspections, hazard audits & immediate corrective actions",
  },
  {
    key: "toolbox",
    title: "Toolbox Talks",
    url: "/toolbox",
    description: "Bilingual weekly meeting guides, signed field rosters & crew signatures",
  },
  {
    key: "jha",
    title: "JHA Assessments",
    url: "/jha",
    description: "Pre-task risk mitigation, PPE requirements & high-risk activity controls",
  },
  {
    key: "incidents",
    title: "Incidents & Claims",
    url: "/incidents",
    description: "First reports of injury, lost-time triage & proactive safety notices",
  },
  {
    key: "coi",
    title: "COI & Insurance",
    url: "/coi",
    description: "Automated ACORD 25 certificates & trade vendor compliance tracking",
  },
  {
    key: "jobsites",
    title: "Active Jobsites",
    url: "/jobsites",
    description: "Superintendent contacts, Level-1 trauma routing & 811 utility response",
  },
  {
    key: "fleet",
    title: "Fleet & Machinery",
    url: "/fleet",
    description: "Machinery schedules, insured asset valuations & inspection status",
  },
  {
    key: "workforce",
    title: "Workforce & Badges",
    url: "/workforce",
    description: "OSHA 10/30 cards, CPR/First Aid credentials & expiration tracking",
  },
  {
    key: "companies",
    title: "Contractor Accounts",
    url: "/companies",
    description: "Multi-tenant company profiles, automated routing emails & safety ratings",
  },
  {
    key: "users",
    title: "Foremen & Users",
    url: "/users",
    description: "App logins, role assignments, jobsite permissions & 1-20 user limits",
  },
]

export const SAFETY_DOCUMENTS: DocumentNavItem[] = [
  {
    name: "OSHA 300 Log",
    url: "/osha-300",
  },
  {
    name: "Compliance Reports",
    url: "/compliance-reports",
  },
  {
    name: "OSHA 1926 Library",
    url: "/osha-1926",
  },
]

export const CURRENT_USER = {
  name: "Marcus Vance",
  email: "safety@titanconcrete-ca.com",
  avatar: "/avatars/shadcn.jpg",
  role: "Safety Director",
}
