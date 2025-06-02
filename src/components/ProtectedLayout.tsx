import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import { Header } from "@/components/Header";
import { RightAside } from "@/components/RightAside";
import { BottomDrawer } from "@/components/BottomDrawer";

const MainContentInternal = () => {
  const { isExpanded } = useSidebar(); 
  return (
    <div className={cn(
      "flex-1 flex flex-col min-w-0 transition-all duration-300 overflow-hidden",
      isExpanded ? "ml-64" : "ml-20",
    )}>
      <div className="flex-shrink-0 mt-12"> 
        <Header />
      </div>
      <main className="flex-1 relative overflow-auto h-[calc(100vh-64px)] "> 
        <Outlet />
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

  return (
    <div className="h-screen w-full flex flex-row overflow-hidden">
      <div className="flex-shrink-0">
        <Sidebar /> 
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
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
        <div className="flex-shrink-0 h-full z-50 w-[40%]">
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
