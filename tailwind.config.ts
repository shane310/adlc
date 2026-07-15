import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0f4c81',
          light: '#3a76b3',
          dark: '#082c4c',
        },
        danger: '#dc2626',
        warning: '#d97706',
        success: '#16a34a',
      },
    },
  },
  plugins: [],
};

export default config;
