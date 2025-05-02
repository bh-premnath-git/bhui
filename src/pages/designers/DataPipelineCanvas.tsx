import { withPageErrorBoundary } from '@/components/withPageErrorBoundary';
import DataPipelineCanvasNew from '@/features/designers/DataPipelineCanvasNew';
import { useSidebar } from '@/context/SidebarContext';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const DataPipelineCanvasPage = () => {
  const {isRightAsideOpen, openRightAside } = useSidebar();

 
  return (
    <div className="h-[90%] w-full relative">
      <div className={cn(isRightAsideOpen?"w-[70%]":"w-full", "h-full transition-all duration-300")}>
      <DataPipelineCanvasNew />
      </div>
      
      {/* Chat toggle button - only show if the panel is not open */}
      {!isRightAsideOpen && (
        <Button
          onClick={openRightAside}
          className="fixed bottom-20 right-4 z-50 rounded-full w-12 h-12 shadow-lg bg-primary hover:bg-primary/90"
          size="icon"
          aria-label="Open AI Assistant"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

export default withPageErrorBoundary(DataPipelineCanvasPage, 'DataPipelineCanvas');