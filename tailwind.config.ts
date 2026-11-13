import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        shelfwise: {
          primary: '#17324D',
          accent: '#16A6A1',
          background: '#F5F7FA',
          surface: '#FFFFFF',
          text: '#17212B',
          error: '#C62828',
          success: '#2E7D32',
          warning: '#ED9B24',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      maxWidth: {
        content: '1200px',
      },
    },
  },
  plugins: [],
} satisfies Config;
