export type UserRole = "foreman" | "boss" | "super_admin"

export type UserStatus = "active" | "inactive" | "invited"
export type LanguagePreference = "en" | "es"

/**
 * Raw database record representation from Supabase public.profiles
 */
export interface DBUserProfile {
  id: string
  email: string
  full_name: string
  phone?: string | null
  company_id?: string | null
  company_name: string
  role: UserRole
  status: UserStatus
  language_preference?: LanguagePreference | null
  assigned_jobsites?: string[] | null
  avatar_url?: string | null
  last_login_at?: string | null
  created_at: string
  updated_at?: string | null
}

/**
 * Frontend representation used throughout the dashboard UI
 */
export interface UserRecord {
  id: string
  email: string
  fullName: string
  phone: string
  companyId?: string
  companyName: string
  role: UserRole
  status: UserStatus
  languagePreference: LanguagePreference
  assignedJobsites: string[]
  avatarUrl?: string
  lastLoginAt?: string
  createdAt: string
  updatedAt?: string
  submissionsCount?: number
}

export interface CreateUserInput {
  email: string
  fullName: string
  phone?: string
  companyId?: string
  companyName?: string
  role: UserRole
  status?: UserStatus
  languagePreference?: LanguagePreference
  assignedJobsites?: string[]
}

export interface UpdateUserInput {
  fullName?: string
  phone?: string
  companyId?: string
  companyName?: string
  role?: UserRole
  status?: UserStatus
  languagePreference?: LanguagePreference
  assignedJobsites?: string[]
  avatarUrl?: string
}

export interface UserFilters {
  search?: string
  companyName?: string
  role?: string
  status?: string
}
