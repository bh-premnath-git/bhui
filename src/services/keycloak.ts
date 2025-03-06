import Keycloak, { KeycloakConfig } from 'keycloak-js';
import { KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID } from '@/config/platformenv';
import { ensureCryptoPolyfill } from './crypto-polyfill';

// Ensure crypto polyfill is applied before Keycloak is initialized
ensureCryptoPolyfill();

// Check for secure context
if (typeof window !== 'undefined' && window.isSecureContext === false) {
  console.warn('Running in insecure context. Keycloak requires secure context (HTTPS) for full functionality.');
}

const initOptions: KeycloakConfig = {
  url: KEYCLOAK_URL,
  realm: KEYCLOAK_REALM,
  clientId: KEYCLOAK_CLIENT_ID,
};

// Create a singleton Keycloak instance
const keycloak = new Keycloak(initOptions);

export { keycloak };