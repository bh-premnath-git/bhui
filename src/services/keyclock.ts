import Keycloak, { KeycloakConfig } from 'keycloak-js';

const initOptions: KeycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
};

// Create a singleton Keycloak instance
const keycloak = new Keycloak(initOptions);

export {keycloak};