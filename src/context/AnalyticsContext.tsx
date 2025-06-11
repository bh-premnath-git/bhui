import React, { createContext, useContext, useState, useCallback } from 'react';
import { useDashboard } from './DashboardContext';
import { Dashboard } from '@/types/dataops/dataops-dash';

interface CurrentDashboard {
  id: string;
  title: string;
}

interface AnalyticsContextType {
  currentDashboard: CurrentDashboard | null;
  setCurrentDashboard: (dashboard: CurrentDashboard) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentDashboard, setCurrentDashboardState] = useState<CurrentDashboard | null>(null);
  const { dispatch } = useDashboard();

  const setCurrentDashboard = useCallback((dashboard: CurrentDashboard) => {
    setCurrentDashboardState(dashboard);
    
    // If we have a dashboard ID, we also want to set it as selected in the DashboardContext
    if (dashboard?.id) {
      // Create a properly formatted Dashboard object that matches the expected type
      const dashboardForContext: Dashboard = {
        id: parseInt(dashboard.id, 10) || 0,
        dashboard_id: parseInt(dashboard.id, 10) || 0,
        dashboard_name: dashboard.title,
        owner: '',
        dashboard_type: 'explorer',
        visibility: 'private',
        meta_data: {},
        dashboard_filters: [],
        dashboard_layout: []
      };
      
      dispatch({
        type: "SET_SELECTED_DASHBOARD",
        payload: dashboardForContext
      });
    }
  }, [dispatch]);

  const value = React.useMemo(() => ({
    currentDashboard,
    setCurrentDashboard
  }), [currentDashboard, setCurrentDashboard]);

  return (
    <AnalyticsContext.Provider value={value}>
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