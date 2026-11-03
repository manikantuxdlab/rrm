import { configureStore } from "@reduxjs/toolkit"
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux"
import checklistReducer, {
  setRealtimeConnected,
  checklistSnapshotReceived,
} from "./checklistSlice"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import type { ChecklistItem } from "@/types"

export const store = configureStore({
  reducer: {
    checklist: checklistReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

/**
 * Real-time Supabase snapshot listener for jobsites checklist updates.
 * When an admin or field user updates a checklist, Supabase pushes the new snapshot
 * directly to all connected devices in real time.
 */
export function setupChecklistRealtime() {
  if (!isSupabaseConfigured) return () => {}

  const channel = supabase
    .channel("rrm_dashboard_checklists_realtime")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "jobsites",
      },
      (payload) => {
        const row = payload.new as any
        if (!row || !row.id) return

        const items: ChecklistItem[] = row.emergency_hospital?.customChecklist
        if (Array.isArray(items)) {
          store.dispatch(
            checklistSnapshotReceived({
              siteId: row.id,
              items,
            })
          )
        }
      }
    )
    .subscribe((status) => {
      store.dispatch(setRealtimeConnected(status === "SUBSCRIBED"))
    })

  return () => {
    supabase.removeChannel(channel)
  }
}

