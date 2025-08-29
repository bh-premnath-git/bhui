import React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { CHART_TYPES } from '../ChartTypes';

interface ChartTypeDropdownProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentType: string;
  onChartTypeChange: (type: string) => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
  ChartTypeIcon: React.ElementType;
}

const ChartTypeDropdown: React.FC<ChartTypeDropdownProps> = ({
  isOpen,
  setIsOpen,
  currentType,
  onChartTypeChange,
  dropdownRef,
  ChartTypeIcon
}) => {
  return (
    <div className="flex mr-2 relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-muted-foreground rounded-md hover:bg-secondary/50 p-1.5 transition-colors"
        aria-label="Change chart type"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-1.5">
          <ChartTypeIcon size={16} />
          <ChevronDown size={14} />
        </div>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-background border border-border/30 rounded-md shadow-md p-2 z-20 w-64 max-h-[280px] overflow-y-auto">
          <div className="mb-2 text-xs font-medium text-muted-foreground">Chart Types</div>
          <div className="grid grid-cols-1 gap-1">
            {CHART_TYPES.map((chartType) => (
              <button
                key={chartType.type}
                onClick={() => {
                  onChartTypeChange(chartType.type);
                  setIsOpen(false);
                }}
                className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/70 transition-colors"
                title={chartType.label}
              >
                <div className="flex items-center gap-2">
                  <chartType.icon size={16} className="text-muted-foreground" />
                  <span className="text-sm">{chartType.label}</span>
                </div>
                {currentType === chartType.type && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartTypeDropdown;
