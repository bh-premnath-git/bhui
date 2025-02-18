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
  const { toggleExpanded, isExpanded: isItemExpanded } = useNavigation();
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
        "transition-all duration-300 ease-in-out",
        isExpanded ? "w-64" : "w-20"
      )}
    >
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
          <img src={logo} alt="Bighammer AI" className="h-6 w-6 text-sidebar-foreground" />
          <div className="overflow-hidden">
            <h1 className={cn(
              "text-lg font-semibold font-sans ml-2",
              "transition-all duration-300 ease-in-out whitespace-nowrap",
              isExpanded
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-4"
            )}>
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
          "bg-sidebar"
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
                    "flex items-center px-3 py-2 rounded-md transition-colors",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                    !isExpanded && "justify-center"
                  )
                }
                onClick={() => item.subItems && toggleExpanded(item.path)}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {isExpanded && (
                  <span className="ml-3 flex-1">{item.title}</span>
                )}
                {isExpanded && item.subItems && (
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 transition-transform shrink-0",
                      isItemExpanded(item.path) && "transform rotate-90"
                    )}
                  />
                )}
              </NavLink>
              {isExpanded && item.subItems && isItemExpanded(item.path) && (
                <ul className="mt-1 ml-4 space-y-1 border-l border-sidebar-border pl-3">
                  {item.subItems.map((subItem) => (
                    <li key={subItem.path}>
                      <NavLink
                        to={subItem.path}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center px-3 py-2 rounded-md text-sm transition-colors",
                            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                          )
                        }
                      >
                        <subItem.icon className="h-4 w-4 shrink-0" />
                        <span className="ml-3">{subItem.title}</span>
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
          "flex items-center justify-between",
          !isExpanded && "justify-center"
        )}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
              <Avatar className="h-8 w-8">
              <AvatarImage src="https://github.com/shadcn.png" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
              </Button>
            </DropdownMenuTrigger>
            {isExpanded && (
              <div className="flex-1 ml-3">
                <p className="text-sm font-medium truncate">{userData?.username}</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">{userData?.email}</p>
              </div>
            )}
            <DropdownMenuContent align="end" className={cn(
              "min-w-[14rem]",
              !isExpanded && "w-auto min-w-[8rem]"
            )}>
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
            className="text-sidebar-foreground hover:bg-sidebar-accent pl-1"
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
