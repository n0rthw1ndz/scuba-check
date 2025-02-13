export type ThemeMode = 'light' | 'dark' | 'cyberpunk' | 'ocean' | 'forest' | 'mocha';

export interface ThemeColors {
  background: string;
  cardBackground: string;
  border: string;
  text: {
    primary: string;
    secondary: string;
    accent: string;
  };
  button: {
    primary: string;
    hover: string;
  };
}

export interface Theme {
  name: string;
  colors: ThemeColors;
  icon: string;
}