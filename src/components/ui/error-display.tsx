import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorDisplayProps {
  message: string;
  className?: string;
  showRefresh?: boolean;
}

export function ErrorDisplay({ 
  message, 
  className,
  showRefresh = true 
}: ErrorDisplayProps) {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Alert 
      variant="destructive" 
      className={cn(
        "max-w-lg mx-auto backdrop-blur-sm",
        "border-red-500/50 bg-red-950/10",
        "animate-in fade-in duration-300",
        className
      )}
    >
      <AlertCircle className="h-5 w-5" />
      <AlertTitle className="text-red-500 flex items-center justify-between font-semibold">
        Error Detected
        {showRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="text-red-500 hover:text-red-400 hover:bg-red-950/20"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh Page
          </Button>
        )}
      </AlertTitle>
      <AlertDescription className="mt-2 text-red-600 font-medium">
        {message}
      </AlertDescription>
    </Alert>
  );
}

export default ErrorDisplay;