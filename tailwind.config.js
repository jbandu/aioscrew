/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'copa-blue': {
          DEFAULT: '#003087',
          50: '#E8F4F8',
          light: '#0047AB',
          dark: '#001F5C',
        },
        'copa-gold': {
          DEFAULT: '#FFB81C',
          light: '#FFD166',
          dark: '#E69500',
        },
      },
    },
  },
  plugins: [],
};
