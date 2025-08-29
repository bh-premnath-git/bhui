import { forwardRef, useImperativeHandle, useState } from "react"
import { Position, NodeToolbar } from "@xyflow/react"
import { Copy, Trash2, Info, PenLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useFlow } from "@/context/designers/FlowContext"
import { NodeToolBarRef } from "@/types/designer/flow"
import { NodeInfo } from "@/components/bh-reactflow-comps/flow/flow/subcomponents/NodeInfo"

interface NodeToolBarProps {
  id: string
  isHovered: boolean
  onStartEdit: () => void
}

export const NodeToolBar = forwardRef<NodeToolBarRef, NodeToolBarProps>(
  ({ id, isHovered, onStartEdit }, ref) => {
    const { deleteNode, cloneNode, showNodeInfo } = useFlow()
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)

    useImperativeHandle(ref, () => ({
      setEditing: (value) => {
        if (value) onStartEdit()
      },
    }))

    const handleInfoClick = () => {
      setIsInfoModalOpen(true)
      showNodeInfo(id)
    }

    return (
      <>
        <NodeToolbar
          isVisible={!!isHovered}
          position={Position.Top}
          className="p-1 rounded-md"
        >
          <div className="flex">
            <Button
              variant="outline"
              size="icon"
              title="Clone"
              className="gap-1 w-4 h-4"
              onClick={() => cloneNode(id)}
            >
              <Copy className="h-2 w-2" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              title="Delete"
              className="gap-1 w-4 h-4"
              onClick={() => deleteNode(id)}
            >
              <Trash2 className="h-2 w-2" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              title="Info"
              className="gap-1 w-4 h-4"
              onClick={handleInfoClick}
            >
              <Info className="h-2 w-2" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              title="Rename"
              className="gap-1 w-4 h-4"
              onClick={onStartEdit}
            >
              <PenLine className="h-2 w-2" />
            </Button>
          </div>
        </NodeToolbar>

        {/* Replace PortalModal with shadcn/ui Dialog */}
        <Dialog open={isInfoModalOpen} onOpenChange={setIsInfoModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Node Information</DialogTitle>
            </DialogHeader>
            <NodeInfo id={id} />
          </DialogContent>
        </Dialog>
      </>
    )
  }
)

NodeToolBar.displayName = "NodeToolBar"
