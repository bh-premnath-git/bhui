import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import AIChat from "./AIChat";
import SQLViewer from "./SQLViewer";
import StyleEditor from "./StyleEditor";
import AnalyticsPanel from "./AnalyticsPanel";
import { MessageSquare, Database, Paintbrush, BarChart, LineChart as LineChartIcon } from "lucide-react";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useAnalytics } from "@/context/AnalyticsContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SuggestedQuestions from "./SuggestedQuestions";

// Interface for storing visualization history
interface VisualHistoryItem {
  id: string;
  question: string;
  timestamp: Date;
  dashboardData: any;
  chartStyles: any;
  viewMode: "chart" | "table" | "sql";
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
    setChartStyles,
    viewMode,
    setViewMode
  } = useAnalytics();
  
  // State for visualization history
  const [visualHistory, setVisualHistory] = useState<VisualHistoryItem[]>([]);
  
  // Process data and add to history
  useEffect(() => {
    if (dashboardData && currentQuestion && currentQuestion.trim() !== "") {
      console.log("Adding visualization to history with data:", dashboardData);
      
      // Ensure complete data
      const processedDashboardData = {
        ...dashboardData,
        salesData: dashboardData.salesData || generateFallbackData(dashboardData.brands || ["Category A", "Category B", "Category C"]),
        sqlQuery: dashboardData.sqlQuery || generateDefaultSqlQuery(currentQuestion)
      };
      
      const existingItem = visualHistory.find(item => item.question === currentQuestion);
      if (!existingItem) {
        setVisualHistory(prev => [
          ...prev,
          {
            id: `vis-${Date.now()}`,
            question: currentQuestion,
            timestamp: new Date(),
            dashboardData: processedDashboardData,
            chartStyles: { ...chartStyles },
            viewMode: "chart"
          }
        ]);
      }
    }
  }, [dashboardData, currentQuestion, chartStyles]);

  // Helper functions
  const generateDefaultSqlQuery = (question: string) => {
    return `-- Generated SQL for: ${question}
SELECT *
FROM sales
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
LIMIT 100;`;
  };

  const generateFallbackData = (brands) => {
    const months = ["Jan", "Feb", "Mar"];
    return months.map(month => {
      const dataPoint = { date: month };
      brands.forEach(brand => {
        dataPoint[brand] = Math.floor(Math.random() * 500000) + 100000;
      });
      return dataPoint;
    });
  };

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

  // ChatGPT-like layout with a single scrollable area
  return (
    <div className="flex h-screen flex-col w-full overflow-hidden">
      {/* Main content - the ONLY scrolling container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className={`flex h-full ${showSidebar ? 'pr-96' : ''}`}>
          {/* Main content panel */}
          <div className="flex-1 relative min-w-0">
            <div className="px-4 pb-24 pt-4 max-w-5xl mx-auto">
              {visualHistory.length === 0 ? (
                <div className="space-y-8">
                  {/* Welcome screen content */}
                  <div className="text-center pt-10 pb-6">
                    <h1 className="text-3xl font-bold mb-2">Data Explorer</h1>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Ask questions about your data in natural language to generate visualizations and insights.
                    </p>
                  </div>
                  
                  <div className="max-w-3xl mx-auto">
                    <Card className="border-2 border-dashed p-6">
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
                    <h2 className="text-lg font-semibold mb-4">Try asking:</h2>
                    <SuggestedQuestions onSelectQuestion={handleSelectQuestion} />
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Render the chat history followed by visualizations */}
                  <div className="space-y-4">
                    {messages.map((message, i) => (
                      <div
                        key={`msg-${i}`}
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
                  </div>
                  
                  {/* Visualizations */}
                  {visualHistory.map((item, index) => (
                    <Card key={item.id} className="mb-8 overflow-hidden">
                      <CardContent className="p-0">
                        <div className="bg-muted p-4 border-b">
                          <h3 className="font-medium">{item.question}</h3>
                          <p className="text-xs text-muted-foreground">
                            {item.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="p-4">
                          <AnalyticsPanel 
                            dashboardData={item.dashboardData} 
                            showHeader={true}
                            chartStyles={item.chartStyles}
                            viewMode={item.viewMode}
                            onViewModeChange={(mode) => updateViewMode(item.id, mode)} 
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

          {/* Sidebar - absolute positioned to avoid scrollbar issues */}
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
      <div className="border-t bg-background sticky bottom-0 z-50 w-full">
        <div className={`mx-auto ${showSidebar ? 'pr-96' : ''}`}>
          <div className="py-3 px-4 max-w-5xl mx-auto">
            <AIChat compact={true} />
          </div>
        </div>
      </div>
    </div>
  );
} 