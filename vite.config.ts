import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';
import fs from 'fs';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = env.VITE_ENV === 'development';
  const keycloakPort = parseInt(env.VITE_KEYCLOAK_PORT, 10) || 5000;
  const catalogRemoteApiUrl = env.VITE_CATALOG_REMOTE_API_URL;
  const allowedHosts = (env.VITE_ALLOWED_HOSTS || '')
    .split(',')
    .map(h => h.trim())
    .filter(Boolean);

  // Properly type the https configuration
  let https: { key: Buffer; cert: Buffer } | undefined = undefined;  
  if (!isDev) {
    try {
      https = {
        key: fs.readFileSync(path.resolve(__dirname, 'key.pem')),
        cert: fs.readFileSync(path.resolve(__dirname, 'cert.pem')),
      };
    } catch {
      console.warn('SSL files not found → falling back to HTTP.');
      https = undefined;
    }
  }

  return {
    plugins: [
      react(),
      nodePolyfills({
        // allow things like `import node:stream`
        protocolImports: true,
        // expose common Node globals
        globals: {
          Buffer: true,
          process: true,
          global: true,
        },
      }),
    ],
    resolve: {
      alias: [
        {
          find: '@',
          replacement: path.resolve(__dirname, './src'),
        },
        // map "buffer/" (with trailing slash) to the package
        { find: /^buffer\/$/, replacement: 'buffer' },
        // stream & buddies used by `probe-image-size`
        { find: 'stream', replacement: 'stream-browserify' },
        { find: 'util', replacement: 'util' },
        { find: 'events', replacement: 'events' },
        { find: 'string_decoder', replacement: 'string_decoder' },
      ],
    },
    define: {
      // some libs still read this
      'process.env': {},
    },
    optimizeDeps: {
      include: [
        'buffer',
        'process',
        'stream-browserify',
        'util',
        'events',
        'string_decoder',
      ],
    },
    server: {
      host: '0.0.0.0',
      port: keycloakPort,
      strictPort: true,
      https,
      allowedHosts,
      proxy: {
        '/api/v1/': {
          target: catalogRemoteApiUrl,
          changeOrigin: true,
        },
      },
    },
  };
});