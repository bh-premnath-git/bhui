import { memo, useMemo, useState, useEffect, useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import { useTransformationOutputQuery } from "@/lib/hooks/useTransformationOutput";
import { HiChartBar } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { fetchTransformationOutput } from "@/store/slices/designer/buildPipeLine/BuildPipeLineSlice";
import { AppDispatch, RootState } from '@/store';
import { Loader, Scissors } from 'lucide-react';
import { usePipelineContext } from "@/context/designers/DataPipelineContext";
import { useSidebar } from "@/context/SidebarContext";
import MetricsDrawerContent from "./MetricsDrawerContent";
import { DataTable } from "@/components/bh-table/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Terminal, PreviewData } from "./LogsPage";
import { alignNodesToTopLeft } from '@/utils/nodeAlignment';

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
    //console.log(metricsData, "metricsData");
    
    // State to track drawer height for responsive table
    const [drawerHeight, setDrawerHeight] = useState<number>(520);
    
    // Listen for drawer resize events
    useEffect(() => {
        const handleDrawerResize = (event: CustomEvent) => {
            const newHeight = event.detail.height;
            setDrawerHeight(newHeight);
        };

        // Add event listener for drawer resize
        document.addEventListener('bottomDrawerResize', handleDrawerResize as EventListener);

        // Also listen for window resize events
        const handleWindowResize = () => {
            // Update drawer height from the container if it exists
            const container = document.getElementById('bottom-drawer-container');
            if (container) {
                const containerHeight = container.getBoundingClientRect().height;
                setDrawerHeight(containerHeight);
            }
        };

        window.addEventListener('resize', handleWindowResize);
        
        // Initial height check
        handleWindowResize();

        return () => {
            document.removeEventListener('bottomDrawerResize', handleDrawerResize as EventListener);
            window.removeEventListener('resize', handleWindowResize);
        };
    }, []);
    
    // Create columns for the DataTable based on the first row of data
    const columns = useMemo(() => {
        if (!metricsData?.[0]?.rows?.length) return [];
        
        // Get all keys from the first row
        const keys = Object.keys(metricsData[0].rows[0] || {});
        
        // Create column definitions for each key
        return keys.map(key => ({
            accessorKey: key,
            header: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '), // Format header with capitalization
            cell: ({ row }: any) => <div className="truncate max-w-[200px]" title={row.getValue(key)}>{row.getValue(key)}</div>
        }));
    }, [metricsData]);
    
    return (
        <div className="w-full h-full">
            <Tabs defaultValue="table" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="table">Table View</TabsTrigger>
                    <TabsTrigger value="metrics">Metrics View</TabsTrigger>
                </TabsList>
                
                <TabsContent value="table" className="w-full">
                    {metricsData?.[0]?.rows?.length > 0 ? (
                        <div style={{ height: `${Math.max(drawerHeight - 200, 200)}px` }}>
                            <DataTable 
                                data={metricsData[0].rows}
                                columns={columns}
                                pagination={true}
                            />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-40 text-gray-500">
                            No data available
                        </div>
                    )}
                </TabsContent>
                
                <TabsContent value="metrics">
                    <MetricsDrawerContent
                        transformData={metricsData?.[0]?.rows ?? []}
                        pipelineName={metricsData?.[0]?.name ?? ''}
                    />
                </TabsContent>
            </Tabs>
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
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
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
    target,
    sourceHandle,
    targetHandle,
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
    // Get isFlow from Redux store
    const { isFlow } = useSelector((state: RootState) => state.buildPipeline);
     const { 
        handleCenter,
        pipelineName, 
        debuggedNodesList,
        nodes, 
        edges, 
        updateSetNode, 
        reactFlowInstance,
        attachedCluster
      } = usePipelineContext()
    // Track if our metrics are currently being shown in the drawer
    const [isShowingInDrawer, setIsShowingInDrawer] = useState(false);
    
    const queryParams = useMemo(() => ({
        pipelineName: pipelineDtl?.pipeline_name,
        transformationName: (getNode(source)?.data.title as string) || '',
        isFlow,
        // Only enable the query when our metrics are being shown in the drawer
        enabled: isShowingInDrawer && isBottomDrawerOpen
    }), [pipelineDtl?.pipeline_name, source, getNode, isShowingInDrawer, isBottomDrawerOpen, isFlow]);

    const { data: metricsData, isLoading: isMetricsLoading } = useTransformationOutputQuery(queryParams);
    const sourceNode = getNode(source);

    // Function to align all nodes to top-left
    const handleAlignTopLeftClick = useCallback(() => {
        alignNodesToTopLeft(nodes, edges, updateSetNode, reactFlowInstance);
    }, [nodes, edges, updateSetNode, reactFlowInstance]);
    
    const rowCount = transformationCounts.find(
        (t) => t.transformationName?.toLowerCase() === (sourceNode?.data.title as string)?.toLowerCase()
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

    // Format connection labels with node names
    const connectionLabels = useMemo(() => {
        const formatHandle = (handle: string | undefined, type: 'source' | 'target') => {
            if (!handle) return '';
            
            // Extract the number from handle IDs like 'input-0', 'output-1', etc.
            const match = handle.match(/(\w+)-(\d+)/);
            if (match) {
                const [, handleType, index] = match;
                const num = parseInt(index) + 1; // Convert 0-based to 1-based
                return type === 'source' ? `out${num}` : `in${num}`;
            }
            return handle;
        };

        // Get node names
        const sourceNode = getNode(source);
        const targetNode = getNode(target);
        const sourceNodeName = sourceNode?.data?.title || sourceNode?.data?.label || 'Source';
        const targetNodeName = targetNode?.data?.title || targetNode?.data?.label || 'Target';

        return {
            source: {
                port: formatHandle(sourceHandle, 'source'),
                nodeName: sourceNodeName
            },
            target: {
                port: formatHandle(targetHandle, 'target'),
                nodeName: targetNodeName
            },
            // For the connection tooltip in the middle of the edge
            connection: `${sourceNodeName} → ${targetNodeName}`
        };
    }, [sourceHandle, targetHandle, source, target, getNode]);

    const handleMetricsClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        // Only proceed if rowCount exists (meaning the node is in debug list)
        if (rowCount) {
            setIsEdgeLoading(true);
            setIsShowingInDrawer(true);
        await handleAlignTopLeftClick();
            
            try {
                // First fetch the data
                const result = await dispatch(fetchTransformationOutput({
                    pipelineName: pipelineName || pipelineDtl?.name || pipelineDtl?.pipeline_name,
                    transformationName: (sourceNode?.data.title as string) || '',
                    host:attachedCluster.master_ip||"host.docker.internal",
                    isFlow
                })).unwrap();
                
                //console.log("Transformation output data:", result);
                
                // Format the data for the Terminal component
                const previewData: PreviewData = {
                    transformationName: (sourceNode?.data.title as string) || 'Transformation',
                    outputs: result.outputs || []
                };
                
                // Create the Terminal component with the preview data
                const terminalComponent = (
                    <Terminal 
                        isOpen={true}  // Set to true since we're opening it in the drawer
                        onClose={closeBottomDrawer}
                        title={`${sourceNode?.data.title || 'Transformation'} Data`}
                        previewData={previewData}
                        pipelineName={pipelineDtl?.pipeline_name || pipelineName}
                        activeTabOnOpen={isFlow ? "terminal" : "preview"}
                        // No need to explicitly pass isFlow as it's already in the Redux store
                    />
                );
                setBottomDrawerContent(terminalComponent, `${sourceNode?.data.title || 'Transformation'} Data`);
                
                // Realign all nodes to top-left when drawer is opened
                handleAlignTopLeftClick();
            } catch (error) {
                console.error("Error fetching transformation output:", error);
            } finally {
                setIsEdgeLoading(false);
            }
        }
    };

    // Effect to handle drawer state synchronization - only reacts to external drawer close
    useEffect(() => {
        // If we're showing our content in the drawer and the drawer is closed externally,
        // update our local state
        if (isShowingInDrawer && !isBottomDrawerOpen) {
            setIsShowingInDrawer(false);
        }
    }, [isShowingInDrawer, isBottomDrawerOpen]);

    // Effect to update drawer content when metrics data changes
    useEffect(() => {
        // Only update if we have metrics data, we're showing in drawer, and drawer is open
        if (metricsData && isShowingInDrawer && isBottomDrawerOpen) {
            // Format the data for the Terminal component
            const previewData: PreviewData = {
                transformationName: (sourceNode?.data.title as string) || 'Transformation',
                outputs: metricsData || []
            };
            
            // Create the Terminal component with the preview data
            const terminalComponent = (
                <Terminal 
                    isOpen={true}
                    onClose={closeBottomDrawer}
                    title={`${sourceNode?.data.title || 'Transformation'} Data`}
                    previewData={previewData}
                    pipelineName={pipelineDtl?.pipeline_name || pipelineName}
                    activeTabOnOpen={isFlow ? "terminal" : "preview"}
                    // No need to explicitly pass isFlow as it's already in the Redux store
                />
            );
            
            // Set the drawer content
            setBottomDrawerContent(terminalComponent, `${sourceNode?.data.title || 'Transformation'} Data`);
            
            // Realign all nodes to top-left when drawer is opened
            handleAlignTopLeftClick();
        }
    }, [metricsData, isShowingInDrawer, isBottomDrawerOpen, closeBottomDrawer, sourceNode?.data.title, pipelineDtl?.pipeline_name, pipelineName, isFlow, setBottomDrawerContent, handleAlignTopLeftClick]);

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

            {/* Connection Labels - Enhanced for better visibility on hover with node names */}
            {(connectionLabels.source.port || connectionLabels.target.port) && (
                <>
                    {/* Source Label */}
                    {connectionLabels.source.port && (
                        <g>
                            {/* Background for better visibility */}
                            {isHovered && (
                                <rect
                                    x={sourceX - 120}
                                    y={sourceY - 15}
                                    width={110}
                                    height={20}
                                    rx={4}
                                    ry={4}
                                    fill="rgba(255, 255, 255, 0.9)"
                                    stroke="#ddd"
                                    strokeWidth={1}
                                    className="connection-label-bg"
                                />
                            )}
                            <text
                                x={sourceX - 15}
                                y={sourceY - 5}
                                className={`text-xs font-medium ${isHovered ? 'fill-blue-600 font-bold' : 'fill-gray-600'}`}
                                textAnchor="end"
                                dominantBaseline="middle"
                                style={{
                                    transition: 'all 0.2s ease',
                                    fontSize: isHovered ? '12px' : '10px',
                                    opacity: isHovered ? 1 : 0.7,
                                    textShadow: isHovered ? '0 0 3px rgba(255, 255, 255, 0.8)' : 'none'
                                }}
                            >
                                {isHovered ? `${connectionLabels.source.nodeName} ${connectionLabels.source.port}` : connectionLabels.source.port}
                            </text>
                        </g>
                    )}
                    
                    {/* Target Label */}
                    {connectionLabels.target.port && (
                        <g>
                            {/* Background for better visibility */}
                            {isHovered && (
                                <rect
                                    x={targetX + 10}
                                    y={targetY - 15}
                                    width={110}
                                    height={20}
                                    rx={4}
                                    ry={4}
                                    fill="rgba(255, 255, 255, 0.9)"
                                    stroke="#ddd"
                                    strokeWidth={1}
                                    className="connection-label-bg"
                                />
                            )}
                            <text
                                x={targetX + 15}
                                y={targetY - 5}
                                className={`text-xs font-medium ${isHovered ? 'fill-blue-600 font-bold' : 'fill-gray-600'}`}
                                textAnchor="start"
                                dominantBaseline="middle"
                                style={{
                                    transition: 'all 0.2s ease',
                                    fontSize: isHovered ? '12px' : '10px',
                                    opacity: isHovered ? 1 : 0.7,
                                    textShadow: isHovered ? '0 0 3px rgba(255, 255, 255, 0.8)' : 'none'
                                }}
                            >
                                {isHovered ? `${connectionLabels.target.nodeName} ${connectionLabels.target.port}` : connectionLabels.target.port}
                            </text>
                        </g>
                    )}
                    
                    {/* Connection tooltip in the middle of the edge (only when hovering) */}
                    {isHovered && (
                        <g>
                            {/* Calculate tooltip width based on content */}
                            {(() => {
                                const sourceText = `${connectionLabels.source.nodeName} ${connectionLabels.source.port}`;
                                const targetText = `→ ${connectionLabels.target.nodeName} ${connectionLabels.target.port}`;
                                const maxLength = Math.max(sourceText.length, targetText.length);
                                // Estimate width based on text length (approx 6px per character)
                                const estimatedWidth = Math.max(160, maxLength * 6);
                                
                                return (
                                    <>
                                        <rect
                                            x={edgeCenter.x - (estimatedWidth / 2)}
                                            y={edgeCenter.y - 15}
                                            width={estimatedWidth}
                                            height={30}
                                            rx={4}
                                            ry={4}
                                            fill="rgba(255, 255, 255, 0.95)"
                                            stroke="#ccc"
                                            strokeWidth={1}
                                            className="connection-tooltip-bg"
                                        />
                                        <text
                                            x={edgeCenter.x}
                                            y={edgeCenter.y - 5}
                                            className="text-xs font-medium fill-gray-700 text-center"
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                        >
                                            {sourceText}
                                        </text>
                                        <text
                                            x={edgeCenter.x}
                                            y={edgeCenter.y + 10}
                                            className="text-xs font-medium fill-gray-700 text-center"
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                        >
                                            {targetText}
                                        </text>
                                    </>
                                );
                            })()}
                        </g>
                    )}
                </>
            )}

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
}) => {
    // Check if MetricsButton should be shown (when it has content)
    const showMetricsButton = rowCount && debuggedNodesList?.length > 0;
    
    // Adjust the foreignObject position to center the scissors button properly
    const foreignObjectX = showMetricsButton ? edgeCenter.x - 70 : edgeCenter.x - 70;
    
    return (
        <foreignObject
            width={140}
            height={40}
            x={foreignObjectX}
            y={edgeCenter.y - 20}
            className="edge-buttons"
            style={{ zIndex: 1000, pointerEvents: 'all' }}
            onMouseEnter={() => onHoverChange(true)}
            onMouseLeave={() => onHoverChange(false)}
            onClick={e => e.stopPropagation()}
        >
            <div className="flex items-center justify-center w-full h-full gap-2" onClick={e => e.stopPropagation()}>
                {showMetricsButton && (
                    <MetricsButton
                        isHovered={isHovered} 
                        onClick={onMetricsClick} 
                        isLoading={isLoading}
                        rowCount={rowCount}
                    />
                )}
                <RemoveButton isHovered={isHovered} onClick={onRemove} />
            </div>
        </foreignObject>
    );
};


interface MetricsButtonProps {
    isHovered: boolean;
    onClick: (e: React.MouseEvent) => void;
    isLoading: boolean;
    rowCount?: number;
}

const MetricsButton: React.FC<MetricsButtonProps> = ({ isHovered, onClick, isLoading, rowCount }) => (
    <button
        className={`flex items-center justify-center w-6 h-6
                 bg-white rounded-full 
                 shadow-md border border-gray-200
                 hover:bg-blue-50 hover:border-blue-200
                 transition-all duration-200
                 ${isHovered ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClick}
        style={{
            pointerEvents: isHovered ? 'all' : 'none'
        }}
        title={`View Metrics${rowCount ? ` (${rowCount} rows)` : ''}`}
        disabled={isLoading}
    >
        {isLoading ? (
            <Loader className="w-3.5 h-3.5 text-blue-500 animate-spin" />
        ) : (
            <HiChartBar className="w-3.5 h-3.5 text-gray-500 hover:text-blue-500 transition-colors duration-200" />
        )}
    </button>
);

interface RemoveButtonProps {
    isHovered: boolean;
    onClick: (e: React.MouseEvent) => void;
}

const RemoveButton: React.FC<RemoveButtonProps> = ({ isHovered, onClick }) => (
    <button
        className={`flex items-center justify-center w-6 h-6
                 bg-white rounded-full 
                 shadow-md border border-gray-200
                 hover:bg-red-50 hover:border-red-200
                 transition-all duration-200
                 ${isHovered ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClick}
        style={{
            pointerEvents: isHovered ? 'all' : 'none'
        }}
        title="Cut Connection"
    >
        <Scissors
            className="w-3.5 h-3.5 text-gray-500 hover:text-red-500
                     transition-colors duration-200"
        />
    </button>
);