import React, { createContext, useContext, useState, useCallback } from "react";
import { QueryResult } from "@/types/data-catalog/xplore/type";

export interface SavedDashboard {
  id: string;
  name: string;
  content: string;
  data: QueryResult[];
  timestamp: Date;
  connectionId?: string;
}

interface DashboardContextType {
  savedDashboards: SavedDashboard[];
  saveDashboard: (dashboard: Omit<SavedDashboard, 'id'>) => void;
  saveToDashboard: (chart: QueryResult) => void;
  getDashboard: (id: string) => SavedDashboard | undefined;
  getDashboardsByConnection: (connectionId: string) => SavedDashboard[];
  getRecentDashboards: (limit?: number) => SavedDashboard[];
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [savedDashboards, setSavedDashboards] = useState<SavedDashboard[]>([]);

  const saveDashboard = useCallback((dashboard: Omit<SavedDashboard, 'id'>) => {
    setSavedDashboards(prev => {
      const newDashboard = { ...dashboard, id: crypto.randomUUID() };
      return [newDashboard, ...prev];
    });
  }, []);

  const saveToDashboard = useCallback((chart: QueryResult) => {
    // Create a new dashboard with just this chart
    const dashboard: Omit<SavedDashboard, 'id'> = {
      name: chart.title || 'Untitled Chart',
      content: '',
      data: [chart],
      timestamp: new Date(),
    };
    saveDashboard(dashboard);
  }, [saveDashboard]);

  const getDashboard = useCallback((id: string) => {
    return savedDashboards.find(dashboard => dashboard.id === id);
  }, [savedDashboards]);

  const getDashboardsByConnection = useCallback((connectionId: string) => {
    return savedDashboards.filter(dashboard => dashboard.connectionId === connectionId);
  }, [savedDashboards]);

  const getRecentDashboards = useCallback((limit = 10) => {
    return savedDashboards
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }, [savedDashboards]);

  const value = React.useMemo(() => ({
    savedDashboards,
    saveDashboard,
    saveToDashboard,
    getDashboard,
    getDashboardsByConnection,
    getRecentDashboards,
  }), [savedDashboards, saveDashboard, saveToDashboard, getDashboard, getDashboardsByConnection, getRecentDashboards]);

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}