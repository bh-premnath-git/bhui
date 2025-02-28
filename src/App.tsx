import { Suspense, useEffect } from "react";
import { ReactFlowProvider } from 'reactflow';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from './store';
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useSidebar } from "@/context/SidebarContext";
import { routerConfig } from "@/config/router-config";
import { ErrorBoundary } from "react-error-boundary";
import { Button } from "./components/ui/button";
import { LazyLoading } from "./components/shared/LazyLoading";
import { KeycloakProvider } from "./context/KeycloakContext";
import 'reactflow/dist/style.css';
import { useAppDispatch } from "@/hooks/useRedux";
import { fetchGithubProviders, fetchDataSourceTypes } from "./store/slices/globalGitSlice";
import { FlowProvider } from "./context/designers/FlowContext";

const queryClient = new QueryClient();

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-destructive">Something went wrong!</h2>
        <pre className="text-sm p-4 bg-muted rounded-md overflow-auto max-w-2xl">
          {error.message}
          {'\n\n'}
          {error.stack}
        </pre>
        <Button onClick={resetErrorBoundary}>Try again</Button>
      </div>
    </div>
  );
}

function RootLayout() {
  const { isExpanded } = useSidebar();

  return (
    <div className="grid grid-cols-[auto,1fr] min-h-screen w-full">
      <Sidebar />
      <div className={`col-start-2 col-span-1 transition-all duration-300 ${isExpanded ? "ml-64" : "ml-20"}`}>
        <Header />
        <main className="pt-16">
          <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={() => {
              console.log('Error boundary reset');
            }}
            onError={(error) => {
              console.error('Error caught by boundary:', error);
            }}
          >
            <Suspense fallback={<LazyLoading />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ReactFlowProvider>
        <FlowProvider>
          <SidebarProvider>
            <RootLayout />
          </SidebarProvider>
        </FlowProvider>
      </ReactFlowProvider>
    ),
    children: routerConfig
  }
]);

function AppInitializer() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchGithubProviders());
    dispatch(fetchDataSourceTypes());
  }, [dispatch]);

  return null;
}

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => {
          console.log('Root error boundary reset');
        }}
        onError={(error) => {
          console.error('Error caught by root boundary:', error);
        }}
      >
        <KeycloakProvider>
          <TooltipProvider>
            <ThemeProvider>
              <AppInitializer />
              <RouterProvider router={router} />
              <Toaster position="top-right" />
            </ThemeProvider>
          </TooltipProvider>
        </KeycloakProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  </Provider>
);

export default App;
