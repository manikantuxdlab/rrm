-- ==============================================================================
-- RRM Safety Dashboard & Mobile App User Management Migration
-- Table: public.profiles
-- Description: Multi-tenant user profiles with RLS, Realtime Sync, and Auth Triggers
-- ==============================================================================

-- 1. Create public.profiles table if not exists
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL DEFAULT '',
    phone TEXT DEFAULT '',
    company_id UUID,
    company_name TEXT NOT NULL DEFAULT 'General Contractor',
    role TEXT NOT NULL DEFAULT 'foreman',
    status TEXT NOT NULL DEFAULT 'active',
    language_preference TEXT DEFAULT 'en',
    assigned_jobsites JSONB DEFAULT '[]'::jsonb,
    avatar_url TEXT,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Add columns if table already exists (safe for existing Supabase projects)
ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS company_id UUID,
    ADD COLUMN IF NOT EXISTS company_name TEXT NOT NULL DEFAULT 'General Contractor',
    ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'foreman',
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS language_preference TEXT DEFAULT 'en',
    ADD COLUMN IF NOT EXISTS assigned_jobsites JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS avatar_url TEXT,
    ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());

-- 3. High-performance indexes
CREATE INDEX IF NOT EXISTS idx_profiles_company_name ON public.profiles(company_name);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 4. Security Definer Helper Functions (avoids RLS infinite recursion)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_company()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_name FROM public.profiles WHERE id = auth.uid();
$$;

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop previous policies to avoid duplication errors on re-run
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Super Admins have full access" ON public.profiles;
DROP POLICY IF EXISTS "Bosses manage their company users" ON public.profiles;

-- Policy A: Every authenticated user can read their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Policy B: Every authenticated user can update basic profile fields (name, phone, language)
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy C: Super Admins can SELECT, INSERT, UPDATE, DELETE all profiles
CREATE POLICY "Super Admins have full access" 
ON public.profiles FOR ALL 
TO authenticated 
USING (
  public.get_current_user_role() = 'super_admin'
);

-- Policy D: Bosses can manage users within their own company
CREATE POLICY "Bosses manage their company users" 
ON public.profiles FOR ALL 
TO authenticated 
USING (
  public.get_current_user_role() = 'boss'
  AND company_name = public.get_current_user_company()
);

-- 6. Auto-trigger: When a new user signs up in auth.users, create their profile record
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    company_name,
    status,
    language_preference
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'New Member'),
    COALESCE(new.raw_user_meta_data->>'role', 'foreman'),
    COALESCE(new.raw_user_meta_data->>'company_name', 'General Contractor'),
    'active',
    COALESCE(new.raw_user_meta_data->>'language_preference', 'en')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = CASE WHEN profiles.full_name = '' THEN EXCLUDED.full_name ELSE profiles.full_name END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Updated_at auto-updater trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 8. Enable Supabase Realtime for public.profiles
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
EXCEPTION
  WHEN duplicate_object THEN null;
  WHEN undefined_object THEN null;
END $$;
