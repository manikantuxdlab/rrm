/**
 * Global shared TypeScript types and interfaces
 */

export * from "./safety"

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
