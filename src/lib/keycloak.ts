import Keycloak, { KeycloakConfig } from 'keycloak-js';

// More comprehensive check for browser environment that includes Web Crypto API
const isBrowser = typeof window !== 'undefined' && window.crypto && window.crypto.subtle;

// Create a complete mock for Keycloak to prevent errors
const createKeycloakMock = () => {
  return {
    init: async () => false,
    login: async () => {},
    logout: async () => {},
    updateToken: async () => false,
    token: undefined,
    refreshToken: undefined,
    onTokenExpired: undefined,
    authenticated: false
  } as unknown as Keycloak;
};

// Initialize Keycloak only in browser environment with Web Crypto API
let keycloak: Keycloak;

if (isBrowser) {
  try {
    const keycloakConfig: KeycloakConfig = {
      url: import.meta.env.VITE_KEYCLOAK_URL, 
      realm: import.meta.env.VITE_KEYCLOAK_REALM,
      clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
    };

    console.log('Keycloak configuration : >>', keycloakConfig);
    keycloak = new Keycloak(keycloakConfig);
  } catch (error) {
    console.error('Error creating Keycloak instance:', error);
    keycloak = createKeycloakMock();
  }
} else {
  console.log('Browser environment not fully supported (missing Web Crypto API), creating mock Keycloak');
  keycloak = createKeycloakMock();
}

export default keycloak;
