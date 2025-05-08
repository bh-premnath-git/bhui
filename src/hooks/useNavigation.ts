import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { navigationItems } from '@/config/navigation';
import { useReports } from './useReports';
import type { NavItem } from '@/types/navigation';
import { ROUTES } from '@/config/routes';
import { PlusCircle } from 'lucide-react';

export interface NavigationHook {
  expandedItems: Set<string>;
  toggleExpanded: (path: string) => void;
  isItemExpanded: (path: string) => boolean;
  handleNavigation: (path: string, params?: Record<string, string>, forceRefetch?: boolean) => void;
  handleAction: (action: string, itemPath: string) => void;
  navigationItems: NavItem[];
  loading: boolean;
}

export function useNavigation(): NavigationHook {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const [items, setItems] = useState<NavItem[]>(navigationItems);
  const { reports, loading } = useReports();

  const toggleExpanded = (path: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const isItemExpanded = (path: string): boolean => {
    return expandedItems.has(path);
  };

  const handleNavigation = (path: string, params?: Record<string, string>, forceRefetch = false) => {
    let finalPath = path;
    
    // Replace path parameters if provided
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        finalPath = finalPath.replace(`:${key}`, value);
      });
    }

    navigate(finalPath, { state: { refetch: forceRefetch } });
  };

  const handleAction = (action: string, itemPath: string) => {
    console.log(`Action ${action} for item ${itemPath}`);
    
    switch (action) {
      case 'menu':
        // For the menu action, we will handle this in the component
        // by showing a dropdown when the ellipsis is clicked
        console.log('Menu clicked for Data Explorer');
        break;
      
      default:
        console.warn(`Unknown action: ${action}`);
    }
  };

  useEffect(() => {
    if (!loading) {
      // Find the Data Explorer item and update its subItems
      const updatedItems = items.map(item => {
        if (item.path === `${ROUTES.DATA_CATALOG}/xplorer`) {
          return {
            ...item,
            subItems: [...reports]
          };
        }
        return item;
      });
      
      setItems(updatedItems);
      
      // Auto-expand Data Explorer section when reports are loaded
      if (reports.length > 0) {
        setExpandedItems(prev => {
          const newSet = new Set(prev);
          newSet.add(`${ROUTES.DATA_CATALOG}/xplorer`);
          return newSet;
        });
      }
    }
  }, [reports, loading]);

  return {
    expandedItems,
    toggleExpanded,
    isItemExpanded,
    handleNavigation,
    handleAction,
    navigationItems: items,
    loading,
  };
}