
import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setThemeMode: (mode: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check for user preference
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    
    // Always default to light theme if no preference is stored
    return storedTheme || 'light';
  });

  const toggleTheme = () => {
    setTheme(currentTheme => {
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  const setThemeMode = (mode: Theme) => {
    setTheme(() => {
      localStorage.setItem('theme', mode);
      return mode;
    });
  };

  // Apply theme to document when it changes
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Add transition class before changing theme
    root.classList.add('theme-transition');
    
    // Remove existing theme classes and add the new one
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Remove transition class after the change to prevent transitions on page load
    const transitionTimeout = setTimeout(() => {
      root.classList.remove('theme-transition');
    }, 300);
    
    return () => {
      clearTimeout(transitionTimeout);
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
