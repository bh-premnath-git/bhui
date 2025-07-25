import { useMemo, useState } from "react";
import { shouldShowAdminNavItems } from "@/utils/roleUtils";
import { useLocation } from "react-router-dom";
import { ChevronDown, LogOut, Sun, Moon, Search, PlusCircle, MoreHorizontal, Check, X, Edit, Trash2, PanelRight, PanelLeft, Home } from "lucide-react";
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
  const [xplorerSearchTerm, setXplorerSearchTerm] = useState("");
  const [isXplorerOpen, setIsXplorerOpen] = useState(true);
  // Check if user has admin role
  const showAdminNavItems = shouldShowAdminNavItems(userInfo?.roles || []);
  
  const navItems = useMemo(() => {
    const items = [];
    items.push({
      title: "Home",
      path: ROUTES.INDEX,
      icon: Home,
      showIcon: true,
      isParent: true,
    });

    // Process dynamic navigation items
    dynamicBaseItems.forEach(item => {
      if (item.path.startsWith(ROUTES.ADMIN.INDEX) && !showAdminNavItems) {
        return;
      }
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
  }, [dynamicBaseItems, showAdminNavItems]);

  const dataXplorerSubItems = useMemo(() => {
    if (dashboardsLoading || !dashboards) return [];
    return dashboards.filter((dashboard: any) => {
      if (!dashboard?.name) return false;
      return dashboard.name.toLowerCase() !== "main";
    }).map((dashboard: any) => ({
      id: dashboard.id.toString(),
      title: dashboard.name,
      path: `${ROUTES.DATA_CATALOG}/xplorer/${dashboard.id}`,
      icon: undefined,
      isSubItem: true,
      parentPath: `${ROUTES.DATA_CATALOG}/xplorer`
    }));
  }, [dashboards, dashboardsLoading]);

  const filteredDataXplorerSubItems = useMemo(() => {
    if (!xplorerSearchTerm.trim()) return dataXplorerSubItems;
    return dataXplorerSubItems.filter((s) =>
      s.title.toLowerCase().includes(xplorerSearchTerm.toLowerCase())
    );
  }, [dataXplorerSubItems, xplorerSearchTerm]);

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
    <div className={cn(
      "h-screen fixed left-0 top-0 z-[100] flex flex-col",
      "bg-gray-50 dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800",
      "transition-[width] duration-300 ease-in-out will-change-[width]",
      isExpanded ? "w-64" : "w-16"
    )}
    >
      {/* Header */}
      <div className="h-16 flex items-center px-4 border-b border-gray-100 dark:border-gray-800">
        {isExpanded ? (
          <div className="flex items-center justify-between w-full">
            <div className="cursor-pointer overflow-hidden" onClick={() => navigation.handleNavigation(ROUTES.DATAOPS.INDEX)}>
              <h1 className="text-lg font-semibold font-sans text-gray-900 dark:text-white transition-all duration-300 ease-in-out whitespace-nowrap ml-3">
                Bighammer.ai
              </h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className={cn(
                "transition-transform duration-200 shadow-none border-none bg-transparent hover:bg-transparent active:bg-transparent focus:bg-transparent"
              )}
              style={{ boxShadow: "none", border: "none", background: "transparent" }}
            >
              <PanelLeft className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className={cn(
                "transition-transform duration-200 shadow-none border-none bg-transparent hover:bg-transparent active:bg-transparent focus:bg-transparent"
              )}
              style={{ boxShadow: "none", border: "none", background: "transparent" }}
            >
              <PanelRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Custom Scrollbar Styles */}
      {isExpanded && (
        <style dangerouslySetInnerHTML={{
          __html: `
            .sidebar-nav-scrollable::-webkit-scrollbar {
              width: 4px !important;
              display: block !important;
            }
            .sidebar-nav-scrollable::-webkit-scrollbar-track {
              background: transparent !important;
            }
            .sidebar-nav-scrollable::-webkit-scrollbar-thumb {
              background: rgba(156, 163, 175, 0.3) !important;
              border-radius: 20px !important;
            }
            .sidebar-nav-scrollable::-webkit-scrollbar-thumb:hover {
              background: rgba(156, 163, 175, 0.6) !important;
            }
            .sidebar-nav-scrollable, .sidebar-subitems-scrollable {
              scrollbar-width: thin !important;
              scrollbar-color: rgba(156, 163, 175, 0.3) transparent !important;
            }
            .sidebar-subitems-scrollable::-webkit-scrollbar {
              width: 4px !important;
              display: block !important;
            }
            .sidebar-subitems-scrollable::-webkit-scrollbar-track {
              background: transparent !important;
            }
            .sidebar-subitems-scrollable::-webkit-scrollbar-thumb {
              background: rgba(156, 163, 175, 0.3) !important;
              border-radius: 20px !important;
            }
            .sidebar-subitems-scrollable::-webkit-scrollbar-thumb:hover {
              background: rgba(156, 163, 175, 0.6) !important;
            }
          `
        }} />
      )}

      {/* Navigation */}
      <nav className={cn(
        "flex-1 overflow-y-auto",
        isExpanded && "sidebar-nav-scrollable"
      )}>
        <ul className={cn(
          "space-y-1",
          isExpanded ? "px-3" : "flex flex-col items-center px-2"
        )}>
          {navItems.map((item) => {
            const shouldShow = isExpanded || (!isExpanded && item.showIcon);

            if (!shouldShow) {
              return null;
            }

            const needsTooltip = !isExpanded && item.showIcon;
            const isActive = location.pathname === item.path;

            const navElement = (
              <a
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  navigation.handleNavigation(item.path);
                }}
                className={cn(
                  "flex items-center rounded-lg transition-all duration-200",
                  "group relative",
                  isActive
                    ? "bg-gray-50 dark:bg-gray-950/50 text-gray-700 dark:text-gray-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white",
                  !isExpanded && item.showIcon ? "p-2 justify-center" : "px-3 py-2",
                  isExpanded && item.title === "Data Xplorer" && "justify-between",
                  isExpanded && item.isSubItem && "pl-9 text-sm py-1.5"
                )}
              >

                {item.showIcon && item.icon && (
                  <item.icon
                    className={cn(
                      "shrink-0 transition-colors duration-200",
                      item.isSubItem ? "h-4 w-4" : "h4- w-4",
                      isActive ? "text-gray-600 dark:text-gray-400" : "text-gray-700 dark:text-gray-300"
                    )}
                  />
                )}

                {isExpanded && (
                  <span className={cn(
                    "flex-1 transition-opacity duration-200 font-medium",
                    item.showIcon && "ml-3",
                    item.isSubItem && "text-sm font-normal",
                    !item.showIcon && item.isParent && "text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
                  )}>
                    {item.title}
                  </span>
                )}

                {isExpanded && item.title === "Data Xplorer" && (
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform duration-200 text-gray-400",
                      isXplorerOpen ? "rotate-0" : "-rotate-90"
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsXplorerOpen((prev) => !prev);
                    }}
                  />
                )}
              </a>
            );

            return (
              <li key={item.path}>
                <div className="flex items-center">
                  {needsTooltip ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          {navElement}
                        </TooltipTrigger>
                        <TooltipContent side="right" className="text-gray-900">
                          <p>{item.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    navElement
                  )}

                  {isExpanded && item.actions && !item.isSubItem && item.title !== "Data Xplorer" && (
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.actions.map((action, index) => (
                        action.icon === 'ellipsis' ? (
                          <DropdownMenu key={index}>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="z-[110] w-auto min-w-[8rem] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                            >
                              {item.title !== "Data Xplorer" && (
                                <DropdownMenuItem
                                  className="cursor-pointer flex items-center gap-2 text-gray-700 dark:text-gray-300"
                                  onClick={() => setSearchOpen(true)}
                                >
                                  <Search className="h-4 w-4" />
                                  <span>Search</span>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="cursor-pointer flex items-center gap-2 text-gray-700 dark:text-gray-300"
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
                            className="h-6 w-6 ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            onClick={() => navigation.handleAction(action.action, item.path)}
                          >
                            {action.icon === 'ellipsis' && <MoreHorizontal className="h-4 w-4" />}
                          </Button>
                        )
                      ))}
                    </div>
                  )}
                </div>

                {/* Data Xplorer subitems */}
                {isExpanded && item.title === "Data Xplorer" && isXplorerOpen && (
                  <div className="mt-2 ml-3 border-l border-gray-200 dark:border-gray-700 pl-3">
                    <div className="mb-2 flex items-center gap-2 px-2">
                      <Input
                        placeholder="Search reports..."
                        value={xplorerSearchTerm}
                        onChange={(e) => setXplorerSearchTerm(e.target.value)}
                        className="h-7 text-xs bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        onClick={handleCreateNewReport}
                        disabled={creatingReport}
                      >
                        {creatingReport ? <Spinner className="h-3 w-3" /> : <PlusCircle className="h-3 w-3" />}
                      </Button>
                    </div>

                    <ul className="space-y-1 max-h-32 overflow-y-auto sidebar-subitems-scrollable">
                      {filteredDataXplorerSubItems.length > 0 ? (
                        filteredDataXplorerSubItems.map(subItem => {
                          const isSubActive = location.pathname === subItem.path;
                          return (
                            <li key={subItem.path}>
                              <div className="flex items-center group">
                                {editingReportId === subItem.id ? (
                                  <div className="flex-1 flex items-center gap-1 px-2 py-1">
                                    <Input
                                      value={editingReportName}
                                      onChange={(e) => setEditingReportName(e.target.value)}
                                      className="h-6 text-xs bg-white dark:bg-gray-800"
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
                                      className="h-5 w-5"
                                      onClick={handleSaveReportName}
                                      disabled={updatingDashboard || !editingReportName.trim()}
                                    >
                                      {updatingDashboard ? <Spinner className="h-3 w-3" /> : <Check className="h-3 w-3 text-green-600" />}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-5 w-5"
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
                                        "flex items-center px-2 py-1.5 rounded-md flex-1 text-sm transition-colors",
                                        isSubActive
                                          ? "bg-gray-50 dark:bg-gray-950/50 text-gray-700 dark:text-gray-300 font-medium"
                                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
                                      )}
                                    >
                                      <span className="truncate">{subItem.title}</span>
                                    </a>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-5 w-5 ml-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                        >
                                          <MoreHorizontal className="h-3 w-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent
                                        align="end"
                                        className="z-[110] w-auto min-w-[8rem] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                                      >
                                        <DropdownMenuItem
                                          className="cursor-pointer flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300"
                                          onClick={() => handleStartRenameReport(subItem.id, subItem.title)}
                                        >
                                          <Edit className="h-3 w-3" />
                                          <span>Rename</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          className="cursor-pointer flex items-center gap-2 text-xs text-red-600 dark:text-red-400"
                                          onClick={() => handleDeleteReport(subItem.id)}
                                          disabled={deletingDashboard}
                                        >
                                          {deletingDashboard ? (
                                            <Spinner className="h-3 w-3" />
                                          ) : (
                                            <Trash2 className="h-3 w-3" />
                                          )}
                                          <span>Delete</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          className="cursor-pointer flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300"
                                          onClick={() => setSearchOpen(true)}
                                        >
                                          <Search className="h-3 w-3" />
                                          <span>Search</span>
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </>
                                )}
                              </div>
                            </li>
                          );
                        })
                      ) : (
                        <li className="px-3 py-2 text-xs text-center text-gray-500 dark:text-gray-400">
                          {xplorerSearchTerm ? 'No reports found.' : 'Click + to add a report.'}
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Search Modal */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Search Reports</DialogTitle>
          </DialogHeader>
          <Input autoFocus placeholder="Search..." className="bg-gray-50 dark:bg-gray-800" />
          <DialogFooter>
            <Button onClick={() => setSearchOpen(false)} className="bg-gray-600 hover:bg-gray-700 text-white">Search</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <div className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div
          className={cn(
            "pl-5 pt-3",
            isExpanded ? "flex justify-between items-center" : "justify-center"
          )}
        >
          {/* Theme toggle with tooltip */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  onClick={toggleTheme}
                  className="flex items-center gap-2 cursor-pointer mb-1"
                >
                  {theme === 'dark' ? (
                    <>
                      <Moon className="h-5 w-5 text-blue-400" />
                      {isExpanded && (
                        <span className="text-sm font-medium text-gray-100 flex items-center">
                          Dark
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <Sun className="h-5 w-5 text-amber-500" />
                      {isExpanded && (
                        <span className="text-sm font-medium text-amber-600 flex items-center">
                          Light
                        </span>
                      )}
                    </>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>


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
                      <Button variant="ghost" className="h-7 w-7 p-0 transition-transform duration-200 hover:scale-110">
                        <Avatar className="h-7 w-7 border border-gray-200 dark:border-gray-600">
                          <AvatarImage src={userInfo?.avatarUrl || ""} alt={userName} />
                          <AvatarFallback className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-medium text-sm">{userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-gray-900 text-gray-100">
                    <p>{userName}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenuContent
                align="end"
                className="z-[110] w-auto min-w-[8rem] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              >
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center flex-1 ml-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 transition-transform duration-200 hover:scale-110">
                    <Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-600">
                      <AvatarImage src={userInfo?.avatarUrl || ""} alt={userName} />
                      <AvatarFallback className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-medium text-sm">{userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="z-[110] min-w-[14rem] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                >
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex-1 ml-3 overflow-hidden">
                <p className="text-sm font-medium truncate text-gray-900 dark:text-white">{userName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userInfo?.email || ""}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;