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
          bg: '#000000',       // Pure Black
          card: '#09090B',     // Zinc 950
          cardHover: '#18181B',// Zinc 900
          border: '#27272A',   // Zinc 800
          textPrimary: '#FAFAFA', // Zinc 50
          textSecondary: '#A1A1AA', // Zinc 400
        },
        brand: {
          primary: '#3B82F6',   // Vivid Blue
          success: '#22C55E',   // Vivid Green
          danger: '#EF4444',    // Vivid Red
          warning: '#EAB308',   // Yellow
          info: '#3B82F6',      
          purple: '#8B5CF6'     

        }
      },
      fontFamily: {
        sans: ['Inter', 'Geist', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        'premium': 'none',
        'premium-hover': '0 4px 12px rgba(0, 0, 0, 0.5)'
      },
      transitionTimingFunction: {
        'organic': 'cubic-bezier(0.22, 1, 0.36, 1)',
      }
    },
  },
  plugins: [],
}
