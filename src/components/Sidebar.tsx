import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { menuList } from '@/configration/menuList';
import { jwtDecode } from 'jwt-decode';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ReactNode;
  path: string;
  label: string;
  shortcut?: string;
  subPaths?: {
    path: string;
    label: string;
    icon: React.ReactNode;
    shortcut?: string;
  }[];
}

interface RoleAccess {
  [key: string]: string[];
}

const roleAccess: RoleAccess = {
  'admin-user': ['Data Catalog', 'Admin Console'],
  'designer-user': ['Data Catalog', 'Designer'],
  'ops-user': ['Data Catalog', 'DataOps Hub'],
};

const getUserRoles = () => {
  const token: any = sessionStorage?.getItem("token");
  const decoded: any = token ? jwtDecode(token) : null;
  return decoded?.realm_access?.roles;
};

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { pathname } = useLocation();
  const userRoles = getUserRoles();
  const navigate = useNavigate();

  const allowedItems = Array.from(
    new Set(userRoles?.flatMap((role: any) => roleAccess[role] || []))
  );

  const filteredNavItems: NavItem[] = menuList.filter((item) =>
    allowedItems.includes(item.label)
  );

  useEffect(() => {
    const isDesignerFlowWithId = /^\/designers\/manage-flow\/.+$/.test(pathname);
    setIsMounted(!isDesignerFlowWithId && pathname !== '/login');
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.altKey) {
        const allItems = menuList.flatMap(item => [item, ...(item.subPaths || [])]);
        const matchingItem = allItems.find(item =>
          item.shortcut?.toLowerCase().includes(event.key.toLowerCase())
        );
        if (matchingItem) {
          event.preventDefault();
          navigate(matchingItem.path);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  if (!isMounted) return null;

  return (
    <aside
      className={cn(
        "fixed top-14 left-0 z-20 h-[calc(100vh-56px)] bg-background/60 backdrop-blur-sm transition-all duration-500 ease-in-out border-r border-border/40",
        isExpanded ? "w-60" : "w-14"
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex flex-col h-full py-1">
        <nav className="flex-1 px-2 space-y-0.5">
          {filteredNavItems.map((item) => (
            <div key={item.path} className="relative space-y-0.5">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.path}
                      className={cn(
                        "flex items-center justify-between w-full rounded-md px-2.5 py-1.5 text-sm transition-all duration-200",
                        "group relative overflow-hidden",
                        pathname === item.path
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-accent/50 text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex h-4 w-4 items-center justify-center">
                          {item.icon}
                        </span>
                        <span className={cn(
                          "transition-all duration-300",
                          !isExpanded && "opacity-0 -translate-x-4 overflow-hidden"
                        )}>
                          {item.label}
                        </span>
                      </div>
                      {isExpanded && item.shortcut && (
                        <Badge variant="secondary" className="bg-whiteh-4 px-1 text-[10px] font-mono">
                          {item.shortcut}
                        </Badge>
                      )}
                    </Link>
                  </TooltipTrigger>
                  {!isExpanded && (
                    <TooltipContent side="right" sideOffset={10}>
                      {item.label} {item.shortcut && `(${item.shortcut})`}
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>

              {item.subPaths && (
                <div className={cn(
                  "space-y-0.5",
                  isExpanded ? "ml-6" : "ml-0"
                )}>
                  {item.subPaths.map((subPath) => (
                    <TooltipProvider key={subPath.path}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            to={subPath.path}
                            className={cn(
                              "flex items-center justify-between w-full rounded-md px-2.5 py-1.5 text-sm transition-all duration-200",
                              "group relative overflow-hidden",
                              pathname === subPath.path
                                ? "bg-accent text-accent-foreground font-medium"
                                : "hover:bg-accent/40 text-muted-foreground/70 hover:text-foreground"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <span className="flex h-3.5 w-3.5 items-center justify-center">
                                {subPath.icon}
                              </span>
                              <span className={cn(
                                "transition-all duration-300",
                                !isExpanded && "opacity-0 -translate-x-4 overflow-hidden"
                              )}>
                                {subPath.label}
                              </span>
                            </div>
                            {isExpanded && subPath.shortcut && (
                              <Badge variant="outline" className="h-4 px-1 text-[10px] font-mono opacity-50">
                                {subPath.shortcut}
                              </Badge>
                            )}
                          </Link>
                        </TooltipTrigger>
                        {!isExpanded && (
                          <TooltipContent side="right" sideOffset={10}>
                            {subPath.label} {subPath.shortcut && `(${subPath.shortcut})`}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}