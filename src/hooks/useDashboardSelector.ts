import { useState, useMemo } from 'react';
import { useListDashboards } from './ueDashboard';

interface Dashboard {
  id: string;
  name: string;
}

export function useDashboardSelector() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: apiDashboards, isLoading, isError } = useListDashboards();

  // Use only API dashboards without adding a default dashboard
  const allDashboards = useMemo(() => {
    return apiDashboards || [];
  }, [apiDashboards]);

  // Filter dashboards based on search term
  const filteredDashboards = useMemo(() => {
    return allDashboards.filter(dashboard =>
      dashboard.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allDashboards, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    allDashboards,
    filteredDashboards,
    isLoading,
    isError
  };
}
