import Keycloak, { KeycloakConfig } from 'keycloak-js';

const initOptions: KeycloakConfig = {
  url: 'http://localhost:8080/',
  realm: 'bighammer-realm',
  clientId: 'bighammer-ui',
};

// Create a singleton Keycloak instance
const keycloak = new Keycloak(initOptions);

export default keycloak;