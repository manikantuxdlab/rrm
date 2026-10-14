-- ==============================================================================
-- RRM Safety Dashboard: Support Tickets & Resolution Thread Migration
-- Tables: public.support_tickets, public.support_ticket_messages
-- Description: 2-Tier Hierarchy Support System (Foreman -> Boss -> Super Admin)
-- ==============================================================================

-- 1. Create Support Tickets Table
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number TEXT UNIQUE NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('mobile_app', 'incident_claim', 'coi_billing', 'osha_compliance', 'jobsite_access', 'general')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_on_user', 'resolved', 'closed')),
    stage TEXT NOT NULL DEFAULT 'company_level' CHECK (stage IN ('company_level', 'escalated_to_admin', 'resolved_by_boss', 'resolved_by_admin')),
    
    -- User & Company Context
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_role TEXT NOT NULL DEFAULT 'foreman' CHECK (user_role IN ('foreman', 'boss', 'super_admin')),
    company_name TEXT NOT NULL,
    jobsite_name TEXT DEFAULT NULL,
    
    -- Assignment & Resolution
    assigned_to TEXT DEFAULT NULL, -- e.g. "Marcus Vance (Boss)" or "Super Admin"
    resolution_notes TEXT DEFAULT NULL,
    resolved_by TEXT DEFAULT NULL,
    resolved_at TIMESTAMPTZ DEFAULT NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create Ticket Messages Table (Conversation Thread)
CREATE TABLE IF NOT EXISTS public.support_ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    sender_role TEXT NOT NULL CHECK (sender_role IN ('foreman', 'boss', 'super_admin')),
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_tickets_status_priority ON public.support_tickets(status, priority);
CREATE INDEX IF NOT EXISTS idx_tickets_company ON public.support_tickets(company_name);
CREATE INDEX IF NOT EXISTS idx_tickets_stage ON public.support_tickets(stage);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON public.support_ticket_messages(ticket_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;

-- 5. Policies
DROP POLICY IF EXISTS "Allow all read tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Allow all manage tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Allow all read ticket messages" ON public.support_ticket_messages;
DROP POLICY IF EXISTS "Allow all manage ticket messages" ON public.support_ticket_messages;

CREATE POLICY "Allow all read tickets"
    ON public.support_tickets
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Allow all manage tickets"
    ON public.support_tickets
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all read ticket messages"
    ON public.support_ticket_messages
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Allow all manage ticket messages"
    ON public.support_ticket_messages
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 6. Initial Realistic Seed Data
INSERT INTO public.support_tickets (
    ticket_number, subject, description, category, priority, status, stage, 
    user_name, user_email, user_role, company_name, jobsite_name, assigned_to
)
VALUES
(
    'TKT-1001',
    'Offline Safety Checklist sync stuck on Gate 3 iPad',
    'Completed pre-pour concrete safety inspection this morning at 6:45 AM. The app indicates 1 item pending in Sync Queue and will not upload over LTE cellular.',
    'mobile_app',
    'high',
    'open',
    'escalated_to_admin',
    'Carlos Vance',
    'cvance@titanconcrete-ca.com',
    'foreman',
    'Titan Concrete & Masonry Contractors LLC',
    'Apex Tower Phase 2 - Downtown High-Rise',
    'Super Admin'
),
(
    'TKT-1002',
    'Subcontractor COI renewal certificate upload issue',
    'Bayview Crane rental submitted updated $5M umbrella liability endorsement, but customer portal still shows status as Expiring in 4 Days.',
    'coi_billing',
    'urgent',
    'in_progress',
    'escalated_to_admin',
    'Marcus Vance',
    'mvance.boss@titanconcrete-ca.com',
    'boss',
    'Titan Concrete & Masonry Contractors LLC',
    'Apex Tower Phase 2 - Downtown High-Rise',
    'Super Admin'
),
(
    'TKT-1003',
    'Missing Trenching & Shoring Toolbox Talk in Spanish',
    'Need the Excavation and Trenching Toolbox Talk translated to Spanish before our 1:00 PM trenching shift at Shoreline Pier.',
    'osha_compliance',
    'medium',
    'open',
    'company_level',
    'Eduardo Silva',
    'esilva@titanconcrete-ca.com',
    'foreman',
    'Titan Concrete & Masonry Contractors LLC',
    'Shoreline Commercial Pier & Bulkhead',
    'Marcus Vance (Boss)'
),
(
    'TKT-1004',
    'Forklift operator certification expired on badge view',
    'Operator David Rodriguez renewed his OSHA Forklift card yesterday. Need badge updated so general contractor site super allows entry.',
    'jobsite_access',
    'high',
    'resolved',
    'resolved_by_boss',
    'Ray Miller',
    'rmiller@titanconcrete-ca.com',
    'foreman',
    'Titan Concrete & Masonry Contractors LLC',
    'Metro Line Extension - Station 4',
    'Marcus Vance (Boss)'
),
(
    'TKT-1005',
    'Request dispatch phone number change for incident alert',
    'Site safety superintendent phone number updated to (555) 782-9901 for all immediate severe injury and near miss SMS broadcasts.',
    'incident_claim',
    'low',
    'resolved',
    'resolved_by_admin',
    'Sarah Jenkins',
    'safety@goldengatebuilders.com',
    'boss',
    'Golden Gate Structural Framing',
    'Harbor View Medical Pavilion',
    'Super Admin'
);

-- Initial messages for TKT-1001 & TKT-1004
INSERT INTO public.support_ticket_messages (ticket_id, sender_name, sender_role, message, created_at)
SELECT id, 'Carlos Vance', 'foreman', 'Tried restarting the iPad and reconnecting to hotspot, still pending.', now() - interval '2 hours'
FROM public.support_tickets WHERE ticket_number = 'TKT-1001';

INSERT INTO public.support_ticket_messages (ticket_id, sender_name, sender_role, message, created_at)
SELECT id, 'Marcus Vance', 'boss', 'Escalating this to Super Admin support to check backend sync logs.', now() - interval '1 hour'
FROM public.support_tickets WHERE ticket_number = 'TKT-1001';

INSERT INTO public.support_ticket_messages (ticket_id, sender_name, sender_role, message, created_at)
SELECT id, 'Marcus Vance', 'boss', 'Verified physical certificate copy and updated operator profile in company portal.', now() - interval '4 hours'
FROM public.support_tickets WHERE ticket_number = 'TKT-1004';
