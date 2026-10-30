

-- ==============================================================================
-- RRM Jobsites Migration & Row Level Security (RLS) Setup
-- Table: public.jobsites
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.jobsites (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    job_number TEXT NOT NULL,
    company_name TEXT,
    address TEXT DEFAULT '',
    city_state_zip TEXT DEFAULT '',
    superintendent TEXT DEFAULT '',
    super_phone TEXT DEFAULT '',
    gc_company TEXT DEFAULT '',
    gc_contact TEXT DEFAULT '',
    gc_phone TEXT DEFAULT '',
    gc_email TEXT DEFAULT '',
    trade TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'active',
    emergency_hospital JSONB DEFAULT '{}'::jsonb,
    urgent_care JSONB DEFAULT '{}'::jsonb,
    muster_point TEXT DEFAULT '',
    utility_emergency TEXT DEFAULT '',
    access_gate_instructions TEXT,
    active_crew_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.jobsites ENABLE ROW LEVEL SECURITY;

-- Allow anon & authenticated users to read jobsites
CREATE POLICY "Allow public read jobsites" 
ON public.jobsites FOR SELECT 
TO anon, authenticated 
USING (true);

-- Allow authenticated and anon users to insert / upsert jobsites
CREATE POLICY "Allow public insert jobsites" 
ON public.jobsites FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Allow authenticated and anon users to update jobsites
CREATE POLICY "Allow public update jobsites" 
ON public.jobsites FOR UPDATE 
TO anon, authenticated 
USING (true)
WITH CHECK (true);

-- Allow authenticated and anon users to delete jobsites
CREATE POLICY "Allow public delete jobsites" 
ON public.jobsites FOR DELETE 
TO anon, authenticated 
USING (true);
