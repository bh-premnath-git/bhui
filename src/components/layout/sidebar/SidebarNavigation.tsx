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
    <nav className="flex-1 overflow-y-auto space-y-1 p-2">
      {items.map((item) => (
        <NavLink
          key={item.name}
          to={item.to}
          className={({ isActive }) =>
            cn(
              'flex items-center px-2 py-2 text-sm font-medium rounded-md relative group',
              'transition-all duration-200 ease-in-out',
              isActive
                ? 'bg-primary/10 text-primary shadow-sm'
                : 'text-muted-foreground hover:bg-primary/5 hover:text-primary',
              isCollapsed ? 'justify-center' : 'gap-3'
            )
          }
        >
          {({ isActive }) => (
            <>
              <span className={cn(
                "sidebar-icon",
                isActive && "scale-110"
              )}>
                <item.icon className="h-5 w-5" />
              </span>
              <div 
                className={cn(
                  "sidebar-content truncate",
                  isCollapsed && "sidebar-content-collapsed"
                )}
              >
                <span className="whitespace-nowrap">{item.name}</span>
              </div>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};