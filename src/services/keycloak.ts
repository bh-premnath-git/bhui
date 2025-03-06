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
const keycloak = new Keycloak(initOptions);

// Add error handling
const originalLogin = keycloak.login;
keycloak.login = function(...args) {
  try {
    return originalLogin.apply(this, args);
  } catch (error) {
    console.error('Keycloak login error:', error);
    // Handle gracefully - maybe redirect to a fallback login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login-fallback';
    }
    throw error;
  }
};

export { keycloak };