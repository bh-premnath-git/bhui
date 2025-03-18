import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactFlowProvider } from 'reactflow';
import { BrowserRouter } from "react-router-dom";
import { KeycloakProvider, useKeycloak } from "./hooks/useKeycloak";
import { ErrorBoundary } from "react-error-boundary";
import { AppRoutes } from "./routes";
import { ErrorFallback } from "@/components/withPageErrorBoundary"
import { Provider } from "react-redux";
import { store } from "@/store";
import { useAppDispatch } from "./hooks/useRedux";
import { useEffect } from "react";
import { fetchGithubProviders, fetchDataSourceTypes } from "./store/slices/globalGitSlice";
import { FlowProvider } from "./context/designers/FlowContext";
import { PipelineProvider } from "./context/designers/DataPipelineContext";


const queryClient = new QueryClient();

// Separate component to use Redux after Provider is initialized
const AppContent = () => {
  const dispatch = useAppDispatch();
  const { authenticated } = useKeycloak();

  useEffect(() => {
    if (authenticated) {
      dispatch(fetchGithubProviders());
      dispatch(fetchDataSourceTypes());
    }
  }, [dispatch, authenticated]);

  return (
    <ReactFlowProvider>
      <FlowProvider>
        <PipelineProvider>
          <AppRoutes />
        </PipelineProvider>
      </FlowProvider>
    </ReactFlowProvider>
  );
};

const App = () => {
  return (
    <BrowserRouter>

      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <KeycloakProvider>
          <Provider store={store}>
            <QueryClientProvider client={queryClient}>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <AppContent />
              </TooltipProvider>
            </QueryClientProvider>
          </Provider>
        </KeycloakProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
};

export default App;
