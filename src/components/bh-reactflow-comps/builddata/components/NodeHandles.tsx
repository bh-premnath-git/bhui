import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Handle, Position, useEdges, useReactFlow, useNodeId, useUpdateNodeInternals } from 'reactflow';

interface NodeHandlesProps {
    data: {
        ports?: {
            inputs?: number;
            outputs?: number;
            maxInputs?: string | number;
            maxOutputs?: number;
        };
    };
}

export const NodeHandles: React.FC<NodeHandlesProps> = ({ data }) => {
    const nodeId = useNodeId();
    const edges = useEdges();
    const reactFlowInstance = useReactFlow();
    const updateNodeInternals = useUpdateNodeInternals();
    const isInitialRender = useRef(true);
    const handleContainerRef = useRef<HTMLDivElement>(null);
    
    // Track if a connection is being dragged (for visual feedback)
    const [isConnectionDragging, setIsConnectionDragging] = useState<boolean>(false);
    
    // Listen for connection start/end events
    useEffect(() => {
        const onConnectionStart = () => setIsConnectionDragging(true);
        const onConnectionEnd = () => setIsConnectionDragging(false);
        
        // Add event listeners to the document
        document.addEventListener('connectionstart', onConnectionStart);
        document.addEventListener('connectionend', onConnectionEnd);
        
        return () => {
            // Clean up event listeners
            document.removeEventListener('connectionstart', onConnectionStart);
            document.removeEventListener('connectionend', onConnectionEnd);
        };
    }, []);
    
    // Track the number of input handles to display
    const [inputHandlesCount, setInputHandlesCount] = useState<number>(
        data.ports?.maxInputs === "unlimited" 
            ? 2 // Start with 2 handles for unlimited inputs
            : (data.ports?.inputs || 1)
    );
    
    // Track which handles have connections
    const [connectedHandles, setConnectedHandles] = useState<Set<string>>(new Set());
    
    // Track if we should show the "add handle" indicator
    const [showAddHandleIndicator, setShowAddHandleIndicator] = useState<boolean>(false);

    // Calculate the height needed for the handle container
    const getHandleContainerHeight = useCallback(() => {
        const handleCount = inputHandlesCount;
        // Base height plus space for each handle - ensure enough space for all handles
        // Use smaller spacing when there are more handles
        const spacing = handleCount > 4 ? 12 : handleCount > 6 ? 8 : 16;
        return Math.max(80, handleCount * spacing + 20); // Adjust minimum height and padding
    }, [inputHandlesCount]);

    // Force React Flow to update the node internals when handles change
    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            // Even on initial render, we should update node internals to ensure proper positioning
            if (nodeId) {
                updateNodeInternals(nodeId);
            }
            return;
        }
        
        if (nodeId) {
            // This is crucial - it tells React Flow to recalculate the node's internals
            // including handle positions and connections
            
            // First immediate update
            updateNodeInternals(nodeId);
            
            // Second update after a short delay to ensure everything is rendered
            const timer = setTimeout(() => {
                updateNodeInternals(nodeId);
            }, 50);
            
            // Cleanup timeout
            return () => clearTimeout(timer);
        }
    }, [nodeId, inputHandlesCount, updateNodeInternals, edges]);

    // Update connected handles when edges change
    useEffect(() => {
        if (!nodeId) return;
        
        const connectedInputs = new Set<string>();
        
        // Find all edges that connect to this node's input handles
        edges.forEach(edge => {
            if (edge.target === nodeId) {
                connectedInputs.add(edge.targetHandle || '');
            }
        });
        
        setConnectedHandles(connectedInputs);
        
        // If this is an "unlimited" input node, check if we need to add more handles
        if (data.ports?.maxInputs === "unlimited") {
            // Find the highest connected handle index
            let highestConnectedIndex = -1;
            
            connectedInputs.forEach(handleId => {
                if (handleId.startsWith('input-')) {
                    const index = parseInt(handleId.split('-')[1], 10);
                    highestConnectedIndex = Math.max(highestConnectedIndex, index);
                }
            });
            
            // Always ensure we have one more handle than the highest connected one
            // This extra handle will be our "plus" handle
            if (highestConnectedIndex >= 0) {
                setInputHandlesCount(highestConnectedIndex + 2); // +2 for one extra "plus" handle
            } else {
                // If no connections, keep at least 2 handles (1 regular + 1 plus)
                setInputHandlesCount(2);
            }
        }
    }, [edges, nodeId, data.ports?.maxInputs]);

    // Calculate the position for each handle to ensure even vertical spacing
    const calculateHandlePosition = useCallback((index: number, totalHandles: number) => {
        // If there's only one handle, center it
        if (totalHandles === 1) {
            return '50%';
        }
        
        // For multiple handles, adjust spacing based on the number of handles
        // Use smaller spacing when there are more handles
        const spacing = totalHandles > 4 ? 10 : totalHandles > 6 ? 8 : 12;
        const totalHeight = (totalHandles - 1) * spacing;
        
        // Start position to center the group (percentage from top)
        const startPosition = 50 - (totalHeight / 2);
        
        // Calculate position for this specific handle
        return `calc(${startPosition}% + ${index * spacing}px)`;
    }, []);

    // Function to render a single input handle
    const renderInputHandle = useCallback((index: number) => {
        const handleId = `input-${index}`;
        const isConnected = connectedHandles.has(handleId);
        const isLastHandle = index === inputHandlesCount - 1;
        const isUnlimitedInputs = data.ports?.maxInputs === "unlimited";
        const isPlusHandle = isUnlimitedInputs && isLastHandle && !isConnected;
        const position = calculateHandlePosition(index, inputHandlesCount);
        
        return (
            <div key={handleId} className="relative" data-handle-id={handleId}>
                {isPlusHandle ? (
                    <>
                        {/* Special styling for the "plus" handle in unlimited input mode */}
                        <Handle
                            type="target"
                            position={Position.Left}
                            id={handleId}
                            style={{
                                top: position,
                                opacity: 1,
                                width: '8px',
                                height: '8px',
                                background: '#1890ff', // Blue color for plus handle
                                border: '1px solid #ffffff',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 0 3px rgba(24, 144, 255, 0.5)',
                                zIndex: 10,
                                left: 0,
                                transform: 'translate(-50%, -150%)',
                            }}
                            className="handle-input handle-plus"
                            isConnectable={true}
                        />
                        
                        {/* Plus sign overlay */}
                        <div 
                            className="absolute flex items-center justify-center pointer-events-none"
                            style={{
                                top: position,
                                left: '-4px',
                                width: '8px',
                                height: '8px',
                                color: 'white',
                                fontSize: '8px',
                                fontWeight: 'bold',
                                transform: 'translate(-50%, -150%)',
                                zIndex: -11,
                            }}
                        >
                            +
                        </div>
                    </>
                ) : (
                    <Handle
                        type="target"
                        position={Position.Left}
                        id={handleId}
                        style={{
                            top: position,
                            opacity: 1,
                            width: '10px',
                            height: '10px',
                            background: isConnected ? '#4CAF50' : '#777777',
                            border: `1px solid ${isConnected ? '#4CAF50' : '#ffffff'}`,
                            borderRadius: '50%',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: isConnected 
                                ? '0 0 4px rgba(76, 175, 80, 0.5)'
                                : '0 1px 3px rgba(0,0,0,0.15)',
                            zIndex: -10,
                            left: 0,
                            transform: 'translate(-50%, -150%)',
                        }}
                        className={`handle-input handle-input-${index} ${
                            isConnected ? 'connected-handle' : ''
                        }`}
                        isConnectable={true}
                    />
                )}
            </div>
        );
    }, [connectedHandles, inputHandlesCount, calculateHandlePosition, data.ports?.maxInputs]);

    // Function to render a single output handle
    const renderOutputHandle = useCallback((index: number, totalOutputs: number) => {
        const position = calculateHandlePosition(index, totalOutputs);
        const handleId = `output-${index}`;
        
        // Check if this output handle has any connections
        const isConnected = Array.from(edges).some(edge => 
            edge.source === nodeId && edge.sourceHandle === handleId
        );
        
        return (
            <div key={handleId} className="relative" data-handle-id={handleId}>
                {/* Visual indicator to make output handle more noticeable */}
                <div 
                    className={`absolute output-handle-indicator ${isConnectionDragging ? 'connection-dragging' : ''}`}
                    style={{
                        top: position,
                        right: '0px',
                        width: isConnectionDragging ? '30px' : '24px',
                        height: isConnectionDragging ? '30px' : '24px',
                        transform: 'translateX(50%) translateY(-50%)',
                        background: isConnectionDragging 
                            ? 'radial-gradient(circle, rgba(128,128,128,0.5) 0%, rgba(128,128,128,0) 70%)' 
                            : 'radial-gradient(circle, rgba(128,128,128,0.2) 0%, rgba(128,128,128,0) 70%)',
                        borderRadius: '50%',
                        zIndex: -5,
                        opacity: isConnectionDragging ? 0.9 : 0.7,
                        transition: 'all 0.3s ease',
                    }}
                />
                
                <Handle
                    type="source"
                    position={Position.Right}
                    id={handleId}
                    style={{
                        top: position,
                        opacity: 1,
                        width: isConnectionDragging ? '18px' : '16px',
                        height: isConnectionDragging ? '18px' : '16px',
                        transform: 'translateX(50%) translateY(-50%)',
                        cursor: 'pointer',
                        background: isConnected ? '#555555' : '#777777', // Gray color for better visibility
                        borderRadius: '0',
                        clipPath: 'polygon(0 0, 0 100%, 100% 50%)',
                        transition: 'all 0.3s ease',
                        zIndex: -15,
                        boxShadow: isConnected 
                            ? '0 0 4px rgba(85, 85, 85, 0.5)' 
                            : isConnectionDragging
                                ? '0 0 5px rgba(119, 119, 119, 0.6)'
                                : '0 0 3px rgba(119, 119, 119, 0.4)',
                        right: 0,
                    }}
                    className={`handle-output ${isConnected ? 'connected-output-handle' : ''}`}
                    isConnectable={true}
                />
                
                {/* Removed the number label */}
            </div>
        );
    }, [calculateHandlePosition, edges, nodeId, isConnectionDragging]);

    return (
        <>
            {/* Input Handles - Enhanced Circle style with dynamic addition */}
            <style>
                {`
                /* Improve ReactFlow performance */
                .react-flow__renderer {
                    will-change: transform;
                }
                
                /* Smoother node movement */
                .react-flow__node {
                    will-change: transform;
                    transition: transform 0.3s ease, opacity 0.3s ease !important;
                }
                
                /* Smoother edge rendering */
                .react-flow__edge {
                    will-change: transform;
                    pointer-events: stroke;
                }
                
                /* Connected handle styling */
                .connected-handle {
                    box-shadow: 0 0 4px rgba(76, 175, 80, 0.4) !important;
                }
                
                /* Plus handle subtle glow */
                .handle-plus {
                    box-shadow: 0 0 3px rgba(24, 144, 255, 0.5);
                }
                
                /* Ensure handles are always visible and interactive */
                .react-flow__handle {
                    pointer-events: all !important;
                }
                
                /* Handle container styling */
                .node-handles-container {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                
                .node-handles-container > div {
                    pointer-events: auto;
                }
                
                /* Simplified hover effects for input handles */
                .handle-input:hover {
                    transform: translate(-50%, -50%) scale(1.1) !important;
                    box-shadow: 0 0 4px rgba(0,0,0,0.2) !important;
                    z-index: 20 !important;
                }
                
                /* Enhanced hover effects for output handles */
                .handle-output:hover {
                    transform: translateX(50%) translateY(-50%) scale(1.2) !important;
                    z-index: 25 !important;
                    box-shadow: 0 0 6px rgba(119, 119, 119, 0.8) !important;
                    background-color: #666666 !important;
                }
                
                /* Add a highlight effect when hovering near the handle */
                div[data-handle-id^="output-"]:hover::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    right: 0;
                    width: 24px;
                    height: 24px;
                    background: radial-gradient(circle, rgba(128,128,128,0.3) 0%, rgba(128,128,128,0) 70%);
                    border-radius: 50%;
                    transform: translateX(50%) translateY(-50%);
                    z-index: 4;
                    pointer-events: none;
                }
                
                /* Connected output handle styling */
                .connected-output-handle {
                    box-shadow: 0 0 4px rgba(85, 85, 85, 0.5) !important;
                }
                
                /* Connection dragging state - enhanced */
                .connection-dragging {
                    opacity: 1 !important;
                    transform: translateX(50%) translateY(-50%) scale(1.3) !important;
                    background: radial-gradient(circle, rgba(128,128,128,0.5) 0%, rgba(128,128,128,0) 70%) !important;
                }
                
                /* Smoother transitions for all handles */
                .react-flow__handle-source,
                .react-flow__handle-target,
                .react-flow__handle {
                    transition: all 0.3s ease !important;
                }
                
                /* Smoother edge connections */
                .react-flow__edge-path {
                    stroke-width: 2;
                    transition: stroke 0.3s ease, stroke-width 0.3s ease;
                }
                
                /* Smoother node dragging */
                .react-flow__node.dragging {
                    transition: transform 0.3s ease, opacity 0.3s ease, box-shadow 0.3s ease !important;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15) !important;
                }
                `}
            </style>
            
            {/* Container for input handles with dynamic height */}
            <div 
                ref={handleContainerRef}
                className="node-handles-container"
                style={{ 
                    minHeight: getHandleContainerHeight(),
                    padding: '5px 0', // Reduced padding for more compact layout
                }}
            >
                {data.ports?.inputs > 0 && Array.from({ length: inputHandlesCount }).map((_, index) => 
                    renderInputHandle(index)
                )}
            </div>

            {/* Output Handles - Triangle style with container */}
            {data.ports?.outputs > 0 && (
                <div 
                    className="node-output-handles-container"
                    style={{ 
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                        padding: '5px 0',
                    }}
                >
                    {Array.from({
                        length: data.ports.maxOutputs || data.ports.outputs || 1
                    }).map((_, index) => {
                        const totalOutputs = data.ports?.maxOutputs || data.ports?.outputs || 1;
                        return renderOutputHandle(index, totalOutputs);
                    })}
                </div>
            )}
        </>
    );
};