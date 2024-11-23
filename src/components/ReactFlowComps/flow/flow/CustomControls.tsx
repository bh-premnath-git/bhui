import { memo } from 'react';
import { ChevronUp, AlignHorizontalDistributeCenter, ZoomIn, ZoomOut, Table2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFlow } from '@/contexts/FlowContext';
import { cn } from '@/lib/utils';

export const CustomControls = memo(() => {
  const { zoomIn, zoomOut, fitView, isDataPreviewOpen, toggleDataPreview } = useFlow();

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 z-50">
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-1.5 shadow-lg border flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={fitView}
          className="h-8 w-8 hover:bg-gray-100"
          title="Center"
        >
          <AlignHorizontalDistributeCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={zoomOut}
          className="h-8 w-8 hover:bg-gray-100"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={zoomIn}
          className="h-8 w-8 hover:bg-gray-100"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleDataPreview}
          className={cn(
            "h-8 px-3 hover:bg-gray-100 flex items-center gap-1.5",
            isDataPreviewOpen && "bg-gray-100"
          )}
        >
          <Table2 className="h-4 w-4" />
          <span className="text-sm font-medium">Logs</span>
          <ChevronUp className={cn(
            "h-3 w-3 text-gray-500 transition-transform",
            isDataPreviewOpen && "rotate-180"
          )} />
        </Button>
      </div>
    </div>
  );
});