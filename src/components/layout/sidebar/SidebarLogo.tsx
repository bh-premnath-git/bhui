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
        "flex items-center gap-2 cursor-pointer",
        isCollapsed && 'justify-center w-full'
      )}
      onClick={() => navigate("/dashboard")}
    >
      <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
      <img src={logo} alt="Logo" className="w-4 h-4" />
      </div>
      {!isCollapsed && (
        <span className="font-semibold text-card-foreground">
          Bighammer AI
        </span>
      )}
    </div>
  );
};