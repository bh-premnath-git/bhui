import React, { createContext, useContext, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { GenericData, DashboardData } from "@/types/dataops/data-ops-hub.d";
import type { ChartStyles } from "@/types/dataops/data-ops-hub.d";
import { fetchData, fetchDashboardData } from "@/api/analytics-api";
import { defaultChartStyles } from "@/features/data-catalog/components/Xplore/StyleEditor";

interface AnalyticsContextType {
  dashboardData: DashboardData | undefined;
  isLoading: boolean;
  error: Error | null;
  viewMode: "chart" | "table";
  setViewMode: (mode: "chart" | "table") => void;
  selectedTimeRange: string;
  setSelectedTimeRange: (range: string) => void;
  activeFilters: string[];
  setActiveFilters: React.Dispatch<React.SetStateAction<string[]>>;
  formatCurrency: (value: number | undefined) => string;
  chartStyles: ChartStyles;
  setChartStyles: (styles: ChartStyles) => void;
  availableBrands: string[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
}

export const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");
  const [selectedTimeRange, setSelectedTimeRange] = useState("7days");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [chartStyles, setChartStyles] = useState<ChartStyles>(defaultChartStyles);

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData
  });

  const formatCurrency = useCallback((value: number | undefined): string => {
    if (value === undefined || value === null) return '$0';
    return `$${value.toLocaleString()}`;
  }, []);

  const availableBrands = ["Dole", "Frieda's", "Goya", "Chiquita"];

  return (
    <AnalyticsContext.Provider
      value={{
        dashboardData,
        isLoading,
        error,
        viewMode,
        setViewMode,
        selectedTimeRange,
        setSelectedTimeRange,
        activeFilters,
        setActiveFilters,
        formatCurrency,
        chartStyles,
        setChartStyles,
        availableBrands,
        currentPage,
        setCurrentPage,
        itemsPerPage,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}