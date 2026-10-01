import * as React from "react"
import { useLocation } from "react-router-dom"
import { AppLayout } from "@/components/layout"
import { AppRoutes } from "@/routes"
import { LoginPage } from "@/features/auth/LoginPage"
import {
  DispatchAlertModal,
  AddCompanyModal,
  AddEquipmentModal,
  IssueCoiModal,
  SubmissionDetailModal,
} from "@/features/safety-admin"
import type { SubmissionRecord } from "@/types"

export default function App() {
  const location = useLocation()
  const [selectedSubmission, setSelectedSubmission] = React.useState<SubmissionRecord | null>(null)
  const [isDispatchOpen, setIsDispatchOpen] = React.useState(false)
  const [isAddCompanyOpen, setIsAddCompanyOpen] = React.useState(false)
  const [isAddEquipmentOpen, setIsAddEquipmentOpen] = React.useState(false)
  const [isIssueCoiOpen, setIsIssueCoiOpen] = React.useState(false)

  if (location.pathname === "/login") {
    return <LoginPage />
  }

  return (
    <AppLayout onDispatchAlert={() => setIsDispatchOpen(true)}>
      <AppRoutes
        onSelectSubmission={(sub) => setSelectedSubmission(sub)}
        onOpenDispatch={() => setIsDispatchOpen(true)}
        onOpenAddCompany={() => setIsAddCompanyOpen(true)}
        onOpenAddEquipment={() => setIsAddEquipmentOpen(true)}
        onOpenIssueCoi={() => setIsIssueCoiOpen(true)}
      />

      {/* Global Modals & Dialogs */}
      <SubmissionDetailModal
        submission={selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
      />

      <DispatchAlertModal
        isOpen={isDispatchOpen}
        onClose={() => setIsDispatchOpen(false)}
        onSubmit={(data) => {
          alert(
            `🚨 Safety Alert Dispatched to field mobile apps:\n\nTitle: ${data.title}\nTrade: ${data.trade}\nPriority: ${data.priority.toUpperCase()}`
          )
        }}
      />

      <AddCompanyModal
        isOpen={isAddCompanyOpen}
        onClose={() => setIsAddCompanyOpen(false)}
        onAdd={(data) => {
          alert(`✅ Contractor "${data.name}" successfully onboarded with 26 safety topics!`)
        }}
      />

      <AddEquipmentModal
        isOpen={isAddEquipmentOpen}
        onClose={() => setIsAddEquipmentOpen(false)}
        onAdd={(data) => {
          alert(
            `✅ Equipment Unit "${data.unitNumber}" (${data.make} ${data.model}) added to insurance schedule!`
          )
        }}
      />

      <IssueCoiModal
        isOpen={isIssueCoiOpen}
        onClose={() => setIsIssueCoiOpen(false)}
        onIssue={(data) => {
          alert(
            `✅ ACORD 25 Certificate generated and dispatched to ${data.email} for "${data.holder}"!`
          )
        }}
      />
    </AppLayout>
  )
}
