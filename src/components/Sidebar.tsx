import { NavLink, useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, LogOut, Sun, Moon } from "lucide-react";
import logo from "/logo.svg";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { navigationItems } from "@/config/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { useNavigation } from "@/hooks/useNavigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function Sidebar() {
  const { isExpanded, toggleSidebar } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const navigation = useNavigation();
  const { getUserInfo, logout } = useAuth();
  const userInfo = getUserInfo();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div
      className={cn(
        "h-screen fixed left-0 top-0 z-40 flex flex-col",
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-r",
        "transition-[width] duration-300 ease-in-out will-change-[width]",
        isExpanded ? "w-64" : "w-20"
      )}
    >
      <div className="h-16 flex items-center px-4 border-b">
        <div className="flex items-center cursor-pointer overflow-hidden" onClick={() => navigate("/dataops-hub")}>
          <img src={logo} alt="Bighammer AI" className="h-6 w-6 text-sidebar-foreground shrink-0" />
          <div className="overflow-hidden">
            <h1
              className={cn(
                "text-lg font-semibold font-sans ml-2",
                "transition-all duration-300 ease-in-out",
                "whitespace-nowrap transform",
                isExpanded
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-4 pointer-events-none"
              )}
            >
              Bighammer AI
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
          "h-10 w-4 rounded-none rounded-r-md border border-l-0",
          "bg-background/90 transition-transform duration-300",
          !isExpanded && "hover:scale-125"
        )}
      >
        {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navigationItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center px-3 py-2 rounded-md",
                    "transition-all duration-200 ease-in-out",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive && "bg-accent text-accent-foreground",
                    !isExpanded && "justify-center"
                  )
                }
                onClick={() => item.subItems && navigation.toggleExpanded(item.path)}
              >
                <item.icon className="h-5 w-5 shrink-0 transition-transform duration-200" />
                {isExpanded && (
                  <span className="ml-3 flex-1 transition-opacity duration-200">{item.title}</span>
                )}
                {isExpanded && item.subItems && (
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 shrink-0",
                      "transition-transform duration-200 ease-in-out",
                      navigation.isItemExpanded(item.path) && "transform rotate-90"
                    )}
                  />
                )}
              </NavLink>
              {isExpanded && item.subItems && (
                <ul
                  className={cn(
                    "mt-1 ml-4 space-y-1 border-l pl-3",
                    "transition-all duration-200 ease-in-out origin-top",
                    navigation.isItemExpanded(item.path)
                      ? "opacity-100 max-h-96 transform scale-y-100"
                      : "opacity-0 max-h-0 transform scale-y-0 pointer-events-none"
                  )}
                >
                  {item.subItems.map((subItem) => (
                    <li key={subItem.path}>
                      <NavLink
                        to={subItem.path}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center px-3 py-2 rounded-md text-sm",
                            "transition-all duration-200 ease-in-out",
                            "hover:bg-accent hover:text-accent-foreground",
                            isActive && "bg-accent text-accent-foreground"
                          )
                        }
                      >
                        <subItem.icon className="h-4 w-4 shrink-0" />
                        <span className="ml-3 transition-opacity duration-200">{subItem.title}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div className="h-auto border-t">
        <div className={cn(
          "p-3 flex items-center",
          isExpanded ? "justify-between" : "justify-center"
        )}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 transition-transform duration-200 hover:scale-110">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userInfo?.avatarUrl || ""} alt={userInfo?.name || "User"} />
                  <AvatarFallback>{userInfo?.name?.charAt(0) || userInfo?.username?.charAt(0) || "U"}</AvatarFallback>
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
                <p className="text-sm font-medium truncate">{userInfo?.name || userInfo?.username}</p>
                <p className="text-xs text-muted-foreground truncate">{userInfo?.email}</p>
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
        </div>
        <div className={cn(
          "px-3 pb-3",
          isExpanded ? "flex justify-between items-center" : "flex justify-center"
        )}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={toggleTheme}
                    className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input scale-90"
                  />
                  {theme === 'dark' ? (
                    <Moon className="h-4 w-4 text-yellow-300" />
                  ) : (
                    <Sun className="h-4 w-4 text-amber-500" />
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
