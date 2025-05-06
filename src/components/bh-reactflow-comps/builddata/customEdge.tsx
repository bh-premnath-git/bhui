import { memo, useMemo, useState, useEffect } from "react";
import { useReactFlow } from "reactflow";
import { useTransformationOutputQuery } from "@/lib/hooks/useTransformationOutput";
import { HiChartBar } from "react-icons/hi";
import { useDispatch } from "react-redux";
import { fetchTransformationOutput } from "@/store/slices/designer/buildPipeLine/BuildPipeLineSlice";
import { AppDispatch } from '@/store';
import { Loader } from 'lucide-react';
import { usePipelineContext } from "@/context/designers/DataPipelineContext";
import { useSidebar } from "@/context/SidebarContext";
import MetricsDrawerContent from "./MetricsDrawerContent";

const edgeStyles = {
    stroke: '#b1b1b7',
    strokeWidth: 2,
    transition: 'stroke-width 0.2s, stroke 0.2s',
};

// Wrapper component for the BottomDrawer content
const MetricsDrawerWrapper: React.FC<{
    metricsData: any[] | null;
    isLoading: boolean;
}> = ({ metricsData }) => {
    console.log(metricsData, "metricsData");
    return (
        <div className="w-full h-full">
            <MetricsDrawerContent
                transformData={metricsData?.[0]?.rows ?? []}
                pipelineName={metricsData?.[0]?.name ?? ''}
            />
        </div>
    );
};

interface CustomEdgeProps {
    id: string;
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
    style?: React.CSSProperties;
    source: string;
    transformationCounts: Array<{ transformationName: string; rowCount: number }>;
    interactionWidth?: number;
    selected?: boolean;
    pipelineDtl: any;
}

export const CustomEdge = memo(({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    style = {},
    source,
    transformationCounts,
    interactionWidth = 1,
    selected,
    pipelineDtl
}: CustomEdgeProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isEdgeLoading, setIsEdgeLoading] = useState(false); 

    const { setEdges, getNode } = useReactFlow();
    const dispatch = useDispatch<AppDispatch>();
    const { setBottomDrawerContent, closeBottomDrawer, isBottomDrawerOpen } = useSidebar();
    const { debuggedNodesList } = usePipelineContext();
    
    // Track if our metrics are currently being shown in the drawer
    const [isShowingInDrawer, setIsShowingInDrawer] = useState(false);
    
    const queryParams = useMemo(() => ({
        pipelineName: pipelineDtl?.pipeline_name,
        transformationName: getNode(source)?.data.title,
        // Only enable the query when our metrics are being shown in the drawer
        enabled: isShowingInDrawer && isBottomDrawerOpen
    }), [pipelineDtl?.pipeline_name, source, getNode, isShowingInDrawer, isBottomDrawerOpen]);

    const { data: metricsData, isLoading: isMetricsLoading } = useTransformationOutputQuery(queryParams);
    const sourceNode = getNode(source);
    
    const rowCount = transformationCounts.find(
        (t) => t.transformationName?.toLowerCase() === sourceNode?.data.title?.toLowerCase()
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

    // Create drawer content with the metrics data
    const createDrawerContent = () => (
        <MetricsDrawerWrapper 
            metricsData={metricsData} 
            isLoading={isMetricsLoading} 
        />
    );

    const handleMetricsClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        
        // Only proceed if rowCount exists (meaning the node is in debug list)
        if (rowCount) {
            setIsEdgeLoading(true);
            setIsShowingInDrawer(true);
            
            try {
                // First fetch the data
                await dispatch(fetchTransformationOutput({
                    pipelineName: pipelineDtl?.pipeline_name,
                    transformationName: sourceNode?.data.title
                }));
                
                // Then set the drawer content and open it
                const title = `${sourceNode?.data.title || 'Transformation'} Metrics`;
                
                // Use setTimeout to ensure this runs after the current event loop
                setTimeout(() => {
                    setBottomDrawerContent(createDrawerContent(), title);
                }, 0);
            } finally {
                setIsEdgeLoading(false);
            }
        }
    };

    // Effect to handle drawer state changes
    useEffect(() => {
        // If we're showing our content in the drawer and the drawer is closed externally,
        // update our local state
        if (isShowingInDrawer && !isBottomDrawerOpen) {
            setIsShowingInDrawer(false);
        }
        
        // Clean up when component unmounts
        return () => {
            // If we're showing our content in the drawer, close it when unmounting
            if (isShowingInDrawer) {
                closeBottomDrawer();
                setIsShowingInDrawer(false);
            }
        };
    }, [isShowingInDrawer, isBottomDrawerOpen, closeBottomDrawer,metricsData]);

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
        </>
    );
});

interface EdgeControlsProps {
    edgeCenter: { x: number; y: number };
    isHovered: boolean;
    rowCount?: number;
    onMetricsClick: (e: React.MouseEvent) => void;
    onRemove: (e: React.MouseEvent) => void;
    onHoverChange: (isHovered: boolean) => void;
    isLoading: boolean;
    debuggedNodesList:any
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
        onClick={e => e.stopPropagation()}
    >
        <div className="flex items-center justify-between w-full" onClick={e => e.stopPropagation()}>
            <MetricsButton rowCount={rowCount} onClick={onMetricsClick} isLoading={isLoading} debuggedNodesList={debuggedNodesList} />
            <RemoveButton isHovered={isHovered} onClick={onRemove} />
        </div>
    </foreignObject>
);

interface MetricsButtonProps {
    rowCount?: number;
    onClick: (e: React.MouseEvent) => void;
    isLoading?: boolean;
    debuggedNodesList:any
}

const MetricsButton: React.FC<MetricsButtonProps & { isLoading?: boolean }> = ({ 
    rowCount, 
    onClick, 
    isLoading,
    debuggedNodesList
}) => {
    const handleMetricsClick = (e: React.MouseEvent) => {
        // Prevent event propagation
        e.stopPropagation();
        e.preventDefault();
        
        // Only trigger onClick if rowCount exists and debug list is not empty
        if (rowCount && debuggedNodesList?.length > 0) {
            onClick(e);
        }
    };

    return (
        <div className="flex items-center" onClick={e => e.stopPropagation()}>
            {rowCount && (
                <div className="flex flex-col items-center ml-8">
                    <button
                        className="w-3 h-3"
                        onClick={handleMetricsClick}
                        disabled={isLoading}
                        title="View Metrics in Bottom Drawer"
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