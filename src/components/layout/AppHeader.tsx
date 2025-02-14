import { useLocation } from "react-router-dom";
import { menuList } from "@/config/menuConfig";
import { FlowProvider } from '@/context/FlowContext';
import { FlowHeader } from '@/components/layout/flow-heaader';
import { PipelineHeader } from '@/components/layout/pipeline-header';

export const AppHeader = () => {
  const location = useLocation();

  const getPageTitle = (path: string) => {
    const mainRoute = menuList.find(item => item.path === path);
    if (mainRoute) return mainRoute.label;

    for (const item of menuList) {
      if (item.subPaths) {
        const subRoute = item.subPaths.find(subItem => path.startsWith(subItem.path));
        if (subRoute) return subRoute.label;
      }
    }

    return '';
  };

  const pageTitle = getPageTitle(location.pathname);

  // Determine which header to show
  if (location.pathname.startsWith('/designers/flow-playground/')) {
    return (
      <FlowProvider>
        <header className="h-12 border-b bg-card text-card-foreground flex items-center px-4">
          <FlowHeader />
        </header>
      </FlowProvider>
    );
  }

  if (location.pathname.startsWith('/designers/build-playground/')) {
    return (
      <FlowProvider>
        <header className="h-12 border-b bg-card text-card-foreground flex items-center px-4">
          <PipelineHeader />
        </header>
      </FlowProvider>
    );
  }

  return (
    <FlowProvider>
      <header className="h-12 border-b bg-card text-card-foreground flex items-center px-4">
        <h1 className="text-lg font-semibold">{pageTitle}</h1>
        <div className="flex-1" />
      </header>
    </FlowProvider>
  );
};
