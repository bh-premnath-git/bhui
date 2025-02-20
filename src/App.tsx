
import { Suspense } from "react";
import { ReactFlowProvider } from 'reactflow';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, useRoutes } from "react-router-dom";
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

function MainContent() {
  const { isExpanded } = useSidebar();
  const routes = useRoutes(routerConfig);

  return (
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
            {routes}
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
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
              <BrowserRouter>
                <ReactFlowProvider>
                  <SidebarProvider>
                    <div className="grid grid-cols-[auto,1fr] min-h-screen w-full">
                      <Sidebar />
                      <MainContent />
                    </div>
                  </SidebarProvider>
                </ReactFlowProvider>
              </BrowserRouter>
            </ThemeProvider>
            <Toaster position="top-right" />
          </TooltipProvider>
        </KeycloakProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  </Provider>
);

export default App;
