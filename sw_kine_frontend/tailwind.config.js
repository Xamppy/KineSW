/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'wanderers-green': 'var(--wanderers-green)',
        'wanderers-white': 'var(--wanderers-white)',
        'wanderers-black': 'var(--wanderers-black)',
      },
    },
  },
  plugins: [],
} 