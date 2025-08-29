
import { ErrorBoundary } from "react-error-boundary";
import { Button } from "@/components/ui/button";

export function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold text-destructive">Page Error</h2>
        <pre className="text-sm p-4 bg-muted rounded-md overflow-auto max-w-2xl">
          {error.message}
          {'\n\n'}
          {error.stack}
        </pre>
        <Button onClick={resetErrorBoundary}>Retry</Button>
      </div>
    </div>
  );
}

export function withPageErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  pageName: string
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => {
          console.log(`${pageName} error boundary reset`);
        }}
        onError={(error) => {
          console.error(`Error in ${pageName}:`, error);
        }}
      >
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}
