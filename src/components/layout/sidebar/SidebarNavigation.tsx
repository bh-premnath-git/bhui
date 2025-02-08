import { NavLink } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { LucideIcon } from 'lucide-react';

interface NavigationItem {
  name: string;
  to: string;
  icon: LucideIcon;
}

interface SidebarNavigationProps {
  items: NavigationItem[];
  isCollapsed: boolean;
}

export const SidebarNavigation = ({ items, isCollapsed }: SidebarNavigationProps) => {
  return (
    <nav className="flex-1 overflow-y-auto space-y-1">
      {items.map((item) => (
        <NavLink
          key={item.name}
          to={item.to}
          className={({ isActive }) =>
            cn(
              'flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
              isActive
                ? 'bg-gray-100 text-gray-900'
                : 'text-muted-foreground hover:bg-gray-50 hover:text-gray-900',
              isCollapsed ? 'justify-center' : 'gap-3'
            )
          }
        >
          <item.icon className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>{item.name}</span>}
        </NavLink>
      ))}
    </nav>
  );
};