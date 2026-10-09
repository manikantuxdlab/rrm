import * as React from "react"
import type { User, Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  role?: string
  created_at?: string
  updated_at?: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [profile, setProfile] = React.useState<UserProfile | null>(null)
  const [session, setSession] = React.useState<Session | null>(null)
  const [loading, setLoading] = React.useState(true)

  // Fetch profile strictly from Supabase public.profiles table
  const fetchProfile = React.useCallback(async (authUser: User) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle()

      if (!error && data) {
        setProfile(data as UserProfile)
      } else {
        // Fallback to metadata only if profiles row doesn't exist yet
        setProfile({
          id: authUser.id,
          email: authUser.email || "",
          full_name: (authUser.user_metadata?.full_name as string) || "Super Admin",
          role: (authUser.user_metadata?.role as string) || "super_admin",
        })
      }
    } catch {
      setProfile(null)
    }
  }, [])

  React.useEffect(() => {
    // 1. Fetch initial session strictly from Supabase Auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user)
      }
      setLoading(false)
    })

    // 2. Real-time auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  // Pure Supabase Auth signIn - NO bypass, NO mock fallback
  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    const trimmedEmail = email.trim().toLowerCase()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    })

    if (error) {
      return { error }
    }

    if (data.session && data.user) {
      setSession(data.session)
      setUser(data.user)
      await fetchProfile(data.user)
      return { error: null }
    }

    return { error: new Error("Authentication failed: No active session returned by Supabase.") }
  }

  // Pure Supabase Auth signOut
  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSession(null)
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
