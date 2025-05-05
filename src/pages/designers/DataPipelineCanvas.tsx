import { withPageErrorBoundary } from '@/components/withPageErrorBoundary';
import DataPipelineCanvasNew from '@/features/designers/DataPipelineCanvasNew';
import { useSidebar } from '@/context/SidebarContext';
import { cn } from '@/lib/utils';

const DataPipelineCanvasPage = () => {
  const {isRightAsideOpen, openRightAside } = useSidebar();

 
  return (
    <div className="h-[90%] w-full relative">
      <div className={cn(isRightAsideOpen?"w-[70%]":"w-full", "h-full transition-all duration-300")}>
      <DataPipelineCanvasNew />
      </div>
     
    </div>
  );
};

export default withPageErrorBoundary(DataPipelineCanvasPage, 'DataPipelineCanvas');