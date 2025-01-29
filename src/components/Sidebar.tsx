import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { menuList } from '@/configration/menuList';
import { jwtDecode } from 'jwt-decode';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from './ui/tooltip';
import { Moon, Sun, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  icon: React.ReactNode;
  path: string;
  label: string;
  subPaths?: {
    path: string;
    label: string;
    icon: React.ReactNode;
  }[];
}

interface RoleAccess {
  [key: string]: string[];
}

const roleAccess: RoleAccess = {
  'admin-user': ['BigHammer AI', 'Data Catalog', 'Admin Console'],
  'designer-user': ['BigHammer AI', 'Data Catalog', 'Designer'],
  'ops-user': ['BigHammer AI', 'Data Catalog', 'DataOps Hub'],
};

const getUserRoles = (): [any[], any] | undefined => {
  const token: string | null = sessionStorage?.getItem('token');
  const decoded: any = token ? jwtDecode(token) : null;
  return [decoded?.realm_access?.roles, decoded];
};

export function Sidebar({ logout }: { logout: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { pathname } = useLocation();
  const [userRoles, userDecoded] = getUserRoles();
  const { theme, toggleTheme } = useTheme();

  const allowedItems = Array.from(
    new Set(userRoles?.flatMap((role: string) => roleAccess[role] || []) || [])
  );

  const filteredNavItems: NavItem[] = menuList.filter((item) =>
    allowedItems.includes(item.label)
  );

  useEffect(() => {
    const isDesignerFlowWithId = /^\/designers\/manage-flow\/.+$/.test(pathname);
    setIsMounted(!isDesignerFlowWithId && pathname !== '/login');
  }, [pathname]);

  if (!isMounted) {
    return null;
  }
  
  return (
    <aside
      className={`
        fixed top-18 left-0 h-screen
        z-20
        transition-all duration-300 ease-in-out
        overflow-hidden
        ${isExpanded ? 'w-60' : 'w-16'}
        bg-[#F6F6F7] text-[#1F1F1F]
      `}
      onMouseEnter={() => {
        if (!userDropdownOpen) {
          setIsExpanded(true);
        }
      }}
      onMouseLeave={() => {
        if (!userDropdownOpen) {
          setIsExpanded(false);
        }
      }}
      role="navigation"
      aria-label="Main Navigation"
    >
      <div className="flex flex-col h-full p-2">
        <nav className="mb-3 overflow-y-auto">
          <ul className="space-y-1">
            {filteredNavItems.map((item) => (
              <li key={item.path} className="relative">
                <Link
                  to={item.path}
                  className={`
                    flex items-center justify-between p-2 rounded-lg
                    transition-colors duration-200
                    ${pathname === item.path
                      ? 'bg-[#EBEBEC] text-[#000] font-semibold'
                      : 'hover:bg-[#EBEBEC]'
                    }
                    ${item.subPaths ? 'font-semibold' : ''}
                  `}
                >
                  <div className="flex items-center">
                    <span className="flex items-center min-w-[22px]">
                      {item.icon}
                    </span>
                    <span
                      className={`
                        ml-3 whitespace-nowrap transition-all duration-300
                        ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                      `}
                    >
                      {item.label}
                    </span>
                  </div>
                </Link>

                {item.subPaths && (
                  <ul className="mt-1 space-y-1">
                    {item.subPaths.map((subPath) => (
                      <li key={subPath.path}>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link
                                to={subPath.path}
                                className={`
                                  flex items-center justify-between p-2 text-sm
                                  transition-colors duration-200
                                  rounded-lg font-normal
                                  ${pathname === subPath.path
                                    ? 'bg-[#EBEBEC] text-[#000]'
                                    : 'text-[#4A4A4A] hover:bg-[#EBEBEC] hover:text-[#1F1F1F]'
                                  }
                                `}
                              >
                                <div className="flex items-center">
                                  <span className="flex items-center min-w-[22px]">
                                    {subPath.icon}
                                  </span>
                                  <span
                                    className={`
                                      whitespace-nowrap transition-all duration-300 ml-3
                                      ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 w-0 -translate-x-4'}
                                    `}
                                  >
                                    {subPath.label}
                                  </span>
                                </div>
                              </Link>
                            </TooltipTrigger>
                            {!isExpanded && (
                              <TooltipContent side="right" align="center">
                                {subPath.label}
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-6 flex flex-col space-y-1.5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="w-full justify-start flex items-center"
                >
                  {theme === 'light' ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                  {isExpanded && (
                    <span className="ml-2">
                      {theme === 'light' ? 'Light' : 'Dark'}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                align="center"
                className={`${isExpanded ? 'hidden' : 'block'}`}
              >
                {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenu
            onOpenChange={(open) => {
              setUserDropdownOpen(open);
              if (open) {
                setIsExpanded(true);
              }
            }}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start p-0 flex items-center"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                {isExpanded && (
                  <div className="ml-2 flex flex-col items-start text-left">
                    <span className="text-sm font-medium">{userDecoded?.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {userDecoded?.email}
                    </span>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  );
}
