-- ==============================================================================
-- Subcontractor & COI Management Database Migration
-- Tables: public.companies, public.coi_requests
-- ==============================================================================

-- 1. Create or Update public.companies (Master Subcontractors & Contractors)
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    trade TEXT NOT NULL DEFAULT 'General Trade',
    contact_person TEXT DEFAULT '',
    contact_phone TEXT DEFAULT '',
    routing_email TEXT DEFAULT '',
    policy_number TEXT DEFAULT '',
    policy_expires DATE,
    safety_score NUMERIC DEFAULT 100,
    status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'pending_setup' | 'on_hold'
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_companies_name ON public.companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_trade ON public.companies(trade);
CREATE INDEX IF NOT EXISTS idx_companies_status ON public.companies(status);

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated & anonymous users (for Mobile app and Admin)
DROP POLICY IF EXISTS "Allow all users to view companies" ON public.companies;
CREATE POLICY "Allow all users to view companies" 
ON public.companies FOR SELECT 
TO anon, authenticated 
USING (true);

-- Allow insert/update for authenticated users & service role
DROP POLICY IF EXISTS "Allow full management on companies" ON public.companies;
CREATE POLICY "Allow full management on companies" 
ON public.companies FOR ALL 
TO anon, authenticated 
USING (true)
WITH CHECK (true);

-- ==============================================================================
-- 2. Create or Update public.coi_requests (Underwriter Queue & Verification)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.coi_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    job_site_id TEXT,
    job_site_name TEXT,
    job_number TEXT DEFAULT '',
    requested_by_name TEXT NOT NULL DEFAULT 'Field Lead',
    requested_by_role TEXT NOT NULL DEFAULT 'foreman',
    holder_name TEXT NOT NULL,
    holder_address TEXT DEFAULT '',
    holder_contact_name TEXT DEFAULT '',
    holder_email TEXT DEFAULT '',
    cc_emails JSONB DEFAULT '[]'::jsonb,
    coverages_requested JSONB DEFAULT '{}'::jsonb,
    special_endorsements JSONB DEFAULT '{}'::jsonb,
    urgency TEXT DEFAULT 'normal', -- 'normal' | 'rush' | 'crew_stopped'
    notes TEXT DEFAULT '',
    contract_doc_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending_underwriter', -- 'pending_underwriter' | 'issued' | 'rejected'
    underwriter_notes TEXT DEFAULT '',
    issued_coi_url TEXT,
    issued_by_name TEXT,
    issued_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_coi_requests_holder ON public.coi_requests(holder_name);
CREATE INDEX IF NOT EXISTS idx_coi_requests_status ON public.coi_requests(status);
CREATE INDEX IF NOT EXISTS idx_coi_requests_created ON public.coi_requests(created_at DESC);

-- Enable RLS
ALTER TABLE public.coi_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all users to view coi_requests" ON public.coi_requests;
CREATE POLICY "Allow all users to view coi_requests" 
ON public.coi_requests FOR SELECT 
TO anon, authenticated 
USING (true);

DROP POLICY IF EXISTS "Allow full management on coi_requests" ON public.coi_requests;
CREATE POLICY "Allow full management on coi_requests" 
ON public.coi_requests FOR ALL 
TO anon, authenticated 
USING (true)
WITH CHECK (true);

-- ==============================================================================
-- 3. Seed Real Subcontractor Data from App UI into Supabase
-- ==============================================================================
INSERT INTO public.companies (name, trade, contact_person, contact_phone, routing_email, policy_number, policy_expires, safety_score, status)
VALUES
    (
        'Pacific Rebar Ironworks LLC',
        'Rebar Reinforcement',
        'Gary Simmons',
        '(562) 555-3921',
        'gary@pacificrebar.com',
        'POL-PAC-94821',
        '2027-11-30',
        98,
        'active'
    ),
    (
        'Golden State Shoring & Scaffolding Inc',
        'Shoring & Formwork Systems',
        'Maria Morales',
        '(213) 555-8812',
        'maria@goldenstateshoring.com',
        'POL-GSS-88124',
        '2027-03-01',
        96,
        'active'
    ),
    (
        'Apex Ready-Mix Logistics',
        'Concrete Batch Supply',
        'Sam Bennett',
        '(818) 555-0914',
        'dispatch@apexreadymix.com',
        'POL-APX-09145',
        '2026-11-20',
        92,
        'active'
    ),
    (
        'Sierra Environmental & Saw Cutting',
        'Concrete Core & Saw Cutting',
        'Ken Tanaka',
        '(909) 555-4478',
        'ken@sierracutting.com',
        'POL-SIE-44781',
        '2027-04-20',
        95,
        'active'
    ),
    (
        'Titan Concrete & Masonry Contractors LLC',
        'Concrete & Masonry',
        'Marcus Vance',
        '(213) 555-0142',
        'safety@titanconcrete-ca.com',
        'POL-RRRM-994821',
        '2027-01-15',
        99,
        'active'
    )
ON CONFLICT (name) DO UPDATE SET
    trade = EXCLUDED.trade,
    contact_person = EXCLUDED.contact_person,
    contact_phone = EXCLUDED.contact_phone,
    routing_email = EXCLUDED.routing_email,
    policy_number = EXCLUDED.policy_number,
    policy_expires = EXCLUDED.policy_expires,
    status = EXCLUDED.status;

-- ==============================================================================
-- 4. Enable Real-Time Replication
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.companies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.coi_requests;

