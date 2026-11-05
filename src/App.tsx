import * as React from "react"
import { useLocation } from "react-router-dom"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/context"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { AppLayout } from "@/components/layout"
import { AppRoutes } from "@/routes"
import { LoginPage } from "@/features/auth/LoginPage"
import {
  DispatchAlertModal,
  AddEquipmentModal,
  IssueCoiModal,
  SubmissionDetailModal,
} from "@/features/safety-admin"
import type { SubmissionRecord } from "@/types"

function AppContent() {
  const location = useLocation()
  const [selectedSubmission, setSelectedSubmission] = React.useState<SubmissionRecord | null>(null)
  const [isDispatchOpen, setIsDispatchOpen] = React.useState(false)
  const [isAddEquipmentOpen, setIsAddEquipmentOpen] = React.useState(false)
  const [isIssueCoiOpen, setIsIssueCoiOpen] = React.useState(false)

  if (location.pathname === "/login") {
    return <LoginPage />
  }

  return (
    <ProtectedRoute>
      <AppLayout onDispatchAlert={() => setIsDispatchOpen(true)}>
        <AppRoutes
          onSelectSubmission={(sub) => setSelectedSubmission(sub)}
          onOpenDispatch={() => setIsDispatchOpen(true)}
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
            toast.error(
              `🚨 Safety Alert Dispatched: ${data.title}`,
              {
                description: `Trade: ${data.trade} | Priority: ${data.priority.toUpperCase()} • Broadcast to mobile devices.`,
              }
            )
          }}
        />

        <AddEquipmentModal
          isOpen={isAddEquipmentOpen}
          onClose={() => setIsAddEquipmentOpen(false)}
          onAdd={(data) => {
            toast.success(
              `Equipment Unit "${data.unitNumber}" Added`,
              {
                description: `${data.make} ${data.model} has been recorded into the insurance schedule.`,
              }
            )
          }}
        />

        <IssueCoiModal
          isOpen={isIssueCoiOpen}
          onClose={() => setIsIssueCoiOpen(false)}
          onIssue={(data) => {
            toast.success(
              `ACORD 25 Certificate Dispatched`,
              {
                description: `Official COI dispatched to ${data.email} for "${data.holder}".`,
              }
            )
          }}
        />
      </AppLayout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster position="top-right" richColors closeButton />
    </AuthProvider>
  )
}
