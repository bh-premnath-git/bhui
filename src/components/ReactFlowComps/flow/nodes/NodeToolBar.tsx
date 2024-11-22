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
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              title="Clone"
              onClick={() => cloneNode(id)}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Delete"
              onClick={() => deleteNode(id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Info"
              onClick={handleInfoClick}
            >
              <Info className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Rename"
              onClick={onStartEdit}
            >
              <PenLine className="h-4 w-4" />
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
