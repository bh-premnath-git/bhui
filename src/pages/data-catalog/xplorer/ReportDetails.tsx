import React from 'react';
import { AnalyticsProvider } from "@/context/AnalyticsContext";
import { DashboardProvider } from "@/context/DashboardContext";

const NoWidgetsDisplay = () => (
  <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 m-4">
    <div className="text-center p-5">
      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
      <h3 className="mt-2 text-sm font-medium text-gray-900">No widgets yet</h3>
      <p className="mt-1 text-sm text-gray-500">Get started by adding widgets to your data explorer.</p>
      <p className="text-xs text-gray-400 mt-2">Use the AI Chat to analyze data and create visualizations</p>
    </div>
  </div>
);

const ReportDetailsContent: React.FC = () => {
  return (
    <div>
      <NoWidgetsDisplay />
    </div>
  );
};

const ReportDetails: React.FC = () => {
  return (
    <DashboardProvider>
      <AnalyticsProvider>
        <ReportDetailsContent />
      </AnalyticsProvider>
    </DashboardProvider>
  );
};

export default ReportDetails;
