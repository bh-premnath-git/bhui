import React, { useState, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer } from "recharts"
import { ChevronDown, Download, GripVertical } from "lucide-react"
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
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export const ErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <div role="alert" className="flex flex-col items-center justify-center h-full p-4 bg-destructive/10 rounded-md text-destructive">
    <p className="font-medium mb-2">Something went wrong:</p>
    <pre className="text-xs p-2 bg-background/50 rounded border border-destructive/20 max-w-full overflow-auto">{error.message}</pre>
  </div>
)

interface SortableChartCardProps {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
  defaultHeight?: number;
  onSaveHeight?: (height: number) => void;
}

export const SortableChartCard: React.FC<SortableChartCardProps> = ({ 
  id,
  title, 
  children, 
  className,
  defaultHeight = 130,
  onSaveHeight
}) => {
  const [height, setHeight] = useState(defaultHeight);
  const [width, setWidth] = useState('350px'); // Default initial width
  const [isResizing, setIsResizing] = useState(false);
  
  // Refs for resize operation
  const startYRef = useRef<number>(0);
  const startXRef = useRef<number>(0);
  const startHeightRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // dnd-kit sortable hook
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id, disabled: isResizing });
  
  // Create debounced save function
  const debouncedSave = useCallback(
    debounce((newHeight: number, newWidth: string) => {
      onSaveHeight?.(newHeight);
      localStorage.setItem(`chart-${title}-dimensions`, JSON.stringify({
        height: newHeight,
        width: newWidth
      }));
    }, 250),
    [title, onSaveHeight]
  );

  // Load saved dimensions on mount and handle window resize
  React.useEffect(() => {
    const loadDimensions = () => {
      const savedDimensions = localStorage.getItem(`chart-${title}-dimensions`);
      if (savedDimensions) {
        const { height: savedHeight } = JSON.parse(savedDimensions);
        if (savedHeight) {
          // Make sure the saved height doesn't exceed current viewport constraints
          const maxHeight = window.innerHeight - 320;
          setHeight(Math.min(savedHeight, maxHeight));
        }
      }
    };

    // Load initial dimensions
    loadDimensions();

    // Update dimensions when window resizes
    const handleResize = () => {
      const maxHeight = window.innerHeight - 320;
      setHeight(currHeight => Math.min(currHeight, maxHeight));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [title]);
  
  // Handle download button
  const handleDownload = () => {
    console.log(`Downloading ${title} data`);
    // Implement actual download logic here
  };
  
  // Reset to default height with viewport constraints
  const resetDimensions = () => {
    // Apply viewport constraints to default height
    const maxHeight = window.innerHeight - 320;
    const constrainedDefaultHeight = Math.min(defaultHeight, maxHeight);
    
    setHeight(constrainedDefaultHeight);
    setWidth('100%'); // Always use 100% width to fit grid cells
    
    localStorage.setItem(`chart-${title}-dimensions`, JSON.stringify({
      height: constrainedDefaultHeight,
      width: '100%'
    }));
    
    onSaveHeight?.(constrainedDefaultHeight);
  };
  
  // Start resize operation
  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    startYRef.current = e.clientY;
    startXRef.current = e.clientX;
    startHeightRef.current = height;
    startWidthRef.current = parseFloat(width.replace('px', '')) || cardRef.current?.offsetWidth || 0;
    
    setIsResizing(true);
    document.body.classList.add('resizing');
  };
  
  // Update the resize handler to use debouncing
  React.useEffect(() => {
    if (!isResizing) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      
      const deltaY = e.clientY - startYRef.current;
      
      // Calculate viewport constraints
      const maxHeight = window.innerHeight - 320; // Account for headers, margins, etc.
      
      // Allow resizing within viewport constraints
      const newHeight = Math.min(
        maxHeight,
        Math.max(90, startHeightRef.current + deltaY)
      );
      
      setHeight(newHeight);
      
      // Use debounced save
      debouncedSave(newHeight, '100%');
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
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
        document.body.classList.remove('resizing');
      }
    };
  }, [isResizing, debouncedSave]);

  // Clean up debounced function on unmount
  React.useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  // Apply dnd-kit transforms
  const chartStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : isResizing ? 50 : 'auto',
    height: 'auto', // Allow height to be determined by content
    width: '100%', // Use full width of grid cell
  };
  
  return (
    <Card 
      ref={(node) => {
        cardRef.current = node;
        setNodeRef(node);
      }}
      className={cn(
        "col-span-1 transition-all duration-300 hover:shadow-md",
        "border-muted/70 bg-card/90",
        "backdrop-blur-sm",
        "relative h-full flex flex-col",  /* Make card fill grid cell and use flex column */
        isDragging && "dragging",
        isResizing && "resizing",
        className
      )}
      style={chartStyle}
    >
      {/* Card header with title and dropdown */}
      <CardHeader className="flex flex-row justify-center items-center p-0 pb-0">
        <div className="absolute left-2 cursor-grab active:cursor-grabbing" 
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground opacity-60 hover:opacity-100" />
        </div>
        
        <CardTitle className="text-xs font-medium text-foreground/80 flex items-center">
          {title}
        </CardTitle>
        <div className="absolute right-2 flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-muted/80">
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
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
      
      {/* Chart content */}
      <CardContent className="p-0 pt-0 flex-grow flex flex-col">
        <div 
          className="p-0 bg-card rounded-md border border-border/30 flex-grow flex flex-col"
          style={{ 
            height: `min(${height}px, calc(100vh - 320px))`, 
            minHeight: '100px',
            maxHeight: 'calc(100vh - 320px)' 
          }}
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
          "absolute bottom-0 right-0 w-4 h-4",
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
        title="Resize chart"
      >
        <div className="w-2 h-2 border-r-2 border-b-2 border-muted-foreground/40" />
      </div>
    </Card>
  )
}