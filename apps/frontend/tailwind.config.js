/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Brand ──
        forest: {
          DEFAULT: '#1A3D2B',
          2:       '#14301F',
          3:       '#2D5A3D',
          soft:    '#E7EEE8',
          tint:    '#F1F6F1',
        },
        amber: {
          DEFAULT: '#D4A827',
          2:       '#B88E1F',
          3:       '#E8C25F',
          soft:    '#F7EED1',
          tint:    '#FCF7E4',
        },
        terracotta: {
          DEFAULT: '#B8542B',
          2:       '#973F19',
          soft:    '#F4DECF',
        },
        // ── Surfaces ──
        cream: {
          DEFAULT: '#F5F0E8',
          2:       '#ECE4D2',
        },
        paper: {
          DEFAULT: '#FBF8F1',
          2:       '#F8F3E6',
        },
        surface: '#FFFFFF',
        // ── Ink ──
        ink: {
          DEFAULT: '#1A1F1A',
          2:       '#2F3530',
          3:       '#5A615A',
          4:       '#8A8F86',
          5:       '#B2B5AC',
        },
        // ── Lines ──
        line: {
          DEFAULT: '#DBD3BF',
          2:       '#E8E0CB',
          soft:    '#EFE9D9',
        },
        // ── Categorical ──
        cat: {
          leaf:  '#2D5A3D',
          amber: '#D4A827',
          terra: '#B8542B',
          bark:  '#6B4F2C',
          sky:   '#4A7A8C',
          clay:  '#C77E5C',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', '"Iowan Old Style"', 'Georgia', 'serif'],
        sans:    ['"DM Sans"', '"Inter"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', '"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        'xs-1':  '6px',
        'sm-1':  '10px',
        'md-1':  '14px',
        'lg-1':  '20px',
        'xl-1':  '28px',
        '2xl-1': '36px',
      },
      boxShadow: {
        'sh-card':   '0 1px 0 rgba(74,56,22,.04), 0 1px 3px rgba(74,56,22,.04)',
        'sh-card-2': '0 2px 0 rgba(74,56,22,.03), 0 10px 28px -16px rgba(45,41,22,.14)',
        'sh-card-3': '0 6px 0 rgba(74,56,22,.02), 0 28px 60px -24px rgba(26,31,26,.22), 0 8px 24px -16px rgba(26,31,26,.10)',
        // legacy aliases
        card:    '0 1px 0 rgba(74,56,22,.04), 0 1px 3px rgba(74,56,22,.04)',
        'card-sm': '0 1px 0 rgba(74,56,22,.04), 0 1px 3px rgba(74,56,22,.04)',
        'card-lg': '0 6px 0 rgba(74,56,22,.02), 0 28px 60px -24px rgba(26,31,26,.22), 0 8px 24px -16px rgba(26,31,26,.10)',
      },
    },
  },
  plugins: [],
}
