import { forwardRef, useImperativeHandle, useState } from "react";
import { Position, NodeToolbar } from "reactflow";
import { Copy, Trash2, Info, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFlow } from "@/contexts/FlowContext";
import { NodeToolBarRef } from "@/types/flow";
import { PortalModal } from "@/portal/PortalModal";
import { NodeInfo } from "@/components/ReactFlowComps/flow/nodes/subcomponents/NodeInfo";
interface NodeToolBarProps {
  id: string;
  isHovered: React.SetStateAction<boolean>;
  onStartEdit: () => void;
}

export const NodeToolBar = forwardRef<NodeToolBarRef, NodeToolBarProps>(
  ({ id, isHovered, onStartEdit }, ref) => {
    const { deleteNode, cloneNode, showNodeInfo } = useFlow();
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

    useImperativeHandle(ref, () => ({
      setEditing: (value) => {
        if (value) onStartEdit();
      },
    }));

    const handleInfoClick = () => {
      setIsInfoModalOpen(true);
      showNodeInfo(id);
    };

    return (
      <>
        <NodeToolbar
          isVisible={isHovered as boolean}
          position={Position.Top}
          className="p-1 rounded-md bg-transparent"
        >
          <div className="flex">
            <Button
              variant="ghost"
              size="icon"
              title="Clone"
              className="gap-1 w-4 h-4"
              onClick={() => cloneNode(id)}
            >
              <Copy className="h-2 w-2" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Delete"
              className="gap-1 w-4 h-4"
              onClick={() => deleteNode(id)}
            >
              <Trash2 className="h-2 w-2" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Info"
              className="gap-1 w-4 h-4"
              onClick={handleInfoClick}
            >
              <Info className="h-2 w-2" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Rename"
              className="gap-1 w-4 h-4"
              onClick={onStartEdit}
            >
              <PenLine className="h-2 w-2" />
            </Button>
          </div>
        </NodeToolbar>
        <PortalModal
          isOpen={isInfoModalOpen}
          onClose={() => setIsInfoModalOpen(false)}
          title="Node Information"
        >
          <NodeInfo id={id} />
        </PortalModal>
      </>
    );
  }
);

NodeToolBar.displayName = "NodeToolBar";
