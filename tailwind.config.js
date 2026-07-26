/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf2f4', 100: '#fbe7eb', 200: '#f8d0d8', 300: '#f2a9b8',
          400: '#e97893', 500: '#db4d70', 600: '#c73058', 700: '#a72249',
          800: '#8c1f41', 900: '#751d3c', 950: '#410b1c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
