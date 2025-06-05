import { memo, useMemo, useState, useEffect } from "react";
import { useReactFlow } from "reactflow";
import { useTransformationOutputQuery } from "@/lib/hooks/useTransformationOutput";
import { HiChartBar } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { fetchTransformationOutput } from "@/store/slices/designer/buildPipeLine/BuildPipeLineSlice";
import { AppDispatch, RootState } from '@/store';
import { Loader } from 'lucide-react';
import { usePipelineContext } from "@/context/designers/DataPipelineContext";
import { useSidebar } from "@/context/SidebarContext";
import MetricsDrawerContent from "./MetricsDrawerContent";
import { DataTable } from "@/components/bh-table/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Terminal, PreviewData } from "./LogsPage";

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
                        <DataTable 
                            data={metricsData[0].rows}
                            columns={columns}
                            pagination={true}
                        />
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
    const { debuggedNodesList, pipelineName } = usePipelineContext();
    // Get isFlow from Redux store
    const { isFlow } = useSelector((state: RootState) => state.buildPipeline);
    
    // Track if our metrics are currently being shown in the drawer
    const [isShowingInDrawer, setIsShowingInDrawer] = useState(false);
    
    const queryParams = useMemo(() => ({
        pipelineName: pipelineDtl?.pipeline_name,
        transformationName: getNode(source)?.data.title,
        isFlow,
        // Only enable the query when our metrics are being shown in the drawer
        enabled: isShowingInDrawer && isBottomDrawerOpen
    }), [pipelineDtl?.pipeline_name, source, getNode, isShowingInDrawer, isBottomDrawerOpen, isFlow]);

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

 

    const handleMetricsClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        
        // Only proceed if rowCount exists (meaning the node is in debug list)
        if (rowCount) {
            setIsEdgeLoading(true);
            setIsShowingInDrawer(true);
            
            try {
                // First fetch the data
                const result = await dispatch(fetchTransformationOutput({
                    pipelineName: pipelineName || pipelineDtl?.name || pipelineDtl?.pipeline_name,
                    transformationName: sourceNode?.data.title,
                    isFlow
                })).unwrap();
                
                console.log("Transformation output data:", result);
                
                // Format the data for the Terminal component
                const previewData: PreviewData = {
                    transformationName: sourceNode?.data.title || 'Transformation',
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
                
                // Set the drawer content
                setBottomDrawerContent(terminalComponent, `${sourceNode?.data.title || 'Transformation'} Data`);
            } catch (error) {
                console.error("Error fetching transformation output:", error);
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
        
        // If we have new metrics data and we're showing in drawer, update the drawer content
        if (metricsData && isShowingInDrawer && isBottomDrawerOpen) {
            // Format the data for the Terminal component
            const previewData: PreviewData = {
                transformationName: sourceNode?.data.title || 'Transformation',
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
        }
        
        // Clean up when component unmounts
        return () => {
            // If we're showing our content in the drawer, close it when unmounting
            if (isShowingInDrawer) {
                closeBottomDrawer();
                setIsShowingInDrawer(false);
            }
        };
    }, [isShowingInDrawer, isBottomDrawerOpen, closeBottomDrawer, metricsData, sourceNode?.data.title, pipelineDtl?.pipeline_name, pipelineName, isFlow]);

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
        width={140}
        height={40}
        x={edgeCenter.x - 70}
        y={edgeCenter.y - 20}
        className="edge-buttons"
        style={{ zIndex: 1000, pointerEvents: 'all' }}
        onMouseEnter={() => onHoverChange(true)}
        onMouseLeave={() => onHoverChange(false)}
        onClick={e => e.stopPropagation()}
    >
        <div className="flex items-center justify-between w-full h-full" onClick={e => e.stopPropagation()}>
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

    // Determine if the button is clickable
    const isClickable = rowCount && debuggedNodesList?.length > 0;

    return (
        <div className="flex items-center" onClick={e => e.stopPropagation()}>
            {rowCount && (
                <div className={`
                    flex flex-col items-center ml-8
                    ${isClickable ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed opacity-60'}
                    transition-opacity duration-200
                    bg-transparent p-0 rounded-md 
                `}>
                    <button
                        className={`
                            w-6 h-6 rounded-full flex items-center justify-center
                            ${isClickable ? 'bg-emerald-100 hover:bg-emerald-200' : 'bg-gray-100'}
                            transition-colors duration-200
                        `}
                        onClick={handleMetricsClick}
                        disabled={isLoading || !isClickable}
                        title={isClickable ? "View Data in Bottom Drawer" : "Debug mode not active"}
                    >
                        {isLoading ? (
                            <Loader size={14} className="animate-spin text-emerald-600" />
                        ) : (
                            <HiChartBar className={`w-4 h-4 ${isClickable ? 'text-emerald-600' : 'text-gray-400'}`} />
                        )}
                    </button>
                    <span 
                        className={`
                            font-medium min-w-[30px] text-center mt-1 text-[10px]
                            ${isClickable ? 'text-emerald-700 font-bold' : 'text-gray-500'}
                        `}
                    >
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
        className={`flex items-center justify-center w-6 h-6
                 bg-white rounded-full 
                 shadow-md border border-gray-200
                 hover:bg-red-50 hover:border-red-200
                 transition-all duration-200
                 ${isHovered ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClick}
        style={{
            pointerEvents: isHovered ? 'all' : 'none',
            transform: 'translateX(-40px)'
        }}
        title="Remove Edge"
    >
        <svg
            className="w-3.5 h-3.5 text-gray-500 hover:text-red-500
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