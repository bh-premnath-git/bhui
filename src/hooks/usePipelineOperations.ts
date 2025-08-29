import { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';

interface UsePipelineOperationsProps {
    nodes: any[];
    edges: any[];
    setNodes: (nodes: any) => void;
    setEdges: (edges: any) => void;
    updateSetNode: (nodes: any, edges: any) => void;
    setFormStates: (formStates: any) => void;
    formStates: { [key: string]: any };
    copiedNodes: any[];
    copiedEdges: any[];
    copiedFormStates: { [key: string]: any };
    setCopiedNodes: (nodes: any[]) => void;
    setCopiedEdges: (edges: any[]) => void;
    setCopiedFormStates: (formStates: any) => void;
    history: Array<{ nodes: any; edges: any }>;
    setHistory: (history: any) => void;
    redoStack: Array<{ nodes: any; edges: any }>;
    setRedoStack: (redoStack: any) => void;
    setUnsavedChanges: () => void;
    addNodeToHistory: () => void;
    handleRun: () => void;
    handleStop: () => void;
    handleNext: () => void;
    handleLogsClick: () => void;
    handleDebugToggle: (nodeId: string, title: string) => void;
    reactFlowInstance: any;
    setSanitizedNodes: (nodes: any) => void;
    dispatch: any;
}

export const usePipelineOperations = ({
    nodes,
    edges,
    setNodes,
    setEdges,
    updateSetNode,
    setFormStates,
    formStates,
    copiedNodes,
    copiedEdges,
    copiedFormStates,
    setCopiedNodes,
    setCopiedEdges,
    setCopiedFormStates,
    history,
    setHistory,
    redoStack,
    setRedoStack,
    setUnsavedChanges,
    addNodeToHistory,
    handleRun,
    handleStop,
    handleNext,
    handleLogsClick,
    handleDebugToggle,
    reactFlowInstance,
    setSanitizedNodes,
    dispatch
}: UsePipelineOperationsProps) => {
    const { zoomIn, zoomOut, fitView } = useReactFlow();

    const handleCenter = useCallback(() => {
        try {
            // Use more generous padding and longer duration for better visibility
            fitView({
                duration: 800,
                padding: 0.2,
                includeHiddenNodes: false,
                minZoom: 0.5,
                maxZoom: 1.5
            });

            // Dispatch a custom event that other components can listen for
            const centerEvent = new CustomEvent('canvasCentered', {
                bubbles: true,
                detail: { timestamp: Date.now() }
            });
            document.dispatchEvent(centerEvent);

            // Force a resize event to ensure ReactFlow recalculates dimensions
            window.dispatchEvent(new Event('resize'));
        } catch (error) {
            console.error('FitView error:', error);

            // Fallback approach - try to use the ReactFlow instance directly
            try {
                const reactFlowViewport = document.querySelector('.react-flow__viewport');
                if (reactFlowViewport) {
                    // Reset transform to center view
                    reactFlowViewport.setAttribute('transform', 'translate(0,0) scale(0.85)');
                }

                // Try to click the fitView button as a last resort
                const fitViewButton = document.querySelector('.react-flow__controls-fitview');
                if (fitViewButton instanceof HTMLElement) {
                    fitViewButton.click();
                }
            } catch (fallbackError) {
                console.error('Fallback center approach failed:', fallbackError);
            }
        }
    }, [fitView]);

    const handleAlignHorizontal = useCallback(() => {
        if (nodes.length === 0) return;

        // Create a map of node levels (columns)
        const nodeLevels = new Map<string, number>();
        const visited = new Set<string>();

        // Find source nodes (nodes with no incoming edges)
        const sourceNodes = nodes.filter(node =>
            !edges.some(edge => edge.target === node.id)
        );

        // Assign levels through BFS
        const queue = sourceNodes.map(node => ({ id: node.id, level: 0 }));
        while (queue.length > 0) {
            const { id, level } = queue.shift()!;
            if (visited.has(id)) continue;

            visited.add(id);
            nodeLevels.set(id, level);

            // Find all outgoing edges from this node
            const outgoingEdges = edges.filter(edge => edge.source === id);
            outgoingEdges.forEach(edge => {
                if (!visited.has(edge.target)) {
                    queue.push({ id: edge.target, level: level + 1 });
                }
            });
        }

        // Get maximum level for spacing calculation
        const maxLevel = Math.max(...Array.from(nodeLevels.values()));
        const levelWidth = 200; // Horizontal spacing between levels
        const nodeSpacing = 150; // Vertical spacing between nodes in the same level

        // Group nodes by their levels
        const nodesByLevel = new Map<number, string[]>();
        nodeLevels.forEach((level, nodeId) => {
            if (!nodesByLevel.has(level)) {
                nodesByLevel.set(level, []);
            }
            nodesByLevel.get(level)!.push(nodeId);
        });

        // Calculate new positions
        const startX = 50;
        const startY = 50;
        const newNodes = nodes.map(node => {
            const level = nodeLevels.get(node.id) || 0;
            const nodesInLevel = nodesByLevel.get(level) || [];
            const indexInLevel = nodesInLevel.indexOf(node.id);

            return {
                ...node,
                position: {
                    x: startX + (level * levelWidth),
                    y: startY + (indexInLevel * nodeSpacing)
                }
            };
        });

        setSanitizedNodes(newNodes);

        // Center the view
        setTimeout(() => {
            const centerX = startX + (maxLevel * levelWidth) / 2;
            const maxNodesInLevel = Math.max(...Array.from(nodesByLevel.values()).map(n => n.length));
            const centerY = startY + (maxNodesInLevel * nodeSpacing) / 2;
            reactFlowInstance.setCenter(centerX, centerY, { duration: 800 });
        }, 50);

        setUnsavedChanges();
    }, [nodes, edges, setSanitizedNodes, reactFlowInstance, setUnsavedChanges]);

    const handleAlignVertical = useCallback(() => {
        if (nodes.length === 0) return;

        // Create a map of node levels (rows)
        const nodeLevels = new Map<string, number>();
        const visited = new Set<string>();

        // Find source nodes (nodes with no incoming edges)
        const sourceNodes = nodes.filter(node =>
            !edges.some(edge => edge.target === node.id)
        );

        // Assign levels through BFS
        const queue = sourceNodes.map(node => ({ id: node.id, level: 0 }));
        while (queue.length > 0) {
            const { id, level } = queue.shift()!;
            if (visited.has(id)) continue;

            visited.add(id);
            nodeLevels.set(id, level);

            // Find all outgoing edges from this node
            const outgoingEdges = edges.filter(edge => edge.source === id);
            outgoingEdges.forEach(edge => {
                if (!visited.has(edge.target)) {
                    queue.push({ id: edge.target, level: level + 1 });
                }
            });
        }

        // Get maximum level for spacing calculation
        const maxLevel = Math.max(...Array.from(nodeLevels.values()));
        const levelHeight = 150; // Vertical spacing between levels
        const nodeSpacing = 200; // Horizontal spacing between nodes in the same level

        // Group nodes by their levels
        const nodesByLevel = new Map<number, string[]>();
        nodeLevels.forEach((level, nodeId) => {
            if (!nodesByLevel.has(level)) {
                nodesByLevel.set(level, []);
            }
            nodesByLevel.get(level)!.push(nodeId);
        });

        // Calculate new positions
        const startX = 50;
        const startY = 50;
        const newNodes = nodes.map(node => {
            const level = nodeLevels.get(node.id) || 0;
            const nodesInLevel = nodesByLevel.get(level) || [];
            const indexInLevel = nodesInLevel.indexOf(node.id);

            return {
                ...node,
                position: {
                    x: startX + (indexInLevel * nodeSpacing),
                    y: startY + (level * levelHeight)
                }
            };
        });

        setSanitizedNodes(newNodes);

        // Center the view
        setTimeout(() => {
            const maxNodesInLevel = Math.max(...Array.from(nodesByLevel.values()).map(n => n.length));
            const centerX = startX + (maxNodesInLevel * nodeSpacing) / 2;
            const centerY = startY + (maxLevel * levelHeight) / 2;
            reactFlowInstance.setCenter(centerX, centerY, { duration: 800 });
        }, 50);

        setUnsavedChanges();
    }, [nodes, edges, setSanitizedNodes, reactFlowInstance, setUnsavedChanges]);

    const handleAlignTopLeft = useCallback(() => {
        if (nodes.length === 0) return;

        // Simple top-left alignment - place all nodes in a grid starting from top-left
        const gridSpacing = 200; // Spacing between nodes
        const startX = 50;
        const startY = 50;

        const newNodes = nodes.map((node, index) => {
            const row = Math.floor(index / 4); // 4 nodes per row
            const col = index % 4;

            return {
                ...node,
                position: {
                    x: startX + (col * gridSpacing),
                    y: startY + (row * gridSpacing)
                }
            };
        });

        setSanitizedNodes(newNodes);

        // Center the view to show the aligned nodes
        setTimeout(() => {
            if (reactFlowInstance && reactFlowInstance.fitView) {
                reactFlowInstance.fitView({ padding: 0.1, duration: 800 });
            }
        }, 50);

        setUnsavedChanges();
    }, [nodes, setSanitizedNodes, reactFlowInstance, setUnsavedChanges]);

    const handleZoomIn = useCallback(() => {
        zoomIn({ duration: 800 });
    }, [zoomIn]);

    const handleZoomOut = useCallback(() => {
        zoomOut({ duration: 800 });
    }, [zoomOut]);

    const handleCopy = useCallback(() => {
        const selectedNodes = nodes.filter(node => node.selected);
        const selectedEdges = edges.filter(edge => {
            const sourceNode = selectedNodes.find(node => node.id === edge.source);
            const targetNode = selectedNodes.find(node => node.id === edge.target);
            return sourceNode && targetNode;
        });

        // Copy form states for selected nodes
        const selectedFormStates = selectedNodes.reduce((acc, node) => {
            if (formStates[node.id]) {
                acc[node.id] = formStates[node.id];
            }
            return acc;
        }, {});

        setCopiedNodes(selectedNodes);
        setCopiedEdges(selectedEdges);
        // Store copied form states
        setCopiedFormStates(selectedFormStates);
    }, [nodes, edges, formStates, setCopiedNodes, setCopiedEdges, setCopiedFormStates]);

    const handlePaste = useCallback(() => {
        if (copiedNodes.length === 0) return;
        addNodeToHistory();
        const idMapping = {};
        const newNodes = copiedNodes.map(node => {
            const newId = `${node.id}_copy_${Date.now()}`;
            idMapping[node.id] = newId;

            return {
                ...node,
                id: newId,
                position: {
                    x: node.position.x + 50,
                    y: node.position.y + 50
                },
                selected: false
            };
        });
        const newEdges = copiedEdges.map(edge => ({
            ...edge,
            id: `${edge.id}_copy_${Date.now()}`,
            source: idMapping[edge.source],
            target: idMapping[edge.target],
            selected: false
        }));

        const newFormStates = {};
        Object.entries(copiedFormStates).forEach(([oldNodeId, formState]) => {
            const newNodeId = idMapping[oldNodeId];
            if (newNodeId) {
                newFormStates[newNodeId] = { ...formState };
            }
        });

        // Use updateSetNode for consistent state management
        const updatedNodes = Array.isArray(nodes) ? [...nodes, ...newNodes] : [...newNodes];
        const updatedEdges = Array.isArray(edges) ? [...edges, ...newEdges] : [...newEdges];

        updateSetNode(updatedNodes, updatedEdges);
        setFormStates(prevFormStates => ({
            ...prevFormStates,
            ...newFormStates
        }));
        setUnsavedChanges();
    }, [nodes, edges, copiedNodes, copiedEdges, copiedFormStates, addNodeToHistory, updateSetNode, setFormStates, setUnsavedChanges]);

    const handleCut = useCallback(() => {
        const selectedNodes = nodes.filter(node => node.selected);
        const selectedEdges = edges.filter(edge => {
            const sourceNode = selectedNodes.find(node => node.id === edge.source);
            const targetNode = selectedNodes.find(node => node.id === edge.target);
            return sourceNode && targetNode;
        });

        setCopiedNodes(selectedNodes);
        setCopiedEdges(selectedEdges);

        addNodeToHistory();

        // Filter out selected nodes and edges
        const updatedNodes = nodes.filter(node => !node.selected);
        const updatedEdges = edges.filter(edge => !edge.selected);

        // Use updateSetNode for consistent state management
        updateSetNode(updatedNodes, updatedEdges);
    }, [nodes, edges, addNodeToHistory, updateSetNode, setCopiedNodes, setCopiedEdges]);

    const handleUndo = useCallback(() => {
        if (history.length > 0) {
            const lastState = history[history.length - 1];
            setHistory((prev) => prev.slice(0, -1));
            setRedoStack((prev) => [...prev, { nodes, edges }]);
            // Use updateSetNode for consistent state management
            updateSetNode(lastState.nodes, lastState.edges);
        }
    }, [history, nodes, edges, updateSetNode, setHistory, setRedoStack]);

    const handleRedo = useCallback(() => {
        if (redoStack.length > 0) {
            const lastState = redoStack[redoStack.length - 1];
            setRedoStack((prev) => prev.slice(0, -1));
            setHistory((prev) => [...prev, { nodes, edges }]);

            // Use updateSetNode for consistent state management
            updateSetNode(lastState.nodes, lastState.edges);
        }
    }, [redoStack, nodes, edges, updateSetNode, setHistory, setRedoStack]);

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        const isFormElement = document.activeElement instanceof HTMLInputElement ||
            document.activeElement instanceof HTMLTextAreaElement ||
            document.activeElement instanceof HTMLSelectElement;

        if (!isFormElement) {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
                event.preventDefault();
                handleCopy();
            }

            // Paste (Ctrl + V)
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v') {
                event.preventDefault();
                handlePaste();
            }

            // Cut (Ctrl + X)
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'x') {
                event.preventDefault();
                handleCut();
            }

            // Undo (Ctrl + Z)
            if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === 'z') {
                event.preventDefault();
                handleUndo();
            }

            // Redo (Ctrl + Y or Ctrl + Shift + Z)
            if ((event.ctrlKey || event.metaKey) &&
                (event.key.toLowerCase() === 'y' || (event.shiftKey && event.key.toLowerCase() === 'z'))) {
                event.preventDefault();
                handleRedo();
            }
            // Debug mode toggle (Ctrl + D)
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'd') {
                event.preventDefault();

                // Add selected nodes to debug list
                const selectedNodes = nodes.filter(node => node.selected);
                if (selectedNodes.length > 0) {
                    selectedNodes.forEach(node => {
                        handleDebugToggle(node.id, node.data.title);
                    });
                }
            }

            // Existing shortcuts
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
                event.preventDefault();
                const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }

            // Run pipeline (Ctrl + R)
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'r') {
                event.preventDefault();
                handleRun();
            }

            // Open logs (Ctrl + L)
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'l') {
                event.preventDefault();
                handleLogsClick();
            }

            // Stop pipeline (Ctrl + K)
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                handleStop();
            }

            // Next step (Ctrl + N)
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'n') {
                event.preventDefault();
                handleNext();
            }

            // Zoom in (Ctrl + Plus)
            if ((event.ctrlKey || event.metaKey) && (event.key === '+' || event.key === '=')) {
                event.preventDefault();
                handleZoomIn();
            }

            // Zoom out (Ctrl + Minus)
            if ((event.ctrlKey || event.metaKey) && event.key === '-') {
                event.preventDefault();
                handleZoomOut();
            }
        }
    }, [handleCopy, handlePaste, handleCut, handleUndo, handleRedo, handleDebugToggle, handleRun, handleLogsClick, handleStop, handleNext, handleZoomIn, handleZoomOut, nodes]);

    return {
        handleAlignHorizontal,
        handleAlignVertical,
        handleAlignTopLeft,
        handleKeyDown,
        handleCut,
        handleRedo,
        handleUndo,
        handlePaste,
        handleCopy,
        handleCenter,
        handleZoomIn,
        handleZoomOut
    };
};