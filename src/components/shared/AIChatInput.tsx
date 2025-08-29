import { Mic, MicOff, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectItem, SelectContent, SelectValue } from "@/components/ui/select";
import { useState, useRef, useEffect } from "react";
import { useConnections as useAdminConnections } from '@/features/admin/connection/hooks/useConnection';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { getColumnSuggestions } from '@/lib/pipelineAutoSuggestion';

interface Connection {
  id: number | string;
  connection_config_name: string;
}

interface AIChatInputProps {
  variant: string;
  input: string;
  onChange: (value: string) => void;
  onSend: (availableColumns?: Record<string, any>) => void;
  onVoiceInput?: () => void;
  placeholder?: string;
  disabled?: boolean;
  onConnectionChange?: (connectionId: string) => void;
  enableVoiceInput?: boolean;
  isLoading?: boolean;
  // Pipeline context props for column suggestions
  currentNodeId?: string;
  nodes?: any[];
  edges?: any[];
  pipelineDtl?: any;
}

export function AIChatInput({
  input,
  onChange,
  onSend,
  onVoiceInput,
  placeholder = "Ask about your data…",
  disabled,
  variant,
  onConnectionChange,
  enableVoiceInput = false,
  currentNodeId,
  nodes,
  edges,
  pipelineDtl,
}: AIChatInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const isExplorer = variant === 'explorer';
  
  // Speech recognition functionality
  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition();
  
  // Always call the hook to avoid conditional hook calls
  const { 
    connections: hookConnections, 
    isLoading: hookIsLoading, 
    isFetching: hookIsFetching, 
    isError: hookIsError 
  } = useAdminConnections();

  // Conditionally use the hook data
  const connections = isExplorer ? (hookConnections as Connection[] || []) : [];
  const isLoading = isExplorer ? hookIsLoading : false;
  const isFetching = isExplorer ? hookIsFetching : false;
  const isError = isExplorer ? hookIsError : false;


  // Set initial connection when connections are loaded
  useEffect(() => {
    if (isExplorer && 
        !selectedConnection && 
        connections && 
        connections.length > 0 && 
        !isLoading && 
        !isFetching) {
      const connId = connections[0].id.toString();
      setSelectedConnection(connId);
      onConnectionChange?.(connId);
    }
  }, [connections, selectedConnection, isExplorer, onConnectionChange, isLoading, isFetching]);

  // Handle voice input transcript
  useEffect(() => {
    if (transcript) {
      onChange(input + transcript);
      resetTranscript();
    }
  }, [transcript, input, onChange, resetTranscript]);

  // Handle voice input toggle
  const handleVoiceInput = () => {
    if (enableVoiceInput && isSupported) {
      if (isListening) {
        stopListening();
      } else {
        startListening();
      }
    } else if (onVoiceInput) {
      onVoiceInput();
    }
  };

  const handleConnectionChange = (connId: string) => {
    setSelectedConnection(connId);
    onConnectionChange?.(connId);
  };

  // Function to handle sending message with available columns
  const handleSendWithColumns = async () => {
    if (!input.trim()) return;

    let availableColumns: Record<string, any> = {};
    
    // Get available columns for the current node if pipeline context is available
    if (nodes && edges && pipelineDtl) {
      try {
        // Determine the node to use for column suggestions
        let nodeIdToUse = currentNodeId;
        
        // If no currentNodeId provided, use the last node in the pipeline
        if (!nodeIdToUse && nodes && nodes.length > 0) {
          // Find the last node (node with no outgoing edges)
          const nodeIds = nodes.map(node => node.id);
          const nodesWithOutgoingEdges = new Set(edges?.map(edge => edge.source) || []);
          
          // Find nodes that have no outgoing edges (terminal nodes)
          const terminalNodes = nodes.filter(node => !nodesWithOutgoingEdges.has(node.id));
          
          if (terminalNodes.length > 0) {
            // Use the first terminal node found
            nodeIdToUse = terminalNodes[0].id;
            console.log('Using terminal node as current node:', nodeIdToUse);
          } else {
            // Fallback to the last node in the array
            const lastNode = nodes[nodes.length - 1];
            nodeIdToUse = lastNode?.id;
            console.log('Using last node in array as current node:', nodeIdToUse);
          }
        }
        
        if (nodeIdToUse) {
          const columnSuggestions = await getColumnSuggestions(nodeIdToUse, nodes, edges, pipelineDtl);
          console.log('Column suggestions for node', nodeIdToUse, ':', columnSuggestions);
          
          // Convert array to object format if needed
          if (Array.isArray(columnSuggestions)) {
            availableColumns = { columns: columnSuggestions };
          } else {
            availableColumns = columnSuggestions || {};
          }
        } else {
          console.warn('No valid node ID found for column suggestions');
          availableColumns = { columns: [] };
        }
      } catch (columnError) {
        console.warn('Failed to get column suggestions:', columnError);
        availableColumns = { columns: [] };
      }
    } else {
      console.warn('Pipeline context not available for column suggestions');
      availableColumns = { columns: [] };
    }

    console.log('Available columns being passed:', availableColumns);
    onSend(availableColumns);
  };
  
  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 250)}px`;
  };

  useEffect(() => {
    if (textareaRef.current) {
      autoResize(textareaRef.current);
    }
  }, [input]);

  const renderConnectionOptions = () => {
    if (!isExplorer) return null;

    if (isLoading || isFetching) {
      return (
        <SelectItem value="loading" disabled>
          Loading connections...
        </SelectItem>
      );
    }

    if (isError) {
      return (
        <SelectItem value="error" disabled>
          Failed to load connections
        </SelectItem>
      );
    }

    if (!connections || connections.length === 0) {
      return (
        <SelectItem value="no-connections" disabled>
          No connections available
        </SelectItem>
      );
    }

    return connections.map(conn => (
      <SelectItem key={conn.id} value={conn.id.toString()} className="bg-white text-slate-900 py-2 hover:bg-gray-100">
        {conn.connection_config_name}
      </SelectItem>
    ));
  };

  return (
    <div className="space-y-2">
      {/* Voice Status Indicator */}
      {enableVoiceInput && isListening && (
        <div className="flex items-center justify-center gap-2 p-2 bg-red-50 rounded-lg">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className="text-sm font-medium text-red-700">Listening... Speak now</span>
        </div>
      )}
      
      {/* Voice Error Display */}
      {enableVoiceInput && error && (
        <div className="p-2 bg-red-100 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      
      <div
        className={`
          flex items-center w-full bg-white rounded-md
          px-2 py-1 space-x-1 shadow-sm
          border transition-all duration-200 ease-in-out
          relative
          ${isFocused 
            ? "border-green-400 ring-1 ring-green-400/30" 
            : "border-gray-200 hover:border-gray-300"}
        `}
        data-connection-id={isExplorer ? selectedConnection : undefined}
      >
      {/* Voice input */}
      <Button
        onClick={handleVoiceInput}
        variant="ghost"
        size="icon"
        className={`h-8 w-8 transition-colors ${
          enableVoiceInput && isListening
            ? "text-red-500 hover:text-red-600"
            : "text-gray-400 hover:text-gray-600"
        }`}
        aria-label={enableVoiceInput && isListening ? "Stop listening" : "Voice input"}
        disabled={enableVoiceInput && !isSupported}
      >
        {enableVoiceInput && isListening ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>

      {/* Connection dropdown - shown only for explorer variant */}
      {isExplorer && (
        <Select 
          value={selectedConnection} 
          onValueChange={handleConnectionChange}
          disabled={isLoading || isFetching}
        >
          <SelectTrigger className="h-8 w-32">
            <SelectValue
              placeholder={
                isLoading || isFetching
                  ? 'Loading...'
                  : isError
                  ? 'Error'
                  : 'Select connection'
              }
            />
          </SelectTrigger>
          <SelectContent className="z-[110] bg-white shadow-lg border border-gray-200">
            {renderConnectionOptions()}
          </SelectContent>
        </Select>
      )}

      {/* Auto-resizing textarea */}
      <div className="flex-grow">
        <Textarea
          ref={textareaRef}
          value={input + interimTranscript}
          onChange={e => onChange(e.target.value)}
          placeholder={
            isExplorer && !selectedConnection
              ? "Select a connection..."
              : placeholder
          }
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendWithColumns();
            }
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          rows={1}
          maxLength={500}
          className="
            w-full
            bg-transparent
            resize-none
            overflow-y-auto
            placeholder:text-gray-400
            !border-none
            !outline-none
            !ring-0
            px-2 py-1.5 mx-1
            text-sm
            !shadow-none"
          style={{ 
            height: "auto", 
            maxHeight: "8rem", 
            minHeight: "2rem",
            caretColor: "#10b981",
          }}
          onInput={e => autoResize(e.currentTarget)}
          disabled={disabled}
        />
      </div>

      {/* Send button */}
      <Button
        onClick={handleSendWithColumns}
        variant="ghost"
        size="icon"
        disabled={disabled || !input.trim() || isLoading}
        className={`
          h-7 w-7 transition-all duration-150 ease-in-out
          ${disabled || !input.trim() || isLoading
            ? "text-green-500 cursor-not-allowed opacity-50"
            : "text-green-700 hover:text-green-600 hover:bg-green-50"}
        `}
        aria-label={isLoading ? "Processing..." : "Send message"}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
      </div>
    </div>
  );
}