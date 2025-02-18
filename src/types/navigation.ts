
import { LucideIcon } from "lucide-react";

// Base navigation properties
export interface BaseNavigationItem {
  title: string;
  path: string;
}

// Icon-specific properties
export interface NavigationIcon {
  icon: LucideIcon;
}

// Common navigation item interface
export interface NavigationItem extends BaseNavigationItem, NavigationIcon {
  parent?: string;
}

// Main navigation item with optional sub-items
export interface NavItem extends NavigationItem {
  subItems?: NavigationItem[];
}

// Type guard to check if an item has sub-items
export const hasSubItems = (item: NavItem): item is NavItem & { subItems: NavigationItem[] } => {
  return Array.isArray(item.subItems) && item.subItems.length > 0;
};
