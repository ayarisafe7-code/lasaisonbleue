/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.js",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        arabic: ['Amiri', 'serif'], // Nouvelle police pour l'arabe
      },
      colors: {
        brand: {
          dark: '#0f172a', // Deep ocean blue fallback
        }
      },
      animation: {
        'ripple-1': 'ripple 3s linear infinite',
        'ripple-2': 'ripple 3s linear 1s infinite',
        'ripple-3': 'ripple 3s linear 2s infinite',
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
