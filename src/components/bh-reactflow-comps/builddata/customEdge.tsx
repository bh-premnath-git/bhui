import { memo, useMemo, useState } from "react";
import { useReactFlow } from "reactflow";
import { useTransformationOutputQuery } from "@/lib/hooks/useTransformationOutput";
import PipeLinePopUp from "./pipeLinePopUp";
import { HiChartBar } from "react-icons/hi";
const edgeStyles = {
    stroke: '#b1b1b7',
    strokeWidth: 2,
    transition: 'stroke-width 0.2s, stroke 0.2s',
};

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
        />
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
    const [isMetricsOpen, setIsMetricsOpen] = useState(false);

    const { setEdges, getNode } = useReactFlow();
    const { data: metricsData, isLoading: isMetricsLoading } = useTransformationOutputQuery({
        pipelineName: pipelineDtl?.pipeline_name,
        transformationName: getNode(source)?.data.title
    });

    const sourceNode = getNode(source);
    
    const rowCount = transformationCounts.find(
        (t) => t.transformationName === sourceNode?.data.label?.toLowerCase()
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

    const handleMetricsClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMetricsOpen(true);
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

interface EdgeControlsProps {
    edgeCenter: { x: number; y: number };
    isHovered: boolean;
    rowCount?: number;
    onMetricsClick: (e: React.MouseEvent) => void;
    onRemove: (e: React.MouseEvent) => void;
    onHoverChange: (isHovered: boolean) => void;
}

const EdgeControls: React.FC<EdgeControlsProps> = ({
    edgeCenter,
    isHovered,
    rowCount,
    onMetricsClick,
    onRemove,
    onHoverChange
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
            <MetricsButton rowCount={rowCount} onClick={onMetricsClick} />
            <RemoveButton isHovered={isHovered} onClick={onRemove} />
        </div>
    </foreignObject>
);

interface MetricsButtonProps {
    rowCount?: number;
    onClick: (e: React.MouseEvent) => void;
}

const MetricsButton: React.FC<MetricsButtonProps> = ({ rowCount, onClick }) => (
    <div className="flex items-center">
        {rowCount && (
            <div className="flex flex-col items-center ml-8">
                <button
                    className="w-3 h-3"
                    onClick={onClick}
                >
                    <HiChartBar className="w-3 h-3 text-emerald-600" />
                </button>
                <span style={{ fontSize: '6px' }} className="font-medium text-gray-700 min-w-[24px] text-center">
                    {rowCount} rows
                </span>
            </div>
        )}
    </div>
);

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