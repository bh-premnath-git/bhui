import { useState, useEffect } from "react";
import AIChat from "./AIChat";
import SQLViewer from "./SQLViewer";
import StyleEditor from "./StyleEditor";
import { MessageSquare, Database, BarChart, LineChart as LineChartIcon } from "lucide-react";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useAnalytics } from "@/context/AnalyticsContext";
import { Card, CardContent } from "@/components/ui/card";
import SuggestedQuestions from "./SuggestedQuestions";
import ResponseDisplay, { Message } from "./ResponseDisplay";
import { AIStreamingResponse, parseStreamingResponse } from "./utils";
import SessionHistory from "./SessionHistory";

interface VisualHistoryItem {
  id: string;
  question: string;
  timestamp: Date;
  dashboardData: any;
  chartStyles: any;
  viewMode: "chart" | "table" | "sql";
  isFollowUp: boolean;
  relatedToId?: string;
}

// Add a MessageWithResponses interface to track responses with each message
interface MessageWithResponses {
  message: Message;
  responses: AIStreamingResponse[];
}

export default function XplorePanel({ showSidebar }: { showSidebar: boolean }) {
  const { messages } = useChatMessages();
  const {
    dashboardData,
    currentQuestion,
    isLoading,
    error,
    chartStyles,
    resetAnalytics
  } = useAnalytics();

  const [visualHistory, setVisualHistory] = useState<VisualHistoryItem[]>([]);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isStreamingChat, setIsStreamingChat] = useState(false);
  const [responseData, setResponseData] = useState<AIStreamingResponse[]>([]);
  
  // Track responses for the history and current message
  const [messageHistory, setMessageHistory] = useState<MessageWithResponses[]>([]);
  const [currentResponses, setCurrentResponses] = useState<AIStreamingResponse[]>([]);
  
  // Track whether streaming has completed successfully for the current message
  const [streamCompleted, setStreamCompleted] = useState(true);
  
  // Track currently selected message index for viewing history
  const [selectedMessageIndex, setSelectedMessageIndex] = useState<number | null>(null);

  const [processedQuestions, setProcessedQuestions] = useState<Set<string>>(new Set());
  
  // Track if we're in a new chat session (no messages yet)
  const [isNewChatSession, setIsNewChatSession] = useState(true);

  const createIsolatedVisualization = (question: string, data: any, styles: any): VisualHistoryItem => ({
    id: `vis-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    question,
    timestamp: new Date(),
    dashboardData: structuredClone(data),
    chartStyles: structuredClone(styles),
    viewMode: "chart" as const,
    isFollowUp: question.toLowerCase().includes("why") ||
      question.toLowerCase().includes("explain") ||
      question.toLowerCase().includes("compare") ||
      question.toLowerCase().includes("tell me more")
  });

  useEffect(() => {
    if (!dashboardData || !currentQuestion || currentQuestion.trim() === "") {
      return;
    }

    console.log("Processing visualization for:", currentQuestion);

    const newVisualization = createIsolatedVisualization(
      currentQuestion,
      dashboardData,
      chartStyles
    );

    setVisualHistory(prev => [...prev, newVisualization]);
    setIsNewChatSession(false);
  }, [dashboardData, currentQuestion, chartStyles]);

  useEffect(() => {
    if (messages.length === 0) {
      setProcessedQuestions(new Set());
    }
  }, [messages.length]);

  useEffect(() => {
    const handleProcessingQuestion = (event: CustomEvent) => {
      const { question } = event.detail;
      console.log("Processing question event:", question);
      
      window.sessionStorage.setItem('xplorer:visualHistory', JSON.stringify(visualHistory));
      
      if (processedQuestions.has(question)) {
        console.log("Re-processing previously processed question:", question);
      }
    };

    const handleQuestionProcessed = (event: CustomEvent) => {
      const { question, success } = event.detail;
      console.log("Question processed event:", question, success);
      if (!success) {
        const savedHistory = window.sessionStorage.getItem('xplorer:visualHistory');
        if (savedHistory) {
          setVisualHistory(JSON.parse(savedHistory));
        }
      }
    };

    window.addEventListener('xplorer:processing-question', handleProcessingQuestion as EventListener);
    window.addEventListener('xplorer:question-processed', handleQuestionProcessed as EventListener);

    return () => {
      window.removeEventListener('xplorer:processing-question', handleProcessingQuestion as EventListener);
      window.removeEventListener('xplorer:question-processed', handleQuestionProcessed as EventListener);
    };
  }, [visualHistory, processedQuestions]);

  const onMessageSend = (message: string) => {
    if (!message || message.trim() === "") return;
  
    // Add user message
    setChatMessages(prev => [...prev, { role: "user", content: message }]);
    
    // Reset streaming state for new message
    setStreamCompleted(false);
    setCurrentResponses([]);
    
    // Automatically select the latest message when a new one is sent
    setSelectedMessageIndex(null);
    
    // Mark that we're no longer in a new chat session
    setIsNewChatSession(false);
    
    console.log("User message sent:", message);
    
    // Dispatch event for AIChat component using the existing event system
    const event = new CustomEvent('xplorer:set-question', { 
      detail: { question: message } 
    });
    window.dispatchEvent(event);
  };

  useEffect(() => {
    // Listen for new-chat events from AIChat to reset local state
    const handleNewChat = () => {
      console.log("New chat event received from AIChat");
      resetAnalytics();
      setVisualHistory([]);
      setChatMessages([]);
      setMessageHistory([]);
      setCurrentResponses([]);
      setResponseData([]);
      setIsStreamingChat(false);
      setStreamCompleted(true);
      setSelectedMessageIndex(null);
      setIsNewChatSession(true);
    };

    window.addEventListener('xplorer:new-chat', handleNewChat);
    return () => {
      window.removeEventListener('xplorer:new-chat', handleNewChat);
    };
  }, [resetAnalytics]);

  const handleStreamStart = () => {
    setIsStreamingChat(true);
  };

  const handleStreamData = (message: Message) => {
    setIsStreamingChat(true);
    
    setChatMessages(prev => {
      // Check if we already have this exact message to avoid duplicate updates
      const messageExists = prev.some((msg, idx) => 
        idx === prev.length - 1 && 
        msg.role === message.role && 
        msg.content === message.content
      );
      
      if (messageExists) {
        return prev;
      }
      
      // If message with same role exists at the end, replace it
      // Otherwise add new message
      const lastMessageSameRole = prev.length > 0 && 
        prev[prev.length - 1].role === message.role;
        
      if (lastMessageSameRole) {
        return [
          ...prev.slice(0, prev.length - 1),
          message
        ];
      } else {
        // Mark that we're no longer in a new session when receiving messages
        setIsNewChatSession(false);
        return [...prev, message];
      }
    });

    // Try to parse structured data from assistant messages
    if (message.role === 'assistant' && message.content) {
      try {
        const parsedResponses = parseStreamingResponse(message.content);        
        if (parsedResponses.length > 0) {
          setResponseData(parsedResponses);
          setCurrentResponses(parsedResponses);
          
          // Ensure we're marking as not completed since we're still streaming
          setStreamCompleted(false);
        }
      } catch (error) {
        console.error("Error processing streaming data:", error);
      }
    }
  };

  const handleStreamEnd = () => {
    setIsStreamingChat(false);
    setStreamCompleted(true);
    
    // When streaming ends, add the current message and its responses to history
    const currentMessage = chatMessages[chatMessages.length - 1];
    if (currentMessage && currentMessage.role === 'assistant' && currentResponses.length > 0) {
      setMessageHistory(prev => {
        // Check if this message is already in history to avoid duplicates
        const exists = prev.some(item => 
          item.message.content === currentMessage.content && 
          item.message.role === currentMessage.role
        );
        
        if (!exists) {
          return [...prev, { message: currentMessage, responses: currentResponses }];
        }
        return prev;
      });
    }
    
    console.log("Stream completed");
  };
  
  // Handle selecting a message from history
  const handleMessageSelect = (index: number) => {
    setSelectedMessageIndex(index === selectedMessageIndex ? null : index);
  };

  // Get the responses to display based on selection
  const getDisplayResponses = () => {
    // If a specific message is selected and it's an assistant message
    if (selectedMessageIndex !== null && 
        chatMessages[selectedMessageIndex]?.role === 'assistant') {
      
      // Find matching responses in history
      const selectedMessage = chatMessages[selectedMessageIndex];
      const historyItem = messageHistory.find(
        item => item.message.content === selectedMessage.content
      );
      
      if (historyItem) {
        return historyItem.responses;
      }
      return [];
    }
    
    // Otherwise show current responses if no specific message is selected
    return selectedMessageIndex === null ? responseData : [];
  };

  // Get messages to display based on selection
  const getDisplayMessages = () => {
    if (selectedMessageIndex === null) {
      // Show all messages if nothing selected
      return chatMessages;
    }
    
    // Show just the selected message and its context
    const userMessageIndex = selectedMessageIndex % 2 === 0 
      ? selectedMessageIndex 
      : Math.max(0, selectedMessageIndex - 1);
    
    const assistantMessageIndex = selectedMessageIndex % 2 === 0 
      ? Math.min(chatMessages.length - 1, selectedMessageIndex + 1) 
      : selectedMessageIndex;
    
    // Return the user message and its corresponding assistant response
    return [
      chatMessages[userMessageIndex],
      ...(assistantMessageIndex < chatMessages.length ? [chatMessages[assistantMessageIndex]] : [])
    ];
  };

  // Determine if we should show the empty state or chat
  const shouldShowEmptyState = isNewChatSession || 
    (visualHistory.length === 0 && chatMessages.length === 0);

  return (
    <div className="flex flex-col w-full overflow-hidden">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className={`flex ${showSidebar ? 'pr-96' : ''}`}>
          <div className="flex-1 h-[calc(100vh-12rem)] relative min-w-0">
            <div className="px-4 pb-4 pt-4 max-w-5xl mx-auto">
              {shouldShowEmptyState ? (
                <div className="space-y-8">
                  <div className="text-center pt-1 pb-2">
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Ask questions about your data in natural language to generate visualizations and insights.
                    </p>
                  </div>

                  <div className="max-w-3xl mx-auto">
                    <Card className="border-2 border-dashed p-2">
                      <CardContent className="p-6 flex items-center gap-8">
                        <div className="grid grid-cols-2 gap-4 flex-1">
                          <div className="flex items-center gap-2 text-sm">
                            <BarChart className="h-5 w-5 text-blue-500" />
                            <span>Compare data across categories</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <LineChartIcon className="h-5 w-5 text-green-500" />
                            <span>Analyze trends over time</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MessageSquare className="h-5 w-5 text-purple-500" />
                            <span>Ask follow-up questions</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Database className="h-5 w-5 text-amber-500" />
                            <span>Explore your database</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="max-w-3xl mx-auto">
                    <h2 className="text-lg font-semibold mb-1">Try asking:</h2>
                    <SuggestedQuestions onSelectQuestion={onMessageSend} />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Session History - re-added component */}
                  <SessionHistory 
                    messages={chatMessages}
                    messageHistory={messageHistory}
                    onMessageSelect={handleMessageSelect}
                    selectedMessageIndex={selectedMessageIndex}
                  />
                
                  <div className="space-y-8">
                    <ResponseDisplay 
                      data={getDisplayResponses()} 
                      isStreaming={isStreamingChat && selectedMessageIndex === null}
                      messages={getDisplayMessages()}
                    />
                   
                    {/* Loading state */}
                    {(isLoading || isStreamingChat) && chatMessages.length === 0 && (
                      <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    )}

                    {/* Error state */}
                    {error && (
                      <div className="p-4 text-destructive">
                        <p>Error processing your request. Please try again.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="border-t bg-background sticky bottom-4 z-50 w-full">
        <div className={`mx-auto ${showSidebar ? 'pr-96' : ''}`}>
          <div className="py-0 px-0 max-w-5xl mx-auto">
            <AIChat 
              compact={true} 
              onStreamStart={handleStreamStart}
              onStreamData={handleStreamData}
              onStreamEnd={handleStreamEnd}
            />
          </div>
        </div>
      </div>
    </div>
  );
}