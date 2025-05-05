import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";
import { useLocation } from "react-router-dom";
import { NavigationBreadcrumb } from "./NavigationBreadcrumb";
import NotebookAiButton from "./headers/notbook-header/NotebookAiButton";
import { PlaygroundHeader } from "./headers/playground-header";

export const Header = () => {
  const { isExpanded } = useSidebar();
  const location = useLocation();

  // Route-check helpers
  const isBuildPlaygroundRoute = (path: string) =>
    path.startsWith("/designers/build-playground/");
  const isFlowPlaygroundRoute = (path: string) =>
    path.startsWith("/designers/flow-playground/");
  const isNotebookRoute = (path: string) =>
    path === "/data-catalog/notebook";

  // Decide which header content to render
  const renderHeaderContent = () => {
    if (isBuildPlaygroundRoute(location.pathname)) {
      return <PlaygroundHeader playGroundHeader="pipeline" />;
    }
    if (isFlowPlaygroundRoute(location.pathname)) {
      return <PlaygroundHeader playGroundHeader="flow" />;
    }
    return <NavigationBreadcrumb />;
  };

  // Padding to offset sidebar width
  const paddingLeft = isExpanded ? "pl-64" : "pl-24";

  return (
    <header
      className={cn(
        // Stretch full width: left:0; right:0
        "fixed top-0 inset-x-0 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-30"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between h-full px-6 transition-all duration-300",
          paddingLeft
        )}
      >
        {renderHeaderContent()}
        {isNotebookRoute(location.pathname) && <NotebookAiButton />}
      </div>
    </header>
  );
};
