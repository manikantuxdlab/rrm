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
    title: "Overview Dashboard",
    url: "/dashboard",
    description: "Multi-tenant sync status, real-time metrics & field activity feed",
  },
  {
    key: "companies",
    title: "Companies & Users",
    url: "/companies",
    description: "Customer company onboarding & 1-20 foremen logins per company",
  },
  {
    key: "routing",
    title: "Notification Routing",
    url: "/routing",
    description: "Destination emails & SMS contacts for claims, COIs & safety reports",
  },
  {
    key: "safety-config",
    title: "Safety & Checklists Config",
    url: "/safety-config",
    description: "Configure Toolbox Talk topics, Daily safety checklists & JHA templates",
  },
  {
    key: "jobsites",
    title: "Jobsites & Projects",
    url: "/jobsites",
    description: "Active/inactive sites, superintendent info & emergency contacts",
  },
  {
    key: "workforce",
    title: "Certifications Tracker",
    url: "/workforce",
    description: "OSHA 10/30, CPR credentials & 30-day advance expiration alerts",
  },
  {
    key: "submissions",
    title: "Field Submissions & Logs",
    url: "/submissions",
    description: "Field claims, signed toolbox rosters, safety checklists & sync queue",
  },
]

export const SAFETY_DOCUMENTS: DocumentNavItem[] = []

export const CURRENT_USER = {
  name: "Marcus Vance",
  email: "safety@titanconcrete-ca.com",
  avatar: "/avatars/shadcn.jpg",
  role: "Safety Director",
}
