import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import type { ChecklistItem } from "@/types"
import { jobsitesService } from "@/services/jobsitesService"
import { MOCK_DAILY_CHECKLIST_ITEMS } from "@/data/safetyMockData"

export interface ChecklistState {
  selectedSiteId: string
  items: ChecklistItem[]
  loading: boolean
  saving: boolean
  error: string | null
  hasUnsavedChanges: boolean
  lastSyncedAt: string | null
  realtimeConnected: boolean
}

const initialState: ChecklistState = {
  selectedSiteId: "global",
  items: MOCK_DAILY_CHECKLIST_ITEMS,
  loading: false,
  saving: false,
  error: null,
  hasUnsavedChanges: false,
  lastSyncedAt: null,
  realtimeConnected: false,
}

// Async thunk to fetch checklist from Supabase
export const loadChecklist = createAsyncThunk(
  "checklist/loadChecklist",
  async (siteId: string, { rejectWithValue }) => {
    try {
      const items = await jobsitesService.fetchChecklist(siteId)
      return { siteId, items }
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to load checklist")
    }
  }
)

// Async thunk to publish checklist to Supabase
export const publishChecklist = createAsyncThunk(
  "checklist/publishChecklist",
  async (
    { siteId, items }: { siteId: string; items: ChecklistItem[] },
    { rejectWithValue }
  ) => {
    try {
      const res = await jobsitesService.saveChecklist(siteId, items)
      if (!res.ok) {
        return rejectWithValue(res.error || "Failed to publish checklist")
      }
      return { siteId, items, timestamp: new Date().toISOString() }
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to publish checklist")
    }
  }
)

export const checklistSlice = createSlice({
  name: "checklist",
  initialState,
  reducers: {
    setSelectedSiteId: (state, action: PayloadAction<string>) => {
      state.selectedSiteId = action.payload
      state.hasUnsavedChanges = false
    },
    setItems: (state, action: PayloadAction<ChecklistItem[]>) => {
      state.items = action.payload
      state.hasUnsavedChanges = true
    },
    addItem: (state, action: PayloadAction<ChecklistItem>) => {
      state.items.push(action.payload)
      state.hasUnsavedChanges = true
    },
    updateItem: (state, action: PayloadAction<ChecklistItem>) => {
      const idx = state.items.findIndex((i) => i.id === action.payload.id)
      if (idx !== -1) {
        state.items[idx] = action.payload
        state.hasUnsavedChanges = true
      }
    },
    deleteItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.id !== action.payload)
      state.hasUnsavedChanges = true
    },
    moveItem: (
      state,
      action: PayloadAction<{ fromIndex: number; toIndex: number }>
    ) => {
      const { fromIndex, toIndex } = action.payload
      if (
        fromIndex < 0 ||
        fromIndex >= state.items.length ||
        toIndex < 0 ||
        toIndex >= state.items.length
      ) {
        return
      }
      const item = state.items.splice(fromIndex, 1)[0]
      state.items.splice(toIndex, 0, item)
      state.hasUnsavedChanges = true
    },
    importItems: (
      state,
      action: PayloadAction<{ items: ChecklistItem[]; mode: "replace" | "append" }>
    ) => {
      if (action.payload.mode === "replace") {
        state.items = action.payload.items
      } else {
        state.items = [...state.items, ...action.payload.items]
      }
      state.hasUnsavedChanges = true
    },
    resetToStandard: (state) => {
      state.items = MOCK_DAILY_CHECKLIST_ITEMS
      state.hasUnsavedChanges = true
    },
    setRealtimeConnected: (state, action: PayloadAction<boolean>) => {
      state.realtimeConnected = action.payload
    },
    checklistSnapshotReceived: (
      state,
      action: PayloadAction<{ siteId: string; items: ChecklistItem[] }>
    ) => {
      // If snapshot is for current selected site, or for global when global is selected
      const isTarget =
        (state.selectedSiteId === "global" &&
          action.payload.siteId === "global-checklist-template") ||
        state.selectedSiteId === action.payload.siteId

      if (isTarget && action.payload.items && action.payload.items.length > 0) {
        // Only override if user doesn't have pending local edits
        if (!state.hasUnsavedChanges) {
          state.items = action.payload.items
          state.lastSyncedAt = new Date().toISOString()
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // loadChecklist
      .addCase(loadChecklist.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loadChecklist.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.hasUnsavedChanges = false
        state.lastSyncedAt = new Date().toISOString()
      })
      .addCase(loadChecklist.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // publishChecklist
      .addCase(publishChecklist.pending, (state) => {
        state.saving = true
        state.error = null
      })
      .addCase(publishChecklist.fulfilled, (state, action) => {
        state.saving = false
        state.hasUnsavedChanges = false
        state.lastSyncedAt = action.payload.timestamp
      })
      .addCase(publishChecklist.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload as string
      })
  },
})

export const {
  setSelectedSiteId,
  setItems,
  addItem,
  updateItem,
  deleteItem,
  moveItem,
  importItems,
  resetToStandard,
  setRealtimeConnected,
  checklistSnapshotReceived,
} = checklistSlice.actions

export default checklistSlice.reducer
