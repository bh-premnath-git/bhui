import { Mic, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectItem, SelectContent, SelectValue } from "@/components/ui/select";
import { useState, useRef, useEffect } from "react";
import { useConnections as useAdminConnections } from '@/features/admin/connection/hooks/useConnection';

interface Connection {
  id: number | string;
  connection_config_name: string;
}

interface AIChatInputProps {
  variant: string;
  input: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onVoiceInput?: () => void;
  placeholder?: string;
  disabled?: boolean;
  onConnectionChange?: (connectionId: string) => void;
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
}: AIChatInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const isExplorer = variant === 'explorer';
  
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

  const handleConnectionChange = (connId: string) => {
    setSelectedConnection(connId);
    onConnectionChange?.(connId);
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
        onClick={onVoiceInput}
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Voice input"
      >
        <Mic className="h-4 w-4" />
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
          value={input}
          onChange={e => onChange(e.target.value)}
          placeholder={
            isExplorer && !selectedConnection
              ? "Select a connection..."
              : placeholder
          }
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
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
        onClick={onSend}
        variant="ghost"
        size="icon"
        disabled={disabled || !input.trim()}
        className={`
          h-7 w-7 transition-all duration-150 ease-in-out
          ${disabled || !input.trim()
            ? "text-green-500 cursor-not-allowed opacity-50"
            : "text-green-700 hover:text-green-600 hover:bg-green-50"}
        `}
        aria-label="Send message"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}