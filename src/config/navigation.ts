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
    badge: "148",
    description: "Pre-pour inspections, hazard audits & immediate corrective actions",
  },
  {
    key: "toolbox",
    title: "Toolbox Talks",
    url: "/toolbox",
    badge: "26",
    description: "Bilingual weekly meeting guides, signed field rosters & crew signatures",
  },
  {
    key: "jha",
    title: "JHA Assessments",
    url: "/jha",
    badge: "3",
    description: "Pre-task risk mitigation, PPE requirements & high-risk activity controls",
  },
  {
    key: "incidents",
    title: "Incidents & Claims",
    url: "/incidents",
    badge: "1",
    description: "First reports of injury, lost-time triage & proactive safety notices",
  },
  {
    key: "coi",
    title: "COI & Insurance",
    url: "/coi",
    badge: "4",
    description: "Automated ACORD 25 certificates & trade vendor compliance tracking",
  },
  {
    key: "jobsites",
    title: "Active Jobsites",
    url: "/jobsites",
    badge: "4",
    description: "Superintendent contacts, Level-1 trauma routing & 811 utility response",
  },
  {
    key: "fleet",
    title: "Fleet & Machinery",
    url: "/fleet",
    badge: "5",
    description: "Machinery schedules, insured asset valuations & inspection status",
  },
  {
    key: "workforce",
    title: "Workforce & Badges",
    url: "/workforce",
    badge: "6",
    description: "OSHA 10/30 cards, CPR/First Aid credentials & expiration tracking",
  },
  {
    key: "companies",
    title: "Contractor Accounts",
    url: "/companies",
    badge: "5",
    description: "Multi-tenant company profiles, automated routing emails & safety ratings",
  },
]

export const SAFETY_DOCUMENTS: DocumentNavItem[] = [
  {
    name: "OSHA 300 Log",
    url: "#",
  },
  {
    name: "Compliance Reports",
    url: "#",
  },
  {
    name: "OSHA 1926 Library",
    url: "#",
  },
]

export const CURRENT_USER = {
  name: "Marcus Vance",
  email: "safety@titanconcrete-ca.com",
  avatar: "/avatars/shadcn.jpg",
  role: "Safety Director",
}
