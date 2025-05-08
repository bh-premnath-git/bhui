import { useDataOps } from "@/context/dataops/DataOpsContext"

export const useFilters = () => {
  const { filters, handleFilterChange, resetFilters, loadSavedFilters } = useDataOps()
  return { filters, handleFilterChange, resetFilters, loadSavedFilters }
}
