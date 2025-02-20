import { memo, useRef, useState } from "react";
import { NodeProps } from "reactflow";
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
  ({ id, data, selected }: NodeProps<CustomNodeData>) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isNodeTapModalOpen, setIsNodeTapModalOpen] = useState(false);
    const { selectNode, revertOrSaveData } = useFlow();
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    return (
      <>
        <div
          className={`relative group p-0 bg-transparent select-none ${
            selected ? "shadow-lg" : ""
          }`}
          onMouseEnter={showToolbar}
          onMouseLeave={hideToolbar}
          onDoubleClick={handleDoubleClick}
        >
          <NodeContent
            id={id}
            label={data.meta.moduleInfo.label}
            type={data.meta?.renameType ?? data.selectedData}
            moduleInfo={data.meta.moduleInfo}
            isHovered={isHovered}
          />
          <NodeHandles />
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
          <SheetContent side="right" className="w-[45vw]">
            <SheetHeader>
              <SheetTitle>Configure Node Properties</SheetTitle>
            </SheetHeader>
            <NodeForm
              id={id}
              closeTap={() => {
                setIsNodeTapModalOpen(false);
              }}
            />
          </SheetContent>
        </Sheet>
      </>
    );
  }
);
