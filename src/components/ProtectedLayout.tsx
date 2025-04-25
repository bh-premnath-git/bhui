import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";
import { Header } from "@/components/Header";
import { RightAside } from "@/components/RightAside";
import { BottomDrawer } from "@/components/BottomDrawer";

const MainContent = () => {
  const { 
    isExpanded, 
    isRightAsideOpen, 
    isBottomDrawerOpen,
    rightAsideContent,
    rightAsideTitle,
    bottomDrawerContent,
    bottomDrawerTitle
  } = useSidebar();
  
  return (
    <div className={cn(
      "flex-1 transition-all duration-300",
      isExpanded ? "ml-64" : "ml-20",
      isRightAsideOpen && "mr-80",
      isBottomDrawerOpen && "mb-80"
    )}>
      <Header />
      <main className={cn(
        "p-2 mt-10 transition-all duration-300",
        // Add padding at the bottom when bottom drawer is open
        isBottomDrawerOpen && "pb-16"
      )}>
        <Outlet />
      </main>
      
      {/* Only render these components if they have content */}
      {rightAsideContent && (
        <RightAside title={rightAsideTitle}>
          {rightAsideContent}
        </RightAside>
      )}
      
      {bottomDrawerContent && (
        <BottomDrawer title={bottomDrawerTitle}>
          {bottomDrawerContent}
        </BottomDrawer>
      )}
    </div>
  );
};

const ProtectedLayout = () => {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <div className="min-h-screen w-full flex">
          <Sidebar />
          <MainContent />
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
};

export default ProtectedLayout;
