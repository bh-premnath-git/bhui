import Keycloak, { KeycloakInstance } from 'keycloak-js';
import { keycloakAdminConfig } from './keycloak';

const keycloak: KeycloakInstance = new Keycloak(keycloakAdminConfig);

export const initKeycloak = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        keycloak.init({ onLoad: 'login-required' })
            .then(authenticated => {
                if (authenticated) {
                    resolve();
                } else {
                    keycloak.login();
                }
            })
            .catch(error => {
                console.error("Keycloak initialization failed:", error);
                reject(error);
            });
    });
};

export default keycloak;
