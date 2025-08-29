import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/context/SidebarContext';
import { Button } from '@/components/ui/button';
import aiIcon from '/assets/ai/ai.svg';
import { BottomDrawer } from '@/components/BottomDrawer';

interface RightAsideProps {
  title?: string;
  children: React.ReactNode;
  width?: string;
  className?: string;
}

export function RightAside({
  title = 'Details',
  children,
  width = 'w-[25%]',
  className
}: RightAsideProps) {
  const { 
    closeRightAside, 
    updateRightAsideWidth,
    isBottomDrawerOpen,
    bottomDrawerContent,
    bottomDrawerTitle
  } = useSidebar();
  const [currentWidth, setCurrentWidth] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const asideRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  // Initialize width on mount
  useEffect(() => {
    if (asideRef.current) {
      // Extract numeric width from the width prop if it's in the format 'w-[25%]' or similar
      const widthMatch = width.match(/w-\[(\d+)%\]/);
      const initialWidth = widthMatch ? parseInt(widthMatch[1]) : 25; // Default to 25% if not specified
      setCurrentWidth(initialWidth);
    }
  }, [width]);

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    isDraggingRef.current = true;
    setIsDragging(true);
    startXRef.current = e.clientX;
    
    // Get the current width from the parent container
    const container = document.getElementById('right-aside-container');
    if (container) {
      const containerWidth = container.getBoundingClientRect().width;
      const windowWidth = window.innerWidth;
      const widthPercentage = (containerWidth / windowWidth) * 100;
      startWidthRef.current = widthPercentage;
      setCurrentWidth(widthPercentage);
    } else {
      // Fallback to the current state if container not found
      startWidthRef.current = currentWidth;
    }
    
    // Add event listeners for resize
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', handleResizeEnd);
    
    // Change cursor during resize
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  };

  // Handle resize during mouse movement
  const handleResize = (e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    
    // For RightAside, we want to increase width when dragging left (negative deltaX)
    // and decrease width when dragging right (positive deltaX)
    const deltaX = startXRef.current - e.clientX;
    
    // Calculate the new width based on the starting width and the mouse movement
    // The multiplier controls the sensitivity of the resize
    const sensitivity = 1.5;
    const newWidthPercentage = startWidthRef.current + (deltaX / window.innerWidth) * 100 * sensitivity;
    
    // Ensure the width stays within reasonable bounds (minimum 5%, maximum 80%)
    const clampedWidth = Math.min(Math.max(newWidthPercentage, 5), 80);
    
    // Update the parent container width
    const container = document.getElementById('right-aside-container');
    if (container) {
      container.style.width = `${clampedWidth}%`;
      
      // Also update the main content area width
      const mainContent:any = container.previousElementSibling;
      if (mainContent) {
        mainContent.style.width = `calc(100% - ${clampedWidth}%)`;
      }
      
      // Update the sidebar context with the new width
      updateRightAsideWidth(`w-[${Math.round(clampedWidth)}%]`);
      
      // Dispatch a custom event to notify other components that the RightAside panel has been resized
      const resizeEvent = new CustomEvent('rightAsideResize', {
        bubbles: true,
        detail: { width: clampedWidth }
      });
      document.dispatchEvent(resizeEvent);
      
      // Also dispatch a resize event to ensure ReactFlow and other components update
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 50);
    }
    
    setCurrentWidth(clampedWidth);
  };

  // Handle resize end
  const handleResizeEnd = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
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

  return (
    <aside
      ref={asideRef}
      className={cn(
        "relative flex flex-col h-full bg-background border-l shadow-sm sidebar-right",
        "transition-property-[width] duration-100 ease-in-out", // Only transition width property
        "flex-shrink-0 w-full", // Take up full width of parent
        className
      )}
      data-state="open" // Add a data attribute to assist with CSS selectors
      style={{ 
        zIndex: 55 // Ensure RightAside is on a high stacking layer
      }}
    >
      {/* Resize handle */}
      <div
        ref={resizeHandleRef}
        className="absolute left-0 top-0 w-6 h-full cursor-ew-resize z-30 group flex items-center justify-center"
        onMouseDown={handleResizeStart}
        style={{ transform: 'translateX(-3px)' }}
      >
        {/* Center grip indicator */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-[2px] h-8 bg-green-500/50 rounded" />
          <div className="w-[2px] h-8 bg-green-500/50 rounded" />
          <div className="w-[2px] h-8 bg-green-500/50 rounded" />
        </div>
      </div>
      {/* Collapse handle - Hidden during resize */}
      <Button
        variant="ghost"
        size="icon"
        onClick={closeRightAside}
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 -ml-4",
          "h-6 w-6 rounded-full border bg-background",
          "hover:bg-accent shadow-sm hover:shadow-md",
          "transition-all duration-200",
          "group z-10",
          isDragging ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
        aria-label="Collapse panel"
      >
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
      </Button>

      <div className="p-4 border-b flex items-center justify-between w-full flex-shrink-0 bg-muted">
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#009f59' }}
          >
            <img
              src={aiIcon}
              alt="AI"
              className="w-3 h-4 transform -rotate-[40deg] filter brightness-0 invert"
            />
          </div>
          <h2 className="font-medium text-lg text-green-600">{title}</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={closeRightAside}
          className="h-8 w-8 rounded-full hover:bg-background"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close panel</span>
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto w-full">
        {children}
      </div>

      {/* Scoped Bottom Drawer inside RightAside */}
      {(() => {
        const { isBottomDrawerOpen, bottomDrawerContent, bottomDrawerTitle } = useSidebar();
        return (isBottomDrawerOpen && bottomDrawerContent) ? (
          <div id="bottom-drawer-container" className="flex-shrink-0 w-full">
            <BottomDrawer title={bottomDrawerTitle}>
              {bottomDrawerContent}
            </BottomDrawer>
          </div>
        ) : null;
      })()}
    </aside>
  );
}

export default RightAside;
