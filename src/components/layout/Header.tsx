
import { useLocation } from "react-router-dom";
import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";
import { navigationItems } from "@/config/navigation";

export function Header() {
  const location = useLocation();
  const { isExpanded } = useSidebar();

  const getCurrentPageTitle = () => {
    const currentPath = location.pathname;    
    const navItem = navigationItems.find(item => {
      if (currentPath === item.path) return true;
      return item.subItems?.some(subItem => currentPath === subItem.path);
    });

    if (currentPath === '/') return 'Dashboard';

    const subItem = navItem?.subItems?.find(item => currentPath === item.path);
    
    return subItem?.title || navItem?.title || 'Not Found';
  };

  return (
    <header className={cn(
      "h-16 border-b border-border bg-background fixed top-0 right-0 z-30",
      "transition-all duration-300",
      isExpanded ? "left-64" : "left-20"
    )}>
      <div className="h-full flex items-center px-6">
        <h1 className="text-xl font-semibold">{getCurrentPageTitle()}</h1>
      </div>
    </header>
  );
}
