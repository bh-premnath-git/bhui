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
  fetchDatabaseConnections, 
  fetchChatHistory, 
  getConversationContext, 
  updateConversationContext,
  type ConversationContext 
} from "@/api/analytics-api";
import type { DatabaseConnection, ChatSession } from "@/types/dataops/data-ops-hub.d";

interface AIChatProps {
  compact?: boolean;
  showHistory?: boolean;
}

export default function AIChat({ compact = false, showHistory = false }: AIChatProps) {
  const { messages, setMessages, addUserMessage, addAssistantMessage, clearMessages } = useChatMessages();
  const [input, setInput] = useState("");
  const { fetchData, resetAnalytics } = useAnalytics();
  const [selectedConnection, setSelectedConnection] = useState<string>("bigquery-analytics"); // Default connection
  const [isNewChat, setIsNewChat] = useState<boolean>(true);
  const [selectedChatSession, setSelectedChatSession] = useState<string>("");
  const [showConnectionSelector, setShowConnectionSelector] = useState<boolean>(false);
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [contextEnabled, setContextEnabled] = useState<boolean>(true);
  const [conversationContext, setConversationContext] = useState(getConversationContext());

  // Fetch connections and chat history on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [connectionsData, historyData] = await Promise.all([
          fetchDatabaseConnections(),
          fetchChatHistory()
        ]);
        setConnections(connectionsData);
        setChatHistory(historyData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Initialize with new chat mode
  useEffect(() => {
    if (messages.length === 0) {
      setIsNewChat(true);
    }
  }, [messages.length]);

  // New function to generate more intelligent assistant responses
  const generateAssistantResponse = (question: string, data: any | null, context: ConversationContext): string => {
    if (!data) {
      return `I couldn't find any relevant data for "${question}". Try refining your question or asking about a different topic.`;
    }
    
    // Check if this is a follow-up question
    const isFollowUp = context.recentQuestions.length > 1;
    
    // Generate different responses based on context
    if (isFollowUp) {
      const prevQuestion = context.recentQuestions[context.recentQuestions.length - 2];
      
      // For comparison questions
      if (question.toLowerCase().includes('compare') || 
          question.toLowerCase().includes('difference') ||
          question.toLowerCase().includes('versus')) {
        return `Based on your previous question about "${prevQuestion}", I've analyzed the comparison you requested: ${data.explanation[0]}`;
      }
      
      // For elaboration questions
      if (question.toLowerCase().includes('why') || 
          question.toLowerCase().includes('explain') ||
          question.toLowerCase().includes('more detail')) {
        return `To elaborate on "${prevQuestion}": ${data.explanation.join(' ')}`;
      }
      
      // For trend analysis
      if (question.toLowerCase().includes('trend') ||
          question.toLowerCase().includes('over time')) {
        return `I've analyzed the trends based on our conversation about ${context.currentTopic}: ${data.explanation[0]}`;
      }
      
      // Default follow-up response
      return `Following up on our discussion about ${context.currentTopic || prevQuestion}, I've analyzed your question: "${question}"`;
    }
    
    // Initial question response
    return `I've analyzed your question about ${data.title.toLowerCase()}: ${data.explanation[0]}`;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // If connection is not selected for new chat, prompt user
    if (isNewChat && !selectedConnection) {
      addAssistantMessage("Please select a database connection before asking a question.");
      setShowConnectionSelector(true);
      return;
    }

    // Store the current input before clearing it
    const currentQuestion = input;
    
    // Add user message to chat
    addUserMessage(currentQuestion);
    
    // Clear input immediately for better UX
    setInput("");
    
    // Update connection in context if it has changed
    if (selectedConnection !== conversationContext.currentConnection) {
      updateConversationContext({ currentConnection: selectedConnection });
      setConversationContext(getConversationContext());
    }
    
    // Determine if this is a follow-up question
    const isFollowUp = messages.length > 0;
    
    // Fetch data based on the question, with context if enabled
    try {
      // For follow-up questions, we need to preserve context
      const contextToUse = isFollowUp && contextEnabled;
      
      // Create a custom event to notify that a new question is being processed
      window.dispatchEvent(new CustomEvent('xplorer:processing-question', { 
        detail: { question: currentQuestion, isFollowUp: contextToUse }
      }));
      
      const result = await fetchData(currentQuestion, contextToUse);
      
      // Get updated context after fetchData modifies it
      const updatedContext = getConversationContext();
      setConversationContext(updatedContext);
      
      // Generate a more intelligent response
      const assistantResponse = generateAssistantResponse(
        currentQuestion, 
        result, 
        updatedContext
      );
      
      // Add assistant response
      addAssistantMessage(assistantResponse);
      
      // Mark as not a new chat anymore
      if (isNewChat) {
        setIsNewChat(false);
      }
      
      // Notify that the question has been processed
      window.dispatchEvent(new CustomEvent('xplorer:question-processed', { 
        detail: { question: currentQuestion, success: true }
      }));
    } catch (error) {
      console.error("Error fetching data:", error);
      addAssistantMessage("I encountered an error analyzing your request. Please try again.");
      
      // Notify that the question processing failed
      window.dispatchEvent(new CustomEvent('xplorer:question-processed', { 
        detail: { question: currentQuestion, success: false }
      }));
    }
  };

  const handleNewChat = async () => {
    console.log("Starting new chat...");
    
    // Clear messages
    clearMessages();
    
    // Reset state
    setIsNewChat(true);
    setSelectedChatSession("");
    
    // Reset conversation context
    updateConversationContext({
      currentTopic: "",
      recentQuestions: [],
      recentTables: [],
      recentMetrics: [],
      currentConnection: selectedConnection,
      relatedEntities: [],
      analysisHistory: []
    });
    setConversationContext(getConversationContext());
    
    // Don't reset the connection if one is already selected
    if (!selectedConnection) {
      setShowConnectionSelector(true);
    }
    
    // Force a reset of the analytics state
    if (resetAnalytics) {
      resetAnalytics();
    }
    
    // Trigger navigation back to home page
    // This will use the event system to communicate with parent components
    const newChatEvent = new CustomEvent('xplorer:new-chat');
    window.dispatchEvent(newChatEvent);
    
    // Clear processed questions in XplorePanel
    window.dispatchEvent(new CustomEvent('xplorer:clear-processed-questions'));
    
    console.log("New chat initialized");
  };

  const handleSelectSession = (sessionId: string) => {
    const session = chatHistory.find(s => s.id === sessionId);
    if (session) {
      console.log("Loading chat session:", session.id, "with last question:", session.lastQuestion);
      
      // First clear everything to reset state
      resetAnalytics();
      
      // Set selected connection immediately
      setSelectedConnection(session.connection);
      
      // Mark as existing chat
      setIsNewChat(false);
      
      // Set selected session
      setSelectedChatSession(sessionId);
      
      // Clear processed questions to allow re-processing
      window.dispatchEvent(new CustomEvent('xplorer:clear-processed-questions'));
      
      // Load the messages after a small delay to ensure proper sequencing
      setTimeout(() => {
        // Load the chat history
        setMessages(session.messages);
        
        // Now trigger visualization with proper events
        window.dispatchEvent(new CustomEvent('xplorer:processing-question', { 
          detail: { question: session.lastQuestion, isFollowUp: false }
        }));
        
        // Then fetch the data after another small delay
        setTimeout(() => {
          fetchData(session.lastQuestion, false)
            .then(result => {
              console.log("Successfully fetched data for session:", result);
              // Notify that the question has been processed successfully
              window.dispatchEvent(new CustomEvent('xplorer:question-processed', { 
                detail: { question: session.lastQuestion, success: true }
              }));
            })
            .catch(error => {
              console.error("Error fetching data for session:", error);
              window.dispatchEvent(new CustomEvent('xplorer:question-processed', { 
                detail: { question: session.lastQuestion, success: false }
              }));
            });
        }, 100);
      }, 100);
    }
  };

  const getConnectionName = (id: string) => {
    const connection = connections.find(c => c.id === id);
    return connection ? connection.name : "Unknown Connection";
  };

  // This is the compact view used in the main panel's chat input
  if (compact) {
    return (
      <div className="w-full flex items-center gap-2">
        {/* Connection selector dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              {selectedConnection ? (
                <div className="flex items-center gap-1 text-xs">
                  <Database className="h-3 w-3" />
                  <span className="truncate max-w-[120px]">
                    {getConnectionName(selectedConnection)}
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
            {connections.map(conn => (
              <DropdownMenuItem 
                key={conn.id}
                onClick={() => setSelectedConnection(conn.id)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <Database className="h-4 w-4 mr-2" />
                  <span>{conn.name}</span>
                </div>
                {selectedConnection === conn.id && (
                  <span className="ml-auto text-xs text-primary">✓</span>
                )}
              </DropdownMenuItem>
            ))}
            
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Recent Chats</DropdownMenuLabel>
            
            {chatHistory.map(session => (
              <DropdownMenuItem 
                key={session.id}
                onClick={() => handleSelectSession(session.id)}
                className="flex flex-col items-start"
              >
                <div className="w-full">
                  <div className="font-medium text-sm">{session.title}</div>
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xs text-muted-foreground">
                      {getConnectionName(session.connection)}
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
        
        {/* Context toggle - new */}
        <button
          onClick={() => setContextEnabled(!contextEnabled)}
          className={`text-xs px-2 py-1 rounded ${
            contextEnabled 
              ? 'bg-primary/10 text-primary' 
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {contextEnabled ? 'Context: ON' : 'Context: OFF'}
        </button>
        
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

  // Main chat view (not compact, not history)
  if (!showHistory) {
    return (
      <PanelLayout>
        {/* Connection indicator */}
        {selectedConnection && (
          <div className="text-sm text-muted-foreground mb-4 flex items-center gap-2 p-2 bg-muted rounded-md">
            <Database className="h-4 w-4" />
            <span>Connected to: {getConnectionName(selectedConnection)}</span>
          </div>
        )}
        
        {/* Chat conversation */}
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
                      ? "bg-muted text-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No messages yet. Start by asking a question below.
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Chat input */}
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
      {/* New Chat button at the top */}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleNewChat}
        className="flex items-center gap-1 w-full justify-center"
      >
        <PlusCircle className="h-4 w-4" />
        <span>New Chat</span>
      </Button>
      
      {/* Selected connection indicator */}
      {selectedConnection && (
        <div className="text-sm text-muted-foreground mb-4 flex items-center gap-2 p-2 bg-muted rounded-md">
          <Database className="h-4 w-4" />
          <span>
            Connected to: {getConnectionName(selectedConnection)}
          </span>
        </div>
      )}
      
      {/* Recent chats list */}
      <div className="space-y-3">
        <div className="text-sm font-medium text-muted-foreground">Recent Chats</div>
        {isLoading ? (
          <div className="text-center text-muted-foreground py-2">Loading...</div>
        ) : (
          chatHistory.map(session => (
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
                  {getConnectionName(session.connection)}
                </span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}