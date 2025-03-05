import { useState, useEffect, useRef, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatMessages } from "@/hooks/useChatMessages";
import { PanelLayout } from "./shared/PanelLayout";
import { AIChatInput } from "./AIChatInput";
import { Card } from "@/components/ui/card";
import { useAnalytics } from "@/context/AnalyticsContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle, Database, ChevronDown, User, Bot } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import {
  fetchChatHistory,
  getConversationContext,
  updateConversationContext,
  type ConversationContext
} from "@/api/analytics-api";
import type { ChatSession } from "@/types/dataops/data-ops-hub.d";
import { useConnections } from "@/features/admin/connection/hooks/useConnection";
import { useXplore } from "@/features/data-catalog/hooks/useXplore";
import { LazyLoading } from "@/components/shared/LazyLoading";
import { toast } from "sonner";

interface AIChatProps {
  compact?: boolean;
  showHistory?: boolean;
}

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

export default function AIChat({ compact = false, showHistory = false }: AIChatProps) {
  const { connections, isLoading: connectionsLoading } = useConnections();
  const { createConversation, streamConversation } = useXplore();
  const [input, setInput] = useState<string>("");
  const [selectedConnection, setSelectedConnection] = useState<number | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);
  const hasInitializedRef = useRef<boolean>(false);
  const prevConnectionRef = useRef<number | null>(null); // Track the previous connection
  const messagesEndRef = useRef<HTMLDivElement | null>(null); // Reference for auto-scrolling
  const inputDebounceTimeoutRef = useRef<NodeJS.Timeout | null>(null); // For input debouncing
  
  // Get the selected connection object
  const currentConnection = selectedConnection 
    ? connections?.find(conn => conn.id === Number(selectedConnection)) 
    : connections?.[0];

  // Define startNewChat function before using it in useEffect
  const startNewChat = useCallback(async () => {
    // Don't check for selectedConnection here, we might want to initialize the threadId anyway
    if (isLoading) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Log the state before starting
      console.log("Starting new chat with connection:", selectedConnection);
      
      const response = await createConversation();
      
      // Only update if we got a valid thread_id
      if (response.data.thread_id) {
        setThreadId(response.data.thread_id);
        setMessages([]);
        console.log("New chat started with thread_id:", response.data.thread_id);
      } else {
        console.error("No thread_id returned from createConversation");
        toast.error("Failed to start new chat: No thread ID returned");
      }
    } catch (error) {
      console.error("Failed to start new chat:", error);
      toast.error("Failed to start new chat");
    } finally {
      setIsLoading(false);
    }
  }, [createConversation, isLoading, selectedConnection]);

  // Select the first connection when connections are loaded
  useEffect(() => {
    if (!connectionsLoading && connections && connections.length > 0 && !selectedConnection) {
      setSelectedConnection(Number(connections[0].id));
      console.log("Selected first connection:", connections[0].id);
    }
  }, [connections, connectionsLoading, selectedConnection]);

  // Initialize a new chat only once when the component mounts
  useEffect(() => {
    if (!hasInitializedRef.current && !isLoading && !threadId) {
      console.log("Initializing first chat session");
      startNewChat();
      hasInitializedRef.current = true;
    }
    
    // Cleanup any active streams when component unmounts
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      
      // Clear any debounce timeouts
      if (inputDebounceTimeoutRef.current) {
        clearTimeout(inputDebounceTimeoutRef.current);
      }
    };
  }, [isLoading, threadId, startNewChat]);

  // Start a new chat when the connection changes - but NOT when threadId changes
  useEffect(() => {
    // Only proceed if the connection has actually changed from a previous value
    if (hasInitializedRef.current && selectedConnection && prevConnectionRef.current !== selectedConnection) {
      console.log("Connection changed from", prevConnectionRef.current, "to", selectedConnection, "starting new chat");
      startNewChat();
    }
    
    // Update the previous connection reference
    prevConnectionRef.current = selectedConnection;
  }, [selectedConnection, startNewChat]); // Removed threadId from dependencies
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Listen for question selection events
  useEffect(() => {
    const handleSetQuestion = (event: CustomEvent) => {
      const { question } = event.detail;
      setInput(question); // This properly updates the React state
      
      // Focus the input field if needed
      const inputField = document.querySelector('input[placeholder*="Ask a question"]') as HTMLInputElement;
      if (inputField) {
        inputField.focus();
      }
    };

    window.addEventListener('xplorer:set-question', handleSetQuestion as EventListener);
    
    return () => {
      window.removeEventListener('xplorer:set-question', handleSetQuestion as EventListener);
    };
  }, []);

  // Debounced input handler
  const handleInputChange = (value: string) => {
    // Clear any existing timeout
    if (inputDebounceTimeoutRef.current) {
      clearTimeout(inputDebounceTimeoutRef.current);
    }
    
    // Set a new timeout
    inputDebounceTimeoutRef.current = setTimeout(() => {
      setInput(value);
    }, 300); // 300ms debounce delay
  };

  const handleSend = async () => {
    if (!input.trim()) {
      return;
    }
    
    if (!threadId) {
      console.log("No thread ID available, attempting to start a new chat");
      await startNewChat();
      if (!threadId) {
        toast.error("Unable to start a chat. Please try again.");
        return;
      }
    }
    
    if (!selectedConnection) {
      toast.error("Please select a connection first");
      return;
    }
    
    try {
      const userMessage = input;
      
      // Add user message to UI immediately
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      
      // Clear input
      setInput("");
      
      // Start streaming indicator
      setIsStreaming(true);
      console.log("Starting stream with:", {
        connectionId: selectedConnection,
        message: userMessage,
        threadId
      });
      
      // Store assistant's message content as it streams in
      let assistantMessage = "";
      
      // Add an initial assistant message placeholder
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      
      // Start the stream
      cleanupRef.current = streamConversation(
        selectedConnection,
        userMessage,
        threadId,
        (chunk) => {
          console.log("Received chunk:", chunk);
          
          try {
            // Try to parse the JSON chunk
            const parsedChunk = JSON.parse(chunk);
            const content = parsedChunk.content || chunk;
            console.log("Parsed content:", content);
            
            // Append the new content to the assistant's message
            assistantMessage += content;
            
            // Update the messages array with the latest content
            setMessages(prev => {
              const newMessages = [...prev];
              // Get the last message (should be the assistant's)
              const lastIndex = newMessages.length - 1;
              
              if (lastIndex >= 0 && newMessages[lastIndex].role === 'assistant') {
                // Update existing assistant message
                newMessages[lastIndex] = {
                  ...newMessages[lastIndex],
                  content: assistantMessage
                };
              }
              
              return newMessages;
            });
          } catch (e) {
            console.error("Error parsing chunk:", e);
            // If parsing fails, just append the raw chunk
            assistantMessage += chunk;
            
            setMessages(prev => {
              const newMessages = [...prev];
              const lastIndex = newMessages.length - 1;
              
              if (lastIndex >= 0 && newMessages[lastIndex].role === 'assistant') {
                newMessages[lastIndex] = {
                  ...newMessages[lastIndex],
                  content: assistantMessage
                };
              }
              
              return newMessages;
            });
          }
        },
        // On completion
        () => {
          console.log("Stream completed");
          setIsStreaming(false);
          cleanupRef.current = null;
        },
        // On error
        (error) => {
          console.error("Stream error:", error);
          setIsStreaming(false);
          cleanupRef.current = null;
          
          // Update the assistant message to show the error
          setMessages(prev => {
            const newMessages = [...prev];
            const lastIndex = newMessages.length - 1;
            
            if (lastIndex >= 0 && newMessages[lastIndex].role === 'assistant') {
              newMessages[lastIndex] = {
                ...newMessages[lastIndex],
                content: "Sorry, I encountered an error while processing your request."
              };
            }
            
            return newMessages;
          });
          
          toast.error("Error receiving message from AI");
        }
      );
    } catch (error) {
      console.error("Failed to send message:", error);
      setIsStreaming(false);
      toast.error("Failed to send message");
    }
  };

  const handleSelectConnection = (connectionId: number) => {
    if (connectionId === selectedConnection) {
      return; // Prevent unnecessary re-selection
    }
    
    setSelectedConnection(connectionId);
    console.log("Selected connection:", connectionId);
  };

  // Debug the disabled state
  const isInputDisabled = isLoading || isStreaming;
  console.log("Input disabled state:", { isLoading, isStreaming, threadId, isInputDisabled });

  if (compact) {
    return (
      <div className="w-full flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <div className="flex items-center gap-1 text-xs">
                <Database className="h-3 w-3" />
                <span className="truncate max-w-[120px]">
                  {connectionsLoading 
                    ? "Loading..." 
                    : currentConnection?.connection_config_name || "Select Connection"}
                </span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Database Connection</DropdownMenuLabel>
            {connectionsLoading ? (
              <DropdownMenuItem disabled>
                <span className="text-muted-foreground">Loading connections...</span>
              </DropdownMenuItem>
            ) : connections?.length ? (
              connections.map((connection) => (
                <DropdownMenuItem 
                  key={connection.id}
                  className="flex items-center gap-2"
                  onSelect={() => handleSelectConnection(Number(connection.id))}
                >
                  <Database className="h-4 w-4" />
                  <span>{connection.connection_config_name}</span>
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>
                <span className="text-muted-foreground">No connections available</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Recent Chats</DropdownMenuLabel>
            {/* Chat history items placeholder */}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="flex items-center gap-2"
              onSelect={() => {
                console.log("Manual new chat request");
                hasInitializedRef.current = false;
                startNewChat();
              }}
            >
              <PlusCircle className="h-4 w-4" />
              <span>New Chat</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          className="text-xs px-2 py-1 rounded"
        >
          {/* Context toggle placeholder */}
        </button>

        <div className="flex-1">
          <AIChatInput
            input={input}
            onChange={setInput}
            onSend={handleSend}
            placeholder="Ask a question about your data..."
            disabled={isInputDisabled}
          />
        </div>
      </div>
    );
  }

  if (!showHistory) {
    return (
      <PanelLayout>
        <div className="text-sm text-muted-foreground mb-4 flex items-center justify-between p-2 bg-muted rounded-md">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span>Connected to: {
              connectionsLoading 
                ? "Loading..." 
                : currentConnection?.connection_config_name || "No connection selected"
            }</span>
          </div>
          {selectedConnection === null && connections?.length > 0 && (
            <Select onValueChange={(value) => handleSelectConnection(Number(value))}>
              <SelectTrigger className="w-[180px] h-8 text-xs">
                <SelectValue placeholder="Select connection" />
              </SelectTrigger>
              <SelectContent>
                {connections.map((conn) => (
                  <SelectItem key={conn.id} value={String(conn.id)}>
                    {conn.connection_config_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <ScrollArea className="flex-1 pr-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <LazyLoading />
            </div>
          ) : (
            <div className="space-y-4">
              {messages.length > 0 ? (
                messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex items-start gap-2 max-w-[80%]">
                      {message.role === 'assistant' && (
                        <div className="bg-primary text-primary-foreground rounded-full p-1 mt-1">
                          <Bot className="h-4 w-4" />
                        </div>
                      )}
                      <div 
                        className={`rounded-lg px-4 py-2 ${
                          message.role === 'user' 
                            ? 'bg-primary text-primary-foreground rounded-br-none' 
                            : 'bg-muted text-foreground rounded-bl-none'
                        }`}
                      >
                        {message.content || (message.role === 'assistant' && isStreaming ? 'Thinking...' : '')}
                      </div>
                      {message.role === 'user' && (
                        <div className="bg-primary text-primary-foreground rounded-full p-1 mt-1">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  {isLoading ? "Starting new chat..." : "No messages yet. Start by asking a question below."}
                </div>
              )}
              {isStreaming && messages.length === 0 && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2 max-w-[80%]">
                    <div className="bg-primary text-primary-foreground rounded-full p-1 mt-1">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="rounded-lg px-4 py-2 bg-muted text-foreground rounded-bl-none animate-pulse">
                      AI is thinking...
                    </div>
                  </div>
                </div>
              )}
              {/* Auto-scroll anchor element */}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        <div className="flex gap-2 mt-auto">
          <AIChatInput
            input={input}
            onChange={handleInputChange} // Use debounced handler
            onSend={handleSend}
            placeholder="Ask a question about your data..."
            disabled={isInputDisabled}
          />
        </div>
      </PanelLayout>
    );
  }

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1 w-full justify-center"
        onClick={() => {
          console.log("Manual new chat request");
          hasInitializedRef.current = false;
          startNewChat();
        }}
        disabled={isLoading}
      >
        <PlusCircle className="h-4 w-4" />
        <span>{isLoading ? (
          <div className="flex items-center gap-2">
            <span>Starting...</span>
          </div>
        ) : "New Chat"}</span>
      </Button>

      <div className="text-sm text-muted-foreground mb-4 flex items-center gap-2 p-2 bg-muted rounded-md">
        <Database className="h-4 w-4" />
        <span>
          Connected to: {
            connectionsLoading 
              ? "Loading..." 
              : currentConnection?.connection_config_name || "No connection selected"
          }
        </span>
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium text-muted-foreground">Recent Chats</div>
        <div className="text-center text-muted-foreground py-2">
          {connectionsLoading ? (
            <div className="flex justify-center">
              <LazyLoading />
            </div>
          ) : "No recent chats"}
        </div>
      </div>
    </div>
  );
}