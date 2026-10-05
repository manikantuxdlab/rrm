import { Routes, Route, Navigate, useNavigate } from "react-router-dom"
import { LoginPage } from "@/features/auth/LoginPage"
import {
  SafetyDashboardView,
  ContractorAccountsView,
  UserAccountsView,
  RoutingSettingsView,
  SafetyConfigView,
  ActiveJobsitesView,
  WorkforceBadgesView,
  FieldSubmissionsView,
} from "@/features/safety-admin"
import type { SubmissionRecord } from "@/types"

interface AppRoutesProps {
  onSelectSubmission: (submission: SubmissionRecord) => void
  onOpenDispatch: () => void
  onOpenAddCompany: () => void
  onOpenAddEquipment: () => void
  onOpenIssueCoi: () => void
}

export function AppRoutes({
  onSelectSubmission,
  onOpenDispatch,
  onOpenAddCompany,
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
              if (mod === "checklists" || mod === "toolbox" || mod === "jha") {
                navigate("/safety-config")
              } else if (mod === "incidents" || mod === "coi" || mod === "fleet") {
                navigate("/submissions")
              } else {
                navigate(`/${mod}`)
              }
            }}
          />
        }
      />

      {/* 2. Companies & Users */}
      <Route
        path="/companies"
        element={
          <ContractorAccountsView
            onOpenAddCompany={onOpenAddCompany}
          />
        }
      />
      <Route path="/users" element={<UserAccountsView />} />

      {/* 3. Notification Routing */}
      <Route path="/routing" element={<RoutingSettingsView />} />

      {/* 4. Safety & Checklists Config */}
      <Route path="/safety-config" element={<SafetyConfigView />} />
      <Route path="/checklists" element={<Navigate to="/safety-config" replace />} />
      <Route path="/toolbox" element={<Navigate to="/safety-config" replace />} />
      <Route path="/jha" element={<Navigate to="/safety-config" replace />} />

      {/* 5. Jobsites & Projects */}
      <Route path="/jobsites" element={<ActiveJobsitesView />} />

      {/* 6. Certifications Tracker */}
      <Route path="/workforce" element={<WorkforceBadgesView />} />

      {/* 7. Field Submissions & Logs */}
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
        element={<Navigate to="/submissions" replace />}
      />
      <Route
        path="/coi"
        element={<Navigate to="/submissions" replace />}
      />
      <Route
        path="/fleet"
        element={<Navigate to="/submissions" replace />}
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
