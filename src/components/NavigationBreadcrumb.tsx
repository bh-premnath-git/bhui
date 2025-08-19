import * as React from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { navigationItems } from "@/config/navigation";
import { useAppSelector } from "@/hooks/useRedux";
import { RootState } from "@/store";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext"; // <-- add this import

interface BreadcrumbItem {
  title: string;
  path: string;
}

export function NavigationBreadcrumb() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { isExpanded } = useSidebar(); 
  const selectedProject = useAppSelector((state: RootState) => state.projects.selectedProject);
  const selectedConnection = useAppSelector((state: RootState) => state.connections.selectedconnection);
  const selectedEnvironment = useAppSelector((state: RootState) => state.environments.selectedEnvironment);

  // Redirect authenticated users from root to home
  if (location.pathname === "/" && isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  const getBreadcrumbItems = (): BreadcrumbItem[] => {
    const currentPath = location.pathname;
    const items: BreadcrumbItem[] = [{ title: "Home", path: "/home" }];

    if (currentPath === "/") return items;

    // Special case for xplorer
    if (currentPath === "/data-catalog/xplorer") {
      items.push({ title: "Xplorer", path: "/data-catalog/xplorer" });
      return items;
    }

    if (currentPath === "/data-catalog/notebook") {
      items.push({ title: "Data Catalog", path: "/data-catalog" });
      items.push({ title: "Notebook", path: "/data-catalog/notebook" });
      return items;
    }

    // Special case for dataops-hub/ops-hub/data-xplorer
    if (currentPath === "/dataops-hub/ops-hub/data-xplorer") {
      items.push({ title: "DataOps Hub", path: "/dataops-hub" });
      items.push({ title: "Ops Hub", path: "/dataops-hub/ops-hub" });
      items.push({ title: "Data Xplorer", path: "/dataops-hub/ops-hub/data-xplorer" });
      return items;
    }

    // Handle report detail paths
    if (currentPath.startsWith("/data-catalog/xplorer/")) {
      items.push({ title: "Xplorer", path: "/data-catalog/xplorer" });
      
      const searchParams = new URLSearchParams(location.search);
      const reportName = searchParams.get('reportName');
      
      if (reportName) {
        items.push({ title: reportName, path: currentPath });
      } else {
        const reportId = currentPath.split("/").pop();
        
        if (reportId) {
          const formattedName = reportId
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          items.push({ title: formattedName, path: currentPath });
        }
      }
      
      return items;
    }

    // Special case for project edit page
    if (currentPath.match(/\/admin-console\/projects\/edit\/\d+/)) {
      items.push({ title: "Admin Console", path: "/admin-console" });
      items.push({ title: "Projects", path: "/admin-console/projects" });
      
      // Add project name if available in Redux
      if (selectedProject) {
        items.push({ 
          title: `${selectedProject.bh_project_name}`, 
          path: currentPath 
        });
      } else {
        items.push({ title: "Project", path: currentPath });
      }
      return items;
    }
    // Special case for connection edit page
    if (currentPath.match(/\/admin-console\/connection\/edit\/\d+/)) {
      items.push({ title: "Admin Console", path: "/admin-console" });
      items.push({ title: "connection", path: "/admin-console/connection" });
      
      // Add project name if available in Redux
      if (selectedConnection) {
        items.push({ 
          title: `${selectedConnection.connection_config_name}`, 
          path: currentPath 
        });
      } else {
        items.push({ title: "connection", path: currentPath });
      }
      return items;
    }
    
    // Special case for environment edit page
    if (currentPath.match(/\/admin-console\/environment\/edit\/\d+/)) {
      items.push({ title: "Admin Console", path: "/admin-console" });
      items.push({ title: "Environment", path: "/admin-console/environment" });
      
      // Add environment name if available in Redux
      if (selectedEnvironment) {
        items.push({ 
          title: `${selectedEnvironment.bh_env_name}`, 
          path: currentPath 
        });
      } else {
        items.push({ title: "Environment", path: currentPath });
      }
      return items;
    }

    const pathSegments = currentPath.split("/").filter(Boolean);
    let currentPathBuild = "";

    for (const segment of pathSegments) {
      currentPathBuild += `/${segment}`;

      // Look for matching navigation item
      for (const navItem of navigationItems) {
        if (currentPathBuild === navItem.path) {
          items.push({ title: navItem.title, path: navItem.path });
          break;
        }

        // Check sub-items
        if (navItem.subItems) {
          for (const subItem of navItem.subItems) {
            if (currentPathBuild === subItem.path) {
              // Add parent item first
              if (items.findIndex(item => item.path === navItem.path) === -1) {
                items.push({ title: navItem.title, path: navItem.path });
              }
              // Then add sub-item
              items.push({ title: subItem.title, path: subItem.path });
              break;
            }
          }
        }
      }
    }

    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  return (
    <Breadcrumb className={cn("flex items-center h-full mt-2", isExpanded && "ml-5")}>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={`${item.path}-${index}`}>
            <BreadcrumbItem>
              {index === breadcrumbItems.length - 1 ? (
                <span className="font-medium text-foreground">{item.title}</span>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={item.path} className="flex items-center gap-1">
                    {index === 0 ? <Home className="h-3 w-3" /> : item.title}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
