import { z } from "zod"

export const dashboardItemSchema = z.object({
  id: z.number(),
  header: z.string(),
  type: z.string(),
  status: z.string(),
  target: z.string(),
  limit: z.string(),
  reviewer: z.string(),
})

export type DashboardItem = z.infer<typeof dashboardItemSchema>

export interface DashboardMetric {
  title: string
  value: string
  trend: string
  trendType: "up" | "down"
  subtext: string
}
