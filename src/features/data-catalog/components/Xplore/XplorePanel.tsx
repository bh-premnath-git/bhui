import { useState, useEffect } from "react";
import AIChat from "./AIChat";
import SQLViewer from "./SQLViewer";
import StyleEditor from "./StyleEditor";
import AnalyticsPanel from "./AnalyticsPanel";
import { MessageSquare, Database, BarChart, LineChart as LineChartIcon } from "lucide-react";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useAnalytics } from "@/context/AnalyticsContext";
import { Card, CardContent } from "@/components/ui/card";
import SuggestedQuestions from "./SuggestedQuestions";
import ResponseDisplay, { Message } from "./ResponseDisplay";
import { AIStreamingResponse, parseStreamingResponse } from "./utils";

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

  const [processedQuestions, setProcessedQuestions] = useState<Set<string>>(new Set());

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

  useEffect(() => {
    const handleNewChat = () => {
      resetAnalytics();
      setVisualHistory([]);
      setChatMessages([]);
      setResponseData([]);
      setIsStreamingChat(false);
      console.log("New chat initiated - reset to initial state");
    };

    window.addEventListener('xplorer:new-chat', handleNewChat);

    return () => {
      window.removeEventListener('xplorer:new-chat', handleNewChat);
    };
  }, [resetAnalytics]);

  useEffect(() => {
    const handleClearProcessedQuestions = () => {
      console.log("Clearing processed questions");
      setProcessedQuestions(new Set());
    };

    window.addEventListener('xplorer:clear-processed-questions', handleClearProcessedQuestions);

    return () => {
      window.removeEventListener('xplorer:clear-processed-questions', handleClearProcessedQuestions);
    };
  }, []);

  const handleSelectQuestion = (question: string) => {
    const event = new CustomEvent('xplorer:set-question', { 
      detail: { question } 
    });
    window.dispatchEvent(event);
  };

  const updateViewMode = (id: string, mode: "chart" | "table" | "sql") => {
    setVisualHistory(prev =>
      prev.map(item =>
        item.id === id ? { ...item, viewMode: mode } : item
      )
    );
  };

  const handleStreamStart = () => {
    setIsStreamingChat(true);
  };

  const handleStreamData = (message: Message) => {
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
        return [...prev, message];
      }
    });

    // Try to parse structured data from assistant messages
    if (message.role === 'assistant' && message.content) {
      try {
        const parsedResponses = parseStreamingResponse(message.content);        
        if (parsedResponses.length > 0) {
          setResponseData(parsedResponses);
        }
      } catch (error) {
        console.error("Error processing streaming data:", error);
      }
    }
  };

  const handleStreamEnd = () => {
    setIsStreamingChat(false);
  };

  return (
    <div className="flex flex-col w-full overflow-hidden">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className={`flex ${showSidebar ? 'pr-96' : ''}`}>
          <div className="flex-1 h-[calc(100vh-12rem)] relative min-w-0">
            <div className="px-4 pb-4 pt-4 max-w-5xl mx-auto">
              {visualHistory.length === 0 && chatMessages.length === 0 ? (
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
                    <SuggestedQuestions onSelectQuestion={handleSelectQuestion} />
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <ResponseDisplay 
                    data={responseData} 
                    isStreaming={isStreamingChat}
                    messages={chatMessages}
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