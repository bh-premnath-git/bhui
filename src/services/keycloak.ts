import Keycloak, { KeycloakConfig } from 'keycloak-js';
import { KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID } from '@/config/platformenv';
import { ensureCryptoPolyfill } from './crypto-polyfill';

// Ensure crypto polyfill is applied before Keycloak is initialized
ensureCryptoPolyfill();

// Check for secure context
if (typeof window !== 'undefined' && window.isSecureContext === false) {
  console.warn('Running in insecure context. Keycloak may not work properly with HTTP.');
}

const initOptions: KeycloakConfig = {
  url: KEYCLOAK_URL,
  realm: KEYCLOAK_REALM,
  clientId: KEYCLOAK_CLIENT_ID,
};

// Create a singleton Keycloak instance
let keycloak: any = null;

try {
  keycloak = new Keycloak(initOptions);
} catch (error) {
  console.error('Failed to initialize Keycloak:', error);
  // Create a mock keycloak object for fallback
  keycloak = {
    init: () => Promise.resolve(false),
    login: () => {
      window.location.href = '/login-fallback';
      return Promise.resolve();
    },
    logout: () => {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('authenticated');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.resolve();
    },
    updateToken: () => Promise.resolve(false),
    token: null,
    idTokenParsed: null
  };
}

// Add error handling
const originalLogin = keycloak.login;
keycloak.login = function(...args) {
  try {
    return originalLogin.apply(this, args);
  } catch (error) {
    console.error('Keycloak login error:', error);
    // Handle gracefully - redirect to fallback login page
    window.location.href = '/login-fallback';
    return Promise.resolve();
  }
};

export { keycloak };