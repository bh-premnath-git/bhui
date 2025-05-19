import { createContext, useState, useContext, useMemo, useCallback, useEffect } from "react"
import { generateData, processChartData, setCookie, getCookie } from "@/lib/utils"
import type { FilterOption, DataItem, ChartData } from "@/types/dataops/data-ops-hub.d"
import { CHART_ADDED_EVENT } from "@/components/shared/GenericChatUI"

interface CustomChart {
  id: string
  title: string
  type: string
  data: any[]
  config?: {
    xAxis?: {
      label?: string
      labelOffset?: number
    }
    yAxis?: {
      label?: string
      labelOffset?: number
    }
    children?: string
  }
}

interface DataOpsContextType {
  allData: DataItem[]
  chartData: ChartData
  filters: {
    project: FilterOption
    pipeline: FilterOption
    status: FilterOption
    duration: FilterOption
  }
  setFilters: React.Dispatch<
    React.SetStateAction<{
      project: FilterOption
      pipeline: FilterOption
      status: FilterOption
      duration: FilterOption
    }>
  >
  chartOrder: string[]
  setChartOrder: React.Dispatch<React.SetStateAction<string[]>>
  handleFilterChange: (key: string, value: FilterOption) => void
  resetFilters: () => void
  loadSavedFilters: () => void
  customCharts: CustomChart[]
  addCustomChart: (chart: CustomChart) => void
}

const DataOpsContext = createContext<DataOpsContextType | undefined>(undefined)

export const DataOpsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState({
    project: "All" as FilterOption,
    pipeline: "All" as FilterOption,
    status: "All" as FilterOption,
    duration: "All" as FilterOption,
  })

  const [chartOrder, setChartOrder] = useState([
    "latency",
    "cost",
    "ingestion",
    "health",
    "quality",
    "incident",
  ])
  const [customCharts, setCustomCharts] = useState<CustomChart[]>([])

  const allData = useMemo(() => generateData(), [])

  const filteredData = useMemo(() => {
    let filtered = allData
    if (filters.project !== "All") {
      filtered = filtered.filter((item) => item.project === filters.project)
    }
    if (filters.pipeline !== "All") {
      filtered = filtered.filter((item) => item.pipeline === filters.pipeline)
    }
    if (filters.status !== "All") {
      filtered = filtered.filter((item) => item.status === filters.status)
    }
    if (filters.duration !== "All") {
      const now = new Date()
      const startDate = new Date(now)
      switch (filters.duration) {
        case "Today":
          startDate.setHours(0, 0, 0, 0)
          break
        case "This Week":
          startDate.setDate(now.getDate() - now.getDay())
          break
        case "This Month":
          startDate.setDate(1)
          break
      }
      filtered = filtered.filter((item) => item.date >= startDate)
    }
    return filtered
  }, [allData, filters])

  const chartData = useMemo(() => processChartData(filteredData), [filteredData])

  const handleFilterChange = useCallback((key: string, value: FilterOption) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value }
      setCookie("dashboardFilters", JSON.stringify(newFilters), 30)
      return newFilters
    })
  }, [])

  const resetFilters = useCallback(() => {
    const defaultFilters = {
      project: "All",
      pipeline: "All",
      status: "All",
      duration: "All",
    }
    setFilters(defaultFilters)
    setCookie("dashboardFilters", JSON.stringify(defaultFilters), 30)
  }, [])

  const loadSavedFilters = useCallback(() => {
    const savedFilters = getCookie("dashboardFilters")
    if (savedFilters) {
      setFilters(JSON.parse(savedFilters))
    }
  }, [])

  const addCustomChart = useCallback((chart: CustomChart) => {
    setCustomCharts(prev => {
      // Check if a chart with this ID already exists
      const exists = prev.some(c => c.id === chart.id)
      if (exists) {
        // Update existing chart
        return prev.map(c => c.id === chart.id ? chart : c)
      } else {
        // Add new chart and update the chartOrder to include new chart
        setChartOrder(prev => [...prev, `custom-${chart.id}`])
        return [...prev, chart]
      }
    })
  }, [setChartOrder])

  useEffect(() => {
    const handleChartAdded = (event: CustomEvent) => {
      const chartData = event.detail;
      addCustomChart(chartData);
    };

    document.addEventListener(CHART_ADDED_EVENT, handleChartAdded as EventListener);

    return () => {
      document.removeEventListener(CHART_ADDED_EVENT, handleChartAdded as EventListener);
    };
  }, [addCustomChart]);

  const value = {
    allData,
    chartData,
    filters,
    setFilters,
    chartOrder,
    setChartOrder,
    handleFilterChange,
    resetFilters,
    loadSavedFilters,
    customCharts,
    addCustomChart,
  }

  return <DataOpsContext.Provider value={value}>{children}</DataOpsContext.Provider>
}

export const useDataOps = () => {
  const context = useContext(DataOpsContext)
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider")
  }
  return context
}