import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: false,
    proxy: {
      // Redirige peticiones /api/* al Worker local de wrangler (puerto 8787)
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
        secure: false,
        ws: false,
        configure: (proxy) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('[Vite Proxy] Error conectando con Worker local:', err.message);
          });
        },
      },
    },
  },
});
