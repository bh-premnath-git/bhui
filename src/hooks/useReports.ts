// src/hooks/useReports.ts
import { useState } from 'react';
import { File } from 'lucide-react';
import { ROUTES } from '@/config/routes';
import type { NavItem } from '@/types/navigation';

export interface NewReport {
  id: string;
  title: string;
}

export function useReports() {
  const [reports, setReports] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const addReport = (report: NewReport) => {
    const navItem: NavItem = {
      title: report.title,
      icon: File,
      path: `${ROUTES.DATA_CATALOG}/xplorer/${report.id}`,
      parent: `${ROUTES.DATA_CATALOG}/xplorer`,
    };
    setReports(prev => [...prev, navItem]);
  };
  return { reports, loading, error, addReport, setLoading, setError };
}