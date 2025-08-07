
import { useKeycloak } from "./useKeycloak";

// Type for authentication-related utilities
type AuthUtils = {
  isAuthenticated: boolean;
  isInitialized: boolean;
  token: string | undefined;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAuthHeaders: () => { Authorization: string } | {};
  getUserInfo: () => any | null;
};

/**
 * Hook that provides authentication utilities
 */
export function useAuth(): AuthUtils {
  const { initialized, authenticated, token, login, logout, keycloak } = useKeycloak();
  // Get auth headers for API calls
  const getAuthHeaders = () => {
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  };

  // Get basic user info
  const getUserInfo = () => {
    if (authenticated && keycloak.tokenParsed) {
      return {
        username: keycloak.tokenParsed.preferred_username,
        email: keycloak.tokenParsed.email,
        name: keycloak.tokenParsed.name,
        roles: keycloak.tokenParsed.bh_roles?.roles || [],
        resources: keycloak.tokenParsed.bh_resources?.resources || [],
      };
    }
    return null;
  };

  return {
    isAuthenticated: authenticated,
    isInitialized: initialized,
    token,
    login,
    logout,
    getAuthHeaders,
    getUserInfo,
  };
}
