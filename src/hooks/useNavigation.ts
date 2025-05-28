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

    // Clean up any event listeners that might be interfering with navigation
    const cleanupEvents = () => {
      // Remove common event listeners that might be causing issues
      const commonEvents = ['click', 'mousedown', 'mouseup', 'touchstart', 'touchend'];
      commonEvents.forEach(event => {
        window.removeEventListener(event, (e) => e.stopPropagation(), true);
      });
    };

    // Use a timeout to ensure any pending state updates are completed before navigation
    setTimeout(() => {
      cleanupEvents();
      
      // Use window.location for direct navigation to ensure it works
      window.location.href = finalPath;
      
      // As a fallback, also try the React Router navigation
      navigate(finalPath, { 
        state: { refetch: forceRefetch, timestamp: Date.now() },
        replace: true
      });
    }, 10);
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