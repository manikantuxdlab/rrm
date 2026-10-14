-- ==============================================================================
-- RRM Safety Dashboard: FAQ Knowledge Base Migration
-- Table: public.faqs
-- Description: Centralized FAQs and Field Guidance with Role-based access & RLS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'toolbox_talks', 'coi_insurance', 'incidents_claims', 'mobile_app', 'osha_compliance')),
    target_audience TEXT NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'foreman', 'boss', 'super_admin')),
    order_index INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Allow authenticated read published faqs" ON public.faqs;
DROP POLICY IF EXISTS "Allow super_admins full management of faqs" ON public.faqs;
DROP POLICY IF EXISTS "Allow authenticated manage faqs" ON public.faqs;

-- Read policy: Anyone authenticated can view FAQs
-- Allow both authenticated users and anon clients (mobile app / field workers) to read published FAQs
DROP POLICY IF EXISTS "Allow authenticated read faqs" ON public.faqs;
DROP POLICY IF EXISTS "Allow public read faqs" ON public.faqs;

CREATE POLICY "Allow public read faqs"
    ON public.faqs
    FOR SELECT
    TO anon, authenticated
    USING (status = 'published');

-- Write policy: Authenticated staff can insert/update/delete FAQs
CREATE POLICY "Allow authenticated manage faqs"
    ON public.faqs
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Fast Index for Category & Status
CREATE INDEX IF NOT EXISTS idx_faqs_category_status ON public.faqs(category, status);
CREATE INDEX IF NOT EXISTS idx_faqs_order ON public.faqs(order_index ASC);

-- ==============================================================================
-- Initial Seed Data: Construction & Safety FAQs
-- Run this in your Supabase SQL Editor
-- ==============================================================================
INSERT INTO public.faqs (question, answer, category, target_audience, order_index, status)
VALUES
(
    'How do foremen submit Daily Safety Checklists while offline on remote jobsites?',
    'The RRM Mobile App stores completed checklists locally in encrypted offline storage with timestamped digital signatures. When the mobile device reconnects to Wi-Fi or cellular service, submissions automatically sync to Supabase and trigger notification routing.',
    'mobile_app',
    'foreman',
    1,
    'published'
),
(
    'Who receives the instant emergency dispatch email and SMS when an incident is logged?',
    'Incident and injury alerts are dispatched to the routing contacts designated in the company''s Notification Routing tab. By default, this notifies the Safety Director, Risk Manager, and Site Superintendent within 60 seconds.',
    'incidents_claims',
    'boss',
    2,
    'published'
),
(
    'Can Toolbox Talks be conducted and signed in Spanish?',
    'Yes. All 52 OSHA construction Toolbox Talk modules include certified bilingual English and Spanish transcripts, hazard talking points, and worker signature roster sheets.',
    'toolbox_talks',
    'all',
    3,
    'published'
),
(
    'What happens when a subcontractor Certificate of Insurance (COI) is within 30 days of expiring?',
    'The platform marks the subcontractor record in amber (''Expiring Soon'') and sends automated renewal reminder notices to the subcontractor''s dispatch email. If expired, access to create JHA site submissions for that company is temporarily locked.',
    'coi_insurance',
    'boss',
    4,
    'published'
),
(
    'How do I add a new field foreman user and assign them to specific jobsites?',
    'Navigate to User Management in the sidebar, click ''+ Onboard New User'', input their full name, company, mobile phone, role (Field Foreman), and select their assigned active jobsites. The foreman receives an SMS invite link to activate their login.',
    'general',
    'all',
    5,
    'published'
),
(
    'Are OSHA 300 logs automatically updated when field incidents are recorded?',
    'Yes. When an incident report is marked as recordable (requiring medical attention beyond first aid, days away from work, or job restriction), it automatically generates an OSHA Form 300 & 300A draft entry for annual compliance filing.',
    'osha_compliance',
    'boss',
    6,
    'published'
),
(
    'How can workers verify their active OSHA 10/30 or CPR badges via QR code?',
    'Each certified worker is assigned an encrypted digital safety badge. Site superintendents or general contractors can scan the badge QR code on-site using any smartphone camera to verify credential expiration dates in real time.',
    'mobile_app',
    'foreman',
    7,
    'published'
),
(
    'How do I create and dispatch a Job Hazard Analysis (JHA) before starting high-risk work?',
    'Open the Safety & Checklists Config tab, select JHA Templates, choose your trade activity (e.g., Trenching & Excavation, Crane Rigging, or Working at Heights), customize required PPE and controls, then dispatch it directly to the field foreman assigned to the site.',
    'osha_compliance',
    'foreman',
    8,
    'published'
),
(
    'What should foremen do when heavy machinery or fleet equipment fails a daily pre-trip inspection?',
    'Immediately tag the equipment out of service using the red ''Deficiency Lockout'' toggle in the Mobile App. This automatically routes an urgent repair alert to the fleet maintenance supervisor and logs the unit as unusable on the jobsite.',
    'mobile_app',
    'foreman',
    9,
    'published'
),
(
    'How do company bosses update notification routing emails for emergency claims and near-miss alerts?',
    'Navigate to Notification Routing in the sidebar, select your company profile, and enter dedicated email addresses and SMS numbers for Incident Alerts, Daily Logs, and COI expirations. Click Save Changes to activate real-time routing.',
    'incidents_claims',
    'boss',
    10,
    'published'
),
(
    'Can we export safety compliance records and worker certifications for OSHA audit inspections?',
    'Yes. From either the Certifications Tracker or Field Submissions views, administrators can click Export to PDF / CSV to download official compliance reports complete with worker timestamps and verified digital signatures.',
    'general',
    'all',
    11,
    'published'
);



