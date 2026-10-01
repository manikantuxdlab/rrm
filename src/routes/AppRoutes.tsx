import { Routes, Route, Navigate, useNavigate } from "react-router-dom"
import { LoginPage } from "@/features/auth/LoginPage"
import {
  SafetyDashboardView,
  DailyChecklistsView,
  ToolboxTalksView,
  JhaAssessmentsView,
  IncidentsClaimsView,
  CoiInsuranceView,
  ActiveJobsitesView,
  FleetMachineryView,
  WorkforceBadgesView,
  ContractorAccountsView,
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
  onOpenAddEquipment,
  onOpenIssueCoi,
}: AppRoutesProps) {
  const navigate = useNavigate()

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route
        path="/dashboard"
        element={
          <SafetyDashboardView
            onSelectSubmission={onSelectSubmission}
            onOpenDispatch={onOpenDispatch}
            onNavigateModule={(mod) => navigate(`/${mod}`)}
          />
        }
      />

      <Route
        path="/checklists"
        element={
          <DailyChecklistsView
            onSelectSubmission={onSelectSubmission}
          />
        }
      />

      <Route
        path="/toolbox"
        element={
          <ToolboxTalksView
            onSelectSubmission={onSelectSubmission}
          />
        }
      />

      <Route
        path="/jha"
        element={
          <JhaAssessmentsView
            onSelectSubmission={onSelectSubmission}
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
        element={
          <CoiInsuranceView
            onSelectSubmission={onSelectSubmission}
            onOpenIssueCoi={onOpenIssueCoi}
          />
        }
      />

      <Route path="/jobsites" element={<ActiveJobsitesView />} />

      <Route
        path="/fleet"
        element={
          <FleetMachineryView
            onOpenAddEquipment={onOpenAddEquipment}
          />
        }
      />

      <Route path="/workforce" element={<WorkforceBadgesView />} />

      <Route
        path="/companies"
        element={
          <ContractorAccountsView
            onOpenAddCompany={onOpenAddCompany}
          />
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
