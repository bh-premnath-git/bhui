import { Button } from "@/components/ui/button";
import { Sun, Moon, User, LogOut } from 'lucide-react';
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useKeycloakAuth } from "@/provider/KeycloakProvider";

interface SidebarFooterProps {
  isCollapsed: boolean;
  theme: string;
  onThemeChange: () => void;
}

export const SidebarFooter = ({ isCollapsed, theme, onThemeChange }: SidebarFooterProps) => {
  const { logout } = useKeycloakAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="p-4 border-t space-y-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={onThemeChange}
        className={cn(
          'w-full text-foreground bg-accent hover:text-accent-foreground transition-colors',
          !isCollapsed && 'justify-start',
          isCollapsed && 'px-0'
        )}
      >
        {theme === 'dark' ? (
          <>
            <Moon className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span className="ml-3">Dark Mode</span>}
          </>
        ) : (
          <>
            <Sun className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span className="ml-3">Light Mode</span>}
          </>
        )}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'w-full text-foreground bg-accent hover:text-accent-foreground transition-colors',
              !isCollapsed && 'justify-start',
              isCollapsed && 'px-0'
            )}
          >
            <User className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span className="ml-3">Account</span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};