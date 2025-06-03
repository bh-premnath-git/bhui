import React from 'react';
import { X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/context/SidebarContext';
import { Button } from '@/components/ui/button';
import aiIcon from '/assets/ai/ai.svg';

interface RightAsideProps {
  title?: string;
  children: React.ReactNode;
  width?: string;
  className?: string;
}

export function RightAside({
  title = 'Details',
  children,
  width = 'w-[100%]',
  className
}: RightAsideProps) {
  const { closeRightAside } = useSidebar();

  return (
    <aside
      className={cn(
        "relative flex flex-col h-full w-full bg-background/95 backdrop-blur-sm border-l shadow-sm sidebar-right",
        "transition-all duration-300 ease-in-out", // Smoother transitions
        width,
        className
      )}
      data-state="open" // Add a data attribute to assist with CSS selectors
      style={{ zIndex: 25 }} // Higher z-index to ensure it's on top
    >
      {/* Collapse handle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={closeRightAside}
        className="
          absolute left-0 top-1/2 -translate-y-1/2 -ml-4
          h-6 w-6 rounded-full border bg-background
          hover:bg-accent shadow-sm hover:shadow-md
          transition-all duration-200
          group z-10
        "
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
    </aside>
  );
}

export default RightAside;
