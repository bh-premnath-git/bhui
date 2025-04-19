import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";
import { NavigationBreadcrumb } from "./NavigationBreadcrumb";
import { useLocation } from "react-router-dom";
import NotebookAiButton from "./headers/notbook-header/NotebookAiButton";
import { PlaygroundHeader } from "./headers/playground-header";

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

  const isNotebookRoute = (pathname: string) => {
    return pathname === "/data-catalog/notebook";
  };

  const renderHeaderContent = () => {
    if (isBuildPlaygroundRoute(location.pathname)) {
      return <PlaygroundHeader playGroundHeader="pipeline" />;
    }
    if (isFlowPlaygroundRoute(location.pathname)) {
      return <PlaygroundHeader playGroundHeader="flow" />;
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
        {isNotebookRoute(location.pathname) && <NotebookAiButton />}
      </div>
    </header>
  );
};
