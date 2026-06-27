/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0F172A',       // Softer Slate 900 background
          card: '#1E293B',     // Softer Slate 800 card
          cardHover: '#334155',// Card hover
          border: '#334155',   // Slate border
          textPrimary: '#F8FAFC', // White text
          textSecondary: '#94A3B8', // Gray text
        },
        brand: {
          primary: '#3B82F6',   // Blue
          success: '#10B981',   // Emerald
          danger: '#EF4444',    // Red
          warning: '#F59E0B',   // Amber
          info: '#3B82F6',      // Blue
          purple: '#60A5FA'     // Light Blue
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
