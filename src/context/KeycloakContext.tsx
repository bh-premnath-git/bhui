import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { keycloak } from "@/services/keycloak";
import { KEYCLOAK_REDIRECT_URI } from "@/config/platformenv"
import { LoadingState } from "@/components/shared/LoadingState";

interface KeycloakContextProps {
  isAuthenticated: boolean;
  userData?: any;
  logout: () => void;
  isSecureContext: boolean;
}

const KeycloakContext = createContext<KeycloakContextProps>({
  isAuthenticated: false,
  userData: null,
  logout: () => { },
  isSecureContext: true
});

export function useKeycloakAuth() {
  return useContext(KeycloakContext);
}

export function KeycloakProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isSecureContext, setIsSecureContext] = useState(true);
  
  useEffect(() => {
    // Check if we're in a secure context
    if (typeof window !== 'undefined') {
      setIsSecureContext(window.isSecureContext !== false);
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("authenticated");
    sessionStorage.removeItem("user");
    
    // Try keycloak logout
    keycloak.logout({
      redirectUri: KEYCLOAK_REDIRECT_URI + "login",
    });
  }, []);

  const startTokenRefresh = useCallback(() => {
    const refreshToken = () => {
      try {
        keycloak
          .updateToken(30)
          .then((refreshed) => {
            if (refreshed) {
              const newToken = keycloak.token ?? "";
              sessionStorage.setItem("token", JSON.stringify(newToken));
            } else {
              console.warn("Token is still valid, no refresh needed");
            }
          })
          .catch(() => {
            console.error("Failed to refresh token or session expired");
            logout();
          });
      } catch (error) {
        console.error("Error in token refresh:", error);
      }
    };

    keycloak.onTokenExpired = refreshToken;
    return () => {
      // @ts-ignore
      keycloak.onTokenExpired = undefined;
    };
  }, [logout]);

  useEffect(() => {
    // Proceed with Keycloak auth
    try {
      keycloak
        .init({
          onLoad: "login-required",
          checkLoginIframe: false,
        })
        .then((auth) => {
          if (auth) {
            setIsAuthenticated(true);
            setUserData(keycloak.idTokenParsed);
            // Store token in sessionStorage for API calls
            const token = keycloak.token ?? "";
            sessionStorage.setItem("token", JSON.stringify(token));
            sessionStorage.setItem("authenticated", "true");
            startTokenRefresh();
          } else {
            console.warn("Not authenticated!");
            setIsAuthenticated(false);
          }
        })
        .catch((error) => {
          console.error("Keycloak initialization error:", error);
        });
    } catch (error) {
      console.error("Critical Keycloak error:", error);
    }
  }, [startTokenRefresh]);

  const contextValue = useMemo(
    () => ({
      isAuthenticated,
      userData,
      logout,
      isSecureContext
    }),
    [isAuthenticated, userData, logout, isSecureContext]
  );

  return (
    <KeycloakContext.Provider value={contextValue}>
      {isAuthenticated ? children : <LoadingState />}
    </KeycloakContext.Provider>
  );
}
