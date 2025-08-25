import { type LucideIcon } from 'lucide-react';

/**
 * Represents an action item.
 */
export interface ActionItem {
  id: number;
  title: string;
  icon: LucideIcon;
}

/**
 * Represents an action category.
 */
export interface ActionCategory {
  id: string;
  title: string;
  icon: LucideIcon;
}