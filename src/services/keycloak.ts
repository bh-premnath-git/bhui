import Keycloak, { KeycloakConfig } from 'keycloak-js';
import { KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID } from './environment';

const initOptions: KeycloakConfig = {
  url: KEYCLOAK_URL,
  realm: KEYCLOAK_REALM ,
  clientId: KEYCLOAK_CLIENT_ID,
};

// Create a singleton Keycloak instance
const keycloak = new Keycloak(initOptions);

export {keycloak};