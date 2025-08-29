import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Handle, Position, useEdges, useReactFlow, useNodeId, useUpdateNodeInternals } from '@xyflow/react';

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
    
    // Listen for connection start/end events and custom update events
    useEffect(() => {
        const onConnectionStart = () => setIsConnectionDragging(true);
        const onConnectionEnd = () => setIsConnectionDragging(false);
        
        // Handler for custom updateNodeInternals event
        const onUpdateNodeInternals = (event: CustomEvent) => {
            const { nodeId: eventNodeId } = event.detail;
            if (eventNodeId === nodeId) {
                console.log('NodeHandles: Received updateNodeInternals event for this node:', nodeId);
                updateNodeInternals(nodeId);
                
                // Force a second update after a short delay
                setTimeout(() => {
                    updateNodeInternals(nodeId);
                }, 50);
            }
        };
        
        // Add event listeners to the document
        document.addEventListener('connectionstart', onConnectionStart);
        document.addEventListener('connectionend', onConnectionEnd);
        window.addEventListener('updateNodeInternals', onUpdateNodeInternals as EventListener);
        
        return () => {
            // Clean up event listeners
            document.removeEventListener('connectionstart', onConnectionStart);
            document.removeEventListener('connectionend', onConnectionEnd);
            window.removeEventListener('updateNodeInternals', onUpdateNodeInternals as EventListener);
        };
    }, [nodeId, updateNodeInternals]);
    
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
        const spacing = handleCount > 6 ? 8 : handleCount > 4 ? 10 : 12;
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
        
        // If this is an "unlimited" input node or has multiple inputs, check if we need to add more handles
        if (data.ports?.maxInputs === "unlimited" || (typeof data.ports?.maxInputs === 'number' && data.ports?.maxInputs > 1)) {
            // Find the highest connected handle index
            let highestConnectedIndex = -1;
            let customHandleIndices = new Set<number>();
            
            connectedInputs.forEach(handleId => {
                if (handleId.startsWith('input-')) {
                    // Handle both numeric indices and custom handles like 'input-node-123'
                    const parts = handleId.split('-');
                    if (parts.length === 2) {
                        // Standard format: input-0, input-1, etc.
                        const index = parseInt(parts[1], 10);
                        if (!isNaN(index)) {
                            highestConnectedIndex = Math.max(highestConnectedIndex, index);
                        }
                    } else if (parts.length > 2) {
                        // Custom format: input-node-123, etc.
                        // For these, we need to ensure we have enough handles
                        customHandleIndices.add(connectedInputs.size); // Just count them
                    }
                }
            });
            
            // Calculate how many handles we need
            const numCustomHandles = customHandleIndices.size;
            const numStandardHandles = highestConnectedIndex + 1;
            const totalConnectedHandles = Math.max(numCustomHandles, numStandardHandles);
            
            // Always ensure we have one more handle than the highest connected one
            // This extra handle will be our "plus" handle
            if (totalConnectedHandles > 0) {
                setInputHandlesCount(totalConnectedHandles + 1); // +1 for one extra "plus" handle
            } else {
                // If no connections, keep at least 2 handles (1 regular + 1 plus)
                setInputHandlesCount(2);
            }
        }
        
        // Force update node internals to ensure handles are properly rendered
        if (nodeId) {
            updateNodeInternals(nodeId);
            // Second update after a short delay to ensure everything is rendered
            setTimeout(() => {
                updateNodeInternals(nodeId);
            }, 50);
        }
    }, [edges, nodeId, data.ports?.maxInputs, updateNodeInternals]);

    // Calculate the position for each handle to ensure even vertical spacing
    const calculateHandlePosition = useCallback((index: number, totalHandles: number) => {
        // Top-align handles with a small offset; reduce spacing as count grows
        const spacing = totalHandles > 6 ? 8 : totalHandles > 4 ? 10 : 12;
        const startOffset = 6; // px padding from top
        return `calc(${startOffset}px + ${index * spacing}px)`;
    }, []);

    // Function to render a single input handle
    const renderInputHandle = useCallback((index: number) => {
        const handleId = `input-${index}`;
        
        // Check if this handle is connected
        const isConnected = connectedHandles.has(handleId);
        
        // Also check for custom handles that might match this index position
        const customHandleConnected = Array.from(connectedHandles).some(handle => {
            if (handle.startsWith('input-') && handle !== handleId) {
                // For custom handles like 'input-node-123', we need to check if they're at this position
                const connectedEdges = edges.filter(edge => 
                    edge.target === nodeId && edge.targetHandle === handle
                );
                
                // If we have a connected edge with this custom handle, check its position
                if (connectedEdges.length > 0) {
                    // We'll use the index of this handle in the connectedHandles set as its position
                    const handlePosition = Array.from(connectedHandles).indexOf(handle);
                    return handlePosition === index;
                }
            }
            return false;
        });
        
        const isLastHandle = index === inputHandlesCount - 1;
        const isMultiInputNode = data.ports?.maxInputs === "unlimited" || 
                                (typeof data.ports?.maxInputs === 'number' && data.ports?.maxInputs > 1);
        const isPlusHandle = isMultiInputNode && isLastHandle && !isConnected && !customHandleConnected;
        const position = calculateHandlePosition(index, inputHandlesCount);
        
        // For custom handles, we need to find the actual handle ID from the edges
        let actualHandleId = handleId;
        if (customHandleConnected) {
            // Find the edge that connects to this position
            const customHandles = Array.from(connectedHandles).filter(handle => 
                handle.startsWith('input-') && handle !== handleId
            );
            
            if (customHandles.length > index) {
                actualHandleId = customHandles[index];
            }
        }
        
        // Create port label (in1, in2, etc.)
        const portLabel = isPlusHandle ? "" : `in${index + 1}`;
        
        return (
            <div key={`handle-container-${index}`} className="relative" data-handle-id={actualHandleId}>
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
                                width: '6px',
                                height: '6px',
                                background: '#1890ff', // Blue color for plus handle
                                border: '1px solid #ffffff',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 0 3px rgba(24, 144, 255, 0.5)',
                                zIndex: -10, // Negative z-index to ensure it's behind the node image
                                left: 0,
                                transform: 'translate(-50%, -550%)',
                            }}
                            className="handle-input handle-plus"
                            isConnectable={true}
                        />
                        
                        {/* Plus sign overlay */}
                        <div 
                            className="absolute flex items-center justify-center pointer-events-none"
                            style={{
                                top: position,
                                left: '-30px',
                                width: '6px',
                                height: '6px',
                                color: 'white',
                                fontSize: '8px',
                                fontWeight: 'bold',
                                transform: 'translate(-50%, -350%)',
                                zIndex: -11, // Negative z-index to ensure it's behind the node image
                            }}
                        >
                            +
                        </div>
                    </>
                ) : (
                    <>
                        <Handle
                            type="target"
                            position={Position.Left}
                            id={actualHandleId}
                            style={{
                                top: position,
                                opacity: 1,
                                width: '6px', // Reduced size
                                height: '6px', // Reduced size
                                background: (isConnected || customHandleConnected) ? '#4CAF50' : '#ef4444',
                                border: `1px solid ${(isConnected || customHandleConnected) ? '#4CAF50' : '#ef4444'}`,
                                borderRadius: '50%',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: (isConnected || customHandleConnected)
                                    ? '0 0 4px rgba(76, 175, 80, 0.5)'
                                    : '0 0 4px rgba(239, 68, 68, 0.5)',
                                zIndex: -10, // Negative z-index to ensure it's behind the node image
                                left: 0,
                                transform: 'translate(-50%, -550%)',
                            }}
                            className={`handle-input handle-input-${index} ${
                                (isConnected || customHandleConnected) ? 'connected-handle' : ''
                            }`}
                            isConnectable={true}
                        />
                        
                        {/* Port label with enhanced visibility */}
                        <div 
                            className={`port-label port-label-input ${isConnected || customHandleConnected ? 'port-label-connected' : ''}`}
                            style={{
                                position: 'absolute',
                                top: position,
                                left: '-35px', // Position closer to the handle
                                transform: 'translateY(-50%)',
                                fontSize: '7px',
                                color: (isConnected || customHandleConnected) ? '#4CAF50' : '#666',
                                pointerEvents: 'none',
                                userSelect: 'none',
                                fontFamily: 'monospace',
                                zIndex: -9, // Above handle but below node content
                                whiteSpace: 'nowrap',
                                textShadow: '0px 0px 2px rgba(255, 255, 255, 0.8)', // Add text shadow for better visibility
                                fontWeight: (isConnected || customHandleConnected) ? 'bold' : 'normal',
                                transition: 'all 0.2s ease',
                                // backgroundColor: (isConnected || customHandleConnected || isConnectionDragging) ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
                                // padding: (isConnected || customHandleConnected || isConnectionDragging) ? '1px 4px' : '0',
                                borderRadius: '2px',
                                // border: (isConnected || customHandleConnected) ? '1px solid #e0e0e0' : 'none'
                            }}
                        >
                            {portLabel}
                        </div>
                    </>
                )}
            </div>
        );
    }, [connectedHandles, inputHandlesCount, calculateHandlePosition, data.ports?.maxInputs, edges, nodeId]);

    // Function to render a single output handle
    const renderOutputHandle = useCallback((index: number, totalOutputs: number) => {
        const position = calculateHandlePosition(index, totalOutputs);
        const handleId = `output-${index}`;
        
        // Check if this output handle has any connections (check both the visual handle and area handle)
        const isConnected = Array.from(edges).some(edge => 
            edge.source === nodeId && (edge.sourceHandle === handleId || edge.sourceHandle === `${handleId}-area`)
        );
        
        // Create port label (out1, out2, etc.)
        const portLabel = `out${index + 1}`;
        
        return (
            <div key={handleId} className="relative" data-handle-id={handleId} style={{ pointerEvents: 'none' }}>
                {/* Visual indicator to make output handle more noticeable */}
                <div 
                    className={`absolute output-handle-indicator ${isConnectionDragging ? 'connection-dragging' : ''}`}
                    style={{
                        top: position,
                        right: '0px',
                        width: isConnectionDragging ? '36px' : '32px', // Slightly smaller to match reduced handle size
                        height: isConnectionDragging ? '36px' : '32px', // Slightly smaller to match reduced handle size
                        transform: 'translateX(50%) translateY(-50%)',
                        background: isConnectionDragging 
                            ? 'radial-gradient(circle, rgba(128,128,128,0.5) 0%, rgba(128,128,128,0) 70%)' 
                            : 'radial-gradient(circle, rgba(128,128,128,0.2) 0%, rgba(128,128,128,0) 70%)',
                        borderRadius: '50%',
                        zIndex: -20, // Lower z-index to ensure it doesn't block the handle
                        opacity: isConnectionDragging ? 0.9 : 0.3, // Reduced opacity when not dragging to keep UI clean
                        transition: 'all 0.3s ease',
                        pointerEvents: 'none', // Changed to none to prevent blocking the handle
                        cursor: 'crosshair', // Match the cursor style of the handle
                    }}
                />
                
                {/* Port label with enhanced visibility */}
                <div 
                    className={`port-label port-label-output ${isConnected ? 'port-label-connected' : ''}`}
                    style={{
                        position: 'absolute',
                        top: position,
                        right: '4px', // Position closer to the handle
                        transform: 'translateY(-50%)',
                        fontSize: '10px',
                        color: isConnected ? '#4CAF50' : '#666',
                        pointerEvents: 'none',
                        userSelect: 'none',
                        fontFamily: 'monospace',
                        zIndex: -9, // Above handle but below node content
                        whiteSpace: 'nowrap',
                        textShadow: '0px 0px 2px rgba(255, 255, 255, 0.8)', // Add text shadow for better visibility
                        fontWeight: isConnected ? 'bold' : 'normal',
                        transition: 'all 0.2s ease',
                        backgroundColor: (isConnected || isConnectionDragging) ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
                        padding: (isConnected || isConnectionDragging) ? '1px 4px' : '0',
                        borderRadius: '2px',
                        border: isConnected ? '1px solid #e0e0e0' : 'none'
                    }}
                >
                    {portLabel}
                </div>
                
                {/* Invisible larger clickable area for easier connection */}
                <Handle
                    type="source"
                    position={Position.Right} 
                    id={`${handleId}-area`}
                    style={{
                        top: position,
                        opacity: 0, // Completely invisible
                        width: isConnectionDragging ? '20px' : '16px', // Larger invisible area (reduced to match smaller handles)
                        height: isConnectionDragging ? '20px' : '16px', // Larger invisible area (reduced to match smaller handles)
                        transform: 'translateX(50%) translateY(-50%)',
                        cursor: 'crosshair',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '50%', // Circle for larger hit area
                        zIndex: -14, // Slightly above the visual handle
                        right: 0,
                        pointerEvents: 'all'
                    }}
                    className="handle-output-area"
                    isConnectable={true}
                />
                
                {/* Visual handle - smaller but with same appearance */}
                <Handle
                    type="source"
                    position={Position.Right} 
                    id={handleId}
                    style={{
                        top: position,
                        opacity: 1,
                        width: isConnectionDragging ? '14px' : '12px',
                        height: isConnectionDragging ? '14px' : '12px',
                        transform: 'translateX(50%) translateY(-50%)',
                        cursor: 'crosshair',
                        background: isConnected ? '#4CAF50' : '#ef4444',
                        borderRadius: '0',
                        clipPath: 'polygon(0 0, 0 100%, 100% 50%)',
                        transition: 'all 0.3s ease',
                        zIndex: -15,
                        boxShadow: isConnected 
                            ? '0 0 4px rgba(76, 175, 80, 0.5)' 
                            : isConnectionDragging
                                ? '0 0 5px rgba(239, 68, 68, 0.6)'
                                : '0 0 4px rgba(239, 68, 68, 0.5)',
                        right: 0,
                        pointerEvents: 'none' // Disable pointer events for visual element since the area handle handles it
                    }}
                    className={`handle-output ${isConnected ? 'connected-output-handle' : ''}`}
                    isConnectable={false}
                />
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
                    z-index: -20 !important; /* Negative z-index but still visible */
                }
                
                /* Make edge paths more visible */
                .react-flow__edge-path {
                    stroke-width: 2px !important;
                    stroke: #b1b1b7 !important;
                    z-index: -20 !important;
                }
                
                /* Connected handle styling */
                .connected-handle {
                    box-shadow: 0 0 4px rgba(76, 175, 80, 0.4) !important;
                }
                
                /* Unconnected handle styling */
                .handle-input:not(.connected-handle) {
                    background: #ef4444 !important;
                    border: 1px solid #ef4444 !important;
                    box-shadow: 0 0 4px rgba(239, 68, 68, 0.5) !important;
                }
                
                .handle-output:not(.connected-output-handle) {
                    background: #ef4444 !important;
                    box-shadow: 0 0 4px rgba(239, 68, 68, 0.5) !important;
                }
                
                /* Plus handle subtle glow */
                .handle-plus {
                    box-shadow: 0 0 3px rgba(24, 144, 255, 0.5);
                }
                
                /* Ensure handles are always visible and interactive */
                .react-flow__handle {
                    pointer-events: all !important;
                    z-index: -10 !important; /* Negative z-index to ensure it's behind the node image */
                }
                
                /* Specifically target source handles to ensure they're clickable */
                .react-flow__handle-source {
                    pointer-events: all !important;
                    cursor: crosshair !important;
                    z-index: -10 !important;
                }
                
                /* Enhanced clickable area for output handles */
                .handle-output-area {
                    pointer-events: all !important;
                    cursor: crosshair !important;
                    z-index: -14 !important;
                    opacity: 0 !important;
                    border: none !important;
                    background: transparent !important;
                    transition: all 0.2s ease !important;
                }
                
                /* Hover effect for output handles - slightly increase visual indicator */
                .handle-output-area:hover + .handle-output {
                    transform: translateX(50%) translateY(-50%) scale(1.1) !important;
                }
                
                /* Specifically target target handles to ensure they're clickable */
                .react-flow__handle-target {
                    pointer-events: all !important;
                    z-index: -10 !important;
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
                    z-index: -5; /* Negative z-index but higher than handles to ensure proper layering */
                }
                
                .node-handles-container > div {
                    pointer-events: auto;
                }
                
                /* Simplified hover effects for input handles */
                .handle-input:hover {
                    transform: translate(-50%, -50%) scale(1.1) !important;
                    box-shadow: 0 0 4px rgba(0,0,0,0.2) !important;
                    z-index: -10 !important; /* Keep negative z-index even on hover */
                }
                
                /* Enhanced hover effects for output handles */
                .handle-output:hover {
                    transform: translateX(50%) translateY(-50%) scale(1.2) !important;
                    box-shadow: 0 0 6px rgba(119, 119, 119, 0.8) !important;
                    background-color: #666666 !important;
                    cursor: crosshair !important;
                    pointer-events: all !important;
                    z-index: -15 !important; /* Keep negative z-index even on hover */
                }
                
                /* Add a highlight effect when hovering near the handle */
                div[data-handle-id^="output-"]:hover::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    right: 0;
                    width: 36px; /* Increased to match the larger clickable area */
                    height: 36px; /* Increased to match the larger clickable area */
                    background: radial-gradient(circle, rgba(128,128,128,0.3) 0%, rgba(128,128,128,0) 70%);
                    border-radius: 50%;
                    transform: translateX(50%) translateY(-170%);
                    z-index: -16;
                    pointer-events: none;
                }
                
                /* Style for output handle indicator */
                .output-handle-indicator {
                    cursor: crosshair !important;
                    pointer-events: none !important; /* Ensure it doesn't block the handle */
                    z-index: -16 !important; /* Keep it behind the actual handle */
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
                    pointer-events: all !important;
                }
                
                /* Ensure the handle is always clickable */
                .handle-output {
                    pointer-events: all !important;
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
                
                /* Ensure connection lines are visible */
                .react-flow__connection-path {
                    stroke: #b1b1b7 !important;
                    stroke-width: 2px !important;
                    z-index: -20 !important;
                }
                
                /* Ensure connection lines are visible but behind nodes */
                .react-flow__connection {
                    z-index: -20 !important;
                }
                
                /* Port label styling */
                .port-label {
                    font-size: 10px;
                    color: #666;
                    pointer-events: none;
                    user-select: none;
                    font-family: monospace;
                    opacity: 0.8;
                    transition: all 0.2s ease;
                }
                
                /* Input port label positioning */
                .port-label-input {
                    text-align: left;
                    margin-left: 2px;
                }
                
                /* Output port label positioning */
                .port-label-output {
                    text-align: right;
                    margin-right: 2px;
                }
                
                /* Connected port label styling */
                .port-label-connected {
                    opacity: 1;
                    font-weight: bold;
                    color: #4CAF50;
                    background-color: rgba(255, 255, 255, 0.8);
                    padding: 1px 4px;
                    border-radius: 2px;
                    border: 1px solid #e0e0e0;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }
                
                /* Highlight port labels on hover */
                div[data-handle-id]:hover .port-label {
                    opacity: 1;
                    color: #333;
                    background-color: rgba(255, 255, 255, 0.9);
                    padding: 1px 4px;
                    border-radius: 2px;
                    z-index: 100;
                }
                
                /* Highlight port labels during connection dragging */
                .connection-dragging .port-label,
                .react-flow__handle:hover + .port-label {
                    opacity: 1;
                    font-weight: bold;
                    background-color: rgba(255, 255, 255, 0.9);
                    padding: 1px 4px;
                    border-radius: 2px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    z-index: 100;
                }
                `}
            </style>
            
            {/* Container for input handles with dynamic height */}
            <div 
                ref={handleContainerRef}
                className={`node-handles-container ${isConnectionDragging ? 'connection-dragging' : ''}`}
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
                    className={`node-output-handles-container ${isConnectionDragging ? 'connection-dragging' : ''}`}
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
                        minWidth: '40px', // Ensure enough width for the larger clickable areas
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