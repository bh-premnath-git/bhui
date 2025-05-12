import React, { useState, useRef, useEffect } from 'react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useEventStream } from "@/features/admin/connection/hooks/useEventStream";
import { usePipelineContext } from "@/context/designers/DataPipelineContext";

export interface Log {
  timestamp: string;
  message: string;
  level: "info" | "error" | "warning";
}

interface TerminalDrawerProps {
  tabs?: Array<{
    id: string;
    label: string;
    logs?: Log[];
  }>;
  pipelineName?: string;
}

export const TerminalDrawer: React.FC<TerminalDrawerProps> = ({
  tabs = [
    { id: "logs", label: "Logs" },
    { id: "problems", label: "Problems" },
    { id: "preview", label: "Preview" }
  ],
  pipelineName: propPipelineName,
}) => {
  const [activeTab, setActiveTab] = useState<string>(tabs[0]?.id || "logs");
  const [localLogs, setLocalLogs] = useState<Record<string, Log[]>>({});
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [streamMode, setStreamMode] = useState<'sse' | 'regular'>('sse');
  const logsEndRef = useRef<HTMLDivElement>(null);
  
  // Get pipeline name from context if not provided as prop
  const { pipelineName: contextPipelineName, pipelineDtl } = usePipelineContext();

  // Determine the actual pipeline name to use
  const actualPipelineName = propPipelineName ||
    (pipelineDtl?.pipeline_name) ||
    (contextPipelineName?.pipeLineName) ||
    "Unknown Pipeline";

  // Initialize logs for each tab
  useEffect(() => {
    const initialLogs: Record<string, Log[]> = {};
    tabs.forEach(tab => {
      initialLogs[tab.id] = tab.logs || [];
    });
    setLocalLogs(initialLogs);
  }, [tabs]);

  // Setup event stream for logs
  const { start, stop } = useEventStream({
    url: `http://localhost:8011/api/v1/pipeline/stream-logs/${actualPipelineName}`,
    token: sessionStorage.getItem("kc_token")?.replace("Bearer ", "") || "",
    onMessage: (msg:any) => {
      console.log("SSE:", msg);
      // Add the new log to the active tab
      if (typeof msg === 'string') {
        const newLog: Log = {
          timestamp: new Date().toISOString(),
          message: msg,
          level: "info"
        };
        setLocalLogs(prev => ({
          ...prev,
          [activeTab]: [...(prev[activeTab] || []), newLog]
        }));
      } else if (typeof msg === 'object') {
        // Handle structured log objects
        const newLog: Log = {
          timestamp: msg.timestamp || new Date().toISOString(),
          message: msg.message || JSON.stringify(msg),
          level: msg.level || "info"
        };
        setLocalLogs(prev => ({
          ...prev,
          [activeTab]: [...(prev[activeTab] || []), newLog]
        }));
      }
    },
  });

  // Cleanup function reference
  const cleanupRef = useRef<(() => void) | null>(null);

  // Start streaming when component mounts
  useEffect(() => {
    const startStreaming = async () => {
      setIsStreaming(true);
      await start();
      cleanupRef.current = stop;
    };

    startStreaming();

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      setIsStreaming(false);
    };
  }, [start, stop]);

  // Scroll to bottom when logs change
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [localLogs, activeTab]);

  // Function to clear logs for the active tab
  const clearLogs = () => {
    const clearLog: Log = {
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      message: "Logs cleared",
      level: "info"
    };

    setLocalLogs(prev => ({
      ...prev,
      [activeTab]: [clearLog]
    }));
  };

  // Function to toggle streaming mode
  const toggleStreamMode = () => {
    setStreamMode(prev => prev === 'sse' ? 'regular' : 'sse');
    // Restart streaming with new mode
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    
    // Small delay before restarting
    setTimeout(async () => {
      await start();
      cleanupRef.current = stop;
    }, 100);
  };

  // Function to refresh logs
  const refreshLogs = async () => {
    setIsRefreshing(true);
    
    // Stop current stream
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    
    // Clear logs except for the "cleared" message
    const clearLog: Log = {
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      message: "Refreshing logs...",
      level: "info"
    };
    
    setLocalLogs(prev => ({
      ...prev,
      [activeTab]: [clearLog]
    }));
    
    // Restart stream
    try {
      await start();
      cleanupRef.current = stop;
    } catch (error) {
      console.error("Error refreshing logs:", error);
      const errorLog: Log = {
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        message: `Error refreshing logs: ${error}`,
        level: "error"
      };
      setLocalLogs(prev => ({
        ...prev,
        [activeTab]: [...prev[activeTab], errorLog]
      }));
    }
    
    setIsRefreshing(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Terminal header with controls */}
      <div className="flex items-center justify-between mb-2 px-2 py-1 bg-neutral-100 border-b">
        <div className="text-sm text-neutral-600">
          {actualPipelineName}
        </div>
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-6 w-6"
                  onClick={toggleStreamMode}
                >
                  {streamMode === 'sse' ? (
                    <ToggleRight className="h-4 w-4 text-green-600" />
                  ) : (
                    <ToggleLeft className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle streaming mode: {streamMode === 'sse' ? 'SSE' : 'Regular'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-6 w-6"
                  onClick={refreshLogs}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh logs</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-6 w-6"
                  onClick={clearLogs}
                >
                  <Trash2 className="h-4 w-4 text-gray-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear logs</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="border-b bg-neutral-100 w-full text-start justify-start">
          {tabs.map(tab => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="px-4 py-1 text-sm"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1 overflow-auto">
          {tabs.map(tab => (
            <TabsContent 
              key={tab.id} 
              value={tab.id}
              className="flex-1 h-full p-0 m-0"
            >
              <div 
                className="flex-1 overflow-auto p-3 text-sm font-mono bg-white h-full"
                style={{
                  lineHeight: "1.4rem",
                  maxHeight: "calc(100vh - 200px)",
                  overflowY: "auto"
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {isStreaming && (
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                        <span className="text-xs text-green-600">Stream active ({streamMode === 'sse' ? 'SSE' : 'Regular'} mode)</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {localLogs[tab.id]?.length > 0 ? `${localLogs[tab.id].length} log entries` : ''}
                  </div>
                </div>

                {tab.id === 'preview' ? (
                  <div className="p-4">
                    <h3 className="text-lg font-medium mb-4">Pipeline Preview</h3>
                    <div className="bg-gray-100 p-4 rounded-md">
                      <p className="mb-2">Pipeline Name: <span className="font-semibold">{actualPipelineName}</span></p>
                      <p className="mb-2">Status: <span className="text-green-600 font-semibold">Active</span></p>
                      <p className="mb-2">Last Run: <span className="font-semibold">{new Date().toLocaleString()}</span></p>
                      
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Statistics:</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-white p-3 rounded shadow-sm">
                            <p className="text-gray-500 text-xs">Processed</p>
                            <p className="text-xl font-bold">1,245</p>
                          </div>
                          <div className="bg-white p-3 rounded shadow-sm">
                            <p className="text-gray-500 text-xs">Errors</p>
                            <p className="text-xl font-bold text-red-500">12</p>
                          </div>
                          <div className="bg-white p-3 rounded shadow-sm">
                            <p className="text-gray-500 text-xs">Warnings</p>
                            <p className="text-xl font-bold text-amber-500">24</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : localLogs[tab.id]?.length > 0 ? (
                  <>
                    {localLogs[tab.id].map((log, index) => (
                      <div
                        key={index}
                        className={`mb-1 ${
                          log.level === "error"
                            ? "text-red-500"
                            : log.level === "warning"
                            ? "text-amber-500"
                            : "text-gray-800"
                        }`}
                      >
                        <span className="text-gray-400 mr-2">[{log.timestamp}]</span>
                        {log.message}
                      </div>
                    ))}
                    <div ref={logsEndRef} />
                  </>
                ) : (
                  <div className="text-gray-400 italic">No logs to display</div>
                )}
              </div>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
};

export default TerminalDrawer;