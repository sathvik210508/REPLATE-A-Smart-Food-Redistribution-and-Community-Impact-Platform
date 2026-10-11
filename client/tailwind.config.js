/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        replate: {
          bg: '#FFFFFF',
          muted: '#F7F9F8',
          primary: '#16845B',
          dark: '#116747',
          light: '#EAF6EF',
          text: '#202923',
          subtext: '#6B756F',
          border: '#E5EAE6',
          orange: '#F2A44A',
          error: '#DC2626',
          errorBg: '#FEF2F2',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'card': '12px',
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card': '0 4px 12px 0 rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
