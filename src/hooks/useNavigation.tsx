
import { useState } from "react";
import { useLocation, useNavigate  } from "react-router-dom";
import type { NavigationHook, NavigationService } from "@/types/navigation-hook";

export function useNavigation(): NavigationHook {
  const location = useLocation();
  const routerNavigate = useNavigate(); // Renamed variable
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const isPathActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const isSubPathActive = (parentPath: string, subPath: string) => {
    return location.pathname === subPath && location.pathname.startsWith(parentPath);
  };

  const toggleExpanded = (path: string) => {
    setExpandedItems((prev) =>
      prev.includes(path)
        ? prev.filter((p) => p !== path)
        : [...prev, path]
    );
  };

  const isExpanded = (path: string) => expandedItems.includes(path);

  const handleNavigation: NavigationService['navigate'] = (url, forceRefetch = false) => {
    routerNavigate(url, { state: { refetch: forceRefetch } });
  };

  const navigateWithParams: NavigationService['navigateWithParams'] = (route, param) => {
    routerNavigate(route(param));
  };

  const goBack: NavigationService['goBack'] = () => {
    routerNavigate(-1);
  };
  return {
    isPathActive,
    isSubPathActive,
    toggleExpanded,
    isExpanded,
    handleNavigation,
    navigateWithParams,
    goBack
  };
}
