import React from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { RootState } from '@/store';
import { setSelectedMode } from '@/store/slices/designer/buildPipeLine/BuildPipeLineSlice';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Settings, ChevronDown, Cog, Bug, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModeSelectorProps {
  className?: string;
}

const modeOptions = [
  {
    id: 'engine' as const,
    label: 'Engine',
    description: 'Standard execution mode',
    icon: Cog,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  {
    id: 'debug' as const,
    label: 'Debug',
    description: 'Debug and inspect pipeline',
    icon: Bug,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  {
    id: 'interactive' as const,
    label: 'Interactive',
    description: 'Interactive development mode',
    icon: Terminal,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  }
];

export function ModeSelector({ className }: ModeSelectorProps) {
  const dispatch = useAppDispatch();
  const { selectedMode } = useAppSelector((state: RootState) => state.buildPipeline);
  const [isOpen, setIsOpen] = React.useState(false);

  const selectedModeOption = modeOptions.find(option => option.id === selectedMode);
  const SelectedIcon = selectedModeOption?.icon || Settings;

  const handleModeSelect = (mode: 'engine' | 'debug' | 'interactive') => {
    dispatch(setSelectedMode(mode));
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "flex items-center justify-center h-9 w-9 p-0 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200",
                "shadow-sm hover:shadow-md",
                className
              )}
              aria-label="Select Execution Mode"
            >
              <SelectedIcon className={cn("h-4 w-4", selectedModeOption?.color)} />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Execution Mode</p>
        </TooltipContent>
      </Tooltip>
      
      <PopoverContent className="w-64 p-2" align="start">
        <div className="space-y-1">
          <div className="px-2 py-1.5">
            <h4 className="text-sm font-semibold text-gray-900">Execution Mode</h4>
            <p className="text-xs text-gray-500">Choose how to run your pipeline</p>
          </div>
          
          {modeOptions.map((option) => {
            const IconComponent = option.icon;
            const isSelected = selectedMode === option.id;
            
            return (
              <button
                key={option.id}
                onClick={() => handleModeSelect(option.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200",
                  "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                  isSelected && `${option.bgColor} ${option.borderColor} border shadow-sm`
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-md",
                  isSelected ? option.bgColor : "bg-gray-100"
                )}>
                  <IconComponent className={cn(
                    "h-4 w-4",
                    isSelected ? option.color : "text-gray-600"
                  )} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-sm font-medium",
                      isSelected ? "text-gray-900" : "text-gray-900"
                    )}>
                      {option.label}
                    </span>
                    {isSelected && (
                      <div className={cn("w-2 h-2 rounded-full", option.color.replace('text-', 'bg-'))} />
                    )}
                  </div>
                  <p className={cn(
                    "text-xs mt-0.5",
                    isSelected ? "text-gray-700" : "text-gray-500"
                  )}>
                    {option.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}