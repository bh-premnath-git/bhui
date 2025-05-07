import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/context/SidebarContext';
import { Button } from '@/components/ui/button';

interface RightAsideProps {
  children: React.ReactNode;
  width?: string;
  className?: string;
}

export function RightAside({
  children,
  width = 'w-[100%]',
  className
}: RightAsideProps) {
  const { closeRightAside } = useSidebar();

  return (
    <aside
      className={cn(
        "relative flex flex-col h-full pt-12 bg-background/95 backdrop-blur-sm border-l shadow-sm sidebar-right",
        "transition-all duration-300 ease-in-out",
        width,
        className
      )}
      data-state="open"
      style={{ zIndex: 25 }}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={closeRightAside}
        className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 h-8 w-8 rounded-full hover:bg-muted z-10"
        aria-label="Collapse panel"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>      
      <div className="flex-1 overflow-y-auto ">
        {children}
      </div>
    </aside>
  );
}

export default RightAside;
