import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/context/SidebarContext';
import { Button } from '@/components/ui/button';

interface BottomDrawerProps {
  title?: string;
  children: React.ReactNode;
  height?: string; // Height when open (not maximized)
  className?: string;
  showMaximize?: boolean;
  onClose?: () => void; // Optional external close handler (e.g., Redux close)
}

export function BottomDrawer({ 
  title = '', 
  children, 
  height = 'h-full', // Default open height 
  className,
  showMaximize = true,
  onClose
}: BottomDrawerProps) {
  const { isBottomDrawerOpen, toggleBottomDrawer, updateBottomDrawerHeight, bottomDrawerHeight, isExpanded } = useSidebar(); 
  const [isMaximized, setIsMaximized] = React.useState(false);
  const [currentHeight, setCurrentHeight] = useState<number>(520); // Default height in pixels
  const drawerRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const startYRef = useRef<number>(0);
  const startHeightRef = useRef<number>(0);

  const toggleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    setIsMaximized(prev => !prev);
  };

  // Initialize height on mount
  useEffect(() => {
    if (drawerRef.current) {
      // Extract numeric height from the bottomDrawerHeight if it's in the format 'h-[520px]' or similar
      const heightMatch = bottomDrawerHeight.match(/h-\[(\d+)px\]/) || bottomDrawerHeight.match(/(\d+)px/);
      const initialHeight = heightMatch ? parseInt(heightMatch[1]) : 520; // Default to 520px if not specified
      setCurrentHeight(initialHeight);
    }
  }, [bottomDrawerHeight]);

  // Handle sidebar state changes and window resize
  useEffect(() => {
    const handleResize = () => {
      // Force re-render to ensure proper alignment
      if (drawerRef.current) {
        const container = document.getElementById('bottom-drawer-container');
        if (container) {
          // Trigger a layout recalculation
          container.style.width = '100%';
        }
      }
    };

    window.addEventListener('resize', handleResize);
    // Also trigger on sidebar state change
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isExpanded]);

  // Notify listeners after open/height change so canvases can refit
  useEffect(() => {
    const timer = setTimeout(() => {
      const height = drawerRef.current?.getBoundingClientRect().height ?? undefined;
      const evt = new CustomEvent('bottomDrawerResize', { bubbles: true, detail: { open: isBottomDrawerOpen, height } });
      document.dispatchEvent(evt);
      // Also dispatch a window resize so components recalc their size
      window.dispatchEvent(new Event('resize'));
    }, 350); // match transition duration
    return () => clearTimeout(timer);
  }, [isBottomDrawerOpen, isMaximized, currentHeight]);

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    
    // Get the current height from the drawer container
    const container = document.getElementById('bottom-drawer-container');
    if (container) {
      const containerHeight = container.getBoundingClientRect().height;
      startHeightRef.current = containerHeight;
      setCurrentHeight(containerHeight);
    } else {
      // Fallback to the current state if container not found
      startHeightRef.current = currentHeight;
    }
    
    // Add event listeners for resize
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', handleResizeEnd);
    
    // Change cursor during resize
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  };

  // Handle resize during mouse movement
  const handleResize = (e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    
    // For BottomDrawer, we want to increase height when dragging up (negative deltaY)
    // and decrease height when dragging down (positive deltaY)
    const deltaY = startYRef.current - e.clientY;
    
    // Calculate the new height based on the starting height and the mouse movement
    const newHeight = startHeightRef.current + deltaY;
    
    // Ensure the height stays within reasonable bounds (minimum 100px, maximum 80% of window height)
    const minHeight = 100;
    const maxHeight = window.innerHeight * 0.8;
    const clampedHeight = Math.min(Math.max(newHeight, minHeight), maxHeight);
    
    // Update the drawer container height
    const container = document.getElementById('bottom-drawer-container');
    if (container) {
      container.style.height = `${clampedHeight}px`;
      
      // Dispatch a custom event to notify other components that the BottomDrawer has been resized
      const resizeEvent = new CustomEvent('bottomDrawerResize', {
        bubbles: true,
        detail: { height: clampedHeight }
      });
      document.dispatchEvent(resizeEvent);
      
      // Also dispatch a resize event to ensure other components update
      window.dispatchEvent(new Event('resize'));
    }
    
    setCurrentHeight(clampedHeight);
    if (updateBottomDrawerHeight) {
      updateBottomDrawerHeight(`${clampedHeight}px`);
    }
  };

  // Handle resize end
  const handleResizeEnd = () => {
    isDraggingRef.current = false;
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', handleResizeEnd);
    
    // Reset cursor
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  // Clean up event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleResize);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, []);

  // Height class determines the drawer's size within the flex column
  const heightClass = isMaximized ? 'flex-1' : height;

  return (
    // Removed fixed positioning classes (fixed, bottom, left, right, z-index)
    <div 
      ref={drawerRef}
      className={cn(
        "bg-background/95 backdrop-blur-sm", // Keep background
        "border-t shadow-sm", // Keep border/shadow
        "overflow-hidden relative", // Prevent content spilling out before internal scroll, add relative for resize handle
        isExpanded ? "pl-[4%]" : "pl-[2%]", // Responsive padding based on sidebar state
        "w-full", // Ensure full width within parent container
        "transition-all duration-300", // Smooth transitions when sidebar state changes
        heightClass, // Apply dynamic height
        className // Allow additional classes (like flex-shrink-0 from parent)
      )}
    >
      {/* Resize handle */}
      <div
        ref={resizeHandleRef}
        className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize z-30 group flex items-center justify-center"
        onMouseDown={handleResizeStart}
        style={{ transform: 'translateY(-1px)' }}
      >
        {/* Center grip indicator */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="h-[2px] w-8 bg-green-500/50 rounded" />
          <div className="h-[2px] w-8 bg-green-500/50 rounded" />
          <div className="h-[2px] w-8 bg-green-500/50 rounded" />
        </div>
      </div>
      
      {/* Use flex layout internally as well */}
      <div className="flex flex-col h-full">
        {/* Header with title and controls */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-background/50 min-h-[40px]">
          <div className="flex items-center gap-2">
            {title && (
              <h3 className="text-sm font-medium text-foreground/90">{title}</h3>
            )}
          </div>
          <div className="flex items-center gap-1">
            {showMaximize && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMaximize}
                className="h-6 w-6 p-0 hover:bg-muted"
              >
                {isMaximized ? (
                  <Minimize2 className="h-3 w-3" />
                ) : (
                  <Maximize2 className="h-3 w-3" />
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // If an external close handler is provided (e.g., Redux close), call it
                if (onClose) {
                  onClose();
                } else {
                  // Fallback to context toggle if no external handler is provided
                  toggleBottomDrawer();
                }
              }}
              className="h-6 w-6 p-0 hover:bg-muted"
            >
              <ChevronDown className={cn(
                "h-3 w-3 transition-transform duration-200",
                isBottomDrawerOpen ? "rotate-180" : "rotate-0"
              )} />
            </Button>
          </div>
        </div>
        
        {/* Content area takes remaining space and scrolls */}
        <div className={cn(
          "flex-1 overflow-y-auto relative",
          // Hide content visually if not open, though parent controls rendering
          !isBottomDrawerOpen && "hidden" 
        )}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default BottomDrawer; 