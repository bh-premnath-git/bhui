// src/components/bh-reactflow-comps/shared/SharedCustomNode.tsx
import React, { memo, useCallback, useState, useEffect, useRef } from 'react';
import { Handle, Position, useEdges, useReactFlow, NodeProps, useUpdateNodeInternals } from 'reactflow';
import schemaData from '@/pages/designers/data-pipeline/data/mdata.json';
import OrderPopUp from '@/components/bh-reactflow-comps/builddata/OrderPopUp';
import { validateFormData } from '@/components/bh-reactflow-comps/builddata/validation';
import { NodeToolbar } from '@/components/bh-reactflow-comps/builddata/components/NodeToolbar';
import { NodeTitle } from '@/components/bh-reactflow-comps/builddata/components/NodeTitle';
import { NodeImage } from '@/components/bh-reactflow-comps/builddata/components/NodeImage';
import { NodeHandles } from '@/components/bh-reactflow-comps/builddata/components/NodeHandles';
import { NodeInfo } from '@/components/bh-reactflow-comps/builddata/components/NodeInfo';
import { ValidationIndicator } from '@/components/bh-reactflow-comps/builddata/components/ValidationIndicator';
import TargetPopUp from '@/components/bh-reactflow-comps/TargetPopUp';
import { usePipelineContext } from '@/context/designers/DataPipelineContext';
import { useFlow } from '@/context/designers/FlowContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { NodeForm } from '@/components/bh-reactflow-comps/flow/flow/subcomponents/NodeForm';

interface Schema {
  title: string;
  nodeId?: string;
  [key: string]: any;
}

type NodeType = 'flow' | 'pipeline';

export const SharedCustomNode = memo((props: any) => {
  // Detect which type of node we're dealing with based on props
  const nodeType: NodeType = 'meta' in props.data ? 'flow' : 'pipeline';

  return nodeType === 'pipeline' ? 
    <PipelineNode {...props} /> : 
    <FlowNode {...props} />;
});

// Add usePipelineContext but only when it's used in the PipelineNode
const PipelineNode = memo((props: any) => {
  const { 
    data, id, 
    style
  } = props;
  
  // Only use the pipeline context when needed
  const pipelineContext = usePipelineContext();
  const {
    setNodes,
    setSelectedSchema,
    setFormStates,
    setIsFormOpen,
    formStates,
    setRunDialogOpen,
    setSelectedFormState,
    handleDebugToggle,
    handleSearchResultClick
  } = pipelineContext;

  const [showToolbar, setShowToolbar] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(data.title);
  const edges = useEdges();
  const reactFlowInstance = useReactFlow();
  const [showInfo, setShowInfo] = useState(false);
  const [toolbarTimeout, setToolbarTimeout] = useState<NodeJS.Timeout | null>(null);
  const [validationStatus, setValidationStatus] = useState<'none' | 'valid' | 'warning' | 'error'>('none');
  const [validationMessages, setValidationMessages] = useState<string[]>([]);
  const [showValidationTooltip, setShowValidationTooltip] = useState(false);
  const [selectedSourceLabel, setSelectedSourceLabel] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null);
  const [isSelected, setIsSelected] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);

  // Get debuggedNodes as array and convert to Set for O(1) lookups
  const debuggedNodesArray = props.debuggedNodes || [];
  const debuggedNodes = new Set(Array.isArray(debuggedNodesArray) ? debuggedNodesArray : []);

  // Add useEffect to check validation status whenever formStates changes
  useEffect(() => {
    const formData = formStates[id];
    const nodeSchema = schemaData.schema.find((s: any) => s.title === data.label);
    const isSource = data.label?.toLowerCase()?.includes("source");

    // Set initial title from data.label if it exists
    if (data.title) {
      setTitleValue(data.title);
      setNodes((nodes: any[]) =>
        nodes.map(node =>
          node.id === id
            ? { ...node, data: { ...node.data, title: data.title } }
            : node
        )
      );
    }

    // Validation logic
    if (isSource) {
      const { isValid, warnings } = validateFormData(formData, nodeSchema, true, data.source);
      setValidationStatus(isValid ? 'valid' : 'error');
      setValidationMessages(warnings);
      return;
    }

    if (formData) {
      const { isValid, warnings } = validateFormData(formData, nodeSchema, false, data.label?.toLowerCase() == "target" ? formData.target : null);
      setValidationStatus(isValid ? 'valid' : warnings.length > 0 ? 'warning' : 'error');
      setValidationMessages(warnings);
    } else {
      setValidationStatus('error');
      setValidationMessages(['Form not filled']);
    }
  }, [formStates, id, data.label, data.source, setNodes, data.title]);

  // Add effect to track form state
  useEffect(() => {
    const isNodeSelected = formStates[id] && pipelineContext.selectedSchema?.nodeId === id;
    setIsSelected(isNodeSelected);
  }, [formStates, id, pipelineContext.selectedSchema]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditingTitle(true);
  }, []);

  const handleImageHover = useCallback(() => {
    // Clear any existing timeout
    if (toolbarTimeout) {
      clearTimeout(toolbarTimeout);
    }
    setShowToolbar(true);
  }, [toolbarTimeout]);

  const handleImageLeave = useCallback(() => {
    // Set a new timeout
    const timeout = setTimeout(() => {
      setShowToolbar(false);
    }, 4000); // 4 seconds
    setToolbarTimeout(timeout);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (toolbarTimeout) {
        clearTimeout(toolbarTimeout);
      }
    };
  }, [toolbarTimeout]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const { setEdges, setNodes } = reactFlowInstance;
    setNodes((nodes: any[]) => nodes.filter(node => node.id !== id));
    setEdges((edges: any[]) => edges.filter(edge =>
      edge.source !== id && edge.target !== id
    ));
    if (debuggedNodes.has(id)) {
      handleDebugToggle(id, data.title);
    }

  }, [id, reactFlowInstance, debuggedNodes, handleDebugToggle, data.title]);

  const handleClone = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nodes: any[]) => {
      const nodeToClone = nodes.find(node => node.id === id);
      if (!nodeToClone) return nodes;

      const cloneCount = nodes.filter(node =>
        node.id.startsWith(`${id}_clone_`)
      ).length;

      const newNode = {
        ...nodeToClone,
        id: `${id}_clone_${Date.now()}`,
        position: {
          x: nodeToClone.position.x + (100 * (cloneCount + 1)),
          y: nodeToClone.position.y
        }
      };
      return [...nodes, newNode];
    });
  }, [id, setNodes]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingTitle(true);
  }, []);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Optional: Add additional validation here if needed
    setTitleValue(newValue);
  }, []);

  // Add function to check if title already exists
  const isTitleDuplicate = useCallback((newTitle: string, currentId: string) => {
    const existingNodes = reactFlowInstance.getNodes();
    return existingNodes.some(node =>
      node.id !== currentId &&
      (node.data.title === newTitle || node.data.label === newTitle)
    );
  }, [reactFlowInstance]);

  const handleTitleBlur = useCallback(() => {
    setIsEditingTitle(false);
    setTitleError(null);

    const baseModuleName = data.label.split(' ')[0];

    if (titleValue === baseModuleName && isTitleDuplicate(baseModuleName, id)) {
      setTitleError('This name is already in use');
      setTitleValue(data.title);
      return;
    }

    if (isTitleDuplicate(titleValue, id)) {
      setTitleError('This name is already in use');
      setTitleValue(data.title);
      return;
    }

    setNodes((nodes: any[]) =>
      nodes.map(node =>
        node.id === id
          ? { ...node, data: { ...node.data, title: titleValue } }
          : node
      )
    );
  }, [id, setNodes, titleValue, data.label, data.title, isTitleDuplicate]);

  const handleInfo = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowInfo(true);
  }, []);

  const handleImageClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSelected(true);
    handleSearchResultClick(id);

    const schema = schemaData.schema.find(
      (s: Schema) => s.title === data.label
    );

    if (schema) {
      // Get the existing form state for this node
      const existingFormState = formStates[id];

      // Get the transformation data from the node
      const transformationData = data.transformationData;

      // Combine existing form state with transformation data
      const combinedState = {
        ...existingFormState,
        ...transformationData,
        // Preserve the name if it exists
        name: data.title || existingFormState?.name
      };

      setSelectedSchema({
        ...schema,
        nodeId: id,
        // Pass the combined state as initial values
        initialValues: combinedState
      });

      // Update form states with combined state
      setFormStates((prev: any) => ({
        ...prev,
        [id]: combinedState
      }));

      setIsFormOpen(true);
    } else {
      // console.log('Schema not found for:', data);
      if (data?.source || data?.label === "Reader") {
        setSelectedSourceLabel("Source");
        setSelectedSource(data?.source);
      }
      if (data?.label.toLowerCase() === "target" || data?.title.toLowerCase() === "target") {
        setSelectedSourceLabel("target");
        let targetData = data;
        targetData.source = data?.source ? data?.source : data;
        setSelectedSource(targetData);

        // Update the node title immediately when target configuration is updated
        setNodes((nodes: any[]) =>
          nodes.map(node =>
            node.id === id
              ? {
                ...node,
                data: {
                  ...node.data,
                  title: targetData.source.name || targetData.source.title || "Target",
                  source: targetData.source
                }
              }
              : node
          )
        );
      }
    }
  }, [data, id, formStates, setSelectedSchema, setFormStates, setIsFormOpen, handleSearchResultClick, setNodes]);



  const handleDebug = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    handleDebugToggle(id, titleValue);
  }, [id, titleValue, handleDebugToggle]);

  const handleNodeClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    handleSearchResultClick(id);
  }, [id, handleSearchResultClick]);


  return (
    <div
      className="relative group"
      style={{
        minWidth: 50,
        ...style
      }}
      onClick={handleNodeClick}
    >
      {/* Debug indicator */}
      {debuggedNodes.has(id) && (
        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm z-10" />
      )}

      {/* Main node content */}
      <div className="relative">
        <NodeToolbar
          show={showToolbar}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onInfo={handleInfo}
          onClone={handleClone}
          onDebug={handleDebug}
          isDebugged={debuggedNodes.has(id)}
        />

        <NodeTitle
          isEditing={isEditingTitle}
          value={titleValue}
          onChange={handleTitleChange}
          onBlur={handleTitleBlur}
          onDoubleClick={handleDoubleClick}
          error={titleError}
          isSelected={isSelected}
          label={data.label}
        />

        <NodeImage
          data={data}
          isSelected={isSelected}
          onImageClick={handleImageClick}
          onMouseEnter={handleImageHover}
          onMouseLeave={handleImageLeave}
          formStates={formStates}
          id={id}
        />
      </div>

      <ValidationIndicator
        data={data}
        validationStatus={validationStatus}
        validationMessages={validationMessages}
        showTooltip={showValidationTooltip}
        onTooltipEnter={() => setShowValidationTooltip(true)}
        onTooltipLeave={() => setShowValidationTooltip(false)}
      />

      <NodeHandles data={data} />

      {showInfo && (
        <NodeInfo
          data={data}
          titleValue={titleValue}
          debuggedNodes={debuggedNodes}
          id={id}
          formStates={formStates}
          onClose={() => setShowInfo(false)}
        />
      )}

      {/* Popups */}
      {selectedSourceLabel === "Source" && (
        <OrderPopUp
          isOpen={true}
          onClose={() => setSelectedSourceLabel(null)}
          source={selectedSource}
          nodeId={id}
          onSourceUpdate={props.onSourceUpdate}
        />
      )}

      {selectedSourceLabel === "target" && (
        <TargetPopUp
          isOpen={true}
          onClose={() => setSelectedSourceLabel(null)}
          source={selectedSource}
          nodeId={id}
          onSourceUpdate={props.onSourceUpdate}
        />
      )}
    </div>
  );
});

// Flow node implementation
const FlowNode = memo(({ id, data, selected }: NodeProps<any>) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isNodeTapModalOpen, setIsNodeTapModalOpen] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { selectNode, revertOrSaveData, updateNodeDimensions } = useFlow();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  const updateNodeInternals = useUpdateNodeInternals();
  
  // Track node dimensions for responsive layout
  useEffect(() => {
    if (nodeRef.current) {
      const observer = new ResizeObserver((entries) => {
        const { width, height } = entries[0].contentRect;
        setDimensions({ width, height });
        
        // Update node dimensions in context to help with layout calculations
        updateNodeDimensions?.(id, { width, height });
        
        // Force ReactFlow to recalculate handles positions
        updateNodeInternals(id);
      });
      
      observer.observe(nodeRef.current);
      return () => observer.disconnect();
    }
  }, [id, updateNodeInternals, updateNodeDimensions]);

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

  // Calculate appropriate sheet size based on viewport
  const getSheetSize = () => {
    const viewportWidth = window.innerWidth;
    if (viewportWidth < 640) return "w-[95vw]";
    if (viewportWidth < 1024) return "w-[70vw]";
    return "w-[45vw]";
  };
  
  // Create node data adapted for DataPipeline components
  const adaptedData = {
    ...data,
    label: data.meta?.moduleInfo?.label || 'Flow Node',
    title: data.meta?.renameType || data.selectedData || data.meta?.moduleInfo?.label || 'Flow Node',
    icon: data.meta?.moduleInfo?.icon
  };

  return (
    <>
      <div
        ref={nodeRef}
        className={`relative group p-0 bg-transparent select-none transition-shadow ${
          selected ? "shadow-lg" : ""
        }`}
        onMouseEnter={showToolbar}
        onMouseLeave={hideToolbar}
        onDoubleClick={handleDoubleClick}
        data-testid={`node-${id}`}
      >
        {/* Use DataPipeline-style components but with Flow node data */}
        <div className="relative">
          <NodeToolbar 
            show={isHovered}
            onEdit={handleDoubleClick}
            onDelete={() => {}}
            onInfo={() => {}}
            onClone={() => {}}
            onDebug={() => {}}
            isDebugged={false}
          />

          <NodeTitle 
            isEditing={false}
            value={adaptedData.title}
            onChange={() => {}}
            onBlur={() => {}}
            onDoubleClick={handleDoubleClick}
            error={null}
            isSelected={selected}
            label={adaptedData.label}
          />

          <NodeImage 
            data={adaptedData}
            isSelected={selected}
            onImageClick={handleDoubleClick}
            onMouseEnter={showToolbar}
            onMouseLeave={hideToolbar}
            formStates={{}}
            id={id}
          />
        </div>

        <NodeHandles data={adaptedData} />
        
        {/* Optional debug info - remove in production */}
        {false && (
          <div className="absolute bottom-0 right-0 text-[8px] text-gray-500 bg-white/80 px-1 rounded">
            {dimensions.width.toFixed(0)}x{dimensions.height.toFixed(0)}
          </div>
        )}
      </div>
      
      {/* Flow-specific config sheet */}
      <Sheet
        open={isNodeTapModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            revertOrSaveData(id, false);
          }
          setIsNodeTapModalOpen(open);
        }}
      >
        <SheetContent side="right" className={getSheetSize()}>
          <SheetHeader>
            <SheetTitle>Configure Node Properties</SheetTitle>
          </SheetHeader>
          <div className="max-h-[calc(100vh-10rem)] overflow-y-auto pb-4">
            <NodeForm
              id={id}
              closeTap={() => {
                setIsNodeTapModalOpen(false);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
});