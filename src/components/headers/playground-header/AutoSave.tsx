import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  CloudCog, 
  Clock, 
  CloudOff, 
  Loader2, 
  CloudUpload,
  AlertTriangle
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

interface AutoSaveStatusProps {
  status: 'saving' | 'saved' | 'off' | 'unsaved' | 'error';
  lastSaved?: string | null;
  onToggle?: () => void;
  className?: string;
}

const baseClasses = "flex items-center p-1.5 rounded-md transition-all duration-300 ease-in-out hover:shadow-md";
const iconClasses = "h-5 w-5 transition-transform duration-300 ease-in-out";

const formatLastSaved = (dateString: string | null) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString(); 
};

export const AutoSaveStatus = ({ 
  status, 
  lastSaved, 
  onToggle,
  className 
}: AutoSaveStatusProps) => {
  const renderContent = () => {
    switch (status) {
      case 'saving':
        return (
          <div className={cn(
            baseClasses,
            "bg-blue-50 text-blue-700 border border-blue-200",
            className
          )}>
            <div className="relative">
              <Loader2 className={cn(iconClasses, "animate-spin")} />
              <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-400 animate-ping" />
            </div>
          </div>
        );
      case 'unsaved':
        return (
          <div className={cn(
            baseClasses,
            "bg-amber-50 text-amber-700 border border-amber-200",
            "group",
            className
          )}>
            <div className="relative">
              <CloudUpload className={cn(
                iconClasses,
                "group-hover:scale-110 group-hover:-rotate-6"
              )} />
              <span className="sr-only">Unsaved changes</span>
              <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            </div>
          </div>
        );
      case 'saved':
        return (
          <div className={cn(
            baseClasses,
            "bg-green-50 text-green-700 border border-green-200",
            "group",
            className
          )}>
            <div className="relative">
              <CloudUpload className={cn(
                iconClasses,
                "group-hover:scale-110 group-hover:rotate-12"
              )} />
              <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-400" />
            </div>
          </div>
        );
      case 'error':
        return (
          <div className={cn(
            baseClasses,
            "bg-red-50 text-red-700 border border-red-200",
            "group",
            className
          )}>
            <div className="relative">
              <AlertTriangle className={cn(iconClasses, "group-hover:scale-110")}/>
              <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            </div>
          </div>
        );
      case 'off':
        return (
          <div 
            className={cn(
              baseClasses,
              "bg-orange-50 text-orange-700 border border-orange-200",
              "group",
              className,
              onToggle && "cursor-pointer"
            )}
            onClick={onToggle}
          >
            <div className="relative">
              <CloudOff className={cn(
                iconClasses,
                "group-hover:scale-110 group-hover:-rotate-12"
              )} />
              <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
            </div>
          </div>
        );
    }
  };

  const renderTooltipContent = () => {
    switch (status) {
      case 'saving':
        return (
          <div className="flex items-center gap-2">
            <CloudCog className="h-4 w-4" />
            <span>Saving changes...</span>
          </div>
        );
      case 'unsaved':
        return (
          <div className="flex items-center gap-2">
            <CloudUpload className="h-4 w-4" />
            <span>Unsaved changes — will auto-save soon</span>
          </div>
        );
      case 'saved':
        return (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Last saved at {formatLastSaved(lastSaved)}</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Auto-save failed. Please try again.</span>
          </div>
        );
      case 'off':
        return (
          <div className="flex items-center gap-2">
            <CloudOff className="h-4 w-4" />
            <span>Auto-save is disabled</span>
          </div>
        );
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {renderContent()}
        </TooltipTrigger>
        <TooltipContent side="bottom" className={cn(
          status === 'saving' && "bg-blue-50 text-blue-700 border-blue-200",
          status === 'unsaved' && "bg-amber-50 text-amber-700 border-amber-200",
          status === 'saved' && "bg-green-50 text-green-700 border-green-200",
          status === 'error' && "bg-red-50 text-red-700 border-red-200",
          status === 'off' && "bg-orange-50 text-orange-700 border-orange-200"
        )}>
          {renderTooltipContent()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};