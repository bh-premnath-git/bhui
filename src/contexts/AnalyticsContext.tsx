import React, { createContext, useContext, useState } from "react";

type ViewMode = "chart" | "table";

interface AnalyticsContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedTimeRange: string;
  setSelectedTimeRange: (range: string) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>("chart");
  const [selectedTimeRange, setSelectedTimeRange] = useState("7days");

  return (
    <AnalyticsContext.Provider
      value={{
        viewMode,
        setViewMode,
        selectedTimeRange,
        setSelectedTimeRange,
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