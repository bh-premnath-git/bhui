import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import { Header } from "@/components/Header";
import { RightAside } from "@/components/RightAside";
import { BottomDrawer } from "@/components/BottomDrawer";

const MainContentInternal = () => {
  const { isExpanded } = useSidebar(); 
  const location = useLocation();
const path=location.pathname;
  return (
    <div className={cn(
      "flex-1 flex flex-col min-w-0 transition-all duration-300 overflow-hidden",
      isExpanded ? "ml-64" : "ml-0",
    )}>
      <div className={cn("flex-shrink-0 ",path=="/home" ? " " : "mt-12")}> 
        <Header />
      </div>
      <main className="flex-1 relative overflow-auto h-full w-full "> 
        {/* Key forces remount when location changes and fixes stale DOM issues */}
        <Outlet key={location.pathname} />
      </main>
    </div>
  );
};
// Wrapper component that orchestrates the layout based on context
const LayoutWrapper = () => {
  const { 
    isRightAsideOpen, 
    isBottomDrawerOpen,
    rightAsideContent,
    rightAsideTitle,
    rightAsideWidth,
    bottomDrawerContent,
    bottomDrawerTitle,
    isExpanded
  } = useSidebar();

  const rightAsidePercentage = rightAsideWidth.match(/\[(\d+)%\]/)?.[1] || '25';

  return (
    <div className="h-screen w-full flex flex-row overflow-hidden">
      <div className="flex-shrink-0 z-[100]">
        <Sidebar /> 
      </div>
      <div 
        id="main-content-area"
        className={cn(
          "flex flex-col overflow-hidden transition-all duration-300 flex-1"
        )}
        style={{ 
          zIndex: 1
        }}>
        <MainContentInternal /> 
        {/* Render global BottomDrawer only when RightAside is closed; otherwise RightAside hosts its own drawer */}
        {(!isRightAsideOpen) && isBottomDrawerOpen && bottomDrawerContent && (
          <div 
            id="bottom-drawer-container"
            className={cn(
              "flex-shrink-0 transition-all duration-300",
              isExpanded ? "pl-[9%]" : "pl-[0.5%]",
              "w-full"
            )}
          >
            <BottomDrawer title={bottomDrawerTitle}>
              {bottomDrawerContent}
            </BottomDrawer>
          </div>
        )}
      </div>
      {isRightAsideOpen && rightAsideContent && (
        <div 
          id="right-aside-container"
          className="fixed right-0 top-0 h-full transition-all duration-300 z-[80]" 
          style={{ width: rightAsidePercentage+'%' }}
        >
          <RightAside title={rightAsideTitle} width={rightAsideWidth}>
            {rightAsideContent}
          </RightAside>
        </div>
      )}
    </div>
  );
}

const ProtectedLayout = () => {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <LayoutWrapper />
      </SidebarProvider>
    </ThemeProvider>
  );
};

export default ProtectedLayout;
