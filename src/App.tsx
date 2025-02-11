import { useMemo } from "react";
import { Toaster, toast } from "sonner";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider, QueryCache } from "@tanstack/react-query";
import { Provider } from "react-redux";

import { store } from "@/store/store";
import { AppLayout } from "@/components/layout/AppLayout";
import { ThemeProvider } from "@/context/ThemeContext";

import { KeycloakProvider } from "@/provider";
import { ErrorBoundary } from "@/components/errorboundry";

const createQueryClient = () =>
  new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        const metaErrorMessage = query.meta?.errorMessage;
        const errorMessage =
          typeof metaErrorMessage === "string"
            ? metaErrorMessage
            : error instanceof Error
              ? error.message
              : String(error);
        toast.error(errorMessage);
      },
    }),
    defaultOptions: {
      queries: {
        retry: 1,
        retryDelay: 3000,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000,
      },
      mutations: {
        retry: 1,
      },
    },
  });

function App() {
  const queryClient = useMemo(createQueryClient, []);

  return (
    <ErrorBoundary>
      <KeycloakProvider>
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <ThemeProvider>
              <Router>
                <AppLayout />
                <Toaster position="top-right" richColors />
              </Router>
            </ThemeProvider>
          </Provider>
        </QueryClientProvider>
      </KeycloakProvider>
    </ErrorBoundary>
  );
}

export default App;
