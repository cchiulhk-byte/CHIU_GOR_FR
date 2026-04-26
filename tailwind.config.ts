/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
      screens: {
        xs: '400px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      extend: {
        colors: {
          coral: {
            DEFAULT: '#FF6B6B',
            dark: '#E85555',
          },
          teal: {
            DEFAULT: '#4ECDC4',
          },
          mustard: {
            DEFAULT: '#FFE66D',
          },
          // Dark mode palette — dark lavender / Leica-ish
          ink: {
            950: '#0A0514',
            900: '#0E0818',
            800: '#130A22',
            700: '#1E0D38',
            600: '#2D1B4E',
            500: '#3B2060',
          },
          // Light mode palette — Leica ivory/warm neutral
          cream: {
            50:  '#F7F4EF',   // warm ivory base
            100: '#F0EBE3',   // slightly deeper ivory
            200: '#E8DFD4',   // warm sand
            peach: '#F5EFE8', // soft warm peach
            mint:  '#EFF5F4', // cool mint tint
            sand:  '#EDE6DC', // warm sand
          },
          // Leica light mode text
          leica: {
            black: '#1A1410',  // near-black warm charcoal
            gray:  '#4A4440',  // warm mid-gray
            muted: '#7A7068',  // muted warm gray
            rule:  '#D4C8BC',  // hairline rule color
          },
        },
        keyframes: {
          'fade-in-up': {
            '0%': { opacity: '0', transform: 'translateY(24px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
          },
          shimmer: {
            '0%': { transform: 'translateX(-100%)' },
            '100%': { transform: 'translateX(100%)' },
          },
        },
        animation: {
          'fade-in-up': 'fade-in-up 0.6s ease-out both',
          shimmer: 'shimmer 1.2s ease-in-out infinite',
        },
      },
    },
    plugins: [],
  }