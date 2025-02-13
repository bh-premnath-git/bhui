import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import logo from "/logo.svg";

interface SidebarLogoProps {
  isCollapsed: boolean;
}

export const SidebarLogo = ({ isCollapsed }: SidebarLogoProps) => {
  const navigate = useNavigate();

  return (
    <div 
      className={cn(
        "flex items-center gap-2 cursor-pointer min-w-0",
        isCollapsed ? 'justify-center w-full' : 'px-1'
      )}
      onClick={() => navigate("/dashboard")}
    >
      <div className="sidebar-icon flex-shrink-0 w-6 h-6 bg-primary rounded-md flex items-center justify-center">
        <img src={logo} alt="Logo" className="w-4 h-4" />
      </div>
      <div 
        className={cn(
          "sidebar-content truncate",
          isCollapsed && "sidebar-content-collapsed"
        )}
      >
        <span className="font-semibold text-card-foreground whitespace-nowrap">
          Bighammer AI
        </span>
      </div>
    </div>
  );
};