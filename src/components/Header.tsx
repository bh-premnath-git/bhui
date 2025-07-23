import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";
import { useLocation } from "react-router-dom";
import { NavigationBreadcrumb } from "./NavigationBreadcrumb";
import NotebookAiButton from "./headers/notbook-header/NotebookAiButton";
import { PlaygroundHeader } from "./headers/playground-header";
import { AIChatButton } from "@/components/shared/ai-chat-button";
import { useDispatch } from "react-redux";
import { setIsFlow } from "@/store/slices/designer/buildPipeLine/BuildPipeLineSlice";
import { useEffect, useState } from "react";
import {pipelineSchema} from "@bh-ai/schemas"
export const Header = () => {
  const { isExpanded, isRightAsideOpen } = useSidebar();
  const location = useLocation();
  const dispatch = useDispatch();
  const [forceUpdate, setForceUpdate] = useState(0);
  const dataPipelineSchema = pipelineSchema
  console.log(dataPipelineSchema)
  // Listen for resize events to update the header when the RightAside panel is resized
  useEffect(() => {
    const handleResize = () => {
      setForceUpdate(prev => prev + 1);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Also listen for a custom event that might be triggered when the RightAside panel is resized
    const handleRightAsideResize = () => {
      setForceUpdate(prev => prev + 1);
    };
    
    document.addEventListener('rightAsideResize', handleRightAsideResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('rightAsideResize', handleRightAsideResize);
    };
  }, []);

  // Route-check helpers
  const isBuildPlaygroundRoute = (path: string) =>
    path.startsWith("/designers/build-playground/");
  const isFlowPlaygroundRoute = (path: string) =>
    path.startsWith("/designers/flow-playground/") ||
    path.startsWith("/designers/data-flow-playground/");
  const isNotebookRoute = (path: string) =>
    path === "/data-catalog/notebook";
  const isDataOpsHubRoute = (path: string) =>
    path === "/dataops-hub";
  const isDataXploreRoute = (path: string) =>
    path === "/data-catalog/xplorer";

  // Decide which header content to render
  const renderHeaderContent = () => {
    // Get the current width of the right aside panel if it's open
    const getRightAsideWidth = () => {
      if (!isRightAsideOpen) return 0;
      
      const container = document.getElementById('right-aside-container');
      if (container) {
        const containerWidth = container.getBoundingClientRect().width;
        const windowWidth = window.innerWidth;
        return (containerWidth / windowWidth) * 100;
      }
      return 25; // Default to 25% if container not found
    };
    
    // Calculate the available width for the header content
    const availableWidth = isRightAsideOpen ? `calc(100% - ${getRightAsideWidth()}%)` : "100%";
    
    if (isBuildPlaygroundRoute(location.pathname)) {
      dispatch(setIsFlow(false))

      return <div className="w-full" style={{ maxWidth: availableWidth }}>
        <PlaygroundHeader playGroundHeader="pipeline" />
      </div>;
    }
    if (isFlowPlaygroundRoute(location.pathname)) {
      dispatch(setIsFlow(true))
      return <div className="w-full" style={{ maxWidth: availableWidth }}>
        <PlaygroundHeader playGroundHeader="flow" />
      </div>
    }
    if (isDataOpsHubRoute(location.pathname)) {
      return (
        <div className={cn("flex justify-between w-full")} style={{ maxWidth: availableWidth }}>
          <NavigationBreadcrumb />
          {!isRightAsideOpen && <AIChatButton variant="dataops" />}
        </div>
      );
    }
    if (isDataXploreRoute(location.pathname)) {
      return (
        <div className={cn("flex justify-between w-full")} style={{ maxWidth: availableWidth }}>
          <NavigationBreadcrumb />
          {!isRightAsideOpen && <AIChatButton variant="explorer" />}
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
        "fixed top-0 inset-x-0 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-[90]"
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
