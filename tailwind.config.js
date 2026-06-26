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
          bg: '#090D16',       // Ultra deep slate-dark background
          card: '#111827',     // Deep gray card background
          cardHover: '#1F2937',// Card hover
          border: '#1F2937',   // Slate border
          textPrimary: '#F9FAFB', // White text
          textSecondary: '#9CA3AF', // Gray text
        },
        brand: {
          primary: '#6366F1',   // Indigo
          success: '#10B981',   // Emerald
          danger: '#EF4444',    // Red
          warning: '#F59E0B',   // Amber
          info: '#3B82F6',      // Blue
          purple: '#8B5CF6'     // Violet
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
