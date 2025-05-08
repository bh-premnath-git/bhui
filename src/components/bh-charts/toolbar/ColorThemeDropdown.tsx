import React, { useCallback } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { COLOR_THEMES } from '../ChartTypes';

// Color palette categories
const COLOR_CATEGORIES = {
  "Standard": ["default", "alternate", "corporate"],
  "Vivid": ["vivid", "neon"],
  "Nature": ["ocean", "forest", "terra", "sunset"],
  "Classic": ["blue", "green", "purple", "pink", "orange", "mixed"]
};

interface ColorThemeDropdownProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedTheme: string;
  onColorThemeChange: (theme: string) => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
}

const ColorThemeDropdown: React.FC<ColorThemeDropdownProps> = ({
  isOpen,
  setIsOpen,
  selectedTheme,
  onColorThemeChange,
  dropdownRef
}) => {
  // Ensure we have a valid theme selected (defaulting to blue if not)
  const safeSelectedTheme = Object.keys(COLOR_THEMES).includes(selectedTheme) ? selectedTheme : 'blue';
  
  const handleThemeChange = useCallback((theme: string) => {
    if (Object.keys(COLOR_THEMES).includes(theme)) {
      onColorThemeChange(theme);
      setIsOpen(false);
    }
  }, [onColorThemeChange, setIsOpen]);
  
  return (
    <div className="flex border-l border-border/30 pl-2 relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-muted-foreground rounded-md hover:bg-secondary/50 p-1.5 transition-colors"
        aria-label="Change color theme"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-1.5">
          <div 
            className="h-4 w-4 rounded"
            style={{
              background: `linear-gradient(to right, ${COLOR_THEMES[safeSelectedTheme as keyof typeof COLOR_THEMES].slice(0, 2).join(', ')})`
            }}
          />
          <ChevronDown size={14} />
        </div>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-background border border-border/30 rounded-md shadow-md p-2 z-20 w-64">
          <div className="mb-2 text-xs font-medium text-muted-foreground">Theme Colors</div>
          
          {/* Color grid */}
          <div className="grid gap-2">
            {Object.entries(COLOR_CATEGORIES).map(([category, themes]) => (
              <div key={category} className="space-y-1">
                <div className="text-xs text-muted-foreground opacity-70 mb-1">{category}</div>
                <div className="grid grid-cols-4 gap-1">
                  {themes.map(theme => (
                    <button
                      key={theme}
                      onClick={() => handleThemeChange(theme)}
                      className="relative p-0 h-8 overflow-hidden rounded hover:ring-2 hover:ring-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      aria-label={`${theme} color theme`}
                      type="button"
                    >
                      <div 
                        className="w-full h-full"
                        style={{
                          background: `linear-gradient(to bottom right, ${COLOR_THEMES[theme as keyof typeof COLOR_THEMES].slice(0, 3).join(', ')})`
                        }}
                      />
                      {selectedTheme === theme && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorThemeDropdown;
