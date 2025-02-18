export interface NavigationService {
  navigate(path: string, forceRefetch?: boolean): void;
  navigateWithParams(route: (param: string) => string, param: string): void;
  goBack(): void;
}

export interface NavigationHook {
  isPathActive: (path: string) => boolean;
  isSubPathActive: (parentPath: string, subPath: string) => boolean;
  toggleExpanded: (path: string) => void;
  isExpanded: (path: string) => boolean;
  handleNavigation: NavigationService['navigate'];
  navigateWithParams: NavigationService['navigateWithParams'];
  goBack: NavigationService['goBack'];
}


