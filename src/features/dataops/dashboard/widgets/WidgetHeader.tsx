import { forwardRef } from "react";
import {
  Button,
  ButtonProps
} from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, GripVertical, Trash2, BarChart2, RefreshCw, Table } from "lucide-react";
import { cn } from "@/lib/utils";

interface WidgetHeaderProps {
  title: string;
  description?: string;
  onFlip?: () => void;
  onRefresh?: (e: React.MouseEvent) => void;
  onViewChange?: () => void;
  isRefreshing?: boolean;
  showFlip?: boolean;
  isFlipped?: boolean;
  isTableView?: boolean;
}

const IconButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, ...props }, ref) => (
    <Button 
      ref={ref}
      variant="ghost" 
      size="sm"
      className={cn(
        "h-8 w-8 p-1.5 rounded-md hover:bg-accent hover:text-accent-foreground", 
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
);
IconButton.displayName = "IconButton";

export const WidgetHeader = ({ 
  title, 
  description,
  onFlip,
  onRefresh,
  onViewChange,
  isRefreshing,
  showFlip,
  isFlipped,
  isTableView
}: WidgetHeaderProps) => {
  return (
    <div className="flex justify-between items-start mb-2">
      <div className="widget-header flex items-center gap-1.5">
        <div className="cursor-move p-1">
          <GripVertical className="h-4 w-4 text-muted-foreground/50" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground leading-tight">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 pointer-events-auto">
        {onRefresh && !isFlipped && (
          <IconButton 
            onClick={onRefresh}
            disabled={isRefreshing}
            className={cn(isRefreshing && "animate-spin")}
          >
            <RefreshCw className="h-4 w-4" />
          </IconButton>
        )}
        {isFlipped && onViewChange && (
          <IconButton onClick={onViewChange}>
            {isTableView ? <BarChart2 className="h-4 w-4" /> : <Table className="h-4 w-4" />}
          </IconButton>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IconButton>
              <MoreHorizontal className="h-4 w-4" />
            </IconButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            {showFlip && (
              <DropdownMenuItem onClick={onFlip} className="gap-2">
                <BarChart2 className="h-4 w-4" />
                <span>{isFlipped ? "Chart View" : "SQL Query"}</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4" />
              <span>Remove Widget</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};