// src/hooks/useReports.ts
import { useState, useEffect } from 'react';
import { File } from 'lucide-react';
import { ROUTES } from '@/config/routes';
import type { NavItem } from '@/types/navigation';

interface Report {
  id: string;
  title: string;
  path: string;
}

// Mock data instead of API call
const MOCK_REPORTS: Report[] = [
  {
    id: 'sales-report',
    title: 'Sales Report',
    path: 'sales-report'
  },
  {
    id: 'orders-report',
    title: 'Orders Report',
    path: 'orders-report'
  },
  {
    id: 'inventory-report',
    title: 'Inventory Report',
    path: 'inventory-report'
  }
];

export function useReports() {
  const [reports, setReports] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const reportItems: NavItem[] = MOCK_REPORTS.map(report => ({
          title: report.title,
          icon: File,
          path: `${ROUTES.DATA_CATALOG}/xplorer/${report.path}`,
          parent: `${ROUTES.DATA_CATALOG}/xplorer`,
        }));
        
        setReports(reportItems);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to process reports'));
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return { reports, loading, error };
}