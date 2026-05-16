/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-tvk-blue', 'bg-tvk-green', 'bg-saffron',
    'text-tvk-blue', 'text-tvk-green', 'text-saffron',
    'border-tvk-blue/10', 'border-tvk-green/10', 'border-saffron/10',
    'bg-tvk-blue/5', 'bg-tvk-green/5', 'bg-saffron/5',
    'hover:border-saffron', 'hover:bg-saffron/5', 'ring-saffron/30', 'ring-offset-tvk-blue',
  ],
  theme: {
    extend: {
      colors: {
        // ── New design-system tokens (per outputs/03 + 04) ─────────────
        surface:   '#FFFFFF',
        'surface-2': '#F8FAFC',
        panel:     '#FFFFFF',
        hairline:  '#E5E7EB',
        'border-strong': '#D1D5DB',
        ink: {
          900: '#0B1220',
          700: '#1F2A37',
          500: '#5B6776',
          400: '#8794A3',
        },
        brand: {
          red:    '#C8102E',
          'red-dark': '#8B0000',
          yellow: '#F5B600',
        },
        status: {
          success: '#0F9D58',
          warning: '#D97706',
          danger:  '#DC2626',
          info:    '#1D4ED8',
        },
        // ── Legacy tokens kept for un-migrated pages (do not extend) ───
        navy: { DEFAULT: '#1a3a6b', dark: '#0d2347', mid: '#1e4a85', light: '#e8edf5' },
        saffron: { DEFAULT: '#f26522', light: '#fff3ec' },
        tvk: {
          red: '#C8102E',
          'red-dark': '#8B0000',
          'red-deep': '#5A0000',
          yellow: '#FFCC00',
          'yellow-bright': '#FFD60A',
          gold: '#FFD700',
          black: '#0A0A0A',
          cream: '#FFF8E7',
          green: '#138808',
          'green-bright': '#22C55E',
          'green-neon': '#00E676',
          blue: '#0057a8',
        },
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '20px',
      },
      boxShadow: {
        e1: '0 1px 2px rgba(15,23,42,.04), 0 1px 1px rgba(15,23,42,.06)',
        e2: '0 8px 24px -8px rgba(15,23,42,.12), 0 2px 6px rgba(15,23,42,.06)',
      },
      backgroundImage: {
        'tvk-gradient': 'linear-gradient(135deg, #8B0000 0%, #C8102E 50%, #5A0000 100%)',
        'tvk-radial': 'radial-gradient(ellipse at top, #C8102E 0%, #8B0000 50%, #0A0A0A 100%)',
        'tvk-flame': 'linear-gradient(180deg, #FFCC00 0%, #FF8C00 50%, #C8102E 100%)',
      },
      fontFamily: {
        sans: [
          'Inter',
          '"Noto Sans Tamil"',
          'Poppins',
          'Noto Sans',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
        ],
        display: [
          'Poppins',
          'Inter',
          '"Noto Sans Tamil"',
          'sans-serif',
        ],
        tamil: ['"Noto Sans Tamil"', 'Inter', 'sans-serif'],
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
    },
  },
  plugins: [],
}
