import Keycloak, { KeycloakConfig } from 'keycloak-js';
import { KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID } from '@/config/platformenv';
import { applyCryptoShim } from './crypto-polyfill';

// Ensure crypto shim is applied before Keycloak is initialized
applyCryptoShim();

// Check for secure context
if (typeof window !== 'undefined' && window.isSecureContext === false) {
  console.warn('Running in insecure context. Using crypto-browserify as a shim for the Web Crypto API.');
}

// Define standard config options
const baseConfig: KeycloakConfig = {
  url: KEYCLOAK_URL,
  realm: KEYCLOAK_REALM,
  clientId: KEYCLOAK_CLIENT_ID,
};

// Create a singleton Keycloak instance with additional runtime options
// Use type assertion (as any) to bypass TypeScript's strict checking
// These are valid Keycloak options but not included in the TypeScript definitions
const keycloak = new Keycloak({
  ...baseConfig,
  checkLoginIframe: false
} as any);

// Enable logging if in development environment
if (process.env.NODE_ENV !== 'production') {
  keycloak.onReady = (authenticated) => {
    console.log('Keycloak is ready, authenticated:', authenticated);
  };
  
  keycloak.onAuthSuccess = () => {
    console.log('Keycloak auth success');
  };
  
  keycloak.onAuthError = (error) => {
    console.error('Keycloak auth error:', error);
  };
}

export { keycloak };