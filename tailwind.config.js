/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        
        // Exact tokens from DESIGN_GUIDELINES.md
        brand: {
          deep: '#09264A',        // Azul profundo ceremonial
          primary: '#124B87',     // Azul institucional
          interactive: '#1769B3', // Azul interactivo
          gold: '#D6AD60',        // Dorado ceremonial
          light: '#F6F8FC',       // Fondo claro
          card: '#FFFFFF',        // Blanco puro
          text: '#172B45',        // Texto principal
          muted: '#66768A',       // Texto secundario
          border: '#E2E8F0',      // Bordes
          success: '#15803D',     // Verde confirmación
        },
        
        campus: {
          lim: '#1769B3',         // Lima (Azul)
          jul: '#059669',         // Juliaca (Verde)
          tpp: '#D97706',         // Tarapoto (Ámbar)
        },
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        card: '0 4px 6px -1px rgba(9, 38, 74, 0.06), 0 2px 4px -1px rgba(9, 38, 74, 0.04)',
        ceremonial: '0 10px 25px -5px rgba(9, 38, 74, 0.4), 0 8px 10px -6px rgba(214, 173, 96, 0.15)',
        gold: '0 0 25px rgba(214, 173, 96, 0.35)',
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
    },
  },
  plugins: [],
}
