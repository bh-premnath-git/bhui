
import { LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  path: string;
  icon: LucideIcon;
  subItems?: NavItem[];
  parent?: string;
}

export type NavigationItem = NavItem;
