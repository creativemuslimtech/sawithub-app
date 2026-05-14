/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0d1f17',
          2: '#1a2b22',
          3: '#4a5b53',
          4: '#7b8a83',
        },
        paper: {
          DEFAULT: '#faf6ec',
          2: '#f4eedf',
        },
        surface: '#ffffff',
        line: {
          DEFAULT: '#e7e2d4',
          2: '#efeadd',
        },
        emerald: {
          DEFAULT: '#0a7847',
          2: '#0f5e3a',
          3: '#1a9959',
          soft: '#e6f3eb',
          tint: '#f1f8f3',
        },
        terra: {
          DEFAULT: '#d96a2c',
          2: '#b84e1a',
          soft: '#fbe9dc',
        },
        cat: {
          1: '#0a7847',
          2: '#d96a2c',
          3: '#d4a017',
          4: '#1c8e8a',
          5: '#7d3a6b',
          6: '#5e8a52',
        },
      },
      fontFamily: {
        sans:    ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque"', '"Plus Jakarta Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        'sm-1': '10px',
        'md-1': '14px',
        'lg-1': '20px',
        'xl-1': '28px',
      },
      boxShadow: {
        card:    '0 4px 14px -6px rgba(13,31,23,.08), 0 1px 0 rgba(13,31,23,.04)',
        'card-sm': '0 1px 0 rgba(13,31,23,.04), 0 1px 2px rgba(13,31,23,.04)',
        'card-lg': '0 24px 48px -24px rgba(13,31,23,.18), 0 8px 24px -16px rgba(13,31,23,.08)',
      },
    },
  },
  plugins: [],
}
