import { RootState } from '@/store/store';
import { toggleSidebar } from '@/store/features/sidebarSlice';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import { SidebarLogo } from './sidebar/SidebarLogo';
import { SidebarCollapseButton } from './sidebar/SidebarCollapseButton';
import { SidebarFooter } from './sidebar/SidebarFooter';
import { menuList } from '@/config/menuConfig';
import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';

export const AppSidebar = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isCollapsed = useAppSelector((state: RootState) => state.sidebar.isCollapsed);
  const { theme, setTheme } = useTheme();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleThemeChange = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleExpanded = (path: string) => {
    setExpandedItems(prev => 
      prev.includes(path) 
        ? prev.filter(item => item !== path)
        : [...prev, path]
    );
  };

  const handleMenuClick = (e: React.MouseEvent, item: typeof menuList[0]) => {
    if (item.subPaths) {
      e.preventDefault();
      toggleExpanded(item.path);
      // Navigate to the main path when clicking on items with subpaths
      navigate(item.path);
    }
  };

  return (
    <div
      className={cn(
        'relative h-screen bg-card border-r flex flex-col sidebar-animation',
        isCollapsed ? 'w-16' : 'w-52'
      )}
    >
      <div className="flex h-12 items-center justify-between px-4 border-b">
        <SidebarLogo isCollapsed={isCollapsed} />
      </div>

      <SidebarCollapseButton 
        isCollapsed={isCollapsed} 
        onToggle={() => dispatch(toggleSidebar())} 
      />

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {menuList.map((item) => (
          <div key={item.path} className="space-y-1">
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 relative group',
                  isActive
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-muted-foreground hover:bg-primary/5 hover:text-primary',
                  isCollapsed ? 'justify-center' : 'gap-3'
                )
              }
              onClick={(e) => handleMenuClick(e, item)}
            >
              {({ isActive }) => (
                <>
                  <span className={cn(
                    "transition-transform duration-200",
                    isActive && "scale-110"
                  )}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.subPaths && (
                        <ChevronDown
                          size={16}
                          className={cn(
                            "transition-transform duration-300 ease-in-out",
                            expandedItems.includes(item.path) ? "rotate-180" : ""
                          )}
                        />
                      )}
                    </>
                  )}
                </>
              )}
            </NavLink>

            {!isCollapsed && item.subPaths && (
              <div 
                className={cn(
                  "ml-4 space-y-1 overflow-hidden transition-all duration-300 ease-in-out",
                  expandedItems.includes(item.path) ? "opacity-100" : "opacity-0 h-0"
                )}
                style={{
                  maxHeight: expandedItems.includes(item.path) ? item.subPaths.length * 40 : 0,
                }}
              >
                {item.subPaths.map((subItem) => (
                  <NavLink
                    key={subItem.path}
                    to={subItem.path}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center px-2 py-1.5 text-sm rounded-md transition-all duration-200 gap-2 group/sub',
                        isActive
                          ? 'bg-primary/10 text-primary shadow-sm'
                          : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'
                      )
                    }
                  >
                    <span className={cn(
                      "transition-transform duration-200 opacity-75 group-hover/sub:opacity-100",
                    )}>
                      {subItem.icon}
                    </span>
                    <span className="truncate">{subItem.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <SidebarFooter 
        isCollapsed={isCollapsed}
        theme={theme}
        onThemeChange={handleThemeChange}
      />
    </div>
  );
};