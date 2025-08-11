export const DECRYPTION_KEY = import.meta.env.VITE_DECRYPTION_KEY;
export const KEYCLOAK_REALM = import.meta.env.VITE_KEYCLOAK_REALM;
export const KEYCLOAK_CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID;
export const AUTO_SAVE_TIME = import.meta.env.VITE_AUTO_SAVE_TIME;
export const API_PREFIX_URL = import.meta.env.VITE_API_PREFIX_URL;

/**
 * Remote URLs
*/
export const KEYCLOAK_REDIRECT_URI = import.meta.env.VITE_KEYCLOAK_REDIRECT_REMOTE_URI
export const CATALOG_REMOTE_API_URL = import.meta.env.VITE_CATALOG_REMOTE_API_URL;
export const AGENT_REMOTE_URL = import.meta.env.VITE_AGENT_REMOTE_URL;
export const AUDIT_REMOTE_URL = import.meta.env.VITE_AUDIT_REMOTE_URL;
export const MONITOR_REMOTE_URL = import.meta.env.VITE_MONITOR_REMOTE_URL;
export const KEYCLOAK_API_REMOTE_URL = import.meta.env.VITE_KEYCLOAK_API_REMOTE_URL;
export const KEYCLOAK_REMOTE_URL = import.meta.env.VITE_KEYCLOAK_REMOTE_URL;
export const CATALOG_LIVE_API_URL = import.meta.env.VITE_CATALOG_LIVE_API_URL;
export const USE_SECURE = import.meta.env.VITE_USE_SECURE;
export const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT || 'production';

/**
 * Engine Ports
 */
export const SPARK_PORT = import.meta.env.VITE_SPARK_PORT || '15003';
export const PANDAS_PORT = import.meta.env.VITE_PANDAS_PORT || '15004';
export const FLINK_PORT = import.meta.env.VITE_FLINK_PORT || '15005';