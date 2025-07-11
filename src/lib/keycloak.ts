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

// Helper function to get URL parameters
const getUrlParams = () => {
  if (!isBrowser) return { realm: undefined, clientId: undefined };
  
  // Extract from URL path - get the last part of the pathname
  const pathSegments = window.location.pathname.split('/').filter(segment => segment);
  const realmFromUrl = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : undefined;
  const clientIdFromUrl = realmFromUrl; // Use the same value for both realm and clientId
  
  // If URL path contains a realm, save it to sessionStorage for future use
  if (realmFromUrl) {
    sessionStorage.setItem('kc_realm_param', realmFromUrl);
    sessionStorage.setItem('kc_client_id_param', clientIdFromUrl || realmFromUrl);
  }
  
  // Use URL path value if available, otherwise try to get from sessionStorage
  const realm = realmFromUrl || sessionStorage.getItem('kc_realm_param');
  const clientId = clientIdFromUrl || sessionStorage.getItem('kc_client_id_param');
  
  return {
    realm,
    clientId
  };
};

// Initialize Keycloak only in browser environment with Web Crypto API
let keycloak: Keycloak;

if (isBrowser) {
  try {
    const urlParams = getUrlParams();
    
    const keycloakConfig: KeycloakConfig = {
      url: import.meta.env.VITE_KEYCLOAK_URL, 
      realm: urlParams.realm || import.meta.env.VITE_KEYCLOAK_REALM,
      clientId: urlParams.clientId || import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
    };

    keycloak = new Keycloak(keycloakConfig);
  } catch (error) {
    console.error('Error creating Keycloak instance:', error);
    keycloak = createKeycloakMock();
  }
} else {
  keycloak = createKeycloakMock();
}

export default keycloak;
