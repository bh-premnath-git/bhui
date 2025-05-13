import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";
import { useLocation } from "react-router-dom";
import { NavigationBreadcrumb } from "./NavigationBreadcrumb";
import NotebookAiButton from "./headers/notbook-header/NotebookAiButton";
import { PlaygroundHeader } from "./headers/playground-header";
import { AIChatButton } from "@/components/shared/ai-chat-button";

export const Header = () => {
  const { isExpanded } = useSidebar();
  const location = useLocation();
  const { isRightAsideOpen } = useSidebar();

  // Route-check helpers
  const isBuildPlaygroundRoute = (path: string) =>
    path.startsWith("/designers/build-playground/");
  const isFlowPlaygroundRoute = (path: string) =>
    path.startsWith("/designers/flow-playground/");
  const isNotebookRoute = (path: string) =>
    path === "/data-catalog/notebook";
  const isDataOpsHubRoute = (path: string) =>
    path === "/dataops-hub";
  const isDataXploreRoute = (path: string) =>
    path === "/data-catalog/xplorer";

  // Decide which header content to render
  const renderHeaderContent = () => {
    if (isBuildPlaygroundRoute(location.pathname)) {
      return <div className={cn(isRightAsideOpen ? "w-[69%]" : "w-[100%]")}>
        <PlaygroundHeader playGroundHeader="pipeline" />
      </div>;
    }
    if (isFlowPlaygroundRoute(location.pathname)) {
      return <div className={cn(isRightAsideOpen ? "w-[69%]" : "w-[100%]")}>
        <PlaygroundHeader playGroundHeader="flow" />
      </div>
    }
    if (isDataOpsHubRoute(location.pathname)) {
      return (
        <div className={cn(isRightAsideOpen ? "w-[69%]" : "w-[100%]","flex justify-between")}>
          <NavigationBreadcrumb />
          <AIChatButton variant="dataops" />
        </div>
      );
    }
    if (isDataXploreRoute(location.pathname)) {
      return (
        <div className={cn(isRightAsideOpen ? "w-[74%]" : "w-[100%]","flex justify-between")}>
          <NavigationBreadcrumb />
          <AIChatButton variant="explorer" />
        </div>
      );
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
