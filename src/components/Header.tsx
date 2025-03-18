import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";
import { NavigationBreadcrumb } from "./NavigationBreadcrumb";
import FlowPlaygroundHeader from "./headers/flow-playground-header/FlowPlaygroundHeader";
import BuildPlaygroundHeader from "./headers/build-playground-header/BuildPlaygroundHeader";
import { useLocation } from "react-router-dom";

export const Header = () => {
  const { isExpanded } = useSidebar();
  const location = useLocation();
  
  // Helper functions to check routes
  const isBuildPlaygroundRoute = (pathname: string) => {
    return pathname.startsWith("/designers/build-playground/");
  };

  const isFlowPlaygroundRoute = (pathname: string) => {
    return pathname.startsWith("/designers/flow-playground/");
  };

  // Render appropriate header content based on route
  const renderHeaderContent = () => {
    if (isBuildPlaygroundRoute(location.pathname)) {
      return <BuildPlaygroundHeader />;
    }
    if (isFlowPlaygroundRoute(location.pathname)) {
      return <FlowPlaygroundHeader />;
    }
    return <NavigationBreadcrumb />;
  };
  
  return (
    <header className={cn(
      "h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      "fixed top-0 right-0 z-30 flex items-center px-6",
      "transition-all duration-300",
      isExpanded ? "left-64" : "left-20"
    )}>
      <div className="flex items-center justify-between w-full">
        {renderHeaderContent()}
      </div>
    </header>
  );
};
