import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
  server: {
    host: "::",
    port: parseInt(env.VITE_KEYCLOAK_PORT || '5173'),
  },
  proxy: {
    '/superset': {
      target: env.VITE_API_DOMAIN + ':8088',
      changeOrigin: true,
      secure: false,
      rewrite: (path: string) => path.replace(/^\/superset/, '')
    },
  },
  optimizeDeps: {
    include: [
      'reactflow',
      'crypto-browserify',
      'buffer',
      'process'
    ],
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis'
      },
    },
  },
  plugins: [
    react(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Provide Node polyfills for crypto-browserify
      buffer: 'buffer',
      process: 'process',
      stream: 'stream-browserify',
      util: 'util',
      crypto: 'crypto-browserify',
    },
  },
  define: {
    // Polyfill for global Buffer & process
    global: 'globalThis',
    // Polyfill CommonJS exports for ESM compatibility
    exports: '{}',
    module: '{}',
    require: 'function(modulePath) { return window[modulePath] || {} }',
    'process.env': process.env,
    'process.browser': true,
    'process.version': '"v16.0.0"',
  },
  build: {
    rollupOptions: {
      // Add external dependencies to output bundle
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'keycloak-js'],
        },
      },
    },
  },
}});
