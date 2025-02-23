import React, { createContext, useContext, useState } from "react";
import type { ChartStyles } from "@/types/dataops/data-ops-hub.d";

export interface SavedDashboard {
  id: string;
  name: string;
  data: any[];
  styles: ChartStyles;
  type: 'chart' | 'table';
}

interface DashboardContextType {
  savedDashboards: SavedDashboard[];
  saveDashboard: (dashboard: Omit<SavedDashboard, 'id'>) => SavedDashboard;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [savedDashboards, setSavedDashboards] = useState<SavedDashboard[]>([]);

  const saveDashboard = (dashboard: Omit<SavedDashboard, 'id'>) => {
    const newDashboard = { ...dashboard, id: crypto.randomUUID() };
    setSavedDashboards(prev => [...prev, newDashboard]);
    return newDashboard;
  };

  return (
    <DashboardContext.Provider value={{ savedDashboards, saveDashboard }}>
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
