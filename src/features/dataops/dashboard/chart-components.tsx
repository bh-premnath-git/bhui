import React, { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer } from "recharts"
import { ChevronDown, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export const ErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <div role="alert" className="flex flex-col items-center justify-center h-full p-4 bg-destructive/10 rounded-md text-destructive">
    <p className="font-medium mb-2">Something went wrong:</p>
    <pre className="text-xs p-2 bg-background/50 rounded border border-destructive/20 max-w-full overflow-auto">{error.message}</pre>
  </div>
)

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  defaultHeight?: number;
  onSaveHeight?: (height: number) => void;
}

// Create a custom event for communicating resize state to the dashboard
const emitResizeStateEvent = (isResizing: boolean) => {
  const event = new CustomEvent('chart-resize-state', {
    detail: { isResizing }
  });
  window.dispatchEvent(event);
};

export const ChartCard: React.FC<ChartCardProps> = ({ 
  title, 
  children, 
  className,
  defaultHeight = 280,
  onSaveHeight
}) => {
  // State for managing chart height
  const [height, setHeight] = useState(defaultHeight);
  const [width, setWidth] = useState('100%');
  const [isResizing, setIsResizing] = useState(false);
  
  // Refs for resize operation
  const startYRef = useRef<number>(0);
  const startXRef = useRef<number>(0);
  const startHeightRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Handle download button
  const handleDownload = () => {
    console.log(`Downloading ${title} data`);
    // Implement actual download logic here
  };
  
  // Reset to default height
  const resetHeight = () => {
    setHeight(defaultHeight);
    onSaveHeight?.(defaultHeight);
  };
  
  // Start resize operation
  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    startYRef.current = e.clientY;
    startXRef.current = e.clientX;
    startHeightRef.current = height;
    startWidthRef.current = cardRef.current?.offsetWidth || 0;
    
    setIsResizing(true);
    emitResizeStateEvent(true);
    document.body.classList.add('resizing');
  };
  
  // Handle resize events
  useEffect(() => {
    if (!isResizing) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      
      // Calculate both height and width changes
      const deltaY = e.clientY - startYRef.current;
      const deltaX = e.clientX - startXRef.current;
      
      // Set new dimensions within limits
      const newHeight = Math.max(180, Math.min(600, startHeightRef.current + deltaY));
      const newWidth = Math.max(300, Math.min(1200, startWidthRef.current + deltaX));
      
      setHeight(newHeight);
      setWidth(`${newWidth}px`);
    };
    
    const handleMouseUp = () => {
      // End resize operation
      setIsResizing(false);
      
      // Save height if callback provided
      onSaveHeight?.(height);
      
      // Emit event to re-enable drag-and-drop
      emitResizeStateEvent(false);
      
      // Remove global styles
      document.body.classList.remove('resizing');
    };
    
    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      // Clean up listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Make sure to re-enable drag if component unmounts while resizing
      if (isResizing) {
        emitResizeStateEvent(false);
        document.body.classList.remove('resizing');
      }
    };
  }, [isResizing, height, onSaveHeight]);
  
  return (
    <Card 
      ref={cardRef}
      className={cn(
        "col-span-1 transition-all duration-300 hover:shadow-md",
        "border-muted/70 bg-card/90",
        "backdrop-blur-sm",
        "relative",
        className
      )}
      style={{ width }}
    >
      {/* Card header with title and dropdown */}
      <CardHeader className="flex flex-row justify-center items-center p-3 pb-0">
        <CardTitle className="text-sm font-medium text-foreground/80 flex items-center">
          {title}
        </CardTitle>
        <div className="absolute right-2 flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-muted/80">
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={handleDownload} className="text-xs cursor-pointer">
                <Download className="h-3.5 w-3.5 mr-2" />
                Download Data
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={resetHeight} className="text-xs cursor-pointer">
                Reset Height
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      {/* Chart content */}
      <CardContent className="p-3 pt-3">
        <div 
          className="p-2 bg-card rounded-md border border-border/30"
          style={{ height: `${height}px` }}
        >
          <ResponsiveContainer 
            width="100%" 
            height="100%"
            aria-label={title}
          >
            {React.isValidElement(children) ? children : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                No data available
              </div>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
      
      {/* Resize handle - positioned at the bottom of the card */}
      <div 
        className={cn(
          "absolute bottom-1 right-1 w-6 h-6",
          "cursor-nwse-resize flex items-center justify-center",
          "hover:bg-primary/10 rounded-sm",
          isResizing ? "bg-primary/20" : "bg-transparent",
          "transition-colors duration-150",
          "z-10",
          "opacity-60 hover:opacity-100",
        )}
        onMouseDown={handleResizeStart}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <div className="w-3 h-3 border-r-2 border-b-2 border-muted-foreground/40" />
      </div>
    </Card>
  )
}

