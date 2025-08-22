import { memo, useRef, useState, useEffect } from "react";
import { NodeProps, useUpdateNodeInternals } from "@xyflow/react";
import { NodeContent } from "./NodeContent";
import { NodeHandles } from "./NodeHandles";
import { useFlow } from "@/context/designers/FlowContext";
import { NodeForm } from "./subcomponents/NodeForm";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface CustomNodeData {
  label: string;
  type: string;
  status: "pending" | "running" | "success" | "error";
  meta: {
    moduleInfo: {
      color: string;
      icon: string;
      label: string;
    };
    type: string;
    properties: Record<string, any>;
    description: string;
    renameType?: string;
  };
  selectedData?: any | null;
}

export const CustomNode = memo(
  ({ id, data, selected }: NodeProps) => {
    const typedData = data as unknown as CustomNodeData;
    const [isHovered, setIsHovered] = useState(false);
    const [isNodeTapModalOpen, setIsNodeTapModalOpen] = useState(false);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const { selectNode, revertOrSaveData, updateNodeDimensions } = useFlow();
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const nodeRef = useRef<HTMLDivElement>(null);
    const updateNodeInternals = useUpdateNodeInternals();
    // Track node dimensions for responsive layout
    useEffect(() => {
      if (nodeRef.current) {
        const observer = new ResizeObserver((entries) => {
          const { width, height } = entries[0].contentRect;
          setDimensions({ width, height });
          
          // Update node dimensions in context to help with layout calculations
          updateNodeDimensions?.(id, { width, height });
          
          // Force ReactFlow to recalculate handles positions
          updateNodeInternals(id);
        });
        
        observer.observe(nodeRef.current);
        return () => observer.disconnect();
      }
    }, [id, updateNodeInternals, updateNodeDimensions]);

    const showToolbar = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsHovered(true);
    };

    const hideToolbar = () => {
      timeoutRef.current = setTimeout(() => {
        setIsHovered(false);
      }, 300);
    };

    const handleDoubleClick = () => {
      selectNode(id);
      setIsNodeTapModalOpen(true);
    };

    // Calculate appropriate sheet size based on viewport
    const getSheetSize = () => {
      const viewportWidth = window.innerWidth;
      if (viewportWidth < 640) return "w-[95vw]";
      if (viewportWidth < 1024) return "w-[70vw]";
      return "w-[45vw]";
    };

    return (
      <>
        <div
          ref={nodeRef}
          className={`relative group p-0 bg-transparent select-none transition-shadow ${
            selected ? "shadow-lg" : ""
          }`}
          onMouseEnter={showToolbar}
          onMouseLeave={hideToolbar}
          onDoubleClick={handleDoubleClick}
          data-testid={`node-${id}`}
        >
          <NodeContent
            id={id}
            label={typedData.meta.moduleInfo.label}
            type={typedData.meta?.renameType ?? typedData.selectedData}
            moduleInfo={typedData.meta.moduleInfo}
            isHovered={isHovered}
          />
          <NodeHandles />
          
          {/* Optional debug info - remove in production */}
          {false && (
            <div className="absolute bottom-0 right-0 text-[8px] text-gray-500 bg-white/80 px-1 rounded">
              {dimensions.width.toFixed(0)}x{dimensions.height.toFixed(0)}
            </div>
          )}
        </div>
        <Sheet
          open={isNodeTapModalOpen}
          onOpenChange={(open) => {
            if (!open) {
              revertOrSaveData(id, false);
            }
            setIsNodeTapModalOpen(open);
          }}
        >
          <SheetContent side="right" className={getSheetSize()}>
            <SheetHeader>
              <SheetTitle>Configure Node Properties</SheetTitle>
            </SheetHeader>
            <div className="max-h-[calc(100vh-10rem)] overflow-y-auto pb-4">
              <NodeForm
                id={id}
                closeTap={() => {
                  setIsNodeTapModalOpen(false);
                }}
              />
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  }
);
