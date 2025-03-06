import { useState, useEffect, useRef, useCallback } from "react";
import { AIChatInput } from "./AIChatInput";
import { Button } from "@/components/ui/button";
import { PlusCircle, Database, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { useConnections } from "@/features/admin/connection/hooks/useConnection";
import { useXplore } from "@/features/data-catalog/hooks/useXplore";
import { toast } from "sonner";
import { Message } from "./ResponseDisplay";

interface AIChatProps {
  compact?: boolean;
  showHistory?: boolean;
  onStreamStart?: () => void;
  onStreamData?: (message: Message) => void;
  onStreamEnd?: () => void;
}

export default function AIChat({
  compact = false,
  showHistory = false,
  onStreamStart,
  onStreamData,
  onStreamEnd
}: AIChatProps) {
  const { connections, isLoading: connectionsLoading } = useConnections();
  const { createConversation, streamConversation } = useXplore();
  const [input, setInput] = useState<string>("");
  const [selectedConnection, setSelectedConnection] = useState<number | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const hasInitializedRef = useRef<boolean>(false);
  const prevConnectionRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputDebounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const assistantMessageRef = useRef<string>("");

  const currentConnection = selectedConnection
    ? connections?.find(conn => conn.id === Number(selectedConnection))
    : connections?.[0];

  const startNewChat = useCallback(async () => {
    if (isLoading) {
      return;
    }

    try {
      setIsLoading(true);
      console.log("Starting new chat with connection:", selectedConnection);

      const response = await createConversation();
      if (response.data.thread_id) {
        setThreadId(response.data.thread_id);
        setMessages([]);
        console.log("New chat started with thread_id:", response.data.thread_id);
        window.dispatchEvent(new CustomEvent('xplorer:new-chat'));
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

  useEffect(() => {
    if (!connectionsLoading && connections && connections.length > 0 && !selectedConnection) {
      setSelectedConnection(Number(connections[0].id));
      console.log("Selected first connection:", connections[0].id);
    }
  }, [connections, connectionsLoading, selectedConnection]);

  useEffect(() => {
    if (!hasInitializedRef.current && !isLoading && !threadId) {
      console.log("Initializing first chat session");
      startNewChat();
      hasInitializedRef.current = true;
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }

      if (inputDebounceTimeoutRef.current) {
        clearTimeout(inputDebounceTimeoutRef.current);
      }
    };
  }, [isLoading, threadId, startNewChat]);

  useEffect(() => {
    if (hasInitializedRef.current && selectedConnection && prevConnectionRef.current !== selectedConnection) {
      console.log("Connection changed from", prevConnectionRef.current, "to", selectedConnection, "starting new chat");
      startNewChat();
    }
    prevConnectionRef.current = selectedConnection;
  }, [selectedConnection, startNewChat]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleStreamStart = useCallback(() => {
    console.log("Stream started");
    setIsStreaming(true);
    if (onStreamStart) {
      onStreamStart();
    }
  }, [onStreamStart]);

  const handleStreamData = useCallback(
    (content: string) => {
      setIsStreaming(true);
      assistantMessageRef.current = content;

      // Notify parent of new data as it comes in
      if (onStreamData) {
        onStreamData({
          role: "assistant",
          content,
        });
      }
    },
    [onStreamData]
  );

  useEffect(() => {
    if (messages.length > 0 && onStreamData && isStreaming) {
      const lastMessage = messages[messages.length - 1];
      onStreamData(lastMessage);
    }
  }, [isStreaming, onStreamData, messages]);

  useEffect(() => {
    const handleSetQuestion = (event: CustomEvent) => {
      const { question } = event.detail;
      setInput(question);
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

  const handleInputChange = (value: string) => {
    if (inputDebounceTimeoutRef.current) {
      clearTimeout(inputDebounceTimeoutRef.current);
    }
    inputDebounceTimeoutRef.current = setTimeout(() => {
      setInput(value);
    }, 300);
  };

  const handleSend = async () => {
    if (!input.trim()) {
      return;
    }

    // Reset assistant message reference for new conversation
    assistantMessageRef.current = "";

    // Validate necessary connections
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
      setError(null);

      // Add user message to the UI
      const userMessage = input.trim();
      const newMessage = { role: 'user' as const, content: userMessage };
      setMessages(prev => [...prev, newMessage]);

      // Clear input
      setInput("");

      // Signal stream start
      handleStreamStart();

      // Add assistant placeholder for better UX
      const assistantPlaceholder = { role: 'assistant' as const, content: '' };
      setMessages(prev => [...prev, assistantPlaceholder]);

      console.log("Starting stream with:", {
        connectionId: selectedConnection,
        question: userMessage,
        threadId
      });

      // Handle the streaming conversation
      cleanupRef.current = streamConversation(
        selectedConnection,
        userMessage,
        threadId,
        (chunk) => {
          try {
            // Process the streaming chunk
            let content = chunk;
            try {
              const parsedChunk = JSON.parse(chunk);
              content = parsedChunk.content || chunk;
            } catch (e) {
              // If not valid JSON, use the raw chunk
              content = chunk;
            }

            // Update the assistant message reference
            assistantMessageRef.current += content;

            // Update messages state
            setMessages(prev => {
              const newMessages = [...prev];
              const lastIndex = newMessages.length - 1;

              if (lastIndex >= 0 && newMessages[lastIndex].role === 'assistant') {
                newMessages[lastIndex] = {
                  ...newMessages[lastIndex],
                  content: assistantMessageRef.current
                };
              }

              return newMessages;
            });

            // Notify parent of stream data
            handleStreamData(assistantMessageRef.current);
          } catch (e) {
            console.error("Error processing stream chunk:", e);
          }
        },
        () => {
          console.log("Stream completed");
          setIsStreaming(false);
          cleanupRef.current = null;
          if (onStreamEnd) {
            onStreamEnd();
          }
        },
        (error) => {
          console.error("Stream error:", error);
          setError(error.message || "An error occurred during streaming");
          setIsStreaming(false);
          cleanupRef.current = null;

          const errorMessage = {
            role: 'assistant' as const,
            content: "Sorry, I encountered an error while processing your request."
          };

          setMessages(prev => {
            const newMessages = [...prev];
            const lastIndex = newMessages.length - 1;

            if (lastIndex >= 0 && newMessages[lastIndex].role === 'assistant') {
              newMessages[lastIndex] = errorMessage;
            }
            return newMessages;
          });

          if (onStreamEnd) {
            onStreamEnd();
          }

          toast.error("Error receiving message from AI");
        }
      );
    } catch (error: any) {
      console.error("Failed to send message:", error);
      setError(error.message || "An error occurred");
      setIsStreaming(false);
      if (onStreamEnd) {
        onStreamEnd();
      }
      toast.error("Failed to send message");
    }
  };

  const handleSelectConnection = (connectionId: number) => {
    if (connectionId === selectedConnection) {
      return;
    }
    setSelectedConnection(connectionId);
  };

  const isInputDisabled = isLoading || isStreaming;

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
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-2"
              onSelect={() => {
                hasInitializedRef.current = false;
                startNewChat();
              }}
            >
              <PlusCircle className="h-4 w-4" />
              <span>New Chat</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex-1">
          <AIChatInput
            input={input}
            onChange={handleInputChange}
            onSend={handleSend}
            placeholder="Ask a question about your data..."
            disabled={isInputDisabled}
          />
        </div>
      </div>
    );
  }
}