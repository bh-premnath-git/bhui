import { useState, useEffect, useRef, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatMessages } from '@/hooks/useChatMessages';
import { AIChatInput } from '@/components/shared/AIChatInput';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ChatSQLView } from '@/components/shared/chat-components/ChatSQLView';
import { ChatChartView } from '@/components/shared/chat-components/ChatChartView';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { useConversation } from '@/hooks/useConversation';
import { useRecommendation } from '@/hooks/useRecommendation';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';


interface GenericChatUIProps {
  imageSrc?: string;
  assistantColor?: string;
  userColor?: string;
  suggestions?: string[];
  onAddToDashboard?: (chart: any) => void;
}

// Custom event name constant
export const CHART_ADDED_EVENT = 'chart-added-to-dashboard';
const allowedResponseTypes = ['SQL', 'CHART', 'TABLE', 'EXPLANATION'];

export function GenericChatUI({
  assistantColor = '#009459',
  userColor = '#000000',
  onAddToDashboard,
}: GenericChatUIProps) {
  const { messages, addUserMessage, addAssistantMessage, updateLastAssistantMessage } = useChatMessages();
  const { data: recommendations, isLoading, isError } = useRecommendation();
  const [input, setInput] = useState('');
  const [threadId, setThreadId] = useState<string | null>(null);
  const { createConversation, streamConversation } = useConversation();
  const [response, setResponse] = useState<{ sql: any; chart: any; table: any; explanation: any } | null>(null);
  const [activeTab, setActiveTab] = useState<'chart' | 'sql'>('chart');
  const streamAbortRef = useRef<() => void>();

  useEffect(() => {
    let isActive = true;
    createConversation()
      .then(res => {
        if (isActive && res.data.thread_id) {
          setThreadId(res.data.thread_id);
        }
      })
      .catch(err => {
        console.error(err);
      });

    return () => {
      isActive = false;
      streamAbortRef.current?.();
    };
  }, [createConversation]);

  const handleSend = useCallback(() => {
    const q = input.trim();
    if (!q) return;
    streamAbortRef.current?.();
    addUserMessage(q);
    addAssistantMessage('Processing...');
    const onChunk = (chunk: string) => {
      if (typeof chunk === 'string') {
        try {
          const parsedChunk = JSON.parse(chunk);
          if (allowedResponseTypes.includes(parsedChunk?.response_type)) {
            const responseTypeKey = parsedChunk.response_type.toLowerCase();
            setResponse(prev => ({ ...prev, [responseTypeKey]: parsedChunk }));
            addAssistantMessage(JSON.stringify(parsedChunk));
          }
        } catch (error) {
          console.error("Error parsing chunk:", error);
        }
      }
    };
    const onComplete = () => {
      updateLastAssistantMessage('do you have any other queries?');
    };
    const onError = (error: any) => {
      console.error(error);
    };
    streamConversation(null, q, threadId, onChunk, onComplete, onError, "dataops");
    setInput("");
  }, [input, threadId, streamConversation, addUserMessage, addAssistantMessage, updateLastAssistantMessage]);

  const handleAddToDashboard = (data: any) => {
    // Determine chart type and appropriate labels based on data structure
    const dataKeys = Object.keys(data[0] || {}).filter(key => key !== 'name');

    // Determine X and Y axis labels based on the query content and data structure
    const userQuery = messages[messages.length - 2]?.content.toLowerCase() || '';

    // Default labels
    let xAxisLabel = 'Categories';
    let yAxisLabel = dataKeys[0] || 'Value';

    // Try to extract more meaningful labels from the query
    if (userQuery.includes('latency')) {
      yAxisLabel = 'Time (minutes)';
    } else if (userQuery.includes('cost') || userQuery.includes('expensive')) {
      yAxisLabel = 'Cost (USD)';
    } else if (userQuery.includes('failed') || userQuery.includes('error')) {
      yAxisLabel = 'Count';
    }

    const chartData = {
      id: `chart-${Date.now()}`,
      title: messages[messages.length - 2]?.content.split('?')[0] || 'Visualized Data',
      type: 'bar',
      data: data,
      config: {
        xAxis: {
          label: xAxisLabel,
          labelOffset: 10
        },
        yAxis: {
          label: yAxisLabel,
          labelOffset: 15
        },
        children: messages[messages.length - 1]?.content || 'Chart visualization based on query results'
      }
    };

    // Dispatch custom event with chart data
    const chartEvent = new CustomEvent(CHART_ADDED_EVENT, {
      detail: chartData,
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(chartEvent);

    // Still call the prop callback if provided (for backward compatibility)
    if (onAddToDashboard) {
      onAddToDashboard(chartData);
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      <ScrollArea className="flex-1 w-full">
        <div className="px-4 py-4 w-full  mx-auto">
          {messages.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0"
                  style={{ backgroundColor: assistantColor }}
                />
                <div className="flex-1 rounded-xl bg-gray-100 px-2 py-2 shadow">
                  <p className="text-lg font-medium text-gray-800 py-1">How can I assist you?</p>
                </div>
              </div>
              <div className="space-y-2 pl-16 ml-2">
                {isLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <LoadingState classNameContainer="w-20 h-20" />
                  </div>
                ) : isError ? (
                  <ErrorState title="Error" description="Failed to load suggestions. Please try again later." />
                ) : recommendations && recommendations.length > 0 ? (
                  recommendations.map((s, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center"
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                    >
                      <div
                        style={{ backgroundColor: assistantColor }}
                      />
                      <div
                        onClick={() => setInput(s)}
                        className="flex flex-row items-center italic rounded-xl bg-gray-100 border border-border/40 px-4 py-2 cursor-pointer hover:bg-gray-200 transition"
                        style={{ color: assistantColor }}
                      >
                        <Zap className="w-6 h-6 mr-2 flex-shrink-0 transform rotate-12" style={{ color: "#E6B800", fill: "#E6B800" }} />
                        {s}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No AI suggestions available at the moment.</p>
                )}
              </div>
            </motion.div>
          ) : (
            <>
              {messages.map((m, i) => {
                const isA = m.role === 'assistant';
                return (
                  <div key={i} className="flex items-start gap-4 py-2">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0 mt-2"
                      style={{ backgroundColor: isA ? assistantColor : userColor }}
                    />
                    <div
                      className={`flex-1 rounded-2xl px-3 py-3 shadow ${isA ? 'bg-gray-100 text-black' : 'bg-gradient-to-r from-white to-slate-50'
                        }`}
                    >
                      <p className="whitespace-pre-wrap break-words leading-relaxed max-w-full overflow-auto">{m.content}</p>
                    </div>
                  </div>
                );
              })}
              {response && (
                <>
                  <Tabs
                    value={activeTab}
                    onValueChange={v => setActiveTab(v as 'chart' | 'sql')}
                    className="mt-6"
                  >
                    <TabsList className="flex space-x-2 mb-2">
                      <TabsTrigger
                        value="chart"
                        className={`px-4 py-2 rounded-t-lg ${activeTab === 'chart'
                          ? 'bg-gray-200 text-gray-800'
                          : 'bg-white text-gray-500'
                          }`}
                      >
                        Chart
                      </TabsTrigger>
                      <TabsTrigger
                        value="sql"
                        className={`px-2 py-2 rounded-t-lg ${activeTab === 'sql'
                          ? 'bg-gray-200 text-gray-800'
                          : 'bg-white text-gray-500'
                          }`}
                      >
                        SQL
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="chart" className="pt-4">
                      <div className="mt-3 bg-card rounded-md p-2">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-sm text-foreground">
                            {messages[messages.length - 2]?.content.split('?')[0] || 'Visualized Data'}
                          </h4>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddToDashboard(response.chart)}
                            className="h-7 text-xs"
                          >
                            Add to Dashboard
                          </Button>
                        </div>
                        <ChatChartView data={response.chart} />
                      </div>
                    </TabsContent>
                    <TabsContent value="sql" className="pt-4">
                      <ChatSQLView sql={response.sql} />
                    </TabsContent>
                  </Tabs>
                  <div className="flex items-center gap-4 mt-4">
                    <div
                      className="w-8 h-8 rounded-full flex-shrink-0"
                      style={{ backgroundColor: assistantColor }}
                    />
                    <div className="flex-1 rounded-2xl bg-gray-100 px-4 py-3 shadow">
                      <p className="leading-relaxed text-black">
                        Do you want me to analyze the reasons for the latency issue?
                      </p>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </ScrollArea>
      <div className="p-2 border-t border-slate-200 bg-white">
        <AIChatInput input={input} onChange={setInput} onSend={handleSend} placeholder="Type a message..." />
      </div>
    </div>
  );
}
