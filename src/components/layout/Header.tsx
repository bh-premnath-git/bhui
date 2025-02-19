import { useLocation } from "react-router-dom";
import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";
import { navigationItems } from "@/config/navigation";

export function Header() {
  const location = useLocation();
  const { isExpanded } = useSidebar();

  const getCurrentPageTitle = () => {
    const currentPath = location.pathname;

    if (currentPath === "/") return "Dashboard";

    for (const navItem of navigationItems) {
      if (currentPath.startsWith(navItem.path)) return navItem.title;

      if (navItem.subItems) {
        for (const subItem of navItem.subItems) {
          if (currentPath.startsWith(subItem.path)) return subItem.title;
        }
      }
    }

    return "Page Not Found";
  };

  return (
    <header
      className={cn(
        "h-16 border-b border-border bg-background fixed top-0 right-0 z-30",
        "transition-all duration-300",
        isExpanded ? "left-64" : "left-20"
      )}
    >
      <div className="h-full flex items-center px-6">
        <h1 className="text-xl font-semibold">{getCurrentPageTitle()}</h1>
      </div>
    </header>
  );
}
