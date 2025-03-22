import React, { useState, useRef, useEffect } from 'react';
import { BarChart } from 'lucide-react';
import { CHART_TYPES } from './ChartTypes';
import ChartTypeDropdown from './toolbar/ChartTypeDropdown';
import ColorThemeDropdown from './toolbar/ColorThemeDropdown';
import SettingsDropdown from './toolbar/SettingsDropdown';

interface ChartToolbarProps {
  currentType: string;
  selectedTheme: string;
  vizId?: string;
  onChartTypeChange: (type: string) => void;
  onColorThemeChange: (theme: string) => void;
  onSettingChange?: (setting: string, value: boolean) => void;
  config?: Record<string, any>;
  className?: string;
}

const ChartToolbar: React.FC<ChartToolbarProps> = ({
  currentType,
  selectedTheme,
  onChartTypeChange,
  onColorThemeChange,
  onSettingChange,
  config = {},
  className = ""
}) => {
  const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
  const [chartTypeDropdownOpen, setChartTypeDropdownOpen] = useState(false);
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);
  const colorDropdownRef = useRef<HTMLDivElement>(null);
  const chartTypeDropdownRef = useRef<HTMLDivElement>(null);
  const settingsDropdownRef = useRef<HTMLDivElement>(null);

  // Get the current chart type icon
  const getCurrentChartTypeIcon = () => {
    const chartType = CHART_TYPES.find(type => type.type === currentType);
    return chartType ? chartType.icon : BarChart;
  };

  useEffect(() => {
    // Close dropdowns when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (colorDropdownRef.current && !colorDropdownRef.current.contains(event.target as Node)) {
        setColorDropdownOpen(false);
      }
      if (chartTypeDropdownRef.current && !chartTypeDropdownRef.current.contains(event.target as Node)) {
        setChartTypeDropdownOpen(false);
      }
      if (settingsDropdownRef.current && !settingsDropdownRef.current.contains(event.target as Node)) {
        setSettingsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle settings change
  const handleSettingChange = (setting: string, value: boolean) => {
    if (onSettingChange) {
      onSettingChange(setting, value);
    }
  };

  const ChartTypeIcon = getCurrentChartTypeIcon();

  return (
    <div className={`flex items-center ${className}`}>
      {/* Chart Type Dropdown */}
      <ChartTypeDropdown
        isOpen={chartTypeDropdownOpen}
        setIsOpen={setChartTypeDropdownOpen}
        currentType={currentType}
        onChartTypeChange={onChartTypeChange}
        dropdownRef={chartTypeDropdownRef}
        ChartTypeIcon={ChartTypeIcon}
      />
      {/* Color Theme Dropdown */}
      <ColorThemeDropdown
        isOpen={colorDropdownOpen}
        setIsOpen={setColorDropdownOpen}
        selectedTheme={selectedTheme}
        onColorThemeChange={onColorThemeChange}
        dropdownRef={colorDropdownRef}
      />
      {/* Settings Dropdown */}
      <SettingsDropdown
        isOpen={settingsDropdownOpen}
        setIsOpen={setSettingsDropdownOpen}
        currentType={currentType}
        config={config}
        handleSettingChange={handleSettingChange}
        dropdownRef={settingsDropdownRef}
      />
    </div>
  );
};

export default ChartToolbar;
