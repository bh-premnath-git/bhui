import { useState, useEffect, useCallback } from 'react';
import { Layout, Layouts } from 'react-grid-layout';
import { Dashboard } from '@/types/dataops/dataops-dash';

interface LayoutConfig {
  storageKey: string;
  dashboard: Dashboard | null;
  defaultDimensions: { w: number; h: number };
}

export const useLayoutPersistence = ({ storageKey, dashboard, defaultDimensions }: LayoutConfig) => {
  const [layouts, setLayouts] = useState<Layouts>(() => {
    const savedLayout = localStorage.getItem(storageKey);
    if (savedLayout) {
      try {
        return JSON.parse(savedLayout);
      } catch (e) {
        console.error('Failed to parse saved layout:', e);
      }
    }
    
    if (dashboard?.dashboard_layout && dashboard.dashboard_layout.length > 0) {
      const sortedLayout = [...dashboard.dashboard_layout]
        .sort((a, b) => parseInt(a.order_index) - parseInt(b.order_index));
      
      return {
        lg: sortedLayout.map((layout, index) => ({
          i: layout.widget_id.toString(),
          x: layout.widget_coordinates.x ?? (index % 2) * (defaultDimensions.w || 6),
          y: layout.widget_coordinates.y ?? Math.floor(index / 2) * (defaultDimensions.h || 3),
          w: layout.widget_size.w || defaultDimensions.w || 6,
          h: layout.widget_size.h || defaultDimensions.h || 3,
          minW: 3,
          minH: 2,
          maxW: 12,
          maxH: 6,
        }))
      };
    }
    
    return { lg: [] };
  });

  const handleLayoutChange = useCallback((layout: Layout[], allLayouts: Layouts) => {
    setLayouts(allLayouts);
    localStorage.setItem(storageKey, JSON.stringify(allLayouts));
    return layout;
  }, [storageKey]);

  useEffect(() => {
    if (dashboard) {
      setLayouts(prev => ({
        ...prev,
        lg: prev.lg || []
      }));
    }
  }, [dashboard]);

  return { layouts, handleLayoutChange };
};