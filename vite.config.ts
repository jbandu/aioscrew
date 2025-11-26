import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'socket-vendor': ['socket.io-client'],
          // Split large UI libraries
          'ui-vendor': ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 600, // Increase limit slightly since we're splitting chunks
  },
});
