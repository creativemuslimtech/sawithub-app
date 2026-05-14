/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: 'var(--color-primary)',
        primary: 'var(--color-primary)',
        dark: {
          bg: 'var(--color-bg)',
        },
      },
      fontFamily: { sans: 'var(--font-family), system-ui, sans-serif' },
    },
  },
  plugins: [],
}

