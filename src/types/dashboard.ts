export type Status = "success" | "failed" | "in-progress"

export interface TableData {
  id: string
  flow: string
  project: string
  status: Status
  startTime: string
  duration: string
  owner: string
}

export interface StatsData {
  success: number
  failed: number
  inProgress: number
}

export interface FilterValues {
  project: string
  flow: string
  status: string
  startDate: Date | undefined
  endDate: Date | undefined
}

export interface FilterOption {
  value: string
  label: string
}

