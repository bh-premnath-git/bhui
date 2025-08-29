import { useMemo, useState } from "react";
import { shouldShowAdminNavItems } from "@/utils/roleUtils";
import { useLocation } from "react-router-dom";
import { LogOut, Sun, Moon, Search, PlusCircle, MoreHorizontal, Check, X, Edit, Trash2, PanelRight, PanelLeft, Home, Settings } from "lucide-react";
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
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ROUTES } from "@/config/routes";
import { useCreateDashboard, useListDashboards, useUpdateDashboard, useDeleteDashboard } from "@/hooks/ueDashboard";
import { Input } from "./ui/input";
import { Spinner } from "./ui/spinner";
import { useQueryClient } from "@tanstack/react-query";
import { useAppDispatch } from "@/hooks/useRedux";
import { clearMessages, setContext, setOtherActions, setSelectedActionTitle, setIsRightAsideComponent } from "@/store/slices/chat/chatSlice";

export function Sidebar() {
  const { isExpanded, toggleSidebar } = useSidebar();
  const { toggleTheme, setThemeMode } = useTheme();
  const navigation = useNavigation();
  const { getUserInfo, logout } = useAuth();
  const userInfo = getUserInfo();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { navigationItems: dynamicBaseItems = []} = navigation;
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
  const [openParents, setOpenParents] = useState<Record<string, boolean>>({});
 
  const showAdminNavItems = shouldShowAdminNavItems(userInfo?.roles || []);
  const dispatch = useAppDispatch();
  const navItems = useMemo(() => {
    const items: any[] = [];
    const seen = new Set<string>();
    
    const push = (item: any) => {
      if (!item?.path) return;
      if (seen.has(item.path)) return; // skip duplicates
      items.push(item);
      seen.add(item.path);
    };

    // Only add Home if it isn't already present in dynamicBaseItems
    if (!dynamicBaseItems.some(item => item.path === ROUTES.INDEX)) {
      push({
        title: "Home",
        path: "/home",
        icon: Home,
        showIcon: true,
        isParent: true,
      });
    }

    // Process dynamic navigation items
    dynamicBaseItems.forEach(item => {
      if (item.path.startsWith(ROUTES.ADMIN.INDEX) && !showAdminNavItems) {
        return;
      }
      const showIconForParent = item.title === "Data Catalog";
      push({
        ...item,
        showIcon: showIconForParent,
        isParent: true
      });

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
      navigation.handleNavigation(ROUTES.INDEX);
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
      isExpanded ? "w-64" : "w-0"
    )}
    >
      {/* Header */}
      <div className="h-16 flex items-center px-4 border-b border-gray-100 dark:border-gray-800">
        {isExpanded ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 cursor-pointer overflow-hidden" onClick={() =>{
              
                  dispatch(setContext(''));
                  dispatch(setOtherActions(null));
                  dispatch(setSelectedActionTitle(null));
                  dispatch(clearMessages());
                  dispatch(setIsRightAsideComponent(false));
              
              navigation.handleNavigation(ROUTES.HOME)}}>
              <Home className="h-4 w-4 text-gray-800 dark:text-gray-100" />
              <h1 className="text-lg font-semibold font-sans text-gray-900 dark:text-white transition-all duration-300 ease-in-out whitespace-nowrap">
                Bighammer.ai
              </h1>
            </div>
            <div className="flex items-center gap-1">
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
          </div>
        ) : (
          <div className="flex items-center justify-center">
            {/* Home icon and toggle when collapsed */}
            <div className="fixed top-4 left-4 z-[110] flex flex-col items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className={cn(
                  "h-8 w-8 transition-transform duration-200 shadow-none border-none bg-transparent hover:bg-transparent active:bg-transparent focus:bg-transparent"
                )}
                style={{ boxShadow: "none", border: "none", background: "transparent" }}
              >
                <PanelRight className="h-5 w-5" />
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        dispatch(setContext(''));
                        dispatch(setOtherActions(null));
                        dispatch(setSelectedActionTitle(null));
                        dispatch(clearMessages());
                        dispatch(setIsRightAsideComponent(false));
                        navigation.handleNavigation(ROUTES.HOME);
                      }}
                      className={cn(
                        "h-8 w-8 transition-transform duration-200 shadow-none border-none bg-transparent hover:bg-transparent active:bg-transparent focus:bg-transparent"
                      )}
                      style={{ boxShadow: "none", border: "none", background: "transparent" }}
                    >
                      <Home className="h-5 w-5 text-gray-800 dark:text-gray-100" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-gray-900">
                    <p>Home</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
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
            const shouldShow = isExpanded;

            if (!shouldShow) {
              return null;
            }

            const needsTooltip = !isExpanded && item.showIcon;
            const isActive = location.pathname === item.path;
            const hasXplorer = item.title === "Agent Explore";
            const hasStaticChildren = Array.isArray(item.subItems) && item.subItems.length > 0;
            const hasChildren = hasXplorer || hasStaticChildren;
            const isOpen = openParents[item.path] ?? false;

            const navElement = (
              <a
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  if (hasChildren) {
                    // Toggle section open/close on menu click
                    setOpenParents((prev) => ({ ...prev, [item.path]: !isOpen }));
                  } else {
                    // Close any right aside content when navigating to a new menu item
                    dispatch(setIsRightAsideComponent(false));
                    navigation.handleNavigation(item.path);
                    toggleSidebar();
                  }
                }}
                className={cn(
                  "flex items-center rounded-lg transition-all duration-200",
                  "group relative",
                  isActive
                    ? "bg-gray-50 dark:bg-gray-950/50 text-gray-700 dark:text-gray-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white",
                  !isExpanded && item.showIcon ? "p-2 justify-center" : "px-3 py-2",
                  isExpanded && hasChildren && "justify-between",
                  isExpanded && item.isSubItem && "pl-9 text-sm py-1.5"
                )}
              >

                {item.showIcon && item.icon && (
                  <item.icon
                    className={cn(
                      "shrink-0 transition-colors duration-200",
                      item.isSubItem ? "h-4 w-4" : "h-4 w-4",
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

                {/* No caret icon per requirement; entire row toggles */}
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

                  {isExpanded && item.actions && !item.isSubItem && (
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
                              <DropdownMenuItem
                                className="cursor-pointer flex items-center gap-2 text-gray-700 dark:text-gray-300"
                                onClick={() => setSearchOpen(true)}
                              >
                                <Search className="h-4 w-4" />
                                <span>Search</span>
                              </DropdownMenuItem>
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

                {/* Subitems rendering for any parent */}
                {isExpanded && hasChildren && isOpen && (
                  <div className="mt-2 ml-3 border-l border-gray-200 dark:border-gray-700 pl-3">
                    {hasXplorer ? (
                      <>
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

                        {listError ? (
                          <div className="px-2 py-2 text-xs text-center text-red-500 dark:text-red-400">
                            <p>Failed to load reports</p>
                            <button 
                              onClick={() => queryClient.invalidateQueries({ queryKey: ['dashboardslist'] })}
                              className="text-xs underline hover:no-underline mt-1"
                            >
                              Try again
                            </button>
                          </div>
                        ) : (
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
                                                ? "bg-gray-50 dark:bg-gray-950/50 text-gray-700 dark:text-gray-300"
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
                        )}
                      </>
                    ) : (
                      <ul className="space-y-1">
                        {item.subItems?.map((sub) => (
                          <li key={sub.path}>
                            <a
                              href={sub.path}
                              onClick={(e) => {
                                e.preventDefault();
                                navigation.handleNavigation(sub.path);
                                toggleSidebar();
                              }}
                              className={cn(
                                "flex items-center px-3 py-1.5 rounded-md text-sm transition-colors",
                                location.pathname === sub.path
                                  ? "bg-gray-50 dark:bg-gray-950/50 text-gray-700 dark:text-gray-300"
                                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
                              )}
                            >
                              {sub.icon && <sub.icon className="h-4 w-4 mr-2" />}
                              <span>{sub.title}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Settings Footer - only show when expanded */}
      {isExpanded && (
        <div className="border-t border-gray-100 dark:border-gray-800 p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex items-center justify-start gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white rounded-lg transition-all duration-200"
              >
                <Settings className="h-4 w-4" />
                <span className="text-sm font-medium">Settings</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="z-[120] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-2">
              <DropdownMenuItem className="flex items-center gap-2" onClick={() => toggleTheme()}>
                <Sun className="h-4 w-4" />
                <span>Toggle Theme</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2" onClick={() => setThemeMode('light')}>
                <Sun className="h-4 w-4" />
                <span>Light</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2" onClick={() => setThemeMode('dark')}>
                <Moon className="h-4 w-4" />
                <span>Dark</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2" onClick={async () => { await logout(); navigation.handleNavigation('/'); }}>
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

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

      {/* Footer removed per requirement (hide theme and logout) */}
      {/* Intentionally left blank */}
    </div>
  );
}

export default Sidebar;