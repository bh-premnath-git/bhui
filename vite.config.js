/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      host: '0.0.0.0',
      port: env.VITE_KEYCLOAK_PORT,
    },
    proxy: {
      '/superset': {
        target: env.VITE_API_DOMAIN + ':8088',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/superset/, '')
      },
    },
    optimizeDeps: {
      include: [
        '@emotion/react',
        '@emotion/styled',
        '@mui/material/Tooltip',
        'react-flow-renderer',
        'reactflow',
        '@emotion/cache',
        '@emotion/utils',
        '@emotion/serialize'
      ],
    },
    plugins: [
      react({
        jsxImportSource: '@emotion/react',
        babel: {
          plugins: ['@emotion/babel-plugin'],
        },
      }),
      tsconfigPaths()
    ],
    resolve: {
      alias: {
        'date-fn': 'date-fn/esm',
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: [
        'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
      ],
      exclude: [
        'node_modules'
      ],
    }
  };
});