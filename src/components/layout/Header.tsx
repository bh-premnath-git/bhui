import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";
import { NavigationBreadcrumb } from "./NavigationBreadcrumb";

export function Header() {
  const { isExpanded } = useSidebar();

  return (
    <header
      className={cn(
        "h-16 border-b border-border bg-background fixed top-0 right-0 z-30",
        "transition-all duration-300",
        isExpanded ? "left-64" : "left-20"
      )}
    >
      <div className="h-full flex items-center px-6">
        <NavigationBreadcrumb />
      </div>
    </header>
  );
}
