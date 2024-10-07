import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorDisplayProps {
  message: string;
  className?: string;
}

export function ErrorDisplay({ message, className }: ErrorDisplayProps) {
  return (
    <div className={cn(
      "flex items-center justify-center p-6 rounded-lg bg-red-900/20 border border-red-500/50 backdrop-blur-sm",
      "animate-pulse shadow-lg shadow-red-500/20",
      className
    )}>
      <AlertCircle className="w-8 h-8 text-red-500 mr-4 animate-bounce" />
      <div className="text-red-100 font-semibold">
        <h3 className="text-lg mb-1">Error Detected</h3>
        <p className="text-sm opacity-80">{message}</p>
      </div>
    </div>
  );
}