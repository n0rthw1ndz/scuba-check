import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { themes } from '../utils/themes';
import { ThemeMode } from '../types/theme';

export const ThemeSelector: React.FC = () => {
  const { currentTheme, setTheme } = useTheme();

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-slate-850 p-2 rounded-lg shadow-lg border border-purple-custom/20">
        <div className="flex space-x-2">
          {Object.entries(themes).map(([mode, theme]) => (
            <button
              key={mode}
              onClick={() => setTheme(mode as ThemeMode)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                currentTheme.name === theme.name
                  ? 'bg-purple-custom text-white'
                  : 'bg-slate-900 text-gray-400 hover:text-white hover:bg-purple-custom/50'
              }`}
              title={theme.name}
            >
              {theme.icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};