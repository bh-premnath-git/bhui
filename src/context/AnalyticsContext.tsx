import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchDashboardData, updateConversationContext } from '@/api/analytics-api';
import { defaultChartStyles, ChartType } from '@/features/data-catalog/components/Xplore/StyleEditor';
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
  fetchData: (question: string, useContext?: boolean) => Promise<DashboardData | null>;
  currentQuestion: string;
  resetAnalytics: () => void;
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
    
    // Always update the current question
    setCurrentQuestion(question);
    
    try {
      // Pass the context flag to the API
      const data = await fetchDashboardData(question, useContext);
      
      if (data) {
        // Create a deep copy of the data to prevent reference issues
        const dataCopy = structuredClone(data);
        
        // Update dashboard data without affecting previous visualizations
        setDashboardData(dataCopy);
        
        // Don't reset filters for follow-up questions
        if (!useContext) {
          setActiveFilters([]);
        }
        
        // Set chart type only if recommended and not a follow-up
        if (data?.recommendedChartType && !useContext) {
          setChartStyles(prev => ({
            ...prev,
            chartType: (data.recommendedChartType as ChartType) || 'bar',
          }));
        }
      }
      
      // Return the data for the component to use
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const resetAnalytics = useCallback(() => {
    console.log("Resetting analytics state...");
    
    // Reset all relevant state
    setDashboardData(null);
    setCurrentQuestion("");
    setActiveFilters([]);
    setCurrentPage(1);
    setViewMode('chart');
    setChartStyles({...defaultChartStyles});
    setError(null);
    setIsLoading(false);
    
    // Also reset the conversation context
    updateConversationContext({
      currentTopic: "",
      recentQuestions: [],
      recentTables: [],
      recentMetrics: [],
      currentConnection: "",
      relatedEntities: [],
      analysisHistory: []
    }, "");
    
    console.log("Analytics state reset complete");
  }, []);

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
        currentQuestion,
        resetAnalytics,
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