
import * as React from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { navigationItems } from "@/config/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface BreadcrumbItem {
  title: string;
  path: string;
}

export function NavigationBreadcrumb() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Redirect authenticated users from root to dataops-hub
  if (location.pathname === "/" && isAuthenticated) {
    return <Navigate to="/dataops-hub" replace />;
  }

  const getBreadcrumbItems = (): BreadcrumbItem[] => {
    const currentPath = location.pathname;
    const items: BreadcrumbItem[] = [{ title: "Home", path: "/dataops-hub" }];

    if (currentPath === "/") return items;

    // Special case for xplorer
    if (currentPath === "/data-catalog/xplorer") {
      items.push({ title: "Data Catalog", path: "/data-catalog" });
      items.push({ title: "Xplorer", path: "/data-catalog/xplorer" });
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
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.path}>
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
