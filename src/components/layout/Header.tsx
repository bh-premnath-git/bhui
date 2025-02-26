import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";
import { NavigationBreadcrumb } from "./NavigationBreadcrumb";
import { useLocation, useParams } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { BuildPlaygroundHeader } from "./BuildPlaygroundHeader";
import { FlowPlaygroundHeader } from "./FlowPlaygroundHeader";
import { FlowProvider } from "@/context/designers/FlowContext";

export function Header() {
  const { isExpanded } = useSidebar();
  const location = useLocation();
  const { id } = useParams();

  const isBuildPlaygroundRoute = (pathname: string) => {
    return pathname.startsWith(ROUTES.DESIGNERS.BUILD_PLAYGROUND('').replace(':id', ''));
  };

  const isFlowPlaygroundRoute = (pathname: string) => {
    return pathname.startsWith(ROUTES.DESIGNERS.FLOW_PLAYGROUND('').replace(':id', ''));
  };

  const renderHeaderContent = () => {
    if (isBuildPlaygroundRoute(location.pathname)) {
      return <BuildPlaygroundHeader />;
    }
    if (isFlowPlaygroundRoute(location.pathname)) {
      return (
        <FlowProvider>
          <FlowPlaygroundHeader />
        </FlowProvider>
      );
    }
    return <NavigationBreadcrumb />;
  };

  return (
    <header
      className={cn(
        "h-14 border-b border-border bg-background fixed top-0 right-0 z-30",
        "transition-all duration-300",
        isExpanded ? "left-64" : "left-20"
      )}
    >
      <div className="h-full flex items-center px-6 w-full">
        {renderHeaderContent()}
      </div>
    </header>
  );
}
