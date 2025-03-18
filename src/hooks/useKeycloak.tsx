import { useState, useEffect, createContext, useContext, useCallback, ReactNode } from 'react';
import keycloak from '@/lib/keycloak';
import { toast } from 'sonner';

// Define the context type
type KeycloakContextType = {
  initialized: boolean;
  authenticated: boolean;
  keycloak: typeof keycloak;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  token: string | undefined;
  refreshToken: string | undefined;
};

// Create a context to share Keycloak state
const KeycloakContext = createContext<KeycloakContextType | undefined>(undefined);

// More comprehensive check for browser environment that includes Web Crypto API
const isBrowser = typeof window !== 'undefined' && window.crypto && window.crypto.subtle;

// Provider component to wrap around the app
export const KeycloakProvider = ({ children }: { children: ReactNode }) => {
  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [refreshToken, setRefreshToken] = useState<string | undefined>(undefined);

  // Get redirect URI from environment variable
  const redirectUri = isBrowser 
    ? (import.meta.env.VITE_KEYCLOAK_REDIRECT_URI || window.location.origin)
    : '';
    
  if (isBrowser) {
    console.log('Using redirect URI:', redirectUri);
  }

  // Initialize Keycloak only in browser environment
  useEffect(() => {
    // Skip initialization if not in browser with Web Crypto API
    if (!isBrowser) {
      console.log('Skipping Keycloak initialization: Web Crypto API not available');
      return;
    }
    
    let mounted = true;
    
    const initKeycloak = async () => {
      try {
        if (!mounted) return;
        
        console.log('Initializing Keycloak with redirectUri:', redirectUri);
        
        const authenticated = await keycloak.init({
          onLoad: 'check-sso',
          silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
          pkceMethod: 'S256',
          redirectUri,
          checkLoginIframe: false
        });

        if (!mounted) return;

        console.log('Keycloak initialized, authenticated:', authenticated);
        setInitialized(true);
        setAuthenticated(authenticated);
        
        if (authenticated) {
          console.log('User is authenticated, token available:', !!keycloak.token);
          setToken(keycloak.token);
          setRefreshToken(keycloak.refreshToken);
          
          // Save token to sessionStorage
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('kc_token', keycloak.token || '');
            sessionStorage.setItem('kc_refreshToken', keycloak.refreshToken || '');
          }
          
          // Redirect to dashboard if we're on the home page
          if (window.location.pathname === '/') {
            window.location.href = '/dataops-hub';
          }
          
          // Set up token refresh
          keycloak.onTokenExpired = () => {
            console.log('Token expired, refreshing...');
            keycloak.updateToken(30).then((refreshed) => {
              if (refreshed) {
                console.log('Token refreshed');
                setToken(keycloak.token);
                setRefreshToken(keycloak.refreshToken);
                if (typeof sessionStorage !== 'undefined') {
                  sessionStorage.setItem('kc_token', keycloak.token || '');
                  sessionStorage.setItem('kc_refreshToken', keycloak.refreshToken || '');
                }
              }
            }).catch((error) => {
              console.error('Failed to refresh token:', error);
              // Force re-login
              logout();
            });
          };
        }
      } catch (error) {
        if (!mounted) return;
        
        console.error('Keycloak initialization error:', error);
        // Show a more user-friendly error
        toast.error('Authentication service initialization failed. Please try again later.');
      }
    };

    initKeycloak();

    return () => {
      mounted = false;
      if (keycloak.onTokenExpired) {
        keycloak.onTokenExpired = undefined;
      }
    };
  }, [redirectUri]);

  // Login function
  const login = useCallback(async () => {
    // Verify browser environment with Web Crypto API before attempting login
    if (!isBrowser) {
      console.error('Login error: Web Crypto API is not available');
      toast.error('Login not available in this environment');
      return;
    }
    
    try {
      await keycloak.login({
        redirectUri: window.location.origin + '/dataops-hub',
      });
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    // Verify browser environment with Web Crypto API before attempting logout
    if (!isBrowser) {
      console.error('Logout error: Web Crypto API is not available');
      toast.error('Logout not available in this environment');
      return;
    }
    
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('kc_token');
        sessionStorage.removeItem('kc_refreshToken');
      }
      setToken(undefined);
      setRefreshToken(undefined);
      setAuthenticated(false);
      await keycloak.logout({
        redirectUri,
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed. Please try again.');
    }
  }, [redirectUri]);

  return (
    <KeycloakContext.Provider value={{
      initialized,
      authenticated,
      keycloak,
      login,
      logout,
      token,
      refreshToken
    }}>
      {children}
    </KeycloakContext.Provider>
  );
};

// Hook to use the Keycloak context
export const useKeycloak = () => {
  const context = useContext(KeycloakContext);
  if (context === undefined) {
    throw new Error('useKeycloak must be used within a KeycloakProvider');
  }
  return context;
};
