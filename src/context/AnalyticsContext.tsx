import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchDashboardData } from '@/api/analytics-api';
import { defaultChartStyles } from '@/features/data-catalog/components/Xplore/StyleEditor';
import type { DashboardData, ChartStyles } from '@/types/dataops/data-ops-hub.d';

interface AnalyticsContextType {
  dashboardData: DashboardData | null;
  isLoading: boolean;
  error: Error | null;
  viewMode: 'chart' | 'table';
  setViewMode: (mode: 'chart' | 'table') => void;
  formatCurrency: (value: number) => string;
  activeFilters: string[];
  setActiveFilters: React.Dispatch<React.SetStateAction<string[]>>;
  chartStyles: ChartStyles;
  setChartStyles: React.Dispatch<React.SetStateAction<ChartStyles>>;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  itemsPerPage: number;
  fetchData: (question: string) => Promise<void>;
  currentQuestion: string;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [chartStyles, setChartStyles] = useState<ChartStyles>(defaultChartStyles);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const itemsPerPage = 5;

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const fetchData = async (question: string, useContext = true) => {
    setIsLoading(true);
    setError(null);
    setCurrentQuestion(question);
    
    try {
      const data = await fetchDashboardData(question);
      setDashboardData(data);
      
      // Reset filters when data changes
      setActiveFilters([]);
      
      // Set recommended chart type if available
      if (data?.recommendedChartType) {
        setChartStyles(prev => ({
          ...prev,
          chartType: data.recommendedChartType || 'bar'
        }));
      }
      
      // Default to chart view for new data
      setViewMode('chart');
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchData("");
  }, []);

  return (
    <AnalyticsContext.Provider
      value={{
        dashboardData,
        isLoading,
        error,
        viewMode,
        setViewMode,
        formatCurrency,
        activeFilters,
        setActiveFilters,
        chartStyles,
        setChartStyles,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        fetchData,
        currentQuestion
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};