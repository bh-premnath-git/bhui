import { useState, useMemo, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls,
  MiniMap,
  Panel,
  MarkerType,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  addEdge,
  Node,
  Edge,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Database, Server, GitBranch, Play } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Define NodeData outside the component
type NodeData = {
  label: string;
  type?: string;
  details?: { host: string; port: number };
  columns?: { name: string; type: string; isPrimary?: boolean }[];
};

// Sample data - replace with API call later
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'connection',
    data: { 
      label: 'Postgres Connection',
      type: 'postgres',
      details: { host: 'localhost', port: 5432 }
    },
    position: { x: 100, y: 200 },
  },
  {
    id: '2',
    type: 'datasource',
    data: { 
      label: 'Customer Table',
      columns: [
        { name: 'id', type: 'int', isPrimary: true },
        { name: 'name', type: 'varchar' },
      ]
    },
    position: { x: 300, y: 250 },
  },
  // Add a third node for testing
  {
    id: '3',
    type: 'datasource',
    data: { 
      label: 'Orders Table',
      columns: [
        { name: 'id', type: 'int', isPrimary: true },
        { name: 'customer_id', type: 'int', isForeign: true },
        { name: 'amount', type: 'decimal' },
      ]
    },
    position: { x: 500, y: 250 },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'default',
    style: { stroke: '#333', strokeWidth: 3 },
    
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    type: 'default',
    style: { stroke: '#333', strokeWidth: 3 },
    
  },
];

// Custom node types
const nodeTypes = {
  connection: ({ data }: { data: any }) => (
    <div className="flex flex-col items-center bg-white p-4 rounded-lg shadow-md border-2 border-blue-300 min-w-[160px]">
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500" />
      <Server className="w-6 h-6 text-blue-500" />
      <div>{data.label}</div>
    </div>
  ),
  datasource: ({ data }: { data: any }) => (
    <div className="flex flex-col bg-white p-4 rounded-lg shadow-md border-2 border-green-300 min-w-[160px]">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-green-500" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-green-500" />
      <Database className="w-6 h-6 text-green-500" />
      <div>{data.label}</div>
    </div>
  ),
  pipeline: ({ data }: { data: any }) => (
    <div className="flex flex-col items-center bg-white p-4 rounded-lg shadow-md border-2 border-orange-300 min-w-[160px]">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-orange-500" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-orange-500" />
      {/* ... rest of pipeline node content ... */}
    </div>
  ),
};

const Lineage = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [filters, setFilters] = useState({
    connectionType: 'all',
    search: '',
  });
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 0.7 });

  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      if (filters.connectionType !== 'all' && 
          node.type === 'connection' && 
          node.data.type !== filters.connectionType) {
        return false;
      }
      if (filters.search && !node.data.label.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [nodes, filters]);

  const onConnect = useCallback((params: any) => {
    setEdges((eds) => addEdge({
      ...params,
      markerEnd: { type: MarkerType.ArrowClosed },
    }, eds));
  }, [setEdges]);

  return (
    <div className="h-[600px] w-full">
      <ReactFlow
        nodes={filteredNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed },
        }}
        connectionMode={ConnectionMode.Strict}
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.5}
        maxZoom={1.5}
        nodesDraggable={true}
        elementsSelectable={true}
        snapToGrid={true}
        snapGrid={[15, 15]}
      >
        <Background />
        <Controls />
        <MiniMap 
          nodeStrokeColor={(n) => {
            if (n.type === 'connection') return '#3b82f6';
            if (n.type === 'datasource') return '#10b981';
            if (n.type === 'pipeline') return '#f97316';
            return '#64748b';
          }}
          nodeColor={(n) => {
            if (n.type === 'connection') return '#bfdbfe';
            if (n.type === 'datasource') return '#a7f3d0';
            if (n.type === 'pipeline') return '#fed7aa';
            return '#e2e8f0';
          }}
          maskColor="rgba(240, 242, 245, 0.7)"
          className="bg-white shadow-md rounded-md border border-gray-200"
        />
        
        <Panel position="top-left" className="bg-white p-4 rounded-lg shadow">
          <div className="space-y-4">
            <Input
              placeholder="Search nodes..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
            <Select
              value={filters.connectionType}
              onValueChange={(value) => setFilters(prev => ({ 
                ...prev, 
                connectionType: value 
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Connection Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Connections</SelectItem>
                <SelectItem value="postgres">Postgres</SelectItem>
                <SelectItem value="oracle">Oracle</SelectItem>
                <SelectItem value="snowflake">Snowflake</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Panel>

        <Panel position="top-right" className="bg-white p-4 rounded-lg shadow">
          <Card>
            <CardHeader>
              <CardTitle>Legend</CardTitle>
              <CardDescription>Node types in the lineage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-blue-500" />
                  <span>Connection</span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-green-500" />
                  <span>Data Source</span>
                </div>
                <div className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-orange-500" />
                  <span>Pipeline</span>
                </div>
                <div className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-purple-500" />
                  <span>Flow</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default Lineage;
