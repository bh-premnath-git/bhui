import React, { createContext, useContext, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { GenericData, DashboardData } from "@/types/dataops/data-ops-hub.d";
import type { ChartStyles } from "@/types/dataops/data-ops-hub.d";
import { fetchData, fetchDashboardData } from "@/api/analytics-api";

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
  setChartStyles: (styles: Partial<ChartStyles>) => void;
  availableBrands: string[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

interface ChartStyles {
  chartType: 'bar' | 'line' | 'pie';
  colorScheme: 'default' | 'monochrome' | 'colorful' | 'custom';
  colors: string[];
  customColors?: string[];
}

const defaultChartStyles: ChartStyles = {
  chartType: 'bar',
  colorScheme: 'default',
  colors: ['#4B9EFF', '#45D483', '#FFB547', '#FF6B6B'],
  customColors: ['#FFFFFF', '#FFFFFF', '#FFFFFF']
};

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");
  const [selectedTimeRange, setSelectedTimeRange] = useState("7days");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [chartStyles, setChartStylesState] = useState<ChartStyles>(defaultChartStyles);

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: fetchDashboardData,
  });

  const setChartStyles = useCallback((newStyles: Partial<ChartStyles>) => {
    setChartStylesState(prev => ({
      ...prev,
      ...newStyles
    }));
  }, []);

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
  if (context === undefined) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }
  return context;
}