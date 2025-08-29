import { useState, useMemo, useCallback } from 'react';
import  {
  ReactFlow, 
  Background, 
  Controls,
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Database, Server, GitBranch, Play, ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

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

// Updated node types with more compact design
const nodeTypes = {
  connection: ({ data }: { data: any }) => (
    <div className="flex flex-col items-center bg-white p-3 rounded-md shadow-sm border border-blue-200 min-w-[140px]">
      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-blue-500" />
      <div className="flex items-center gap-2 w-full">
        <Server className="w-4 h-4 text-blue-500 shrink-0" />
        <span className="text-sm truncate" title={data.label}>{data.label}</span>
      </div>
    </div>
  ),
  datasource: ({ data }: { data: any }) => (
    <div className="flex flex-col bg-white p-3 rounded-md shadow-sm border border-green-200 min-w-[140px]">
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-green-500" />
      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-green-500" />
      <div className="flex items-center gap-2 w-full">
        <Database className="w-4 h-4 text-green-500 shrink-0" />
        <span className="text-sm truncate" title={data.label}>{data.label}</span>
      </div>
    </div>
  ),
  pipeline: ({ data }: { data: any }) => (
    <div className="flex flex-col items-center bg-white p-3 rounded-md shadow-sm border border-orange-200 min-w-[140px]">
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-orange-500" />
      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-orange-500" />
      <div className="flex items-center gap-2 w-full">
        <GitBranch className="w-4 h-4 text-orange-500 shrink-0" />
        <span className="text-sm truncate" title={data.label}>{data.label}</span>
      </div>
    </div>
  ),
};

const Lineage = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [filters, setFilters] = useState({ connectionType: 'all', search: '' });
  const [isLegendOpen, setIsLegendOpen] = useState(true);
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 0.7 });

  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      if (filters.connectionType !== 'all' && 
          node.type === 'connection' && 
          node.data.type !== filters.connectionType) {
        return false;
      }
      if (filters.search && 
          typeof node.data.label === 'string' && 
          !node.data.label.toLowerCase().includes(filters.search.toLowerCase())) {
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
    <div className="relative w-full">
      <div className="h-[600px] w-full border rounded-lg overflow-hidden">
        <ReactFlow
          nodes={filteredNodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          defaultEdgeOptions={{
            type: 'smoothstep',
            style: { strokeWidth: 1.5 },
            markerEnd: { type: MarkerType.ArrowClosed },
          }}
          connectionMode={ConnectionMode.Strict}
          fitViewOptions={{ padding: 0.1 }}
          minZoom={0.5}
          maxZoom={1.5}
          nodesDraggable={true}
          elementsSelectable={true}
          snapToGrid={true}
          snapGrid={[10, 10]}
          proOptions={{ hideAttribution: true }}
        >
          <Background />
          <Controls className="rounded-md border border-gray-200" />
          
          <Panel position="top-left" className="bg-white rounded-md shadow-sm border border-gray-200">
            <div className="p-2 space-y-2">
              <div className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded">
                <Search className="w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search nodes..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="border-0 focus-visible:ring-0 h-8 text-sm bg-transparent"
                />
              </div>
              <div className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded">
                <Filter className="w-4 h-4 text-gray-400" />
                <Select
                  value={filters.connectionType}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, connectionType: value }))}
                >
                  <SelectTrigger className="border-0 h-8 text-sm bg-transparent">
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
            </div>
          </Panel>
        </ReactFlow>
      </div>

      <div className="absolute top-2 right-2 z-10">
        <Card className="w-[200px] shadow-sm border bg-white">
          <Collapsible open={isLegendOpen} onOpenChange={setIsLegendOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full flex items-center justify-between p-2 text-sm font-medium">
                Legend
                {isLegendOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-2 space-y-1.5 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Server className="w-4 h-4 text-blue-500" />
                  <span>Connection</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Database className="w-4 h-4 text-green-500" />
                  <span>Data Source</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <GitBranch className="w-4 h-4 text-orange-500" />
                  <span>Pipeline</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Play className="w-4 h-4 text-purple-500" />
                  <span>Flow</span>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>
    </div>
  );
};

export default Lineage;
