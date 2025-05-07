import React, { useState, useRef, useEffect, useCallback } from "react"
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
import { debounce } from 'lodash'

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

export const ChartCard: React.FC<ChartCardProps> = React.memo(({ 
  title, 
  children, 
  className,
  defaultHeight = 280,
  onSaveHeight
}) => {
  const [dimensions, setDimensions] = useState<{ height: number; width: string }>({
    height: defaultHeight,
    width: '100%'
  });
  const [isResizing, setIsResizing] = useState(false);
  
  // Refs for resize operation
  const startYRef = useRef<number>(0);
  const startXRef = useRef<number>(0);
  const startHeightRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Create debounced save function
  const debouncedSave = useCallback(
    debounce((newHeight: number, newWidth: string) => {
      onSaveHeight?.(newHeight);
      // You could expand this to save width as well
      localStorage.setItem(`chart-${title}-dimensions`, JSON.stringify({
        height: newHeight,
        width: newWidth
      }));
    }, 250),
    [title, onSaveHeight]
  );

  // Load saved dimensions on mount
  useEffect(() => {
    const savedDimensions = localStorage.getItem(`chart-${title}-dimensions`);
    if (savedDimensions) {
      const { height: savedHeight, width: savedWidth } = JSON.parse(savedDimensions);
      setDimensions({
        height: savedHeight,
        width: savedWidth
      });
    }
  }, [title]);
  
  // Handle download button
  const handleDownload = () => {
    console.log(`Downloading ${title} data`);
    // Implement actual download logic here
  };
  
  // Reset to default height
  const resetDimensions = () => {
    setDimensions({
      height: defaultHeight,
      width: '100%'
    });
    localStorage.removeItem(`chart-${title}-dimensions`);
    onSaveHeight?.(defaultHeight);
  };
  
  // Start resize operation
  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    startYRef.current = e.clientY;
    startXRef.current = e.clientX;
    startHeightRef.current = dimensions.height;
    startWidthRef.current = cardRef.current?.offsetWidth || 0;
    
    setIsResizing(true);
    emitResizeStateEvent(true);
    document.body.classList.add('resizing');
  };
  
  // Update the resize handler to use debouncing
  useEffect(() => {
    if (!isResizing) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      
      const deltaY = e.clientY - startYRef.current;
      const deltaX = e.clientX - startXRef.current;
      
      // Increase minimum size and adjust maximum constraints
      const newHeight = Math.max(200, Math.min(800, startHeightRef.current + deltaY));
      const containerWidth = cardRef.current?.parentElement?.clientWidth || 1200;
      const newWidth = Math.max(350, Math.min(containerWidth, startWidthRef.current + deltaX));
      
      // Add transform scale during resize for visual feedback
      cardRef.current?.style.setProperty('transform', isResizing ? 'scale(1.002)' : 'scale(1)');
      cardRef.current?.style.setProperty('z-index', isResizing ? '50' : 'auto');
      
      setDimensions({
        height: newHeight,
        width: `${newWidth}px`
      });
      
      // Use debounced save
      debouncedSave(newHeight, newWidth.toString());
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      emitResizeStateEvent(false);
      document.body.classList.remove('resizing');
      
      // Final save on mouse up
      debouncedSave.flush();
    };
    
    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (isResizing) {
        emitResizeStateEvent(false);
        document.body.classList.remove('resizing');
      }
    };
  }, [isResizing, debouncedSave]);

  // Clean up debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);
  
  return (
    <Card 
      ref={cardRef}
      className={cn(
        "col-span-1 transition-all duration-300 hover:shadow-md",
        "border-muted/70 bg-card/90",
        "backdrop-blur-sm relative overflow-hidden",
        isResizing && "shadow-lg ring-1 ring-primary/20",
        className
      )}
      style={{ 
        width: dimensions.width,
        transition: isResizing ? 'none' : 'all 0.3s ease',
        willChange: isResizing ? 'transform, width, height' : 'auto'
      }}
    >
      {/* Reduce header padding */}
      <CardHeader className="flex flex-row justify-center items-center p-2">
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
              <DropdownMenuItem onClick={resetDimensions} className="text-xs cursor-pointer">
                Reset Dimensions
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      {/* Reduce content padding */}
      <CardContent className="p-2">
        <div 
          className={cn(
            "bg-card rounded-md border border-border/30",
            "overflow-hidden w-full"
          )}
          style={{ 
            height: `${dimensions.height}px`,
            minHeight: "180px",
          }}
        >
          <ResponsiveContainer 
            width="99%"
            height="100%"
            aria-label={title}
            aspect={undefined}
          >
            {React.isValidElement(children) ? (
              React.cloneElement(children as React.ReactElement, {
                width: "100%",
                height: "100%",
              })
            ) : (
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
})

