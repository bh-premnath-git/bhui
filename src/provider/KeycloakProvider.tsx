import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { keycloak } from "@/services/keycloak";
import { httpClient } from "@/services/httpClient";

interface KeycloakContextProps {
  isAuthenticated: boolean;
  userData?: any;
  logout: () => void;
}

// Create the React context
const KeycloakContext = createContext<KeycloakContextProps>({
  isAuthenticated: false,
  userData: null,
  logout: () => {
    /* default no-op */
  },
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
      redirectUri: import.meta.env.VITE_KEYCLOAK_REDIRECT_URI + "login",
    });
  }, []);

  // (Optional) Start token refresh
  const startTokenRefresh = useCallback(() => {
    keycloak.onTokenExpired = () => {
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
  }, [logout]);

  useEffect(() => {
    (async () => {
      try {
        const authenticated = await keycloak.init({
          onLoad: "login-required",
          checkLoginIframe: true,
          pkceMethod: "S256",
        });
        if (authenticated) {
          setIsAuthenticated(true);
          const token = keycloak.token ?? "";
          sessionStorage.setItem("authenticated", "true");
          sessionStorage.setItem("token", JSON.stringify(token));
          httpClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          startTokenRefresh();
          const profile = await keycloak.loadUserProfile();
          setUserData(profile);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Failed to initialize Keycloak", error);
      }
    })();

    return () => {
      keycloak.clearToken();
    };
  }, [startTokenRefresh]);

  return (
    <KeycloakContext.Provider
      value={{
        isAuthenticated,
        userData,
        logout,
      }}
    >
      {children}
    </KeycloakContext.Provider>
  );
}
