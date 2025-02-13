/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          850: '#1e2132',
          900: '#0f1117',
        },
        purple: {
          custom: '#6b4fbb',
          light: '#8c7ae6',
          dark: '#4a3591',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Ubuntu Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
        'ubuntu': ['Ubuntu Mono', 'monospace']
      }
    },
  },
  plugins: [],
}