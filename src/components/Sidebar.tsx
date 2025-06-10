import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { ChevronRight, ChevronLeft, LogOut, Sun, Moon, Search, PlusCircle, MoreHorizontal, Check, X, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSidebar } from "@/context/SidebarContext";
import { useNavigation } from "@/hooks/useNavigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ROUTES } from "@/config/routes";
import { useCreateDashboard, useListDashboards, useUpdateDashboard, useDeleteDashboard } from "@/hooks/ueDashboard";
import { Input } from "./ui/input";
import { Spinner } from "./ui/spinner";
import { useQueryClient } from "@tanstack/react-query";

export function Sidebar() {
  const { isExpanded, toggleSidebar } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const navigation = useNavigation();
  const { getUserInfo, logout } = useAuth();
  const userInfo = getUserInfo();
  const location = useLocation();
  const queryClient = useQueryClient();

  const { navigationItems: dynamicBaseItems = [], loading: navLoading } = navigation;

  const {
    mutateAsync: createDashboard,
    isPending: creatingReport,
    reset: resetCreate,
  } = useCreateDashboard();
  const { data: dashboards, isLoading: dashboardsLoading, error: listError } = useListDashboards();
  const { mutateAsync: updateDashboard, isPending: updatingDashboard } = useUpdateDashboard();
  const { mutateAsync: deleteDashboard, isPending: deletingDashboard } = useDeleteDashboard();

  const [searchOpen, setSearchOpen] = useState(false);
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [editingReportName, setEditingReportName] = useState("");

  const navItems = useMemo(() => {
    const items = [];
    dynamicBaseItems.forEach(item => {
      const showIconForParent = item.title === "Data Catalog" || item.title === "Data Xplorer";
      items.push({
        ...item,
        showIcon: showIconForParent,
        isParent: true
      });
      if (item.subItems && item.subItems.length > 0 && item.title !== "Data Xplorer") {
        item.subItems.forEach(subItem => {
          items.push({
            ...subItem,
            isSubItem: true,
            parentPath: item.path,
            showIcon: true
          });
        });
      }
    });
    return items;
  }, [dynamicBaseItems]);

  const dataXplorerSubItems = useMemo(() => {
    if (dashboardsLoading || !dashboards) return [];
    return dashboards.map((dashboard: any) => ({
      id: dashboard.id.toString(),
      title: dashboard.name,
      path: `${ROUTES.DATA_CATALOG}/xplorer/${dashboard.id}`,
      icon: undefined,
      isSubItem: true,
      parentPath: `${ROUTES.DATA_CATALOG}/xplorer`
    }));
  }, [dashboards, dashboardsLoading]);

  const handleCreateNewReport = async () => {
    if (creatingReport) return;
    resetCreate();
    try {
      const newDashboard = await createDashboard({ name: "Untitled Report", dashboard_type: 'explorer' });
      await queryClient.invalidateQueries({ queryKey: ['dashboardslist'] });
      if (newDashboard && newDashboard.id) {
        // navigation.handleNavigation(`${ROUTES.DATA_CATALOG}/xplorer/${newDashboard.id}`);
      }
    } catch (err) {
      console.error('Failed to create report:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation.handleNavigation('/');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (deletingDashboard) return;
    try {
      await deleteDashboard(id);
      await queryClient.invalidateQueries({ queryKey: ['dashboardslist'] });
    } catch (err) {
      console.error('Failed to delete report:', err);
    }
  };

  const handleStartRenameReport = (id: string, currentName: string) => {
    setEditingReportId(id);
    setEditingReportName(currentName);
  };

  const handleSaveReportName = async () => {
    if (updatingDashboard || !editingReportId || !editingReportName.trim()) return;
    
    try {
      await updateDashboard({
        dashboardId: editingReportId,
        name: editingReportName
      });
      await queryClient.invalidateQueries({ queryKey: ['dashboardslist'] });
      setEditingReportId(null);
      setEditingReportName("");
    } catch (err) {
      console.error('Failed to rename report:', err);
    }
  };

  const handleCancelRename = () => {
    setEditingReportId(null);
    setEditingReportName("");
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
            .sidebar-nav-scrollable , .sidebar-subitems-scrollable{
              scrollbar-width: thin !important;
              scrollbar-color: rgba(156, 163, 175, 0.5) transparent !important;
            }
               .sidebar-subitems-scrollable::-webkit-scrollbar {
              width: 5px !important;
              display: block !important;
            }
            .sidebar-subitems-scrollable::-webkit-scrollbar-track {
              background: transparent !important;
            }
            .sidebar-subitems-scrollable::-webkit-scrollbar-thumb {
              background: rgba(156, 163, 175, 0.5) !important;
              border-radius: 20px !important;
            }
            .sidebar-subitems-scrollable::-webkit-scrollbar-thumb:hover {
              background: rgba(156, 163, 175, 0.8) !important;
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
                  location.pathname === item.path
                    ? "bg-primary/15 text-primary font-medium dark:bg-primary/30 dark:text-primary-foreground"
                    : "text-gray-800 dark:text-gray-200",
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
                                onClick={() => setSearchOpen(true)}
                              >
                                <Search className="h-4 w-4" />
                                <span>Search</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer flex items-center gap-2"
                                onClick={handleCreateNewReport}
                                disabled={creatingReport}
                              >
                                {creatingReport ? (
                                  <Spinner className="h-4 w-4 mr-2" />
                                ) : (
                                  <PlusCircle className="h-4 w-4" />
                                )}
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
                  <ul className="mt-1 space-y-1 sidebar-subitems-scrollable">
                    {dataXplorerSubItems.map(subItem => (
                      <li key={subItem.path}>
                        <div className="flex items-center">
                          {editingReportId === subItem.id ? (
                            <div className="flex-1 flex items-center gap-1 px-3 py-1">
                              <Input
                                value={editingReportName}
                                onChange={(e) => setEditingReportName(e.target.value)}
                                className="h-7 text-sm"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSaveReportName();
                                  } else if (e.key === 'Escape') {
                                    e.preventDefault();
                                    handleCancelRename();
                                  }
                                }}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={handleSaveReportName}
                                disabled={updatingDashboard || !editingReportName.trim()}
                              >
                                {updatingDashboard ? <Spinner className="h-3 w-3" /> : <Check className="h-3 w-3 text-green-500" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={handleCancelRename}
                              >
                                <X className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <a
                                href={subItem.path}
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigation.handleNavigation(subItem.path, { reportName: subItem.title }, false);
                                }}
                                className={cn(
                                  "flex items-center px-3 py-2 rounded-md",
                                  "transition-all duration-200 ease-in-out",
                                  "hover:bg-gray-200/80 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-white",
                                  location.pathname === subItem.path
                                    ? "bg-primary/15 text-primary font-medium dark:bg-primary/30 dark:text-primary-foreground"
                                    : "text-gray-700 dark:text-gray-300",
                                  "text-sm pl-6 flex-1"
                                )}
                              >
                                {subItem.icon && <subItem.icon className="h-4 w-4 shrink-0" />}
                                <span className="ml-3 flex-1">{subItem.title}</span>
                              </a>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 mr-1 opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
                                  >
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-auto min-w-[8rem]">
                                  <DropdownMenuItem
                                    className="cursor-pointer flex items-center gap-2 text-xs"
                                    onClick={() => handleStartRenameReport(subItem.id, subItem.title)}
                                  >
                                    <Edit className="h-3 w-3" />
                                    <span>Rename</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="cursor-pointer flex items-center gap-2 text-xs text-red-500 focus:text-red-500"
                                    onClick={() => handleDeleteReport(subItem.id)}
                                    disabled={deletingDashboard}
                                  >
                                    {deletingDashboard ? (
                                      <Spinner className="h-3 w-3 mr-2" />
                                    ) : (
                                      <Trash2 className="h-3 w-3" />
                                    )}
                                    <span>Delete</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Search Modal */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Search Reports</DialogTitle>
          </DialogHeader>
          <Input autoFocus placeholder="Search..." />
          <DialogFooter>
            <Button onClick={() => setSearchOpen(false)}>Search</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
          isExpanded ? "flex justify-between items-center" : "justify-center"
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