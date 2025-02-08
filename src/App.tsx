import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { AppLayout } from "./components/layout/AppLayout";
import { ThemeProvider } from "./context/ThemeContext";
import { QueryClient, QueryClientProvider, QueryCache } from "@tanstack/react-query";
import { Toaster, toast } from "sonner";
import { KeycloakProvider } from "@/provider/KeycloakProvider";

const queryClient = new QueryClient({
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
  return (
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
    
  );
}

export default App;
