import { NavLink, useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, Hammer, Sun, Moon, LogOut } from "lucide-react";
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
import { useTheme } from "@/context/ThemeContext";
import { useKeycloakAuth } from "@/context/KeycloakContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logo from "/logo.svg";

export function Sidebar() {
  const { isExpanded, toggleSidebar } = useSidebar();
  const navigation = useNavigation();
  const { theme, toggleTheme } = useTheme();
  const { userData, logout } = useKeycloakAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  return (
    <div
      className={cn(
        "h-screen fixed left-0 top-0 z-40 flex flex-col",
        "bg-sidebar border-r border-sidebar-border",
        "transition-[width] duration-300 ease-in-out will-change-[width]",
        isExpanded ? "w-64" : "w-20"
      )}
    >
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <div className="flex items-center cursor-pointer overflow-hidden" onClick={() => navigate("/")}>
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
          "absolute -right-4 top-9 text-sidebar-foreground hover:bg-sidebar-accent",
          "h-10 w-4 rounded-none rounded-r-md border border-l-0 border-sidebar-border",
          "bg-sidebar transition-transform duration-300",
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
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
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
                    "mt-1 ml-4 space-y-1 border-l border-sidebar-border pl-3",
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
                            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
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
      <div className="h-16 border-t border-sidebar-border p-4">
        <div className={cn(
          "flex items-center",
          "transition-all duration-300 ease-in-out",
          isExpanded ? "justify-between" : "justify-center"
        )}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 transition-transform duration-200 hover:scale-110">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            {isExpanded && (
              <div 
                className={cn(
                  "flex-1 ml-3 overflow-hidden",
                  "transition-all duration-300 ease-in-out",
                  isExpanded 
                    ? "opacity-100 max-w-[200px]" 
                    : "opacity-0 max-w-0 pointer-events-none"
                )}
              >
                <p className="text-sm font-medium truncate">{userData?.username}</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">{userData?.email}</p>
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
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className={cn(
              "text-sidebar-foreground hover:bg-sidebar-accent",
              "transition-all duration-200 ease-in-out",
              isExpanded ? "pl-1" : "hover:scale-110"
            )}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
