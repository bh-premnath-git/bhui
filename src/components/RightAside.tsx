import React from 'react';
import { X } from 'lucide-react';
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
  width = 'w-80',
  className 
}: RightAsideProps) {
  const { closeRightAside } = useSidebar();

  return (
    <aside 
      className={cn(
        "h-full bg-background/95 backdrop-blur-sm",
        "border-l shadow-sm",
        width,
        className
      )}
    >
      <div className="flex flex-col h-full">
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
        
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </aside>
  );
}

export default RightAside; 