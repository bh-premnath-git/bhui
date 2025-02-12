import { useLocation } from "react-router-dom";
import { menuList } from "@/config/menuConfig";

export const AppHeader = () => {
  const location = useLocation();
  console.log("location", location);
  
  const getPageTitle = (path: string) => {
    // First check main routes
    const mainRoute = menuList.find(item => item.path === path);
    if (mainRoute) return mainRoute.label;

    // Then check sub-routes
    for (const item of menuList) {
      if (item.subPaths) {
        const subRoute = item.subPaths.find(subItem => path.startsWith(subItem.path));
        if (subRoute) return subRoute.label;
      }
    }

    return 'Data Catalog';
  };

  const pageTitle = getPageTitle(location.pathname);
  
  return (
    <header className="h-12 border-b bg-card text-card-foreground flex items-center px-4">
      <h1 className="text-lg font-semibold">{pageTitle}</h1>
      <div className="flex-1" />
    </header>
  );
};