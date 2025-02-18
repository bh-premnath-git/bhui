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
      'reactflow'
    ],
  },
  plugins: [
    react(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}});
