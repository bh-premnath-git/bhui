import React, { useState } from 'react'
import {
  BiZoomIn,
  BiZoomOut
} from 'react-icons/bi'
import {
  MdOutlineCenterFocusStrong,
  MdTerminal,
  MdAlignHorizontalCenter,
  MdAlignVerticalCenter,
  MdVerticalAlignTop
} from 'react-icons/md'

// shadcn/ui imports (adjust import paths to match your project setup)
import { Button } from '@/components/ui/button'

import { Terminal } from '@/components/bh-reactflow-comps/builddata/LogsPage';
import { usePipelineContext } from '@/context/designers/DataPipelineContext'
import { useEventStream } from '@/features/admin/connection/hooks/useEventStream'
import { useSidebar } from '@/context/SidebarContext'
import { API_PREFIX_URL, CATALOG_REMOTE_API_URL } from '@/config/platformenv';

interface Log {
  timestamp: string
  message: string
  level: 'info' | 'error' | 'warning'
}

interface FlowControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onCenter: () => void
  handleRunClick: () => void
  onStop: () => void
  onNext: () => void
  isPipelineRunning: boolean
  isLoading: boolean
  pipelineConfig: any
  terminalLogs?: Log[]
  proplesLogs?: Log[]
  onAlignHorizontal: () => void
  onAlignVertical: () => void
  onAlignTopLeft: () => void
}

export const FlowControls: React.FC<FlowControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onCenter,
  isPipelineRunning,
  isLoading,
  pipelineConfig,
  proplesLogs,
  onAlignHorizontal,
  onAlignVertical,
  onAlignTopLeft,
}) => {
  const [isLogsOpen, setIsLogsOpen] = useState(false)
  const { 
    pipelineDtl, 
    pipelineName, 
    nodes, 
    edges, 
    updateSetNode, 
    reactFlowInstance 
  } = usePipelineContext()
  const [logs,setLogs]=useState<any>([])
  
 const { start, stop } = useEventStream({
    url: `${CATALOG_REMOTE_API_URL}/${API_PREFIX_URL}/pipeline/stream-logs/${pipelineName||pipelineDtl?.name}`,
     token: sessionStorage.getItem("kc_token")!.replace("Bearer ", ""),
     onMessage: (msg) => {
       console.log("SSE:", msg);
       setLogs((prev:any) => [...prev, msg]);

     },
   });

  // --- LOGS (Custom Terminal) ---
  const { setBottomDrawerContent, closeBottomDrawer } = useSidebar();
  
  const handleLogsClick = async () => {
    // Stop any existing stream
    stop()
    
    // Format logs for the Terminal component
    const terminalLogs = logs.map((msg: any) => ({
      timestamp: new Date().toISOString(),
      message: typeof msg === 'string' ? msg : JSON.stringify(msg),
      level: "info"
    }));
    
    // Set the Terminal component as the bottom drawer content
    setBottomDrawerContent(
      <Terminal 
        isOpen={true}
        onClose={closeBottomDrawer}
        title="Pipeline Logs"
        terminalLogs={terminalLogs}
        proplesLogs={proplesLogs || []}
        pipelineName={pipelineDtl?.pipeline_name}
        activeTabOnOpen="terminal"
      />,
      `Terminal - ${pipelineDtl?.pipeline_name || 'Pipeline'}`
    );
  }

  const handleCloseLogs = () => {
    closeBottomDrawer();
  }

  
  // Define custom handlers that will directly manipulate the DOM
  const handleZoomInClick = () => {
    console.log("Zoom In clicked");
    try {
      // Try the provided handler
      if (onZoomIn) {
        console.log("Calling onZoomIn handler");
        onZoomIn();
      }
      
      // Also try direct DOM manipulation
      const reactFlowViewport = document.querySelector('.react-flow__viewport');
      if (reactFlowViewport) {
        console.log("Found reactFlowViewport, applying direct zoom");
        const currentTransform = reactFlowViewport.getAttribute('transform');
        if (currentTransform) {
          const match = currentTransform.match(/scale\(([^)]+)\)/);
          if (match && match[1]) {
            const currentScale = parseFloat(match[1]);
            const newScale = currentScale * 1.2; // Increase zoom by 20%
            
            // Update the transform attribute
            const newTransform = currentTransform.replace(
              /scale\([^)]+\)/, 
              `scale(${newScale})`
            );
            reactFlowViewport.setAttribute('transform', newTransform);
          }
        }
      }
      
      // Try to click the zoom in button directly
      const zoomInButton = document.querySelector('.react-flow__controls-button[data-action="zoomIn"]');
      if (zoomInButton instanceof HTMLElement) {
        console.log("Clicking zoomIn button");
        zoomInButton.click();
      }
      
      // Dispatch a custom event for any listeners
      const zoomEvent = new CustomEvent('flowControlZoomIn', {
        bubbles: true,
        detail: { timestamp: Date.now() }
      });
      document.dispatchEvent(zoomEvent);
      
      // Try to access the ReactFlow instance through the window
      try {
        // @ts-ignore - Access any potential global ReactFlow instance
        if (window.reactFlowInstance && window.reactFlowInstance.zoomIn) {
          console.log("Using global reactFlowInstance.zoomIn");
          // @ts-ignore
          window.reactFlowInstance.zoomIn();
        }
      } catch (e) {
        console.error("Error accessing global reactFlowInstance:", e);
      }
    } catch (error) {
      console.error("Error in zoom in:", error);
    }
  };
  
  const handleZoomOutClick = () => {
    console.log("Zoom Out clicked");
    try {
      // Try the provided handler
      if (onZoomOut) {
        console.log("Calling onZoomOut handler");
        onZoomOut();
      }
      
      // Also try direct DOM manipulation
      const reactFlowViewport = document.querySelector('.react-flow__viewport');
      if (reactFlowViewport) {
        console.log("Found reactFlowViewport, applying direct zoom out");
        const currentTransform = reactFlowViewport.getAttribute('transform');
        if (currentTransform) {
          const match = currentTransform.match(/scale\(([^)]+)\)/);
          if (match && match[1]) {
            const currentScale = parseFloat(match[1]);
            const newScale = currentScale / 1.2; // Decrease zoom by 20%
            
            // Update the transform attribute
            const newTransform = currentTransform.replace(
              /scale\([^)]+\)/, 
              `scale(${newScale})`
            );
            reactFlowViewport.setAttribute('transform', newTransform);
          }
        }
      }
      
      // Try to click the zoom out button directly
      const zoomOutButton = document.querySelector('.react-flow__controls-button[data-action="zoomOut"]');
      if (zoomOutButton instanceof HTMLElement) {
        console.log("Clicking zoomOut button");
        zoomOutButton.click();
      }
      
      // Dispatch a custom event for any listeners
      const zoomEvent = new CustomEvent('flowControlZoomOut', {
        bubbles: true,
        detail: { timestamp: Date.now() }
      });
      document.dispatchEvent(zoomEvent);
      
      // Try to access the ReactFlow instance through the window
      try {
        // @ts-ignore - Access any potential global ReactFlow instance
        if (window.reactFlowInstance && window.reactFlowInstance.zoomOut) {
          console.log("Using global reactFlowInstance.zoomOut");
          // @ts-ignore
          window.reactFlowInstance.zoomOut();
        }
      } catch (e) {
        console.error("Error accessing global reactFlowInstance:", e);
      }
    } catch (error) {
      console.error("Error in zoom out:", error);
    }
  };
  
  const handleCenterClick = () => {
    console.log("Center clicked");
    try {
      // First, try the provided handler from props
      if (onCenter) {
        console.log("Calling onCenter handler");
        onCenter();
      }
      
      // Then, try to click the fitView button directly
      const fitViewButton = document.querySelector('.react-flow__controls-fitview');
      if (fitViewButton instanceof HTMLElement) {
        console.log("Clicking fitView button");
        fitViewButton.click();
      }
      
      // Force a resize event to ensure ReactFlow recalculates dimensions
      window.dispatchEvent(new Event('resize'));
      
      // Additional approach: try to manipulate the viewport directly
      const reactFlowViewport = document.querySelector('.react-flow__viewport');
      if (reactFlowViewport) {
        console.log("Manipulating viewport directly");
        // Get all nodes to calculate their bounding box
        const nodes = document.querySelectorAll('.react-flow__node');
        if (nodes.length > 0) {
          // Reset transform to a reasonable default if we can't calculate
          reactFlowViewport.setAttribute('transform', 'translate(0,0) scale(0.85)');
        }
      }
      
      // Dispatch a custom event for any listeners
      const centerEvent = new CustomEvent('flowControlCenter', {
        bubbles: true,
        detail: { timestamp: Date.now() }
      });
      document.dispatchEvent(centerEvent);
      
      // Try again after a short delay to ensure everything has rendered
      setTimeout(() => {
        if (onCenter) onCenter();
        if (fitViewButton instanceof HTMLElement) fitViewButton.click();
      }, 300);
      
      // Try one more time after a longer delay
      setTimeout(() => {
        if (onCenter) onCenter();
        
        // Also try to access the ReactFlow instance through the window
        try {
          // @ts-ignore - Access any potential global ReactFlow instance
          if (window.reactFlowInstance && window.reactFlowInstance.fitView) {
            // @ts-ignore
            window.reactFlowInstance.fitView();
          }
        } catch (e) {
          console.error("Error accessing global reactFlowInstance:", e);
        }
      }, 800);
    } catch (error) {
      console.error("Error in center:", error);
    }
  };
  
  const handleAlignHorizontalClick = () => {
    console.log("Align Horizontal clicked");
    try {
      if (!nodes || nodes.length === 0) {
        console.log("No nodes to align");
        return;
      }
      
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
      const maxLevel = Math.max(...Array.from(nodeLevels.values()), 0);
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

      // Update nodes with new positions
      updateSetNode(newNodes, edges);

      // Center the view
      setTimeout(() => {
        const centerX = startX + (maxLevel * levelWidth) / 2;
        const maxNodesInLevel = Math.max(...Array.from(nodesByLevel.values()).map(n => n.length), 0);
        const centerY = startY + (maxNodesInLevel * nodeSpacing) / 2;
        
        if (reactFlowInstance && reactFlowInstance.setCenter) {
          reactFlowInstance.setCenter(centerX, centerY, { duration: 800 });
        }
        
        // Try to click the fitView button directly as a fallback
        const fitViewButton = document.querySelector('.react-flow__controls-fitview');
        if (fitViewButton instanceof HTMLElement) {
          console.log("Clicking fitView button after horizontal alignment");
          fitViewButton.click();
        }
      }, 100);
      
    } catch (error) {
      console.error("Error in align horizontal:", error);
    }
  };
  
  const handleAlignVerticalClick = () => {
    console.log("Align Vertical clicked");
    try {
      if (!nodes || nodes.length === 0) {
        console.log("No nodes to align");
        return;
      }
      
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
      const maxLevel = Math.max(...Array.from(nodeLevels.values()), 0);
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

      // Update nodes with new positions
      updateSetNode(newNodes, edges);

      // Center the view
      setTimeout(() => {
        const maxNodesInLevel = Math.max(...Array.from(nodesByLevel.values()).map(n => n.length), 0);
        const centerX = startX + (maxNodesInLevel * nodeSpacing) / 2;
        const centerY = startY + (maxLevel * levelHeight) / 2;
        
        if (reactFlowInstance && reactFlowInstance.setCenter) {
          reactFlowInstance.setCenter(centerX, centerY, { duration: 800 });
        }
        
        // Try to click the fitView button directly as a fallback
        const fitViewButton = document.querySelector('.react-flow__controls-fitview');
        if (fitViewButton instanceof HTMLElement) {
          console.log("Clicking fitView button after vertical alignment");
          fitViewButton.click();
        }
      }, 100);
      
    } catch (error) {
      console.error("Error in align vertical:", error);
    }
  };

  const handleAlignTopLeftClick = () => {
    console.log("Align Top Left clicked");
    try {
      if (!nodes || nodes.length === 0) {
        console.log("No nodes to align");
        return;
      }
      
      // Simple grid layout starting from top-left
      const startX = -250; // Move nodes more to the right
      const startY = -120; // Move nodes even higher up (can go negative)
      const gridSpacing = 100; // Space between nodes
      const nodesPerRow = 4; // Number of nodes per row
      
      const newNodes = nodes.map((node, index) => {
        const row = Math.floor(index / nodesPerRow);
        const col = index % nodesPerRow;
        
        return {
          ...node,
          position: {
            x: startX + (col * gridSpacing),
            y: startY + (row * gridSpacing)
          }
        };
      });

      // Update nodes with new positions
      updateSetNode(newNodes, edges);

      // Center the view after a short delay
      setTimeout(() => {
        if (reactFlowInstance && reactFlowInstance.setCenter) {
          // Calculate the center of the grid
          const rows = Math.ceil(nodes.length / nodesPerRow);
          const centerX = startX + ((nodesPerRow - 1) * gridSpacing) / 2;
          const centerY = startY + ((rows - 1) * gridSpacing) / 2;
          
          reactFlowInstance.setCenter(centerX, centerY, { duration: 800 });
        }
        
        // Try to click the fitView button directly as a fallback
        const fitViewButton = document.querySelector('.react-flow__controls-fitview');
        if (fitViewButton instanceof HTMLElement) {
          console.log("Clicking fitView button after top-left alignment");
          fitViewButton.click();
        }
      }, 100);
      
    } catch (error) {
      console.error("Error in align top left:", error);
    }
  };

  const actions = [
    { key: 'zoom-in', icon: BiZoomIn, handler: handleZoomInClick },
    { key: 'zoom-out', icon: BiZoomOut, handler: handleZoomOutClick },
    { key: 'center', icon: MdOutlineCenterFocusStrong, handler: handleCenterClick },
    { key: 'align-horizontal', icon: MdAlignHorizontalCenter, handler: handleAlignHorizontalClick },
    { key: 'align-vertical', icon: MdAlignVerticalCenter, handler: handleAlignVerticalClick },
    { key: 'align-top-left', icon: MdVerticalAlignTop, handler: handleAlignTopLeftClick },
    // { key: 'run', icon: HiOutlinePlay, handler: handleRunClick },
    // { key: 'stop', icon: MdOutlineStop, handler: onStop },
    // { key: 'next', icon: MdOutlineSkipNext, handler: onNext },
    // { key: 'logs', icon: MdTerminal, handler: handleLogsClick },
  ]
  console.log(logs)
  return (
    <>
      <div
        className="flex items-center bg-white rounded-xl shadow-lg border border-gray-100 p-1.5 gap-1"
        style={{ zIndex: 100001 }}
      >
        {actions.map((action, index) => (
          <React.Fragment key={action.key}>
            {index > 0 && <div className="w-px h-6 bg-gray-200" />}
            <Button
              onClick={action.handler}
              variant="ghost"
              className="group relative flex items-center justify-center w-8 h-8 
                         hover:bg-gray-900 active:bg-gray-800 
                         transition-all duration-200 ease-in-out p-0"
              title={action.key
                .split('-')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')}
              disabled={
                (action.key === 'run' && isLoading) ||
                (action.key === 'next' && !isPipelineRunning) ||
                (action.key === 'stop' && !isPipelineRunning)

              }
            >
              <span
                className="
                  absolute -top-10 scale-0 transition-all 
                  rounded bg-gray-800 p-2 text-xs text-white 
                  group-hover:scale-100
                "
              >
                {action.key
                  .split('-')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')}
                <span
                  className="
                    absolute bottom-[-4px] left-1/2 -translate-x-1/2 
                    rotate-45 w-2 h-2 bg-gray-800
                  "
                />
              </span>
              <span className="text-gray-700 group-hover:text-white transition-colors">
                <action.icon
                  size={20}
                  className={
                    action.key === 'stop' && isPipelineRunning ? 'text-red-500' : ''
                  }
                />
              </span>
            </Button>
          </React.Fragment>
        ))}

        {/* Extra button to open Settings (shadcn Sheet) */}
        {/* <div className="w-px h-6 bg-gray-200 mx-1" /> */}
        {/* <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" onClick={handleSettingsClick} title="Settings">
              <MdSettings size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="mySheetContent">
            <SheetHeader>
              <SheetTitle>Settings</SheetTitle>
              <SheetDescription>
                Customize your pipeline settings here.
              </SheetDescription>
            </SheetHeader>
            <SheetFooter>
              <Button variant="secondary" onClick={handleCloseSettings}>
                Close
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet> */}
      </div>

      {/* Logs Terminal */}
      <Terminal
        isOpen={isLogsOpen}
        onClose={handleCloseLogs}
        title="Pipeline Logs"
        terminalLogs={logs}
        proplesLogs={proplesLogs}
        pipelineName={pipelineConfig?.pipeline_name}
      />
    </>
  )
}
