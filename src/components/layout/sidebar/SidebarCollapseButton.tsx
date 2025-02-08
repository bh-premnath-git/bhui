import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarCollapseButtonProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const SidebarCollapseButton = ({ isCollapsed, onToggle }: SidebarCollapseButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      className={cn(
        "absolute -right-3 top-2 z-50 h-6 w-6 rounded-full border bg-background text-foreground shadow-md",
        "hover:bg-accent hover:text-accent-foreground",
        "dark:border-border dark:bg-background dark:text-foreground dark:hover:bg-accent dark:hover:text-accent-foreground",
        isCollapsed && "rotate-180"
      )}
    >
      <ChevronLeft className="h-3 w-3" />
    </Button>
  );
};