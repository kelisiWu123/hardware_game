/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      keyframes: {
        'fade-in-down': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-10px) translateX(-50%)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0) translateX(-50%)',
          },
        },
        'fade-out-up': {
          '0%': {
            opacity: '1',
            transform: 'translateY(0) translateX(-50%)',
          },
          '100%': {
            opacity: '0',
            transform: 'translateY(-10px) translateX(-50%)',
          },
        },
      },
      animation: {
        'fade-in-down': 'fade-in-down 0.3s ease-out',
        'fade-out-up': 'fade-out-up 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
