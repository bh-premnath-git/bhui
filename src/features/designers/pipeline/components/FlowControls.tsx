import React, { useState } from 'react'
import {
  BiZoomIn,
  BiZoomOut
} from 'react-icons/bi'
import {
  MdOutlineCenterFocusStrong,
  MdOutlineSkipNext,
  MdOutlineStop,
  MdSettings,
  MdTerminal,
  MdAlignHorizontalCenter,
  MdAlignVerticalCenter
} from 'react-icons/md'
import { HiOutlinePlay } from 'react-icons/hi'

// shadcn/ui imports (adjust import paths to match your project setup)
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'

import { Terminal, PreviewData } from '@/components/bh-reactflow-comps/builddata/LogsPage';
import { usePipelineContext } from '@/context/designers/DataPipelineContext'
import { useEventStream } from '@/features/admin/connection/hooks/useEventStream'
import { useSidebar } from '@/context/SidebarContext'
import { API_DOMAIN, API_PREFIX_URL, CATALOG_API_PORT } from '@/config/platformenv';

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
}

export const FlowControls: React.FC<FlowControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onCenter,
  handleRunClick,
  onStop,
  onNext,
  isPipelineRunning,
  isLoading,
  pipelineConfig,
  terminalLogs,
  proplesLogs,
  onAlignHorizontal,
  onAlignVertical,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isLogsOpen, setIsLogsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const { pipelineDtl } = usePipelineContext()
  const [logs,setLogs]=useState<any>([])
  
 const { start, stop } = useEventStream({
    url: `${API_DOMAIN}:${CATALOG_API_PORT}/api/v1/pipeline/stream-logs/${pipelineDtl?.pipeline_name}`,
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
      if (onZoomIn) onZoomIn();
      
      // Also try direct DOM manipulation
      const reactFlowViewport = document.querySelector('.react-flow__viewport');
      if (reactFlowViewport) {
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
    } catch (error) {
      console.error("Error in zoom in:", error);
    }
  };
  
  const handleZoomOutClick = () => {
    console.log("Zoom Out clicked");
    try {
      // Try the provided handler
      if (onZoomOut) onZoomOut();
      
      // Also try direct DOM manipulation
      const reactFlowViewport = document.querySelector('.react-flow__viewport');
      if (reactFlowViewport) {
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
    } catch (error) {
      console.error("Error in zoom out:", error);
    }
  };
  
  const handleCenterClick = () => {
    console.log("Center clicked");
    try {
      // Try the provided handler
      if (onCenter) onCenter();
      
      // Also try to click the fitView button
      const fitViewButton = document.querySelector('.react-flow__controls-fitview');
      if (fitViewButton instanceof HTMLElement) {
        fitViewButton.click();
      }
    } catch (error) {
      console.error("Error in center:", error);
    }
  };
  
  const handleAlignHorizontalClick = () => {
    console.log("Align Horizontal clicked");
    try {
      // Try the provided handler
      if (onAlignHorizontal) {
        console.log("Calling onAlignHorizontal");
        onAlignHorizontal();
      } else {
        console.error("onAlignHorizontal is not defined");
      }
      
      // Dispatch a custom event that the DataPipelineContext can listen for
      const alignHorizontalEvent = new CustomEvent('alignHorizontal', {
        bubbles: true,
        cancelable: true,
        detail: { timestamp: new Date().getTime() }
      });
      document.dispatchEvent(alignHorizontalEvent);
      
      // Direct DOM manipulation approach
      const nodes = document.querySelectorAll('.react-flow__node');
      if (nodes.length > 0) {
        const HORIZONTAL_SPACING = 250;
        const VERTICAL_SPACING = 150;
        const NODES_PER_ROW = 4;
        const STARTING_X = 50;
        const STARTING_Y = 50;
        
        nodes.forEach((node, index) => {
          const row = Math.floor(index / NODES_PER_ROW);
          const col = index % NODES_PER_ROW;
          
          const x = STARTING_X + col * HORIZONTAL_SPACING;
          const y = STARTING_Y + row * VERTICAL_SPACING;
          
          // Update node position using transform
          node.setAttribute('style', `transform: translate(${x}px, ${y}px); position: absolute;`);
        });
        
        // Try to fit view
        const fitViewButton = document.querySelector('.react-flow__controls-fitview');
        if (fitViewButton instanceof HTMLElement) {
          setTimeout(() => {
            fitViewButton.click();
          }, 100);
        }
      }
    } catch (error) {
      console.error("Error in align horizontal:", error);
    }
  };
  
  const handleAlignVerticalClick = () => {
    console.log("Align Vertical clicked");
    try {
      // Try the provided handler
      if (onAlignVertical) {
        console.log("Calling onAlignVertical");
        onAlignVertical();
      } else {
        console.error("onAlignVertical is not defined");
      }
      
      // Dispatch a custom event that the DataPipelineContext can listen for
      const alignVerticalEvent = new CustomEvent('alignVertical', {
        bubbles: true,
        cancelable: true,
        detail: { timestamp: new Date().getTime() }
      });
      document.dispatchEvent(alignVerticalEvent);
      
      // Direct DOM manipulation approach
      const nodes = document.querySelectorAll('.react-flow__node');
      if (nodes.length > 0) {
        const HORIZONTAL_SPACING = 250;
        const VERTICAL_SPACING = 150;
        const NODES_PER_COLUMN = 4;
        const STARTING_X = 50;
        const STARTING_Y = 50;
        
        nodes.forEach((node, index) => {
          const column = Math.floor(index / NODES_PER_COLUMN);
          const row = index % NODES_PER_COLUMN;
          
          const x = STARTING_X + column * HORIZONTAL_SPACING;
          const y = STARTING_Y + row * VERTICAL_SPACING;
          
          // Update node position using transform
          node.setAttribute('style', `transform: translate(${x}px, ${y}px); position: absolute;`);
        });
        
        // Try to fit view
        const fitViewButton = document.querySelector('.react-flow__controls-fitview');
        if (fitViewButton instanceof HTMLElement) {
          setTimeout(() => {
            fitViewButton.click();
          }, 100);
        }
      }
    } catch (error) {
      console.error("Error in align vertical:", error);
    }
  };

  const actions = [
    { key: 'zoom-in', icon: BiZoomIn, handler: handleZoomInClick },
    { key: 'zoom-out', icon: BiZoomOut, handler: handleZoomOutClick },
    { key: 'center', icon: MdOutlineCenterFocusStrong, handler: handleCenterClick },
    { key: 'align-horizontal', icon: MdAlignHorizontalCenter, handler: handleAlignHorizontalClick },
    { key: 'align-vertical', icon: MdAlignVerticalCenter, handler: handleAlignVerticalClick },
    // { key: 'run', icon: HiOutlinePlay, handler: handleRunClick },
    // { key: 'stop', icon: MdOutlineStop, handler: onStop },
    // { key: 'next', icon: MdOutlineSkipNext, handler: onNext },
    { key: 'logs', icon: MdTerminal, handler: handleLogsClick },
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
