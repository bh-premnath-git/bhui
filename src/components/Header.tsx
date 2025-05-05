import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";
import { NavigationBreadcrumb } from "./NavigationBreadcrumb";
import { useLocation } from "react-router-dom";
import NotebookAiButton from "./headers/notbook-header/NotebookAiButton";
import { PlaygroundHeader } from "./headers/playground-header";
import { PipeLineChatPanel } from "@/features/designers/pipeline/components/PipeLineChatPanel";
import { PipeLineChatProvider } from "@/context/designers/PipeLineChatContext";
import { useEffect } from "react";

export const Header = () => {
  const { isExpanded } = useSidebar();
  const location = useLocation();
const { setRightAsideContent, rightAsideContent, isRightAsideOpen, openRightAside,closeRightAside } = useSidebar();
  
  // Helper functions to check routes
  const isBuildPlaygroundRoute = (pathname: string) => {
    // alert()
    // const chatPanel = (
    //   <PipeLineChatProvider>
    //     <PipeLineChatPanel 
    //       imageSrc="/assets/ai/ai.svg"
    //     />
    //   </PipeLineChatProvider>
    // );
    
    // // Only set the content if it's not already set
    // if (!rightAsideContent) {
    //   setRightAsideContent(chatPanel, 'Pipeline Assistant');
    // }
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
    }else{
      setRightAsideContent(null, '');
      closeRightAside()
    }
    if (isFlowPlaygroundRoute(location.pathname)) {
      return <PlaygroundHeader playGroundHeader="flow" />;
    }
    return <NavigationBreadcrumb />;
  };
  
  return (
    <header className={cn(
      "h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      "fixed top-0 left-0 z-30 flex items-center px-6",
      "transition-all duration-300",
      isExpanded ? "right-[30%] left-20" : "right-0 left-20"
    )}>
      <div className="flex items-center justify-between w-full">
        {renderHeaderContent()}
        {isNotebookRoute(location.pathname) && <NotebookAiButton />}
      </div>
    </header>
  );
};
