import { LucideIcon } from "lucide-react";

export interface NavAction {
  icon?: string;
  action: string;
}

export interface NavItem {
  title: string;
  path: string;
  icon?: LucideIcon;
  subItems?: NavItem[];
  parent?: string;
  actions?: NavAction[];
}

export type NavigationItem = NavItem;