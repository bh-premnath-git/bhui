import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export interface NavigationHook {
  expandedItems: Set<string>;
  toggleExpanded: (path: string) => void;
  isItemExpanded: (path: string) => boolean;
  handleNavigation: (path: string, params?: Record<string, string>, forceRefetch?: boolean) => void;
}

export function useNavigation(): NavigationHook {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

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

  return {
    expandedItems,
    toggleExpanded,
    isItemExpanded,
    handleNavigation,
  };
}
