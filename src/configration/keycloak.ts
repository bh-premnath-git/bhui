import Keycloak, { KeycloakConfig } from 'keycloak-js';
const keycloakUrl=import.meta.env.VITE_KEYCLOAK_URL
console.log(keycloakUrl)
const initOptions: KeycloakConfig = {
  //url: 'http://54.157.234.126:8080/',
  url: keycloakUrl,
  realm: 'bighammer-realm',
  clientId: 'bighammer-ui',
};

// Create a singleton Keycloak instance
const keycloak = new Keycloak(initOptions);

export default keycloak;