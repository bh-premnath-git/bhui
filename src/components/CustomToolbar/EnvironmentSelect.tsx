import React, { useEffect } from 'react';
import { AlertCircle, Check, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import useToast from '@/oldcomponents/teast-service';

export const EnvironmentSelect = ({ value, onValueChange, environments }) => {
  const environmentOptions = [
    { value: "select", label: "Select Environment" },
    ...environments.map(env => ({
      value: env.id.toString(),
      label: env.envName
    }))
  ];

  const showWarning = value === "select" || !value;
  const isEnvironmentSelected = !showWarning;
  const [ToastComponent, showToast] = useToast();

  const selectedEnvironment = environmentOptions.find(opt => opt.value === value);

  // Check initially if no environment is selected
  useEffect(() => {
    if (showWarning) {
      showToast('No environment selected', { color: 'red' });
    }
  }, []); // Empty dependency array means this runs once on mount

  const handleValueChange = (newValue) => {
    if (newValue === "select" || !newValue) {
      showToast('No environment selected', { color: 'red' });
    }
    onValueChange(newValue);
  };

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Select value={value} onValueChange={handleValueChange}>
                <SelectTrigger
                  className={`
                    w-40 h-9 px-3
                    flex items-center
                    bg-white transition-all duration-200
                    ${showWarning
                      ? 'border-yellow-400 hover:border-yellow-500'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                    focus:outline-none focus:ring-2 
                    ${showWarning
                      ? 'focus:ring-yellow-200'
                      : 'focus:ring-blue-500'
                    }
                    [&>svg]:hidden
                  `}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {isEnvironmentSelected && (
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-green-400" />
                    )}
                    <SelectValue
                      placeholder="Select Environment"
                      className={`${showWarning ? 'text-gray-400' : 'text-gray-700'} truncate max-w-[120px]`}
                    />
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500 opacity-50 flex-shrink-0 ml-2" />
                </SelectTrigger>
                <SelectContent
                  className="max-h-[300px] w-[280px] overflow-auto bg-white rounded-md shadow-lg border border-gray-200"
                  align="start"
                  sideOffset={4}
                >
                  {environmentOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className={`
                        relative flex items-center px-3 py-2 text-sm
                        ${option.value === 'select'
                          ? 'text-gray-400'
                          : 'text-gray-700'
                        }
                        ${value === option.value ? 'bg-blue-50' : ''}
                        hover:bg-gray-100
                        cursor-pointer
                        transition-colors
                        outline-none
                        focus:bg-blue-50 focus:text-gray-900
                        [&>svg]:hidden
                      `}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="truncate max-w-[200px]">{option.label}</span>
                        {value === option.value && option.value !== 'select' && (
                          <Check className="h-4 w-4 text-blue-500 ml-2 flex-shrink-0" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TooltipTrigger>
          {isEnvironmentSelected && selectedEnvironment && (
            <TooltipContent
              side="top"
              className="bg-gray-900 px-3 py-1.5 text-xs font-medium text-white rounded-md border-0"
              sideOffset={5}
            >
              <p>{selectedEnvironment.label}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      {showWarning && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <AlertCircle
                  className="h-5 w-5 text-yellow-400 hover:text-yellow-500 transition-colors cursor-help"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="bg-gray-900 px-3 py-1.5 text-xs font-medium text-white rounded-md border-0"
              sideOffset={5}
            >
              <p>Please select an environment</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <ToastComponent />
    </div>
  );
};