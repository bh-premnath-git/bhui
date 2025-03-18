import React, { useState, useCallback } from 'react';
import { QueryResult, ChartType } from '@/types/data-catalog/xplore/type';
import ChartToolbar from '@/components/bh-charts/ChartToolbar';
import { cn } from '@/lib/utils';

interface ChartContainerProps {
  result: QueryResult;
  children: React.ReactNode;
  onChartChange?: (updatedResult: QueryResult) => void;
}

const ChartContainer: React.FC<ChartContainerProps> = ({ 
  result, 
  children,
  onChartChange 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(result.config?.colorTheme || 'blue');
  
  // Handle chart type change
  const handleChartTypeChange = useCallback((chartType: string) => {
    if (onChartChange) {
      onChartChange({
        ...result,
        chartType: chartType as ChartType
      });
    }
  }, [result, onChartChange]);

  // Handle color theme change
  const handleColorThemeChange = useCallback((theme: string) => {
    setCurrentTheme(theme);
    if (onChartChange) {
      onChartChange({
        ...result,
        config: {
          ...result.config,
          colorTheme: theme
        }
      });
    }
  }, [result, onChartChange]);

  // Handle settings change
  const handleSettingChange = useCallback((setting: string, value: boolean) => {
    if (onChartChange) {
      onChartChange({
        ...result,
        config: {
          ...result.config,
          [setting]: value
        }
      });
    }
  }, [result, onChartChange]);

  return (
    <div 
      className="relative w-full h-full max-w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={cn(
          "absolute top-1 right-1 z-[100] transition-all duration-200",
          isHovered 
            ? "opacity-100 visible translate-y-0" 
            : "opacity-0 invisible -translate-y-2"
        )}
      >
        <div className="bg-background border border-border rounded-md shadow-lg p-1.5">
          <ChartToolbar
            currentType={result.chartType || 'bar'}
            selectedTheme={currentTheme}
            onChartTypeChange={handleChartTypeChange}
            onColorThemeChange={handleColorThemeChange}
            onSettingChange={handleSettingChange}
            config={result.config || {}}
          />
        </div>
      </div>
      <div className="w-full h-full overflow-hidden horizontal-scrollbar">
        {children}
      </div>
    </div>
  );
};

export default ChartContainer;
