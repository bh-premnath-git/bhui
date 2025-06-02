import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const keycloakPort = parseInt(env.VITE_KEYCLOAK_PORT, 10) || 5000; // Always use 5000 if undefined
  const catalogRemoteApiUrl = env.VITE_CATALOG_REMOTE_API_URL;
  let httpsConfig = {};
  try {
    httpsConfig = {/* 
      key: fs.readFileSync(path.resolve(__dirname, 'key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'cert.pem')), */
    };
  } catch (error) {
    console.warn('SSL files not found. Running HTTP only.');
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0', // Support both IPv4 & IPv6
      port: keycloakPort,
      strictPort: true,
      https: Object.keys(httpsConfig).length ? httpsConfig : false, // Enable HTTPS only if SSL files exist
    /*   headers: {
        'Content-Security-Policy': "frame-ancestors 'self' https://54.82.150.27:8443/; default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';"
      } */
      allowedHosts: ['ui.nprd.bighammer.ai', 'localhost'],
      proxy: {
        '/api/v1/': {
          target: catalogRemoteApiUrl,
          changeOrigin: true,
        }
      }
    },
  };
});
