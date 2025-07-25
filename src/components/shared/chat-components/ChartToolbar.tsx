import React, { useState, useRef } from 'react';
import ChartTypeDropdown from '@/components/bh-charts/toolbar/ChartTypeDropdown';
import ColorThemeDropdown from '@/components/bh-charts/toolbar/ColorThemeDropdown';
import { CHART_TYPES } from '@/components/bh-charts/ChartTypes';
import { useComponentVisible } from '@/hooks/useComponentVisible';

interface ChartToolbarProps {
  currentChartType: string;
  onChartTypeChange: (type: string) => void;
  selectedTheme: string;
  onColorThemeChange: (theme: string) => void;
}

export const ChartToolbar: React.FC<ChartToolbarProps> = ({ 
  currentChartType, 
  onChartTypeChange, 
  selectedTheme, 
  onColorThemeChange 
}) => {
  const { ref: chartTypeDropdownRef, isComponentVisible: isChartTypeOpen, setIsComponentVisible: setIsChartTypeOpen } = useComponentVisible(false);
  const { ref: colorThemeDropdownRef, isComponentVisible: isColorThemeOpen, setIsComponentVisible: setIsColorThemeOpen } = useComponentVisible(false);

  const ChartTypeIcon = CHART_TYPES.find(c => c.type === currentChartType)?.icon || CHART_TYPES[0].icon;

  return (
    <div className="flex items-center justify-end p-2 border-b border-border/30 bg-background/50">
      <ChartTypeDropdown
        dropdownRef={chartTypeDropdownRef}
        isOpen={isChartTypeOpen}
        setIsOpen={setIsChartTypeOpen}
        currentType={currentChartType}
        onChartTypeChange={onChartTypeChange}
        ChartTypeIcon={ChartTypeIcon}
      />
      <ColorThemeDropdown
        dropdownRef={colorThemeDropdownRef}
        isOpen={isColorThemeOpen}
        setIsOpen={setIsColorThemeOpen}
        selectedTheme={selectedTheme}
        onColorThemeChange={onColorThemeChange}
      />
    </div>
  );
};
