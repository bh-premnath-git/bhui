import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { ChevronLeft, CloudCog, Edit, Link, Clock, Settings, Check, CloudOff, Loader2, CloudUpload, Database, Zap, Link2, Search, Power, Server, CheckCircle } from 'lucide-react'
import { cn } from "@/lib/utils"



const baseClasses = "flex items-center p-1.5 rounded-md transition-all duration-300 ease-in-out hover:shadow-md";
const iconClasses = "h-5 w-5 transition-transform duration-300 ease-in-out";
const formatLastSaved = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString(); 
  };
export function AutoSaveChanges(){
    return (
        <Tooltip>
          <TooltipTrigger>
            <div className={cn(
              baseClasses,
              "bg-blue-50 text-blue-700 border border-blue-200"
            )}>
              <div className="relative">
                <Loader2 className={cn(iconClasses, "animate-spin")} />
                <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-400 animate-ping" />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-blue-50 text-blue-700 border-blue-200">
            <div className="flex items-center gap-2">
              <CloudCog className="h-4 w-4" />
              <span>Saving changes...</span>
            </div>
          </TooltipContent>
        </Tooltip>
    )
}

export function LastSave({lastSaved}){
    return (
        <Tooltip>
          <TooltipTrigger>
            <div className={cn(
              baseClasses,
              "bg-green-50 text-green-700 border border-green-200",
              "group"
            )}>
              <div className="relative">
                <CloudUpload className={cn(
                  iconClasses,
                  "group-hover:scale-110 group-hover:rotate-12"
                )} />
                <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-400" />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-green-50 text-green-700 border-green-200">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Last saved at {formatLastSaved(lastSaved)}</span>
            </div>
          </TooltipContent>
        </Tooltip>
    )
}


export function AutoSaveDefault(){
    return (
        <Tooltip>
        <TooltipTrigger>
          <div className={cn(
            baseClasses,
            "bg-orange-50 text-orange-700 border border-orange-200",
            "group"
          )}>
            <div className="relative">
              <CloudOff className={cn(
                iconClasses,
                "group-hover:scale-110 group-hover:-rotate-12"
              )} />
              <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
            </div>
          </div>
        </TooltipTrigger>

      </Tooltip>
    )
}