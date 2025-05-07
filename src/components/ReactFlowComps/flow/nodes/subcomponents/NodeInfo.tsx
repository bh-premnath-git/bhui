import { useFlow } from "@/contexts/FlowContext";

export const NodeInfo: React.FC<{ id: string }> = ({ id }) => {
    const { nodes } = useFlow();
    const node = nodes.find((n) => n.id === id);
  
    if (!node) return null;
  
    return (
      <div className="space-y-4">
        <div>
          <h3 className="font-medium">{node.data.meta.moduleInfo.label}</h3>
          <p className="text-sm text-muted-foreground">{node.data.meta.type}</p>
        </div>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Node ID:</label>
            <p className="text-sm text-muted-foreground font-sans bg-muted p-1 rounded">{id}</p>
          </div>
        </div>
      </div>
    );
  }