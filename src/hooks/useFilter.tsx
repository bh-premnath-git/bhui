import { useDashboard } from "@/context/DashboardContext"

export const useFilters = () => {
  const { filters, handleFilterChange, resetFilters, loadSavedFilters } = useDashboard()
  return { filters, handleFilterChange, resetFilters, loadSavedFilters }
}
