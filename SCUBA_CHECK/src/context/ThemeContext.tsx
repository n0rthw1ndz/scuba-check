import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme, ThemeMode } from '../types/theme';
import { themes } from '../utils/themes';

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: themes.dark,
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes.dark);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeMode;
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(themes[savedTheme]);
      applyTheme(themes[savedTheme]);
    }
  }, []);

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    root.style.setProperty('--theme-background', theme.colors.background);
    root.style.setProperty('--theme-card-background', theme.colors.cardBackground);
    root.style.setProperty('--theme-border', theme.colors.border);
    root.style.setProperty('--theme-text-primary', theme.colors.text.primary);
    root.style.setProperty('--theme-text-secondary', theme.colors.text.secondary);
    root.style.setProperty('--theme-text-accent', theme.colors.text.accent);
    root.style.setProperty('--theme-button-primary', theme.colors.button.primary);
    root.style.setProperty('--theme-button-hover', theme.colors.button.hover);
  };

  const setTheme = (mode: ThemeMode) => {
    const newTheme = themes[mode];
    setCurrentTheme(newTheme);
    localStorage.setItem('theme', mode);
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};