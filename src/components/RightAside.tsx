import React from 'react';
import { X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/context/SidebarContext';
import { Button } from '@/components/ui/button';

interface RightAsideProps {
  title?: string;
  children: React.ReactNode;
  width?: string;
  className?: string;
}

export function RightAside({
  title = 'Details',
  children,
  width = 'w-70',
  className
}: RightAsideProps) {
  const { closeRightAside } = useSidebar();

  return (
    <aside
      className={cn(
        "relative flex flex-col h-full bg-background/95 backdrop-blur-sm border-l shadow-sm transition-width",
        width,
        className
      )}
    >
      {/* Collapse handle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={closeRightAside}
        className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 h-8 w-8 rounded-full hover:bg-muted z-10"
        aria-label="Collapse panel"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Header with close “X” */}
      <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
        <h2 className="font-medium text-lg">{title}</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={closeRightAside}
          className="h-8 w-8 rounded-full hover:bg-muted"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close panel</span>
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {children}
      </div>
    </aside>
  );
}

export default RightAside;
