import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import { Header } from "@/components/Header";
import { RightAside } from "@/components/RightAside";
import { BottomDrawer } from "@/components/BottomDrawer";

// Internal component for main content area (excluding drawer/aside)
const MainContentInternal = () => {
  const { isExpanded } = useSidebar(); 

  return (
    // This div takes up remaining vertical space and handles sidebar margin
    <div className={cn(
      "flex-1 flex flex-col transition-all duration-300 overflow-hidden", // Ensure it handles overflow
      isExpanded ? "ml-64" : "ml-20",
    )}>
      {/* Wrap Header in a div to apply flex-shrink-0 */}
      <div className="flex-shrink-0"> 
        <Header />
      </div>
      {/* Main content scrolls internally */}
      <main className="flex-1 p-2 mt-10 overflow-auto"> 
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
    // Main flex row: Sidebar | Middle Column | RightAside
    <div className="min-h-screen w-full flex flex-row overflow-hidden"> {/* Ensure row overflow is hidden */}
      {/* Wrap Sidebar in a div to apply flex-shrink-0 */}
      <div className="flex-shrink-0">
        <Sidebar /> 
      </div>
      
      {/* Middle flex column: Main Content | Bottom Drawer */}
      <div className="flex flex-1 flex-col overflow-hidden"> {/* This column takes remaining width */}
        <MainContentInternal /> 
        {/* Conditionally render BottomDrawer if open and has content */}
        {isBottomDrawerOpen && bottomDrawerContent && (
          // Wrap BottomDrawer in a div to apply flex-shrink-0
          <div className="flex-shrink-0">
            <BottomDrawer title={bottomDrawerTitle}>
              {bottomDrawerContent}
            </BottomDrawer>
          </div>
        )}
      </div>

      {/* Conditionally render RightAside if open and has content */}
      {isRightAsideOpen && rightAsideContent && (
        // Wrap RightAside in a div to apply flex-shrink-0
        <div className="flex-shrink-0">
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
        {/* Use the LayoutWrapper which has access to SidebarContext */}
        <LayoutWrapper /> 
      </SidebarProvider>
    </ThemeProvider>
  );
};

export default ProtectedLayout;
