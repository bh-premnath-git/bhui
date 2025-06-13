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
  return (
    <div className={cn(
      "flex-1 flex flex-col min-w-0 transition-all duration-300 overflow-hidden",
      isExpanded ? "ml-64" : "ml-20",
    )}>
      <div className="flex-shrink-0 mt-12"> 
        <Header />
      </div>
      <main className="flex-1 relative overflow-auto h-[calc(100vh-64px)] "> 
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
    bottomDrawerTitle
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
          "flex flex-col overflow-hidden transition-all duration-300",
           isRightAsideOpen ? '' : 'flex-1'
        )}
        style={{ zIndex: 1, width: isRightAsideOpen ? `calc(100% - ${rightAsidePercentage}%)` : undefined }}>
        <MainContentInternal /> 
        {isBottomDrawerOpen && bottomDrawerContent && (
          <div className="flex-shrink-0 pl-[1%]">
            <BottomDrawer title={bottomDrawerTitle}>
              {bottomDrawerContent}
            </BottomDrawer>
          </div>
        )}
      </div>
      {isRightAsideOpen && rightAsideContent && (
        <div 
          id="right-aside-container"
          className="flex-shrink-0 h-full transition-all duration-300" 
          style={{ width: rightAsidePercentage+'%', zIndex: 80 }}
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
