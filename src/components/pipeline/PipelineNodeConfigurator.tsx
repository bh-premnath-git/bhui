import { useState } from 'react';
import { TransformationFormWrapper, TransformationSelector } from './TransformationFormWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Cog, Database, Filter, FileText, Shuffle } from 'lucide-react';

interface PipelineNodeConfiguratorProps {
  selectedNode?: {
    id: string;
    type: string;
    data?: any;
  };
  selectedEngineType?: 'pyspark' | 'flink';
  onNodeUpdate?: (nodeId: string, data: any) => void;
  onClose?: () => void;
}

type ViewMode = 'selector' | 'configurator';

export function PipelineNodeConfigurator({
  selectedNode,
  selectedEngineType = 'pyspark',
  onNodeUpdate,
  onClose
}: PipelineNodeConfiguratorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(
    selectedNode?.type ? 'configurator' : 'selector'
  );
  const [currentTransformationType, setCurrentTransformationType] = useState<string>(
    selectedNode?.type || ''
  );
  const [currentEngineType, setCurrentEngineType] = useState<'pyspark' | 'flink'>(selectedEngineType);

  const handleTransformationSelect = (transformationType: string) => {
    setCurrentTransformationType(transformationType);
    setViewMode('configurator');
  };

  const handleBack = () => {
    if (viewMode === 'configurator') {
      setViewMode('selector');
      setCurrentTransformationType('');
    } else {
      onClose?.();
    }
  };

  const handleSave = async (data: any) => {
    if (selectedNode && onNodeUpdate) {
      await onNodeUpdate(selectedNode.id, data);
    } else {
      // Handle new node creation
      console.log('New transformation configuration:', data);
    }
    
    // Optionally close the configurator after saving
    // onClose?.();
  };

  const getTransformationIcon = (type: string) => {
    const iconMap: Record<string, any> = {
      'reader': FileText,
      'filter': Filter,
      'writer': Database,
      'join': Shuffle,
      'default': Cog
    };
    
    const IconComponent = iconMap[type.toLowerCase()] || iconMap.default;
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/50">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold">
              {viewMode === 'selector' ? 'Select Transformation' : 'Configure Transformation'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {viewMode === 'selector' 
                ? 'Choose a transformation type for your pipeline'
                : `Setting up ${currentTransformationType} transformation`
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Select
            value={currentEngineType}
            onValueChange={(value: 'pyspark' | 'flink') => setCurrentEngineType(value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pyspark">PySpark</SelectItem>
              <SelectItem value="flink">PyFlink</SelectItem>
            </SelectContent>
          </Select>
          
          {selectedNode && (
            <Badge variant="outline" className="gap-1">
              {getTransformationIcon(selectedNode.type)}
              {selectedNode.type}
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {viewMode === 'selector' ? (
          <TransformationSelector
            selectedEngineType={currentEngineType}
            onTransformationSelect={handleTransformationSelect}
          />
        ) : (
          <TransformationFormWrapper
            transformationType={currentTransformationType}
            selectedEngineType={currentEngineType}
            onBack={handleBack}
            onSave={handleSave}
            isEdit={!!selectedNode}
            formData={selectedNode?.data}
            mode={selectedNode ? 'edit' : 'new'}
          />
        )}
      </div>
    </div>
  );
}

// Example integration component showing how to use with React Flow or similar
export function PipelineEditor() {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [showConfigurator, setShowConfigurator] = useState(false);
  const [engineType, setEngineType] = useState<'pyspark' | 'flink'>('pyspark');

  // Mock nodes for demonstration
  const mockNodes = [
    { id: '1', type: 'reader', data: { reader_name: 'CSV Reader', source: { type: 'File' } } },
    { id: '2', type: 'filter', data: { filter_condition: 'age > 18' } },
    { id: '3', type: 'writer', data: { writer_name: 'Parquet Writer' } },
  ];

  const handleNodeClick = (node: any) => {
    setSelectedNode(node);
    setShowConfigurator(true);
  };

  const handleNodeUpdate = async (nodeId: string, data: any) => {
    console.log(`Updating node ${nodeId} with data:`, data);
    // Here you would update your pipeline state/store
    
    // Update the selected node data
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode({ ...selectedNode, data });
    }
  };

  const handleAddNode = () => {
    setSelectedNode(null);
    setShowConfigurator(true);
  };

  return (
    <div className="h-screen flex">
      {/* Pipeline Canvas */}
      <div className="flex-1 p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Pipeline Editor</h1>
            <div className="flex items-center gap-2">
              <Select
                value={engineType}
                onValueChange={(value: 'pyspark' | 'flink') => setEngineType(value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pyspark">PySpark</SelectItem>
                  <SelectItem value="flink">PyFlink</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAddNode}>Add Node</Button>
            </div>
          </div>

          {/* Mock Pipeline Nodes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockNodes.map((node) => (
              <Card 
                key={node.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleNodeClick(node)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getTransformationIcon(node.type)}
                    {node.type}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge variant="outline">ID: {node.id}</Badge>
                    {node.data && (
                      <div className="text-sm text-muted-foreground">
                        <pre className="text-xs">
                          {JSON.stringify(node.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      {showConfigurator && (
        <div className="w-1/2 border-l bg-background">
          <PipelineNodeConfigurator
            selectedNode={selectedNode}
            selectedEngineType={engineType}
            onNodeUpdate={handleNodeUpdate}
            onClose={() => setShowConfigurator(false)}
          />
        </div>
      )}
    </div>
  );
}

// Helper function (duplicate from above for standalone usage)
function getTransformationIcon(type: string) {
  const iconMap: Record<string, any> = {
    'reader': FileText,
    'filter': Filter,
    'writer': Database,
    'join': Shuffle,
    'default': Cog
  };
  
  const IconComponent = iconMap[type.toLowerCase()] || iconMap.default;
  return <IconComponent className="h-4 w-4" />;
}