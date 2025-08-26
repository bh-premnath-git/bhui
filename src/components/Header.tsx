import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";
import { useLocation } from "react-router-dom";
import { NavigationBreadcrumb } from "./NavigationBreadcrumb";
import NotebookAiButton from "./headers/notbook-header/NotebookAiButton";
import { PlaygroundHeader } from "./headers/playground-header";
import { AIChatButton } from "@/components/shared/ai-chat-button";
import { useDispatch } from "react-redux";
import { setIsFlow } from "@/store/slices/designer/buildPipeLine/BuildPipeLineSlice";
import { pipelineSchema } from "@bh-ai/schemas";
import { useEffect } from "react";
import { motion } from 'framer-motion';

export const Header = () => {
  const { isExpanded, isRightAsideOpen } = useSidebar();
  const location = useLocation();
  const dispatch = useDispatch();
  console.log(pipelineSchema, "pipelineSchema")

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
  const isHomeRoute = (path: string) =>
    path === "/home";
  const isDataXploreRoute = (path: string) =>
    /^\/data-catalog\/xplorer(\/[^/?]+)?(\?.*)?$/.test(path);

  // Handle flow state updates in useEffect to avoid setState during render
  useEffect(() => {
    if (isBuildPlaygroundRoute(location.pathname)) {
      dispatch(setIsFlow(false));
    } else if (isFlowPlaygroundRoute(location.pathname)) {
      dispatch(setIsFlow(true));
    }
  }, [location.pathname, dispatch]);

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

    // Calculate the sidebar width
    const sidebarWidth = isExpanded ? 256 : 56; // 16rem = 256px, 3.5rem = 56px

    // Calculate the available width for the header content
    // We need to account for both sidebar and right aside panel
    const rightAsideWidthPercent = getRightAsideWidth();
    const availableWidth = isRightAsideOpen
      ? `calc(100vw - ${sidebarWidth}px - ${rightAsideWidthPercent}vw)`
      : `calc(100vw - ${sidebarWidth}px)`;



    if (isBuildPlaygroundRoute(location.pathname)) {
      return <div className="w-full overflow-hidden" style={{ width: availableWidth }}>
        <PlaygroundHeader playGroundHeader="pipeline" />
      </div>;
    }
    if (isFlowPlaygroundRoute(location.pathname)) {
      return <div className="w-full overflow-hidden" style={{ width: availableWidth }}>
        <PlaygroundHeader playGroundHeader="flow" />
      </div>
    }
    if (isDataOpsHubRoute(location.pathname)) {
      return (
        <div className={cn("flex justify-between w-full overflow-hidden")} style={{ width: availableWidth }}>
          <NavigationBreadcrumb />
          {!isRightAsideOpen && <AIChatButton variant="dataops" />}
        </div>
      );
    }
    if (isDataXploreRoute(location.pathname)) {
      return (
        <div className={cn("flex justify-between w-full overflow-hidden")} style={{ width: availableWidth }}>
          <NavigationBreadcrumb />
          {!isRightAsideOpen && <AIChatButton variant="explorer" />}
        </div>
      );
    }
    if (isHomeRoute(location.pathname)) {
      return (
        <>
          {/* <div /> 
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.button
              className="relative w-8 h-8 rounded-full group flex items-center justify-center hover:bg-accent"
              style={{ backgroundColor: "#009f59" }}
              whileHover={{ scale: 1.05, opacity: 0.9 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.img
                src="/assets/ai/ai.svg"
                alt="ai"
                className="w-3 h-4 transform -rotate-[40deg] filter brightness-0 invert"
                initial={{ rotate: -45 }}
                animate={{ rotate: -40 }}
                transition={{ type: 'spring', stiffness: 150 }}
              />
            </motion.button>
          </motion.div> */}
        </>
      );

    }
    return <div className="w-full overflow-hidden" style={{ width: availableWidth }}>
      <NavigationBreadcrumb />
    </div>;
  };

  return (
    <>
    {location.pathname!=='/home'&&(<header
      className={cn(
        "fixed top-0 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-[90]",
        "transition-all duration-300 flex-shrink-0 "
      )}
      style={{
        left: isExpanded ? '256px' : '56px',
        right: '0',
        width: isRightAsideOpen
          ? `calc(100vw - ${isExpanded ? '256px' : '56px'})`
          : `calc(100vw - ${isExpanded ? '256px' : '56px'})`
      }}
    >
      <div className="flex items-center justify-between h-full px-6 w-full ">
        {renderHeaderContent()}
        {isNotebookRoute(location.pathname) && <NotebookAiButton />}
      </div>
    </header>)}
    </>
  );

};
