import { Routes, Route, Navigate, useNavigate } from "react-router-dom"
import { LoginPage } from "@/features/auth/LoginPage"
import {
  SafetyDashboardView,
  DailyChecklistsView,
  ContractorAccountsView,
  UserAccountsView,
  RoutingSettingsView,
  ActiveJobsitesView,
  WorkforceBadgesView,
  FieldSubmissionsView,
  FaqManagementView,
  SupportTicketsView,
  ToolboxTalksView,
  SystemSettingsView,
  FleetMachineryView,
  COIRequestsQueueView,
  IncidentsClaimsView,
  NearMissHazardsView,
  JhaAssessmentsView,
} from "@/features/safety-admin"
import type { SubmissionRecord } from "@/types"
import { AttendanceView } from "@/features/safety-admin/components/AttendanceView"
import { COIComplianceLogView } from "@/features/safety-admin/components/COIComplianceLogView"

interface AppRoutesProps {
  onSelectSubmission: (submission: SubmissionRecord) => void
  onOpenDispatch: () => void
  onOpenAddEquipment: () => void
  onOpenIssueCoi: () => void
}

export function AppRoutes({
  onSelectSubmission,
  onOpenDispatch,
  onOpenAddEquipment: _onOpenAddEquipment,
  onOpenIssueCoi: _onOpenIssueCoi,
}: AppRoutesProps) {
  const navigate = useNavigate()

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* 1. Overview Dashboard */}
      <Route
        path="/dashboard"
        element={
          <SafetyDashboardView
            onSelectSubmission={onSelectSubmission}
            onOpenDispatch={onOpenDispatch}
            onNavigateModule={(mod) => {
              if (mod === "checklists") {
                navigate("/checklists")
              } else if (mod === "toolbox") {
                navigate("/toolbox-talks")
              } else if (mod === "jha") {
                navigate("/jha")
              } else if (mod === "fleet") {
                navigate("/fleet")
              } else if (mod === "incidents" || mod === "coi") {
                navigate("/submissions")
              } else {
                navigate(`/${mod}`)
              }
            }}
          />
        }
      />

      {/* 2. Checklist Management (Site-wise Custom Builder, Importer & Live Sync) */}
      <Route
        path="/checklists"
        element={<DailyChecklistsView onSelectSubmission={onSelectSubmission} />}
      />

      {/* 3. Jobsites & Projects */}
      <Route path="/jobsites" element={<ActiveJobsitesView />} />

      {/* 4. Contractor Companies & User Management */}
      <Route
        path="/companies"
        element={<ContractorAccountsView />}
      />
      <Route path="/users" element={<UserAccountsView />} />

            {/* Settings & Weekly Schedule Policies */}
      <Route path="/settings" element={<SystemSettingsView />} />

      {/* 5. Notification Routing */}
      <Route path="/routing" element={<RoutingSettingsView />} />

      {/* 6. Safety Configurator & Toolbox Talks */}
      <Route path="/safety-config" element={<Navigate to="/checklists" replace />} />
      <Route
        path="/toolbox-talks"
        element={<ToolboxTalksView onSelectSubmission={onSelectSubmission} />}
      />
      <Route path="/toolbox" element={<Navigate to="/toolbox-talks" replace />} />
      {/* 7. Job Hazard Analysis (JHA / Risk & Super Admin Template Manager) */}
      <Route
        path="/jha"
        element={<JhaAssessmentsView onSelectSubmission={onSelectSubmission} />}
      />
      <Route path="/jha-library" element={<Navigate to="/jha" replace />} />

      {/* Customer COI Underwriter Queue */}
      <Route path="/coi-requests" element={<COIRequestsQueueView />} />
      <Route path="/certifications/coi-requests" element={<Navigate to="/coi-requests" replace />} />
      {/* Subcontractor COI Compliance Log */}
      <Route path="/coi-compliance" element={<COIComplianceLogView />} />

      {/* 7. Certifications Tracker */}
      <Route path="/workforce" element={<WorkforceBadgesView />} />
      <Route
        path="/fleet"
        element={<FleetMachineryView onOpenAddEquipment={_onOpenAddEquipment} />}
      />
      <Route path="/equipment" element={<Navigate to="/fleet" replace />} />

      {/* 8. Field Submissions & Logs */}
      <Route
        path="/submissions"
        element={
          <FieldSubmissionsView
            onSelectSubmission={onSelectSubmission}
            onOpenDispatch={onOpenDispatch}
          />
        }
      />
      <Route
        path="/incidents"
        element={
          <IncidentsClaimsView
            onSelectSubmission={onSelectSubmission}
            onOpenDispatch={onOpenDispatch}
          />
        }
      />
      <Route
        path="/coi"
        element={<Navigate to="/coi-requests" replace />}
      />
      <Route
        path="/claims"
        element={
          <IncidentsClaimsView
            onSelectSubmission={onSelectSubmission}
            onOpenDispatch={onOpenDispatch}
          />
        }
      />

      {/* 9. Near-Miss Proactive Hazards */}
      <Route path="/near-miss" element={<NearMissHazardsView />} />

      {/* 10. FAQ Management */}
      <Route path="/faqs" element={<FaqManagementView />} />

      {/* 10. Support Tickets */}
      <Route path="/tickets" element={<SupportTicketsView />} />

      {/* 11. Attendance */}
      <Route path="/attendance" element={<AttendanceView />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
