import { Theme, ThemeMode } from '../types/theme';

export const themes: Record<ThemeMode, Theme> = {
  dark: {
    name: 'Dark',
    icon: '🌙',
    colors: {
      background: '#0f1117',
      cardBackground: '#1e2132',
      border: 'rgba(107, 79, 187, 0.2)',
      text: {
        primary: '#ffffff',
        secondary: '#94a3b8',
        accent: '#8c7ae6'
      },
      button: {
        primary: '#6b4fbb',
        hover: '#8c7ae6'
      }
    }
  },
  light: {
    name: 'Light',
    icon: '☀️',
    colors: {
      background: '#f8fafc',
      cardBackground: '#ffffff',
      border: 'rgba(107, 79, 187, 0.2)',
      text: {
        primary: '#1e293b',
        secondary: '#475569',
        accent: '#6b4fbb'
      },
      button: {
        primary: '#6b4fbb',
        hover: '#4a3591'
      }
    }
  },
  cyberpunk: {
    name: 'Cyberpunk',
    icon: '⚡',
    colors: {
      background: '#000000',
      cardBackground: '#0a0a0f',
      border: 'rgba(255, 23, 68, 0.2)',
      text: {
        primary: '#ffffff',
        secondary: '#b3e5fc',
        accent: '#ff1744'
      },
      button: {
        primary: '#ff1744',
        hover: '#d50000'
      }
    }
  },
  ocean: {
    name: 'Ocean',
    icon: '🌊',
    colors: {
      background: '#1a2b3c',
      cardBackground: '#2c4356',
      border: 'rgba(100, 181, 246, 0.2)',
      text: {
        primary: '#ffffff',
        secondary: '#b3e5fc',
        accent: '#64b5f6'
      },
      button: {
        primary: '#64b5f6',
        hover: '#2196f3'
      }
    }
  },
  forest: {
    name: 'Forest',
    icon: '🌲',
    colors: {
      background: '#1b2f1d',
      cardBackground: '#2c422e',
      border: 'rgba(129, 199, 132, 0.2)',
      text: {
        primary: '#ffffff',
        secondary: '#c8e6c9',
        accent: '#81c784'
      },
      button: {
        primary: '#81c784',
        hover: '#4caf50'
      }
    }
  },
  mocha: {
    name: 'Mocha',
    icon: '☕',
    colors: {
      background: '#2C1810', // Deep coffee brown
      cardBackground: '#3C2218', // Slightly lighter coffee brown
      border: 'rgba(210, 180, 140, 0.2)', // Creamy coffee border
      text: {
        primary: '#FFF6E6', // Creamy white
        secondary: '#D2B48C', // Coffee with cream
        accent: '#C87941' // Rich caramel
      },
      button: {
        primary: '#C87941', // Rich caramel
        hover: '#A0522D' // Darker roast
      }
    }
  }
};