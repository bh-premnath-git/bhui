import * as React from "react"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
// import { fetchPipelineStreamLogs } from "@/lib/api/log-stream-service"
import { usePipelineContext } from "@/context/designers/DataPipelineContext"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, ToggleLeft, ToggleRight, Trash2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useEventStream } from "@/features/admin/connection/hooks/useEventStream"
import { DataTable } from "@/components/bh-table/data-table"
import { API_DOMAIN, API_PREFIX_URL, CATALOG_API_PORT } from '@/config/platformenv';

export interface Log {
  timestamp: string
  message: string
  level: "info" | "error" | "warning"
}

// Define the structure for preview data
export interface PreviewData {
  transformationName: string;
  outputs: Array<{
    name: string;
    rows: Array<Record<string, string>>;
  }>;
}

interface TerminalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  terminalLogs?: Log[]
  proplesLogs?: Log[]
  previewData?: PreviewData
  defaultHeight?: string
  minHeight?: string
  pipelineName?: string
  activeTabOnOpen?: "terminal" | "proples" | "preview"
}

export const Terminal: React.FC<TerminalProps> = ({
  isOpen,
  onClose,
  title = "Logs",
  terminalLogs = [],
  proplesLogs = [],
  previewData,
  defaultHeight = "40%",
  minHeight = "40px",
  pipelineName: propPipelineName,
  activeTabOnOpen = "preview",
}) => {
  console.log(terminalLogs)
  const [isMinimized, setIsMinimized] = React.useState(false)
  const [isMaximized, setIsMaximized] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<"terminal" | "proples" | "preview">(
    activeTabOnOpen,
  )
  const [localTerminalLogs, setLocalTerminalLogs]: any = React.useState<Log[]>(terminalLogs)
  const [localProplesLogs, setLocalProplesLogs] = React.useState<Log[]>(proplesLogs)
  const [localPreviewData, setLocalPreviewData] = React.useState<PreviewData | undefined>(previewData)
  const [isStreaming, setIsStreaming] = React.useState(false)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const logsEndRef = React.useRef<HTMLDivElement>(null)
  const [logs, setLogs] = React.useState<string[]>([]);

  // Get pipeline name from context if not provided as prop
  const { pipelineName: contextPipelineName, pipelineDtl } = usePipelineContext()

  // Determine the actual pipeline name to use
  const actualPipelineName = propPipelineName ||
    (pipelineDtl?.name) ||
    (contextPipelineName?.pipeLineName) ||
    "Unknown Pipeline"

  // Setup event stream for logs
  const { start, stop } = useEventStream({
    url: `${API_DOMAIN}:${CATALOG_API_PORT}/api/v1/pipeline/stream-logs/${actualPipelineName}`,
    token: sessionStorage.getItem("kc_token")?.replace("Bearer ", "") || "",
    onMessage: (msg: any) => {
      console.log("SSE:", msg);
      // Add the new log to the active tab
      if (typeof msg === 'string') {
        const newLog: Log = {
          timestamp: new Date().toISOString(),
          message: msg,
          level: "info"
        };
        setLocalTerminalLogs(prev => [...prev, newLog]);
      } else if (typeof msg === 'object') {
        // Handle structured log objects
        const newLog: Log = {
          timestamp: msg.timestamp || new Date().toISOString(),
          message: msg.message || JSON.stringify(msg),
          level: msg.level || "info"
        };
        setLocalTerminalLogs(prev => [...prev, newLog]);
      }
    },
  });

  // Cleanup function reference
  const cleanupRef = React.useRef<(() => void) | null>(null);

  /**
   * Instead of querying the DOM for `.MuiDrawer-paper`,
   * we store a local height state and apply it to our container.
   */
  const [height, setHeight] = React.useState(defaultHeight)

  // Update local logs when props change
  React.useEffect(() => {
    if (terminalLogs?.length > 0) {
      setLocalTerminalLogs(prevLogs => {
        // Only add logs that don't already exist (based on timestamp + message)
        const existingLogKeys = new Set(
          prevLogs.map(log => `${log.timestamp}-${log.message}`)
        );

        const newLogs = terminalLogs.filter(
          log => !existingLogKeys.has(`${log.timestamp}-${log.message}`)
        );

        return [...prevLogs, ...newLogs];
      });
    }
  }, [terminalLogs]);

  React.useEffect(() => {
    if (proplesLogs.length > 0) {
      setLocalProplesLogs(prevLogs => {
        // Only add logs that don't already exist (based on timestamp + message)
        const existingLogKeys = new Set(
          prevLogs.map(log => `${log.timestamp}-${log.message}`)
        );

        const newLogs = proplesLogs.filter(
          log => !existingLogKeys.has(`${log.timestamp}-${log.message}`)
        );

        return [...prevLogs, ...newLogs];
      });
    }
  }, [proplesLogs]);

  // Update local preview data when prop changes
  React.useEffect(() => {
    if (previewData) {
      setLocalPreviewData(previewData);
      // If preview data is provided, switch to the preview tab
      setActiveTab("preview");
    }
  }, [previewData]);
  const startStreaming = React.useCallback(async () => {
    if (!isStreaming) {
      setIsStreaming(true);
      try {
        await start();
        cleanupRef.current = stop;
      } catch (error) {
        console.error("Error starting stream:", error);
        setIsStreaming(false);
      }
    }
  }, [isStreaming, start, stop]);
  // Start streaming only when the terminal tab is active AND the component is open
  React.useEffect(() => {
    if (isOpen && activeTab === "terminal" && !isStreaming) {
      startStreaming();
    }
  }, [isOpen, activeTab, isStreaming, startStreaming]);

  // Scroll to bottom when logs change
  React.useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [localTerminalLogs, localProplesLogs, activeTab]);

  // We'll manually start streaming when needed, not automatically on mount


  const stopStreaming = React.useCallback(() => {
    if (isStreaming && cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
      setIsStreaming(false);
    }
  }, [isStreaming]);

  // Handle open/close state changes
  React.useEffect(() => {
    if (isOpen) {
      // When opening, set initial states
      setIsMinimized(false);
      setIsMaximized(false);
      setHeight(defaultHeight);

      // Don't automatically start streaming here - we'll let the tab-specific effect handle that
    } else {
      // When closing, clean up
      setIsMinimized(false);
      setIsMaximized(false);
      setHeight(defaultHeight);

      // Always stop streaming when closed
      stopStreaming();
    }

    // Return cleanup function to stop streaming when component unmounts
    return () => {
      stopStreaming();
    };
  }, [isOpen, defaultHeight, stopStreaming])

  React.useEffect(() => {
    // Only apply scroll lock when the terminal is actually open
    if (isOpen) {
      // We don't need to lock scrolling as the drawer handles this
      document.body.style.pointerEvents = 'auto !important';
    }

    return () => {
      // Clean up when the component is unmounted
      document.body.removeAttribute('data-scroll-locked');
    };
  }, [isOpen]);

  // State to track streaming mode
  const [streamMode, setStreamMode] = React.useState<'sse' | 'regular'>('sse');



  // Only render the component when it's supposed to be open
  if (!isOpen) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      {!isMinimized && (
        <Tabs

          value={activeTab}
          onValueChange={(val) =>
            setActiveTab(val as "terminal" | "proples" | "preview")
          }
        >
          <TabsList className="border-b bg-neutral-100 w-full text-start justify-start">
            <TabsTrigger
              value="preview"
              className="px-4 py-1 text-sm"
              disabled={!localPreviewData}
            >
              Preview
            </TabsTrigger>
            <TabsTrigger
              value="terminal"
              className="px-4 py-1 text-sm"
            >
              Logs
            </TabsTrigger>
            <TabsTrigger
              value="proples"
              className="px-4 py-1 text-sm"
            >
              Problems
            </TabsTrigger>
            
          </TabsList>

          <div
            className="flex-1 overflow-auto p-3 text-sm font-mono bg-white"
            // Custom scrollbars if desired
            style={{
              lineHeight: "1.4rem",
              maxHeight: "calc(100vh - 150px)",
              overflowY: "auto"
            }}
          >
            <TabsContent value="terminal">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {isStreaming ? (
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                      <span className="text-xs text-green-600">Stream active ({streamMode === 'sse' ? 'SSE' : 'Regular'} mode)</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-gray-400 mr-2"></div>
                      <span className="text-xs text-gray-500">Stream inactive</span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {localTerminalLogs?.length > 0 ? `${localTerminalLogs?.length} log entries` : ''}
                </div>
              </div>

              {localTerminalLogs?.length > 0 ? (
                <>
                  {localTerminalLogs?.map((log, index) => (
                    <div
                      key={index}
                      className="mb-1 flex items-start"
                      style={{
                        color:
                          log.level === "error"
                            ? "#dc3545"
                            : log.level === "warning"
                              ? "#ffc107"
                              : "#28a745",
                      }}
                    >
                      <span className="text-neutral-500 mr-2">
                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : index}
                      </span>
                      <span>{log.message}</span>
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </>
              ) : (
                <div className="italic text-neutral-500">
                  {isStreaming ? "Waiting for logs..." : "No terminal logs available..."}
                </div>
              )}
            </TabsContent>
            <TabsContent value="proples">
              {localProplesLogs.length > 0 ? (
                <>
                  {localProplesLogs.map((log, index) => (
                    <div
                      key={index}
                      className="mb-1 flex items-start"
                      style={{
                        color:
                          log.level === "error"
                            ? "#dc3545"
                            : log.level === "warning"
                              ? "#ffc107"
                              : "#28a745",
                      }}
                    >
                      <span className="text-neutral-500 mr-2">
                        {log.timestamp}
                      </span>
                      <span>{log.message}</span>
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </>
              ) : (
                <div className="italic text-neutral-500">
                  No problems available...
                </div>
              )}
            </TabsContent>

            <TabsContent value="preview">
              {localPreviewData && localPreviewData.outputs && localPreviewData.outputs.length > 0 ? (
                <div className="font-sans">


                  {localPreviewData.outputs.map((output, index) => {
                    // Create columns for the DataTable based on the first row
                    const columns = output.rows.length > 0
                      ? Object.keys(output.rows[0]).map(key => ({
                        accessorKey: key,
                        header: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
                        cell: ({ row }: any) => (
                          <div className="truncate max-w-[200px]" title={row.getValue(key)}>
                            {row.getValue(key)}
                          </div>
                        )
                      }))
                      : [];

                    return (
                      <div key={index} className="mb-6">
                        {output.name && output.name !== localPreviewData.transformationName && (
                          <h4 className="text-sm font-medium mb-2">{output.name}</h4>
                        )}

                        {output.rows.length > 0 ? (
                          <DataTable
                            data={output.rows}
                            columns={columns}
                            pagination={true}
                            topVariant="status"
                          />
                        ) : (
                          <div className="italic text-neutral-500 p-4 text-center border rounded">
                            No data available for this output
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="italic text-neutral-500 flex items-center justify-center h-40">
                  No preview data available...
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      )}
    </div>
  )
}
