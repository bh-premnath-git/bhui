import React, { useRef, useState } from "react";
import { DataOpsHub } from '@/types/dataops/dataOpsHub';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import { DataOpsHubSchema } from './DataOpsHubSchema';

interface OpsHubSlideWrapperProps {
  isSheetOpen: boolean;
  setIsSheetOpen: (open: boolean) => void;
  selectedRow?: DataOpsHub;
}

export const OpsHubSlideWrapper = ({
  isSheetOpen,
  setIsSheetOpen,
  selectedRow,
}: OpsHubSlideWrapperProps) => {
  const minWidth = window.innerWidth * 0.75; // default 75vw
  const [width, setWidth] = useState(minWidth);
  const isDragging = useRef(false);

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth >= minWidth) {
      setWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  React.useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetContent
        side="right"
        className="p-0"
        style={{ width: `${width}px`, maxWidth: "90vw" }}
      >
        {/* Resizer handle */}
        <div
          onMouseDown={handleMouseDown}
          className="absolute left-0 top-0 h-full w-1 cursor-ew-resize bg-gray-100 z-50"
        />
        <div className="h-full overflow-auto">
          <DataOpsHubSchema jobId={selectedRow?.job_id} />
        </div>
      </SheetContent>
    </Sheet>
  );
};
