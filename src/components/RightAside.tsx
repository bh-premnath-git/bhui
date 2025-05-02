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
  width = 'w-[30%]',
  className 
}: RightAsideProps) {
  const { closeRightAside, isRightAsideOpen } = useSidebar();

  return (
    <aside 
      className={cn(
        "fixed right-0 top-0 h-screen z-30 ",
        "border-l shadow-sm transition-all duration-300 ease-in-out",
        "transform", 
        isRightAsideOpen ? "translate-x-0" : "translate-x-full",
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
        
        <div className="flex-1 overflow-y-auto p-0">
          {children}
        </div>
      </div>
    </aside>
  );
}

export default RightAside; 