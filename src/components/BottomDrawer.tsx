import React from 'react';
import { ChevronDown, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/context/SidebarContext';
import { Button } from '@/components/ui/button';

interface BottomDrawerProps {
  title?: string;
  children: React.ReactNode;
  height?: string;
  defaultHeight?: string;
  className?: string;
  showMaximize?: boolean;
}

export function BottomDrawer({ 
  title = 'Console', 
  children, 
  height = 'h-80',
  defaultHeight = 'h-10',
  className,
  showMaximize = true
}: BottomDrawerProps) {
  const { isBottomDrawerOpen, toggleBottomDrawer, closeBottomDrawer } = useSidebar();
  const [isMaximized, setIsMaximized] = React.useState(false);

  const toggleMaximize = () => {
    setIsMaximized(prev => !prev);
  };

  const effectiveHeight = isMaximized ? 'h-[calc(100vh-64px)]' : height;

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-sm",
        "border-t shadow-sm transition-all duration-300 ease-in-out",
        isBottomDrawerOpen ? effectiveHeight : defaultHeight,
        className
      )}
    >
      <div className="flex flex-col h-full">
        <div 
          className="px-4 py-2 border-b flex items-center justify-between cursor-pointer"
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
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMaximize();
                }}
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
        
        <div className={cn(
          "flex-1 overflow-y-auto p-4 transition-opacity duration-200",
          isBottomDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none h-0"
        )}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default BottomDrawer; 