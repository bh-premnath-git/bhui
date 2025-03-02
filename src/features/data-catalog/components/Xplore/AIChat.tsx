import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatMessages } from "@/hooks/useChatMessages";
import { PanelLayout } from "./shared/PanelLayout";
import { AIChatInput } from "@/components/shared/AIChatInput";
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
import { PlusCircle, Database, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";

interface AIChatProps {
  compact?: boolean;
  showHistory?: boolean;
}

// Hardcoded connections for now
const AVAILABLE_CONNECTIONS = [
  { id: "postgres-prod", name: "PostgreSQL (Production)", type: "postgres" },
  { id: "snowflake-dw", name: "Snowflake Data Warehouse", type: "snowflake" },
  { id: "bigquery-analytics", name: "BigQuery Analytics", type: "bigquery" },
  { id: "mysql-app", name: "MySQL App Database", type: "mysql" }
];

// Chat history with associated questions and connections
const CHAT_HISTORY = [
  { 
    id: "recent-1", 
    title: "Sales analysis by region", 
    timestamp: new Date(Date.now() - 3600000),
    connection: "snowflake-dw",
    messages: [
      { role: "user", content: "Show me sales by region" },
      { role: "assistant", content: "I've analyzed your request about: Show me sales by region" }
    ],
    lastQuestion: "Show me sales by region"
  },
  { 
    id: "recent-2", 
    title: "Customer retention metrics", 
    timestamp: new Date(Date.now() - 86400000),
    connection: "bigquery-analytics",
    messages: [
      { role: "user", content: "What's our customer retention rate?" },
      { role: "assistant", content: "I've analyzed your request about: What's our customer retention rate?" }
    ],
    lastQuestion: "What's our customer retention rate?"
  }
];

export default function AIChat({ compact = false, showHistory = false }: AIChatProps) {
  const { messages, setMessages, addUserMessage, addAssistantMessage, clearMessages } = useChatMessages();
  const [input, setInput] = useState("");
  const { fetchData } = useAnalytics();
  const [selectedConnection, setSelectedConnection] = useState<string>("bigquery-analytics"); // Default connection
  const [isNewChat, setIsNewChat] = useState<boolean>(true);
  const [selectedChatSession, setSelectedChatSession] = useState<string>("");
  const [showConnectionSelector, setShowConnectionSelector] = useState<boolean>(false);

  // Initialize with new chat mode
  useEffect(() => {
    if (messages.length === 0) {
      setIsNewChat(true);
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // If connection is not selected for new chat, prompt user
    if (isNewChat && !selectedConnection) {
      addAssistantMessage("Please select a database connection before asking a question.");
      setShowConnectionSelector(true);
      return;
    }

    // Add user message to chat
    addUserMessage(input);
    
    // Fetch data based on the question
    try {
      await fetchData(input);
      
      // Add assistant response
      addAssistantMessage("I've analyzed your request about: " + input);
    } catch (error) {
      console.error("Error fetching data:", error);
      addAssistantMessage("I encountered an error analyzing your request. Please try again.");
    }
    
    // Clear input
    setInput("");
  };

  const handleNewChat = () => {
    clearMessages();
    setIsNewChat(true);
    setSelectedChatSession("");
    // Don't reset the connection if one is already selected
    if (!selectedConnection) {
      setShowConnectionSelector(true);
    }
  };

  const handleSelectSession = (sessionId: string) => {
    const session = CHAT_HISTORY.find(s => s.id === sessionId);
    if (session) {
      // Load the chat history
      setMessages(session.messages);
      // Set the connection
      setSelectedConnection(session.connection);
      // Mark as existing chat
      setIsNewChat(false);
      // Set selected session
      setSelectedChatSession(sessionId);
      // Load the last question's data
      fetchData(session.lastQuestion);
    }
  };

  if (compact) {
    return (
      <div className="w-full flex items-center gap-2">
        {/* Connection selector and history dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              {selectedConnection ? (
                <div className="flex items-center gap-1 text-xs">
                  <Database className="h-3 w-3" />
                  <span className="truncate max-w-[120px]">
                    {AVAILABLE_CONNECTIONS.find(c => c.id === selectedConnection)?.name}
                  </span>
                  <ChevronDown className="h-3 w-3 ml-1" />
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs">
                  <Database className="h-3 w-3" />
                  <span>Select Connection</span>
                  <ChevronDown className="h-3 w-3 ml-1" />
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Database Connection</DropdownMenuLabel>
            {AVAILABLE_CONNECTIONS.map(conn => (
              <DropdownMenuItem 
                key={conn.id}
                onClick={() => {
                  setSelectedConnection(conn.id);
                  setShowConnectionSelector(false);
                }}
                className="flex items-center gap-2"
              >
                <Database className="h-4 w-4" />
                <span>{conn.name}</span>
                {selectedConnection === conn.id && (
                  <span className="ml-auto text-xs text-primary">✓</span>
                )}
              </DropdownMenuItem>
            ))}
            
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Recent Chats</DropdownMenuLabel>
            
            {CHAT_HISTORY.map(session => (
              <DropdownMenuItem 
                key={session.id}
                onClick={() => handleSelectSession(session.id)}
                className="flex flex-col items-start"
              >
                <div className="w-full">
                  <div className="font-medium text-sm">{session.title}</div>
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xs text-muted-foreground">
                      {AVAILABLE_CONNECTIONS.find(c => c.id === session.connection)?.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(session.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={handleNewChat} className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>New Chat</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Chat input */}
        <div className="flex-1">
          <AIChatInput
            input={input}
            onChange={setInput}
            onSend={handleSend}
            placeholder="Ask a question about your data..."
          />
        </div>
      </div>
    );
  }

  if (!showHistory) {
    return (
      <PanelLayout>
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message, i) => (
              <div
                key={i}
                className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.role === "assistant"
                      ? "bg-gray-100 text-black"
                      : "bg-white text-black"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex gap-2 mt-auto">
          <AIChatInput
            input={input}
            onChange={setInput}
            onSend={handleSend}
            placeholder="Ask about your data..."
          />
        </div>
      </PanelLayout>
    );
  }

  // This is the history view shown in the sidebar
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleNewChat}
          className="flex items-center gap-1 w-full justify-center"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Chat</span>
        </Button>
      </div>
      
      {/* Connection selector (only shown when starting a new chat) */}
      {isNewChat && showConnectionSelector && (
        <Card className="p-3 mb-4">
          <div className="text-sm font-medium mb-2">Select Database Connection</div>
          <Select value={selectedConnection} onValueChange={setSelectedConnection}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a connection to query" />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_CONNECTIONS.map(conn => (
                <SelectItem key={conn.id} value={conn.id}>
                  <div className="flex items-center">
                    <Database className="h-4 w-4 mr-2" />
                    <span>{conn.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>
      )}
      
      {/* Selected connection indicator */}
      {selectedConnection && (
        <div className="text-sm text-muted-foreground mb-4 flex items-center gap-2 p-2 bg-muted rounded-md">
          <Database className="h-4 w-4" />
          <span>
            Connected to: {AVAILABLE_CONNECTIONS.find(c => c.id === selectedConnection)?.name}
          </span>
        </div>
      )}
      
      {/* Recent chats list - Always show this in the history view */}
      <div className="space-y-3">
        <div className="text-sm font-medium text-muted-foreground">Recent Chats</div>
        {CHAT_HISTORY.map(session => (
          <Card 
            key={session.id} 
            className={`p-3 cursor-pointer transition-colors hover:bg-muted/50 ${
              selectedChatSession === session.id ? 'ring-1 ring-primary bg-muted/30' : ''
            }`}
            onClick={() => handleSelectSession(session.id)}
          >
            <div className="flex justify-between">
              <div className="font-medium">{session.title}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(session.timestamp).toLocaleDateString()}
              </div>
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Database className="h-3 w-3" />
              <span>
                {AVAILABLE_CONNECTIONS.find(c => c.id === session.connection)?.name}
              </span>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Chat messages - Only show in history view if there are messages */}
      {messages.length > 0 && (
        <div className="space-y-3 mt-6">
          <div className="text-sm font-medium text-muted-foreground">Current Conversation</div>
          {messages.map((message, i) => (
            <Card key={i} className="p-3">
              <div className="text-sm font-medium text-muted-foreground mb-1">
                {message.role === "assistant" ? "BigHammer AI" : "You"}
              </div>
              <div className="text-sm">{message.content}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}