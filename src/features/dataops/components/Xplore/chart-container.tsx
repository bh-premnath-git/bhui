import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { QueryResult, ChartType } from '@/types/data-catalog/xplore/type';
import ChartToolbar from '@/components/bh-charts/ChartToolbar';
import { cn } from '@/lib/utils';
import { COLOR_THEMES } from '@/components/bh-charts/ChartTypes';

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
  // Always declare hooks at the top level, regardless of chart type
  const [isHovered, setIsHovered] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(result.config?.colorTheme || 'orange');
  
  // Get the actual color array based on the theme name
  const themeColors = useMemo(() => {
    return COLOR_THEMES[currentTheme as keyof typeof COLOR_THEMES] || COLOR_THEMES.orange;
  }, [currentTheme]);
  
  // Debug logging to verify theme changes
  useEffect(() => {
    console.log('Current theme:', currentTheme);
    console.log('Theme colors:', themeColors);
  }, [currentTheme, themeColors]);
  
  // Clone children to pass down the colors
  const childrenWithColors = useMemo(() => {
    return React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        // Clone the element with the colors prop
        return React.cloneElement(child, { 
          colors: themeColors,
          ...child.props
        });
      }
      return child;
    });
  }, [children, themeColors]);

  // Handle chart type change
  const handleChartTypeChange = useCallback((chartType: string) => {
    if (onChartChange) {
      console.log(`Changing chart type to: ${chartType}`);
      onChartChange({
        ...result,
        chartType: chartType as ChartType
      });
    }
  }, [result, onChartChange]);

  // Handle color theme change
  const handleColorThemeChange = useCallback((theme: string) => {
    console.log(`Changing color theme to: ${theme}`);
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

  // Determine if this chart type should have overflow visible
  const shouldAllowOverflow = result.chartType === 'donut';

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
      <div className={cn(
        "w-full h-full",
        shouldAllowOverflow ? "overflow-visible" : "overflow-hidden horizontal-scrollbar"
      )}>
        {childrenWithColors}
      </div>
    </div>
  );
};

export default ChartContainer;
