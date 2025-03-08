import React from 'react';
import { ChevronDown, Settings } from 'lucide-react';

interface SettingToggleProps {
  label: string;
  isChecked: boolean;
  onChange: (checked: boolean) => void;
}

const SettingToggle: React.FC<SettingToggleProps> = ({ label, isChecked, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          className="sr-only peer"
          checked={isChecked === true}
          onChange={handleChange}
        />
        <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
      </label>
    </div>
  );
};

interface SettingsDropdownProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentType: string;
  config: Record<string, any>;
  handleSettingChange: (setting: string, value: boolean) => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
}

const SettingsDropdown: React.FC<SettingsDropdownProps> = ({
  isOpen,
  setIsOpen,
  currentType,
  config,
  handleSettingChange,
  dropdownRef
}) => {
  // Check if the setting is applicable to the current chart type
  const isSettingApplicable = (setting: string): boolean => {
    const nonGridCharts = ['pie', 'donut', 'gauge'];
    const stackableCharts = ['bar', 'area'];
    
    switch (setting) {
      case 'showGrid': 
        return !nonGridCharts.includes(currentType);
      case 'showAxis':
        return !['pie', 'donut', 'gauge', 'radar', 'treemap'].includes(currentType);
      case 'horizontal': 
        return currentType === 'bar';
      case 'stacked': 
        return stackableCharts.includes(currentType);
      case 'showLabels':
        return true; // All chart types can show labels
      case 'showLegend':
        return true; // All chart types can show legend
      case 'roundedBars':
        return ['bar', 'histogram'].includes(currentType);
      default:
        return true;
    }
  };

  // Get the current value of a setting, defaulting to appropriate values based on the setting
  const getSettingValue = (setting: string): boolean => {
    switch (setting) {
      case 'showLegend':
      case 'showGrid':
      case 'showAxis':
        return config[setting] !== false; // Default to true
      case 'showLabels':
      case 'horizontal':
      case 'stacked':
      case 'roundedBars':
        return config[setting] === true; // Default to false
      default:
        return !!config[setting];
    }
  };

  // Handle toggle with proper logging
  const handleToggleSetting = (setting: string, checked: boolean) => {
    handleSettingChange(setting, checked);
  };

  return (
    <div className="flex mr-2 relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-muted-foreground rounded-md hover:bg-secondary/50 p-1.5 transition-colors"
        aria-label="Chart settings"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-1.5">
          <Settings size={16} />
          <ChevronDown size={14} />
        </div>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-background border border-border/30 rounded-md shadow-md p-2 z-20 w-64">
          <div className="mb-2 text-xs font-medium text-muted-foreground">Chart Settings</div>
          <div className="space-y-3">
            {/* Show Legend */}
            {isSettingApplicable('showLegend') && (
              <SettingToggle 
                label="Show Legend" 
                isChecked={getSettingValue('showLegend')}
                onChange={(checked) => handleToggleSetting('showLegend', checked)}
              />
            )}
            
            {/* Show Grid */}
            {isSettingApplicable('showGrid') && (
              <SettingToggle 
                label="Show Grid" 
                isChecked={getSettingValue('showGrid')}
                onChange={(checked) => handleToggleSetting('showGrid', checked)}
              />
            )}

            {/* Show Axis */}
            {isSettingApplicable('showAxis') && (
              <SettingToggle 
                label="Show Axis" 
                isChecked={getSettingValue('showAxis')}
                onChange={(checked) => handleToggleSetting('showAxis', checked)}
              />
            )}
            
            {/* Show Labels */}
            {isSettingApplicable('showLabels') && (
              <SettingToggle 
                label="Show Data Labels" 
                isChecked={getSettingValue('showLabels')}
                onChange={(checked) => handleToggleSetting('showLabels', checked)}
              />
            )}
            
            {/* Rounded Bars */}
            {isSettingApplicable('roundedBars') && (
              <SettingToggle 
                label="Rounded Bars" 
                isChecked={getSettingValue('roundedBars')}
                onChange={(checked) => handleToggleSetting('roundedBars', checked)}
              />
            )}
            
            {/* Horizontal (for Bar Chart) */}
            {isSettingApplicable('horizontal') && (
              <SettingToggle 
                label="Horizontal Layout" 
                isChecked={getSettingValue('horizontal')}
                onChange={(checked) => handleToggleSetting('horizontal', checked)}
              />
            )}
            
            {/* Stacked (for Bar and Area Charts) */}
            {isSettingApplicable('stacked') && (
              <SettingToggle 
                label="Stacked" 
                isChecked={getSettingValue('stacked')}
                onChange={(checked) => handleToggleSetting('stacked', checked)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsDropdown;
