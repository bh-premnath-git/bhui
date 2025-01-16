import { useState, Suspense, useEffect, useRef } from 'react';
import { BrowserRouter, Route, Routes, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from 'react-redux';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { FlowProvider } from '@/contexts/FlowContext';
import { ToastContainer } from 'react-toastify';
import Loading from '@/pages/loadingPage';
import kc from './configration/keycloak';
import { httpClient } from './configration/HttpClient';
import store from './store/store';
import { ThemeProvider } from '@mui/material';
import { ThemeProvider as ThemesProvides } from "@/contexts/ThemeContext";
import { DashboardProvider } from "./contexts/DashboardContext";

import { routeList, theme } from '@/router/route';
import { ErrorBoundary } from "@/ErrorBoundry"
import 'react-toastify/dist/ReactToastify.css';

interface LayoutProps {
  isAuthenticated: boolean;
  logout: () => void;
}

const Layout = ({ isAuthenticated, logout }: LayoutProps) => {
  return (
    <div className="flex flex-col h-screen">
      <Header isAuthenticated={isAuthenticated} logout={logout} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto overflow-x-hidden	p-1 ml-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
};

function App() {
  const [_, setStep] = useState<any>();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const keycloakInitialized = useRef(false);

  useEffect(() => {
    const initializeKeycloak = async () => {
      if (keycloakInitialized.current) {
        return;
      }

      keycloakInitialized.current = true;

      try {
        const authenticated = await kc.init({
          onLoad: 'login-required',
          checkLoginIframe: true,
          pkceMethod: 'S256',
        });

        if (authenticated) {
          setIsAuthenticated(true);
          sessionStorage.setItem('authenticated', 'true');
          sessionStorage.setItem('token', JSON.stringify(kc.token));
          httpClient.defaults.headers.common['Authorization'] = `Bearer ${kc.token}`;
          startTokenRefresh();
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Failed to initialize Keycloak', error);
      }
    };

    initializeKeycloak();

    return () => {
      stopTokenRefresh();
    };
  }, []);

  const startTokenRefresh = () => {
    kc.onTokenExpired = () => {
      kc.updateToken(30)
        .then((refreshed) => {
          if (refreshed) {
            sessionStorage.setItem('token', JSON.stringify(kc.token));
            httpClient.defaults.headers.common['Authorization'] = `Bearer ${kc.token}`;
          } else {
            console.warn('Token is still valid, no refresh needed');
          }
        })
        .catch(() => {
          console.error('Failed to refresh the token, or the session has expired');
          logout();
        });
    };
  };
  const stopTokenRefresh = () => {
    kc.clearToken();
  };

  function logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('authenticated');
    kc.logout({
      redirectUri: import.meta.env.VITE_KEYCLOAK_REDIRECT_URI + 'login',
    });
  }

  const queryClient = new QueryClient();
  return (
    <ThemeProvider theme={theme}>
      <ThemesProvides>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <DashboardProvider>
              <FlowProvider>
                <Provider store={store}>
                  <BrowserRouter>
                    <Suspense fallback={<Loading />}>
                      <Routes>
                        <Route element={<Layout isAuthenticated={isAuthenticated} logout={logout} />} >
                          {routeList.map((route, index) => (
                            <Route key={`${index}-${route.path}`} path={route.path} element={route.element} />
                          ))}
                        </Route>
                      </Routes>
                    </Suspense>
                  </BrowserRouter>
                </Provider>
              </FlowProvider>
              <ToastContainer />
            </DashboardProvider>
          </QueryClientProvider>
        </ErrorBoundary>
      </ThemesProvides>
    </ThemeProvider>
  );
}

export default App;
