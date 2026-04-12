/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0B0F19', // very dark blue for background
          light: '#F3F4F6', // light grayish white for text fallback
          primary: '#4338CA', // Indigo primary
          secondary: '#38BDF8', // Sky blue accent
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
