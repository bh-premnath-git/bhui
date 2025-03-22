import { useState, useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls,
  MiniMap,
  Panel,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Database, Server, GitBranch, Play, Link2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Sample data - replace with API call later
const initialNodes = [
  {
    id: '1',
    type: 'connection',
    data: { 
      label: 'Postgres Connection',
      type: 'postgres',
      details: { host: 'localhost', port: 5432 }
    },
    position: { x: 100, y: 100 },
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
    position: { x: 300, y: 100 },
  },
  // ... more sample nodes
];

const initialEdges = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  // ... more edges
];

// Custom node types
const nodeTypes = {
  connection: ({ data }) => (
    <div className="bg-white p-4 rounded-lg shadow border-2 border-blue-200">
      <Server className="w-6 h-6 text-blue-500" />
      <div>{data.label}</div>
    </div>
  ),
  datasource: ({ data }) => (
    <div className="bg-white p-4 rounded-lg shadow border-2 border-green-200">
      <Database className="w-6 h-6 text-green-500" />
      <div>{data.label}</div>
    </div>
  ),
  // ... other node types
};

const Lineage = () => {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [filters, setFilters] = useState({
    connectionType: 'all',
    search: '',
  });

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

  return (
    <div className="h-screen w-full">
      <div className="h-full">
        <ReactFlow
          nodes={filteredNodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
          
          <Panel position="top-left" className="bg-white p-4 rounded-lg shadow">
            <div className="space-y-4">
              <Input
                placeholder="Search nodes..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
              <Select
                value={filters.connectionType}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  connectionType: e.target.value 
                }))}
              >
                <option value="all">All Connections</option>
                <option value="postgres">Postgres</option>
                <option value="oracle">Oracle</option>
                <option value="snowflake">Snowflake</option>
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
    </div>
  );
};

export default Lineage;
