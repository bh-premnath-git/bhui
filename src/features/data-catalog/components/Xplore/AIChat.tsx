import { useState, useEffect } from "react";
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

interface AIChatProps {
  compact?: boolean;
  showHistory?: boolean;
}


export default function AIChat({ compact = false, showHistory = false }: AIChatProps) {
  const { connections, isLoading: connectionsLoading } = useConnections();
  const { createConversation } = useXplore();
  const [input, setInput] = useState<string>("")
  const [selectedConnection, setSelectedConnection] = useState<number | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get the selected connection object
  const currentConnection = selectedConnection 
    ? connections?.find(conn => conn.id === Number(selectedConnection)) 
    : connections?.[0];

  // Initialize a new chat when the component mounts
  useEffect(() => {
    startNewChat();
  }, []);

  // Start a new chat conversation and get a thread_id
  const startNewChat = async () => {
    try {
      setIsLoading(true);
      const response = await createConversation();
      setThreadId(response.data.thread_id);
      setMessages([]);
      console.log("New chat started with thread_id:", response.data.thread_id);
    } catch (error) {
      console.error("Failed to start new chat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !threadId) return;
    
    try {
      setIsLoading(true);
      const userMessage = input;
      
      // Add user message to UI immediately
      setMessages(prev => [...prev, `User: ${userMessage}`]);
      
      // Clear input
      setInput("");
      
      // TODO: Send the message to the conversation API with the thread_id
      // This would be implementation once you have the sendMessage function
      // const response = await sendMessage(threadId, userMessage);
      // setMessages(prev => [...prev, `AI: ${response.data.message}`]);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSelectConnection = (connectionId: number) => {
    setSelectedConnection(connectionId);
  }

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
              onSelect={startNewChat}
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
            disabled={isLoading || !threadId}
          />
        </div>
      </div>
    );
  }

  if (!showHistory) {
    return (
      <PanelLayout>
        <div className="text-sm text-muted-foreground mb-4 flex items-center gap-2 p-2 bg-muted rounded-md">
          <Database className="h-4 w-4" />
          <span>Connected to: {
            connectionsLoading 
              ? "Loading..." 
              : currentConnection?.connection_config_name || "No connection selected"
          }</span>
        </div>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.length > 0 ? (
              messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${message.startsWith('User:') ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.startsWith('User:') 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    {message}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                {isLoading ? "Starting new chat..." : "No messages yet. Start by asking a question below."}
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2 mt-auto">
          <AIChatInput
            input={input}
            onChange={setInput}
            onSend={handleSend}
            placeholder="Ask a question about your data..."
            disabled={isLoading || !threadId}
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
        onClick={startNewChat}
        disabled={isLoading}
      >
        <PlusCircle className="h-4 w-4" />
        <span>{isLoading ? "Starting..." : "New Chat"}</span>
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
          {connectionsLoading ? "Loading..." : "No recent chats"}
        </div>
      </div>
    </div>
  );
}