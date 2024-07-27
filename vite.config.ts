import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    host: '0.0.0.0', // Listen on all available network interfaces
    port: 5000, // Change the port to 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/superset': {
        target: 'http://localhost:8088',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/superset/, '')
      },
    }
  },
  optimizeDeps: {
    include: [
      '@emotion/react', 
      '@emotion/styled', 
      '@mui/material/Tooltip'
    ],
  },
  plugins: [
    react({
      jsxImportSource: '@emotion/react', // Use @emotion/react for JSX transformation
      babel: {
        plugins: ['@emotion/babel-plugin'], // Use @emotion/babel-plugin for Babel transformations
      },
    }),
  ],
  resolve: {
    alias: {
      'date-fns': 'date-fns/esm',
    },
  },
});
