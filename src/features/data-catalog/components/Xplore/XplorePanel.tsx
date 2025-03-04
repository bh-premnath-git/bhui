import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import AIChat from "./AIChat";
import SQLViewer from "./SQLViewer";
import StyleEditor from "./StyleEditor";
import AnalyticsPanel from "./AnalyticsPanel";
import { MessageSquare, Database, Paintbrush, BarChart, LineChart as LineChartIcon } from "lucide-react";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useAnalytics } from "@/context/AnalyticsContext";
import { Card, CardContent } from "@/components/ui/card";
import SuggestedQuestions from "./SuggestedQuestions";

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
  const [activeTab, setActiveTab] = useState<string>("bighammer");
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

    // Don't check processed questions set anymore - allow reprocessing 
    // even if we've seen this question before
    
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
      
      // Store current visual history in case we need to revert
      window.sessionStorage.setItem('xplorer:visualHistory', JSON.stringify(visualHistory));
      
      // If it's already in processed questions but we're explicitly processing it again,
      // we should allow it (happens when loading from history)
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
      setVisualHistory([]);
      if (typeof resetAnalytics === 'function') {
        resetAnalytics();
      }
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
    const inputField = document.querySelector('input[placeholder*="Ask a question"]') as HTMLInputElement;
    if (inputField) {
      inputField.value = question;
      inputField.focus();
    }
  };

  const updateViewMode = (id: string, mode: "chart" | "table" | "sql") => {
    setVisualHistory(prev =>
      prev.map(item =>
        item.id === id ? { ...item, viewMode: mode } : item
      )
    );
  };

  return (
    <div className="flex flex-col w-full overflow-hidden">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className={`flex ${showSidebar ? 'pr-96' : ''}`}>
          <div className="flex-1 h-[calc(100vh-12rem)] relative min-w-0">
            <div className="px-4 pb-4 pt-4 max-w-5xl mx-auto">
              {visualHistory.length === 0 ? (
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
                  <div className="space-y-4">
                    {messages.map((message, i) => (
                      <div
                        key={`msg-${i}`}
                        className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`rounded-lg px-4 py-2 max-w-[80%] ${message.role === "assistant"
                              ? "bg-muted text-foreground"
                              : "bg-primary text-primary-foreground"
                            }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    ))}
                  </div>
                  {visualHistory.map((item, index) => (
                    <Card key={item.id} className="mb-2 overflow-hidden">
                      <CardContent className="p-0">
                        <div className="bg-muted p-4 border-b">
                          <h3 className="font-medium">{item.question}</h3>
                          <p className="text-xs text-muted-foreground">
                            {item.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="p-1">
                          <AnalyticsPanel
                            dashboardData={structuredClone(item.dashboardData)}
                            showHeader={true}
                            chartStyles={structuredClone(item.chartStyles)}
                            viewMode={item.viewMode}
                            onViewModeChange={(mode) => updateViewMode(item.id, mode)}
                            key={`panel-${item.id}-${Math.random()}`}
                            isolatedMode={true}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Loading state */}
                  {isLoading && (
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

          {showSidebar && (
            <div className="w-96 border-l absolute right-0 top-0 bottom-0 bg-background">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <TabsList className="w-full justify-start p-0 h-12 rounded-none border-b">
                  <TabsTrigger value="bighammer">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>BigHammer AI</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="styling">
                    <div className="flex items-center gap-2">
                      <Paintbrush className="h-4 w-4" />
                      <span>Styling</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="sql">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      <span>SQL</span>
                    </div>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="bighammer" className="flex-1 p-4 overflow-auto">
                  <AIChat showHistory={true} />
                </TabsContent>

                <TabsContent value="styling" className="flex-1 p-4 overflow-auto">
                  <StyleEditor />
                </TabsContent>

                <TabsContent value="sql" className="flex-1 p-4 overflow-auto">
                  <SQLViewer />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>

      {/* Fixed bottom input - always visible */}
      <div className="border-t bg-background sticky bottom-4 z-50 w-full">
        <div className={`mx-auto ${showSidebar ? 'pr-96' : ''}`}>
          <div className="py-0 px-0 max-w-5xl mx-auto">
            <AIChat compact={true} />
          </div>
        </div>
      </div>
    </div>
  );
} 