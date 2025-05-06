import React from 'react';
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
}

export function BottomDrawer({ 
  title = 'Console', 
  children, 
  height = 'h-[520px]', // Default open height 
  className,
  showMaximize = true
}: BottomDrawerProps) {
  const { isBottomDrawerOpen, toggleBottomDrawer } = useSidebar(); 
  const [isMaximized, setIsMaximized] = React.useState(false);

  const toggleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    setIsMaximized(prev => !prev);
  };

  // Height class determines the drawer's size within the flex column
  const heightClass = isMaximized ? 'flex-1' : height;

  return (
    // Removed fixed positioning classes (fixed, bottom, left, right, z-index)
    <div 
      className={cn(
        "bg-background/95 backdrop-blur-sm", // Keep background
        "border-t shadow-sm", // Keep border/shadow
        "overflow-hidden pl-[4%]", // Prevent content spilling out before internal scroll
        heightClass, // Apply dynamic height
        className // Allow additional classes (like flex-shrink-0 from parent)
      )}
    >
      {/* Use flex layout internally as well */}
      <div className="flex flex-col h-full">
        <div 
          className="px-4 py-2 border-b flex items-center justify-between cursor-pointer flex-shrink-0" // Header shouldn't shrink
          onClick={toggleBottomDrawer}
        >
          <div className="flex items-center gap-2">
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform duration-200",
              isBottomDrawerOpen ? "rotate-180" : "rotate-0"
            )} />
            <h2 className="font-medium">{title}</h2>
          </div>
          
          <div className="flex items-center gap-1">
            {showMaximize && isBottomDrawerOpen && ( 
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleMaximize}
                className="h-7 w-7 rounded-full hover:bg-muted"
              >
                {isMaximized ? (
                  <Minimize2 className="h-3.5 w-3.5" />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5" />
                )}
                <span className="sr-only">{isMaximized ? 'Minimize' : 'Maximize'}</span>
              </Button>
            )}
          </div>
        </div>
        
        {/* Content area takes remaining space and scrolls */}
        <div className={cn(
          "flex-1 overflow-y-auto p-4",
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