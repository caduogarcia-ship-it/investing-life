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
          bg: '#0B1426',       // Deep Navy
          card: '#141E30',     // Premium Card Dark
          cardHover: '#1E293B',// Card hover
          border: '#1E293B',   // Subtle border
          textPrimary: '#F8FAFC', // White text
          textSecondary: '#94A3B8', // Gray text
        },
        brand: {
          primary: '#6366F1',   // Indigo
          success: '#10B981',   // Emerald
          danger: '#EF4444',    // Red
          warning: '#F59E0B',   // Amber
          info: '#6366F1',      // Indigo
          purple: '#8B5CF6'     // Violet
        }
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 1px 2px rgba(10, 20, 40, 0.3), 0 4px 12px rgba(99, 102, 241, 0.08), 0 12px 40px rgba(10, 20, 40, 0.25)',
        'premium-hover': '0 1px 2px rgba(10, 20, 40, 0.3), 0 8px 24px rgba(99, 102, 241, 0.12), 0 16px 48px rgba(10, 20, 40, 0.3)'
      },
      transitionTimingFunction: {
        'organic': 'cubic-bezier(0.22, 1, 0.36, 1)',
      }
    },
  },
  plugins: [],
}
