// src/components/bh-reactflow-comps/shared/SharedCustomEdge.tsx
import React, { memo, useMemo, useState, useCallback } from "react";
import { useReactFlow, EdgeProps, getSmoothStepPath, MarkerType } from "reactflow";
import { useTransformationOutputQuery } from "@/lib/hooks/useTransformationOutput";
import PipeLinePopUp from "@/components/bh-reactflow-comps/builddata/pipeLinePopUp";
import { HiChartBar } from "react-icons/hi";
import { useDispatch } from "react-redux";
import { fetchTransformationOutput } from "@/store/slices/designer/buildPipeLine/BuildPipeLineSlice";
import { AppDispatch } from '@/store';
import { Loader, Trash2 } from 'lucide-react';
import { usePipelineContext } from "@/context/designers/DataPipelineContext";
import { useFlow } from "@/context/designers/FlowContext";

const edgeStyles = {
  stroke: '#b1b1b7',
  strokeWidth: 2,
  transition: 'stroke-width 0.2s, stroke 0.2s',
};

type EdgeType = 'flow' | 'pipeline';

// This determines if the custom edge is being used in a flow or pipeline context
// Flow edges must render with the same structure as the original Flow edge
export const SharedCustomEdge = memo((props: EdgeProps) => {
  // For now, always return FlowEdge for flow-playground URL
  // and PipelineEdge for other contexts
  const pathname = window.location.pathname;
  const isFlowPlayground = pathname.includes('flow-playground');
  
  if (isFlowPlayground) {
    return <FlowEdge {...props} />;
  }
  
  // Fallback to type detection based on props
  const edgeType: EdgeType = 'transformationCounts' in props ? 'pipeline' : 'flow';

  return edgeType === 'pipeline' ? 
    <PipelineEdge {...props} /> : 
    <FlowEdge {...props} />;
});

// Pipeline edge implementation
const PipelineEdge = memo((props: any) => {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    style = {},
    source,
    interactionWidth = 1,
    selected,
    pipelineDtl,
    transformationCounts = []
  } = props;

  const [isHovered, setIsHovered] = useState(false);
  const [isMetricsOpen, setIsMetricsOpen] = useState(false);
  const [isEdgeLoading, setIsEdgeLoading] = useState(false);

  const { setEdges, getNode } = useReactFlow();
  const dispatch = useDispatch<AppDispatch>();
  // Get the pipeline context
  const pipelineContext = usePipelineContext();
  const { debuggedNodesList } = pipelineContext;
  
  const queryParams = useMemo(() => ({
    pipelineName: pipelineDtl?.pipeline_name,
    transformationName: getNode(source)?.data.title,
    // Only enable the query when the metrics dialog is open
    enabled: isMetricsOpen
  }), [pipelineDtl?.pipeline_name, source, getNode, isMetricsOpen]);

  const { data: metricsData, isLoading: isMetricsLoading } = useTransformationOutputQuery(queryParams);
  const sourceNode = getNode(source);
  
  const rowCount = transformationCounts.find(
    (t: any) => t.transformationName?.toLowerCase() === sourceNode?.data.title?.toLowerCase()
  )?.rowCount;

  const edgeCenter = useMemo(() => ({
    x: (sourceX + targetX) / 2,
    y: (sourceY + targetY) / 2,
  }), [sourceX, targetX, sourceY, targetY]);

  const path = useMemo(() => {
    const controlPointOffset = Math.abs(targetX - sourceX) * 0.5;
    return `M ${sourceX} ${sourceY} 
            C ${sourceX + controlPointOffset} ${sourceY},
              ${targetX - controlPointOffset} ${targetY},
              ${targetX} ${targetY}`;
  }, [sourceX, sourceY, targetX, targetY]);

  const handleMetricsClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // Only proceed if rowCount exists (meaning the node is in debug list)
    if (rowCount) {
      setIsMetricsOpen(true);
      setIsEdgeLoading(true);
      try {
        await dispatch(fetchTransformationOutput({
          pipelineName: pipelineDtl?.pipeline_name,
          transformationName: sourceNode?.data.title
        }));
      } finally {
        setIsEdgeLoading(false);
      }
    }
  };

  const handleEdgeRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEdges(edges => edges.filter(edge => edge.id !== id));
  };

  return (
    <>
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={interactionWidth}
        className="react-flow__edge-interaction"
        style={{ pointerEvents: 'stroke' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      <path
        id={id}
        style={{
          ...edgeStyles,
          ...style,
          strokeWidth: selected || isHovered ? 1 : 1,
          stroke: selected || isHovered ? '#666' : '#b1b1b7',
        }}
        className="react-flow__edge-path"
        d={path}
      />

      {/* Edge Controls */}
      <EdgeControls
        edgeCenter={edgeCenter}
        isHovered={isHovered}
        rowCount={rowCount}
        onMetricsClick={handleMetricsClick}
        onRemove={handleEdgeRemove}
        onHoverChange={setIsHovered}
        isLoading={isEdgeLoading}
        debuggedNodesList={debuggedNodesList}
      />

      {/* Metrics Dialog */}
      <EdgeMetricsDialog
        isOpen={isMetricsOpen}
        onClose={() => setIsMetricsOpen(false)}
        metricsData={metricsData}
        isLoading={isMetricsLoading}
      />
    </>
  );
});

// Flow edge implementation
const FlowEdge = memo((props: EdgeProps) => {
  const {
    id,
    source,
    target,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerStart,
    markerEnd,
    selected,
  } = props;

  const [isHovered, setIsHovered] = useState(false);
  const flowContext = useFlow();
  const { deleteEdgeBySourceTarget } = flowContext;
  const { getNode } = useReactFlow();
  
  // Calculate path with improved curve for better visual flow
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16, // Smoother curves
  });

  const handleDelete = useCallback(() => {
    deleteEdgeBySourceTarget(source, target);
  }, [deleteEdgeBySourceTarget, source, target]);

  // Determine edge appearance based on selection state and hover
  const getStrokeWidth = () => {
    if (selected) return 2;
    if (isHovered) return 1.5;
    return 1;
  };

  // Use exactly the same structure as the original Flow edge
  return (
    <g 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="transition-opacity duration-300"
    >
      <path
        id={id}
        style={{
          ...style,
          strokeWidth: getStrokeWidth(),
          stroke: selected ? 'rgb(148 163 184)' : 'rgb(148 163 184)',
          transition: 'stroke 0.3s, stroke-width 0.3s',
        }}
        className={`react-flow__edge-path ${isHovered ? 'opacity-100' : 'opacity-80'}`}
        d={edgePath}
        markerStart={markerStart}
        markerEnd={markerEnd}
      />
      
      {/* Controls that appear on hover or selection */}
      {(isHovered || selected) && (
        <foreignObject
          width={24}
          height={24}
          x={(sourceX + targetX) / 2 - 12}
          y={(sourceY + targetY) / 2 - 12}
          requiredExtensions="http://www.w3.org/1999/xhtml"
          style={{ pointerEvents: 'all' }}
        >
          <div
            className="w-full h-full flex items-center justify-center rounded-full bg-white border border-red-500 hover:bg-red-50 transition-colors duration-200 shadow-sm"
            style={{ cursor: 'pointer' }}
          >
            <button
              onClick={handleDelete}
              className="flex items-center justify-center w-full h-full p-1"
              title="Delete Edge"
            >
              <Trash2 size={14} className="text-red-500" />
            </button>
          </div>
        </foreignObject>
      )}
    </g>
  );
});

// Shared components

interface EdgeMetricsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  metricsData: any[] | null;
  isLoading: boolean;
}

const EdgeMetricsDialog: React.FC<EdgeMetricsDialogProps> = ({
  isOpen,
  onClose,
  metricsData,
}) => {
  return (
    <PipeLinePopUp
      open={isOpen}
      handleClose={onClose}
      transformData={metricsData?.[0]?.rows ?? []}
      pipelineName={metricsData?.[0]?.name ?? ''}
    />
  );
};

interface EdgeControlsProps {
  edgeCenter: { x: number; y: number };
  isHovered: boolean;
  rowCount?: number;
  onMetricsClick: (e: React.MouseEvent) => void;
  onRemove: (e: React.MouseEvent) => void;
  onHoverChange: (isHovered: boolean) => void;
  isLoading?: boolean;
  debuggedNodesList?: any;
}

const EdgeControls: React.FC<EdgeControlsProps> = ({
  edgeCenter,
  isHovered,
  rowCount,
  onMetricsClick,
  onRemove,
  onHoverChange,
  isLoading,
  debuggedNodesList
}) => (
  <foreignObject
    width={120}
    height={24}
    x={edgeCenter.x - 60}
    y={edgeCenter.y - 12}
    className="edge-buttons"
    style={{ zIndex: 1000, pointerEvents: 'all' }}
    onMouseEnter={() => onHoverChange(true)}
    onMouseLeave={() => onHoverChange(false)}
  >
    <div className="flex items-center justify-between w-full">
      <MetricsButton rowCount={rowCount} onClick={onMetricsClick} isLoading={isLoading} debuggedNodesList={debuggedNodesList} />
      <RemoveButton isHovered={isHovered} onClick={onRemove} />
    </div>
  </foreignObject>
);

interface MetricsButtonProps {
  rowCount?: number;
  onClick: (e: React.MouseEvent) => void;
  isLoading?: boolean;
  debuggedNodesList?: any;
}

const MetricsButton: React.FC<MetricsButtonProps> = ({ 
  rowCount, 
  onClick, 
  isLoading,
  debuggedNodesList
}) => {
  const handleMetricsClick = (e: React.MouseEvent) => {
    // Only trigger onClick if rowCount exists (meaning debug list is not empty)
    if (rowCount) {
      if(debuggedNodesList?.length > 0) {
        onClick(e);
      }
    }
  };

  return (
    <div className="flex items-center">
      {rowCount && (
        <div className="flex flex-col items-center ml-8">
          <button
            className="w-3 h-3"
            onClick={handleMetricsClick}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader size={12} className="animate-spin text-emerald-600" />
            ) : (
              <HiChartBar className="w-3 h-3 text-emerald-600" />
            )}
          </button>
          <span style={{ fontSize: '6px' }} className="font-medium text-gray-700 min-w-[24px] text-center">
            {rowCount} rows
          </span>
        </div>
      )}
    </div>
  );
};

interface RemoveButtonProps {
  isHovered: boolean;
  onClick: (e: React.MouseEvent) => void;
}

const RemoveButton: React.FC<RemoveButtonProps> = ({ isHovered, onClick }) => (
  <button
    className={`flex items-center justify-center w-4 h-4
               bg-white rounded-full 
               shadow-md border border-gray-200
               hover:bg-red-50 hover:border-red-200
               transition-all duration-200
               ${isHovered ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
    onClick={onClick}
    style={{
      pointerEvents: isHovered ? 'all' : 'none',
      transform: 'translateX(-50px)'
    }}
    title="Remove Edge"
  >
    <svg
      className="w-2.5 h-2.5 text-gray-500 hover:text-red-500
                 transition-colors duration-200"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  </button>
);