/**
 * Global shared TypeScript types and interfaces
 */

export * from "./safety"
export * from "./user"

export type Theme = "dark" | "light" | "system"
export type ResolvedTheme = "dark" | "light"

export interface UserProfile {
  name: string
  email: string
  avatar: string
  role?: string
}

export interface NavItem {
  title: string
  url: string
  icon?: React.ReactNode
  isActive?: boolean
  badge?: string | number
  items?: {
    title: string
    url: string
  }[]
}

export interface DocumentItem {
  name: string
  url: string
  icon: React.ReactNode
  badge?: string
}


export type CoiRequestStatus = 'pending_underwriter' | 'in_review' | 'issued' | 'rejected';
export type CoiUrgency = 'normal' | 'crew_stopped';

export interface CoiCoverages {
  gl: boolean;
  wc: boolean;
  auto: boolean;
  umbrella: boolean;
  glLimit?: string;
  autoLimit?: string;
  umbrellaLimit?: string;
  wcLimit?: string;
}

export interface CoiEndorsements {
  additionalInsured: boolean;
  waiverSubrogation: boolean;
  primaryNonContributory: boolean;
}

export interface CoiRequestRecord {
  id: string;
  companyName: string;
  jobSiteId: string;
  jobSiteName: string;
  jobNumber?: string;
  requestedByUserId?: string;
  requestedByName: string;
  requestedByRole: 'foreman' | 'boss' | 'super_admin';
  holderName: string;
  holderAddress: string;
  holderContactName?: string;
  holderEmail: string;
  ccEmails: string[];
  coverages: CoiCoverages;
  endorsements: CoiEndorsements;
  urgency: CoiUrgency;
  notes?: string;
  contractDocUrl?: string | null;
  status: CoiRequestStatus;
  underwriterNotes?: string | null;
  issuedCoiUrl?: string | null;
  issuedByName?: string | null;
  issuedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}
