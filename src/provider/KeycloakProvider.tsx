import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { keycloak } from "@/services/keycloak";
import { httpClient } from "@/services/httpClient";
import { KEYCLOAK_REDIRECT_URI } from "@/services/environment";

interface KeycloakContextProps {
  isAuthenticated: boolean;
  userData?: any;
  logout: () => void;
}

const KeycloakContext = createContext<KeycloakContextProps>({
  isAuthenticated: false,
  userData: null,
  logout: () => {},
});

export function useKeycloakAuth() {
  return useContext(KeycloakContext);
}

export function KeycloakProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const logout = useCallback(() => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("authenticated");
    keycloak.logout({
      redirectUri: KEYCLOAK_REDIRECT_URI as string + "login",
    });
  }, []);

  // Token Refresh Logic
  const startTokenRefresh = useCallback(() => {
    const refreshToken = () => {
      keycloak
        .updateToken(30)
        .then((refreshed) => {
          if (refreshed) {
            const newToken = keycloak.token ?? "";
            sessionStorage.setItem("token", JSON.stringify(newToken));
            httpClient.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
          } else {
            console.warn("Token is still valid, no refresh needed");
          }
        })
        .catch(() => {
          console.error("Failed to refresh token or session expired");
          logout();
        });
    };

    keycloak.onTokenExpired = refreshToken;

    return () => {
      keycloak.onTokenExpired = null;
    };
  }, [logout]);

  // Keycloak Initialization
  useEffect(() => {
    const initializeKeycloak = async () => {
      try {
        const authenticated = await keycloak.init({
          onLoad: "login-required",
          checkLoginIframe: true,
          pkceMethod: "S256",
        });

        setIsAuthenticated(authenticated);

        if (authenticated) {
          const token = keycloak.token ?? "";
          sessionStorage.setItem("authenticated", "true");
          sessionStorage.setItem("token", JSON.stringify(token));
          httpClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          const cleanup = startTokenRefresh();
          const profile = await keycloak.loadUserProfile();
          setUserData(profile);

          return cleanup;
        }
      } catch (error) {
        console.error("Failed to initialize Keycloak", error);
      }
    };

    const cleanup = initializeKeycloak();

    return () => {
      keycloak.clearToken();
      if (cleanup) cleanup.then(fn => fn());
    };
  }, [startTokenRefresh]);

  const keycloakContextValue = useMemo(
    () => ({ isAuthenticated, userData, logout }),
    [isAuthenticated, userData, logout]
  );

  return (
    <KeycloakContext.Provider value={keycloakContextValue}>
      {children}
    </KeycloakContext.Provider>
  );
}
