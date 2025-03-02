import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatMessages } from "@/hooks/useChatMessages";
import { PanelLayout } from "./shared/PanelLayout";
import { AIChatInput } from "@/components/shared/AIChatInput";
import { Card, CardContent } from "@/components/ui/card";
import { useAnalytics } from "@/context/AnalyticsContext";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle, MessageCircle, Database } from "lucide-react";

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

export default function AIChat({ compact = false, showHistory = false }: AIChatProps) {
  const { messages, addUserMessage, addAssistantMessage, clearMessages } = useChatMessages();
  const [input, setInput] = useState("");
  const { fetchData } = useAnalytics();
  const [selectedConnection, setSelectedConnection] = useState<string>("");
  const [showConnectionSelector, setShowConnectionSelector] = useState<boolean>(true);
  const [chatSessions, setChatSessions] = useState<{ id: string, title: string, timestamp: Date }[]>([
    { id: "recent-1", title: "Sales analysis by region", timestamp: new Date(Date.now() - 3600000) },
    { id: "recent-2", title: "Customer retention metrics", timestamp: new Date(Date.now() - 86400000) }
  ]);

  // Show connection selector on first load or when starting a new chat
  useEffect(() => {
    if (messages.length === 0) {
      setShowConnectionSelector(true);
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // If connection is not selected, prompt user to select one
    if (!selectedConnection && showConnectionSelector) {
      addAssistantMessage("Please select a database connection before asking a question.");
      return;
    }

    // Hide connection selector after first message
    setShowConnectionSelector(false);

    // Add user message to chat
    addUserMessage(input);
    
    // Fetch data based on the question
    await fetchData(input);
    
    // Add assistant response
    addAssistantMessage("I've analyzed your request about: " + input);
    
    // Clear input
    setInput("");
  };

  const handleNewChat = () => {
    clearMessages();
    setShowConnectionSelector(true);
  };

  const handleSelectSession = (sessionId: string) => {
    // In a real app, you would load the selected chat session
    // For now, we'll just hide the connection selector
    setShowConnectionSelector(false);
    addAssistantMessage("Previous chat session loaded. How can I help you further?");
  };

  if (compact) {
    return (
      <div className="w-full">
        {showConnectionSelector && messages.length === 0 && (
          <div className="mb-3 flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedConnection} onValueChange={setSelectedConnection}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select a database connection" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_CONNECTIONS.map(conn => (
                  <SelectItem key={conn.id} value={conn.id}>
                    {conn.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {selectedConnection && (
          <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Database className="h-3 w-3" />
            <span>
              Connected to: {AVAILABLE_CONNECTIONS.find(c => c.id === selectedConnection)?.name}
            </span>
          </div>
        )}
        
        <AIChatInput
          input={input}
          onChange={setInput}
          onSend={handleSend}
          placeholder="Ask a question about your data..."
        />
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

  return (
    <div className="space-y-4">
      {/* Chat options */}
      <div className="flex gap-2 mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 justify-start" 
          onClick={handleNewChat}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          New Chat
        </Button>
        
        <Select>
          <SelectTrigger className="flex-1">
            <div className="flex items-center">
              <MessageCircle className="h-4 w-4 mr-2" />
              <span>Continue Chat</span>
            </div>
          </SelectTrigger>
          <SelectContent>
            {chatSessions.map(session => (
              <SelectItem 
                key={session.id} 
                value={session.id}
                onClick={() => handleSelectSession(session.id)}
              >
                <div className="flex flex-col">
                  <span>{session.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {session.timestamp.toLocaleString()}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Connection selector */}
      {showConnectionSelector && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-2">Select Database Connection</h3>
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
          </CardContent>
        </Card>
      )}
      
      {/* Selected connection indicator */}
      {selectedConnection && !showConnectionSelector && (
        <div className="text-sm text-muted-foreground mb-4 flex items-center gap-2 p-2 bg-muted rounded-md">
          <Database className="h-4 w-4" />
          <span>
            Connected to: {AVAILABLE_CONNECTIONS.find(c => c.id === selectedConnection)?.name}
          </span>
        </div>
      )}
      
      {/* Chat messages */}
      {messages.map((message, i) => (
        <Card key={i} className="p-3">
          <div className="text-sm font-medium text-muted-foreground mb-1">
            {message.role === "assistant" ? "BigHammer AI" : "You"}
          </div>
          <div className="text-sm">{message.content}</div>
        </Card>
      ))}
      
      {messages.length === 0 && !showConnectionSelector && (
        <div className="text-center text-muted-foreground py-8">
          No messages yet. Start by asking a question below.
        </div>
      )}
    </div>
  );
}