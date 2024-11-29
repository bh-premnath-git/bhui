import { memo, useRef, useState } from "react";
import { NodeProps } from "reactflow";
import { NodeContent } from "./NodeContent";
import { NodeHandles } from "./NodeHandles";
import { useFlow } from "@/contexts/FlowContext";
import { SlidingPortalModal } from "@/portal/SlidingPortal";
import { NodeForm } from "./subcomponents/NodeForm";

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
  };
}

export const CustomNode = memo(
  ({ id, data, selected }: NodeProps<CustomNodeData>) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isNodeTapModalOpen, setIsNodeTapModalOpen] = useState(false);
    const { selectNode, selectedNode } = useFlow();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const newLabel = selectedNode?.data?.meta?.type ?? "";
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
          className={`relative group p-0 bg-transparent select-none ${selected ? "shadow-lg" : ""
            }`}
          onMouseEnter={showToolbar}
          onMouseLeave={hideToolbar}
          onDoubleClick={handleDoubleClick}
        >
          <NodeContent
            id={id}
            label={data.meta.moduleInfo.label}
            type={data.type}
            moduleInfo={data.meta.moduleInfo}
            isHovered={isHovered}
          />
          <NodeHandles />
        </div>
        <SlidingPortalModal
          isOpen={isNodeTapModalOpen}
          onClose={() => setIsNodeTapModalOpen(false)}
          title={newLabel}
        >
          <NodeForm closeTap={() => setIsNodeTapModalOpen(false)} />
        </SlidingPortalModal>
      </>
    );
  }
);
