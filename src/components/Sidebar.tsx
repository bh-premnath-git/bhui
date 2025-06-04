import { useLocation } from "react-router-dom";
import { ChevronRight, ChevronLeft, LogOut, Sun, Moon, Search, PlusCircle, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/context/SidebarContext";
import { useNavigation } from "@/hooks/useNavigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ROUTES } from "@/config/routes";
import { useMemo } from "react";

export function Sidebar() {
  const { isExpanded, toggleSidebar } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const navigation = useNavigation();
  const { getUserInfo, logout } = useAuth();
  const userInfo = getUserInfo();
  const location = useLocation();
  const { navigationItems: dynamicItems = [], loading } = navigation;
  
  // Generate items for the navigation menu
  const navItems = useMemo(() => {
    const items = [];
    
    dynamicItems.forEach(item => {
      // Add parent items
      const showIconForParent = item.title === "Data Catalog" || item.title === "Data Xplorer";
      
      items.push({
        ...item,
        showIcon: showIconForParent,
        isParent: true // Mark as parent item
      });
      
      // Only add subitems for non-Data Xplorer parents
      // Data Xplorer subitems are handled separately
      if (item.subItems && item.subItems.length > 0 && item.title !== "Data Xplorer") {
        item.subItems.forEach(subItem => {
          items.push({
            ...subItem,
            isSubItem: true,
            parentPath: item.path,
            showIcon: true // All subitems show icons
          });
        });
      }
    });
    
    return items;
  }, [dynamicItems]);
  
  // Get Data Xplorer specific items
  const dataXplorerSubItems = useMemo(() => {
    const xplorerItem = dynamicItems.find(item => item.title === "Data Xplorer");
    return xplorerItem?.subItems || [];
  }, [dynamicItems]);

  // Function to check if a parent item has an active child
  const hasActiveChild = (parentPath) => {
    return location.pathname.startsWith(parentPath) && 
           navItems.some(item => 
             item.isSubItem && 
             item.parentPath === parentPath && 
             location.pathname === item.path
           );
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation.handleNavigation('/');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const userName = userInfo?.name || userInfo?.username || "John Doe";

  return (
    <div
      className={cn(
        "h-screen fixed left-0 top-0 z-40 flex flex-col",
        "bg-gray-90 dark:bg-gray-950 backdrop-blur supports-[backdrop-filter]:bg-gray-100/95 dark:supports-[backdrop-filter]:bg-gray-950/95 border-r border-gray-200 dark:border-gray-800",
        "transition-[width] duration-300 ease-in-out will-change-[width]",
        "shadow-sm",
        isExpanded ? "w-64" : "w-20"
      )}
    >
      <div className="h-16 flex items-center px-4 border-gray-200 dark:border-gray-800">
        <div className="flex items-center cursor-pointer overflow-hidden" onClick={() => navigation.handleNavigation(ROUTES.DATAOPS.INDEX)}>
          
          <div className="overflow-hidden">
            <h1
              className={cn(
                "text-lg font-semibold font-sans ml-2",
                "transition-all duration-300 ease-in-out",
                "whitespace-nowrap transform",
                "text-gray-900 dark:text-white",
                isExpanded
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-4 pointer-events-none"
              )}
            >
              BigHammer.ai
            </h1>
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className={cn(
          "absolute -right-4 top-9 text-muted-foreground hover:bg-accent",
          "h-10 w-4 rounded-none rounded-r-md border border-l-0 border-gray-200 dark:border-gray-800",
          "bg-background/90 transition-transform duration-300",
          !isExpanded && "hover:scale-125",
          isExpanded ? "justify-between" : "justify-center"
        )}
      >
        {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>
      
      {/* Add custom scrollbar styles */}
      {isExpanded && (
        <style dangerouslySetInnerHTML={{
          __html: `
            .sidebar-nav-scrollable::-webkit-scrollbar {
              width: 5px !important;
              display: block !important;
            }
            .sidebar-nav-scrollable::-webkit-scrollbar-track {
              background: transparent !important;
            }
            .sidebar-nav-scrollable::-webkit-scrollbar-thumb {
              background: rgba(156, 163, 175, 0.5) !important;
              border-radius: 20px !important;
            }
            .sidebar-nav-scrollable::-webkit-scrollbar-thumb:hover {
              background: rgba(156, 163, 175, 0.8) !important;
            }
            .sidebar-nav-scrollable {
              scrollbar-width: thin !important;
              scrollbar-color: rgba(156, 163, 175, 0.5) transparent !important;
            }
          `
        }} />
      )}
      
      <nav className={cn(
        "flex-1 overflow-y-auto py-4",
        isExpanded && "sidebar-nav-scrollable"
      )}>
        <ul className={cn(
          "space-y-2",
          isExpanded ? "px-2 space-y-1" : "flex flex-col items-center w-full"
        )}>
          {navItems.map((item) => {
            const shouldShow = isExpanded || (!isExpanded && item.showIcon);
            
            if (!shouldShow) {
              return null;
            }            
            const needsTooltip = !isExpanded && item.showIcon;
            
            const navElement = (
              <a
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  navigation.handleNavigation(item.path);
                }}
                className={cn(
                  "flex items-center py-2 rounded-md",
                  "transition-all duration-200 ease-in-out",
                  "hover:bg-gray-200/80 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-white",
                  location.pathname === item.path ? 
                    "bg-primary/15 text-primary font-medium dark:bg-primary/30 dark:text-primary-foreground" : 
                    "text-gray-800 dark:text-gray-200",
                  "flex-1",
                  !isExpanded && item.showIcon && "justify-center px-3",
                  isExpanded && "px-3",
                  isExpanded && item.isSubItem && "pl-6 text-sm"
                )}
              >
                {item.showIcon && item.icon && (
                  <item.icon className={cn(
                    "shrink-0 transition-transform duration-200",
                    item.isSubItem ? "h-4 w-4" : "h-4 w-4"
                  )} />
                )}
                {isExpanded && (
                  <span className={cn(
                    "flex-1 transition-opacity duration-200",
                    item.showIcon && "ml-3",
                    item.isSubItem && "text-sm",
                    // Make parent items without icons have smaller text
                    !item.showIcon && item.isParent && "text-sm font-medium"
                  )}>
                    {item.title}
                  </span>
                )}
              </a>
            );
            
            return (
              <li key={item.path}>
                <div className="flex">
                  {needsTooltip ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          {navElement}
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{item.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    navElement
                  )}
                  
                  {isExpanded && item.actions && !item.isSubItem && (
                    <div className="flex items-center">
                      {item.actions.map((action, index) => (
                        action.icon === 'ellipsis' ? (
                          <DropdownMenu key={index}>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 ml-1"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-auto min-w-[8rem]">
                              <DropdownMenuItem 
                                className="cursor-pointer flex items-center gap-2"
                                onClick={() => {
                                  // Open search functionality
                                  console.log("Search clicked");
                                }}
                              >
                                <Search className="h-4 w-4" />
                                <span>Search</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="cursor-pointer flex items-center gap-2"
                                onClick={() => {
                                  navigation.handleNavigation(`${ROUTES.DATA_CATALOG}/xplorer`);
                                }}
                              >
                                <PlusCircle className="h-4 w-4" />
                                <span>New Report</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <Button
                            key={index}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 ml-1"
                            onClick={() => navigation.handleAction(action.action, item.path)}
                          >
                            {action.icon === 'ellipsis' && <MoreHorizontal className="h-4 w-4" />}
                          </Button>
                        )
                      ))}
                    </div>
                  )}
                </div>
                {/* Handle Data Xplorer subitems here when it's the Data Xplorer parent item */}
                {isExpanded && item.title === "Data Xplorer" && dataXplorerSubItems.length > 0 && (
                  <ul className="mt-1 space-y-1">
                    {dataXplorerSubItems.map(subItem => (
                      <li key={subItem.path}>
                        <a
                          href={subItem.path}
                          onClick={(e) => {
                            e.preventDefault();
                            navigation.handleNavigation(subItem.path);
                          }}
                          className={cn(
                            "flex items-center px-3 py-2 rounded-md",
                            "transition-all duration-200 ease-in-out",
                            "hover:bg-gray-200/80 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-white",
                            location.pathname === subItem.path ? 
                              "bg-primary/15 text-primary font-medium dark:bg-primary/30 dark:text-primary-foreground" : 
                              "text-gray-700 dark:text-gray-300",
                            "text-sm pl-6"
                          )}
                        >
                          {subItem.icon && <subItem.icon className="h-4 w-4 shrink-0" />}
                          <span className="ml-3 flex-1">{subItem.title}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="h-auto border-t border-gray-200 dark:border-gray-800">
        <div className={cn(
          "p-3 flex items-center",
          isExpanded ? "justify-between" : "justify-center"
        )}>
          {/* User profile section */}
          {!isExpanded ? (
            <DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 transition-transform duration-200 hover:scale-110">
                        <Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-700">
                          <AvatarImage src={userInfo?.avatarUrl || ""} alt={userName} />
                          <AvatarFallback className="bg-primary/10 text-primary font-medium dark:bg-primary/20 dark:text-primary-foreground">{userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{userName}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenuContent
                align="end"
                className="w-auto min-w-[8rem]"
              >
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 transition-transform duration-200 hover:scale-110">
                  <Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-700">
                    <AvatarImage src={userInfo?.avatarUrl || ""} alt={userName} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium dark:bg-primary/20 dark:text-primary-foreground">{userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              {isExpanded && (
                <div
                  className={cn(
                    "flex-1 ml-3 overflow-hidden",
                    "transition-all duration-300 ease-in-out",
                    isExpanded
                      ? "opacity-100 max-w-[140px]"
                      : "opacity-0 max-w-0 pointer-events-none"
                  )}
                >
                  <p className="text-sm font-medium truncate text-gray-900 dark:text-white">{userName}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{userInfo?.email || ""}</p>
                </div>
              )}
              <DropdownMenuContent
                align="end"
                className={cn(
                  "transition-all duration-200 ease-in-out",
                  isExpanded ? "min-w-[14rem]" : "w-auto min-w-[8rem]"
                )}
              >
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div className={cn(
          "px-3 pb-3",
          isExpanded ? "flex justify-between items-center" : "flex justify-center"
        )}>
          {/* Theme toggle with tooltip */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 relative">
                  <div className="relative">
                    <Switch
                      checked={theme === 'dark'}
                      onCheckedChange={toggleTheme}
                      className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input scale-90"
                    />
                    
                    {/* Custom thumb with icon */}
                    <div 
                      className={cn(
                        "absolute top-0 left-0 pointer-events-none",
                        "h-5 w-10 flex items-center",
                        "transition-all duration-300"
                      )}
                    >
                      <div 
                        className={cn(
                          "h-[18px] w-[18px] rounded-full flex items-center justify-center",
                          "transition-all duration-300 transform shadow-sm",
                          theme === 'dark' 
                            ? "translate-x-[18px] bg-primary/90" 
                            : "translate-x-[2px] bg-amber-50"
                        )}
                      >
                        {theme === 'dark' ? (
                          <Moon className="h-3 w-3 text-white drop-shadow-[0_0_1px_rgba(255,255,255,0.5)]" />
                        ) : (
                          <Sun className="h-3 w-3 text-amber-600 drop-shadow-[0_0_1px_rgba(180,83,9,0.3)]" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <span className={cn(
                      "text-sm ml-1 font-medium",
                      theme === 'dark' ? "text-blue-100" : "text-amber-600"
                    )}>
                      {theme === 'dark' ? 'Dark' : 'Light'}
                    </span>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;