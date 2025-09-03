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
  MdVerticalAlignTop,
  MdAdd
} from 'react-icons/md'
import { FaTable } from 'react-icons/fa'

// shadcn/ui imports (adjust import paths to match your project setup)
import { Button } from '@/components/ui/button'

import { Terminal } from '@/components/bh-reactflow-comps/builddata/LogsPage';
import { PipelineForm } from './PipelineForm';
import { usePipelineContext } from '@/context/designers/DataPipelineContext'
import { useEventStream } from '@/features/admin/connection/hooks/useEventStream'
import { useSidebar } from '@/context/SidebarContext'
import { API_PREFIX_URL, CATALOG_REMOTE_API_URL } from '@/config/platformenv';
import { useFlowAlignment } from '@/hooks/useFlowAlignment';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { openChatBottomDrawer, closeChatBottomDrawer } from '@/store/slices/chat/chatSlice';

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
  onAlignTopLeft?: () => void
}

export const FlowControls: React.FC<FlowControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onCenter,
  isPipelineRunning,
  isLoading,
  pipelineConfig,
  proplesLogs,
  onAlignTopLeft,
}) => {
  const [isLogsOpen, setIsLogsOpen] = useState(false)
  const [isPipelineFormOpen, setIsPipelineFormOpen] = useState(false)
  const dispatch = useAppDispatch();
  const { 
    pipelineDtl, 
    pipelineName, 
    nodes, 
    edges, 
    updateSetNode, 
    reactFlowInstance 
  } = usePipelineContext()
  const { alignHorizontal, alignVertical, alignTopLeftGrid, alignTopLeftHierarchical } = useFlowAlignment({
    nodes,
    edges,
    updateNodes: updateSetNode,
    reactFlowInstance,
  });
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
  
  // Drawer toggle handler
  const handleDrawerToggle = () => {
    const isOpen = isChatDrawerOpen
    if (isOpen) {
      dispatch(closeChatBottomDrawer())
      return
    }
    // Create dummy preview data component
    const PreviewDataComponent = () => {
      const dummyData = [
        {
          id: 1,
          customer_name: 'John Doe',
          product: 'Laptop',
          amount: 1299.99,
          status: 'Completed'
        },
        {
          id: 2,
          customer_name: 'Jane Smith',
          product: 'Smartphone',
          amount: 899.99,
          status: 'Processing'
        },
        {
          id: 3,
          customer_name: 'Bob Johnson',
          product: 'Headphones',
          amount: 249.99,
          status: 'Shipped'
        },
        {
          id: 4,
          customer_name: 'Alice Brown',
          product: 'Monitor',
          amount: 349.99,
          status: 'Delivered'
        },
        {
          id: 5,
          customer_name: 'Charlie Wilson',
          product: 'Keyboard',
          amount: 129.99,
          status: 'Processing'
        }
      ];

      return (
        <div className="p-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pipeline Preview Data</h3>
            <p className="text-sm text-gray-600">Sample data showing the expected output format</p>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dummyData.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{row.id}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{row.customer_name}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{row.product}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">${row.amount.toFixed(2)}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        row.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        row.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                        row.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    };

    // Open the bottom drawer with preview data
    dispatch(openChatBottomDrawer({
      title: 'Pipeline Preview Data',
      content: <PreviewDataComponent />,
      height: 400
    }));
  };

  const handleLogsClick = async () => {
    await handleCenterClick();
// await handleAlignTopLeftClick();

    console.log("🔧 Terminal button clicked - starting logs and alignment process");
    console.log("🔧 onAlignTopLeft prop available:", !!onAlignTopLeft);
    console.log("🔧 Current nodes count:", nodes?.length || 0);
    
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
      // `Terminal - ${pipelineDtl?.pipeline_name || 'Pipeline'}`
    );
    console.log("🔧 Bottom drawer content set; panning viewport up to keep nodes visible");

    // After the drawer opens, nudge the viewport up instead of re-aligning nodes
    setTimeout(() => {
      try {
        const el = document.querySelector('[data-bottom-drawer], .bottom-drawer, #bottom-drawer') as HTMLElement | null;
        const height = el?.offsetHeight || Math.round(window.innerHeight * 0.3);
        const offset = Math.max(160, Math.floor(height * 0.7));
        if (reactFlowInstance) {
          // Read current viewport and pan up by offset
          // @ts-ignore
          const vp = reactFlowInstance.toObject?.().viewport || { x: 0, y: 0, zoom: (reactFlowInstance as any).getZoom?.() || 1 };
          reactFlowInstance.setViewport({ x: vp.x, y: vp.y - offset, zoom: vp.zoom }, { duration: 400 });
        } else {
          // Fallback: resize + center
          window.dispatchEvent(new Event('resize'));
          handleCenterClick();
        }
      } catch (e) {
        console.error('Viewport nudge failed', e);
      }
    }, 250);
  }

  const handleCloseLogs = () => {
    closeBottomDrawer();
  }


  const handleClosePipelineForm = () => {
    setIsPipelineFormOpen(false);
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
    console.log("Zoom Out clicked")
    try {
      if (onZoomOut) onZoomOut()
      const reactFlowViewport = document.querySelector('.react-flow__viewport')
      if (reactFlowViewport) {
        const currentTransform = reactFlowViewport.getAttribute('transform')
        if (currentTransform) {
          const match = currentTransform.match(/scale\(([^)]+)\)/)
          if (match && match[1]) {
            const currentScale = parseFloat(match[1])
            const newScale = currentScale / 1.2
            const newTransform = currentTransform.replace(/scale\([^)]+\)/, `scale(${newScale})`)
            reactFlowViewport.setAttribute('transform', newTransform)
          }
        }
      }
      const zoomOutButton = document.querySelector('.react-flow__controls-button[data-action="zoomOut"]')
      if (zoomOutButton instanceof HTMLElement) zoomOutButton.click()
      const zoomEvent = new CustomEvent('flowControlZoomOut', { bubbles: true, detail: { timestamp: Date.now() } })
      document.dispatchEvent(zoomEvent)
    } catch (error) {
      console.error("Error in zoom out:", error)
    }
  }

  const handleCenterClick = () => {
    console.log("Center clicked")
    try {
      if (onCenter) onCenter()
      const fitViewButton = document.querySelector('.react-flow__controls-fitview')
      if (fitViewButton instanceof HTMLElement) fitViewButton.click()
      window.dispatchEvent(new Event('resize'))
    } catch (error) {
      console.error("Error in center:", error)
    }
  }

  const handleAlignHorizontalClick = () => {
    console.log("Align Horizontal clicked")
    try {
      alignHorizontal({
        startX: 50,
        startY: 50,
        levelWidth: 300,
        nodeSpacing: 200,
        fitView: true,
        distribution: 'even',
        fitViewOptions: { padding: 0.15, duration: 600 },
      })
      handleCenterClick()
    } catch (error) {
      console.error("Error in align horizontal:", error)
    }
  }

  const handleAlignVerticalClick = () => {
    console.log("Align Vertical clicked")
    try {
      alignVertical({
        startX: 50,
        startY: 50,
        levelHeight: 240,
        nodeSpacing: 200,
        fitView: true,
        fitViewOptions: { padding: 0.15, duration: 600 },
      })
      handleCenterClick()
    } catch (error) {
      console.error("Error in align vertical:", error)
    }
  }

  const handleAlignTopLeftClick = () => {
    console.log("Align Top Left clicked")
    try {
      alignTopLeftGrid({ startX: 0, startY: 0, spacing: 140, columns: 4, fitView: true })
    } catch (error) {
      console.error("Error in align top left:", error)
    }
  }

  const isChatDrawerOpen = useAppSelector((state) => state.chat.bottomDrawer.isOpen)

  const actions = [
    { key: 'zoom-in', icon: BiZoomIn, handler: handleZoomInClick },
    { key: 'zoom-out', icon: BiZoomOut, handler: handleZoomOutClick },
    { key: 'center', icon: MdOutlineCenterFocusStrong, handler: handleCenterClick },
    { key: 'align-horizontal', icon: MdAlignHorizontalCenter, handler: handleAlignHorizontalClick },
    { key: 'align-vertical', icon: MdAlignVerticalCenter, handler: handleAlignVerticalClick },
    { key: isChatDrawerOpen ? 'drawer-close' : 'drawer-open', icon: FaTable, handler: handleDrawerToggle },
    { key: 'logs', icon: MdTerminal, handler: handleLogsClick },
  ] as const

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
              title={action.key.replace('-', ' ')}
            >
              <span className="text-gray-700 group-hover:text-white transition-colors">
                <action.icon size={20} />
              </span>
            </Button>
          </React.Fragment>
        ))}
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

      {/* Pipeline Form */}
      <PipelineForm
        isOpen={isPipelineFormOpen}
        onClose={handleClosePipelineForm}
      />
    </>
  )
}
 