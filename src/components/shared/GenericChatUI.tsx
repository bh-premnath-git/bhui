import { useState, useEffect, useRef, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatMessages } from '@/hooks/useChatMessages';
import { AIChatInput } from '@/components/shared/AIChatInput';
import { motion } from 'framer-motion';
import { AIDataVisualizer } from '@/components/shared/chat-components/DataVizualizer';
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
}

// Custom event name constant
export const CHART_ADDED_EVENT = 'chart-added-to-dashboard';
const allowedResponseTypes = ['SQL', 'CHART', 'TABLE', 'EXPLANATION'];

export function GenericChatUI({
  assistantColor = '#009459',
  userColor = '#000000',
}: GenericChatUIProps) {
  const { 
    messages, 
    addUserMessage, 
    addAssistantMessage, 
    updateMessageById,
  } = useChatMessages();
  const { data: recommendations, isLoading, isError } = useRecommendation();
  const [input, setInput] = useState('');
  const [threadId, setThreadId] = useState<string | null>(null);
  const { createConversation, streamConversation } = useConversation();
  const [response, setResponse] = useState<{ sql: any; chart: any; table: any; explanation: any } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingState, setProcessingState] = useState<'processing' | 'processed' | 'hidden'>('hidden');
  const [processingMessageId, setProcessingMessageId] = useState<string | null>(null);
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
    
    // Reset states for new query
    setResponse(null);
    setProcessingState('processing');
    setIsProcessing(true);
    
    // Add user message first
    addUserMessage(q);
    
    // Add processing message and track its ID
    const processingMessage = 'Processing...';
    const msgId = addAssistantMessage(processingMessage);
    setProcessingMessageId(msgId);
    
    const onChunk = (chunk: string) => {
      if (typeof chunk === 'string') {
        try {
          const parsedChunk = JSON.parse(chunk);
          
          // Keep the processing message visible until completion
          // Don't immediately set isProcessing to false
          
          if (allowedResponseTypes.includes(parsedChunk?.response_type)) {
            const responseTypeKey = parsedChunk.response_type.toLowerCase();
            setResponse(prev => ({ ...prev, [responseTypeKey]: parsedChunk }));
          }
        } catch (error) {
          console.error("Error parsing chunk:", error);
        }
      }
    };
    
    const onComplete = () => {
      // Only when streaming is complete, update both states
      setProcessingState('processed');
      setIsProcessing(false);
    };
    
    const onError = (error: any) => {
      console.error(error);
      // On error, update the processing message to show the error
      if (processingMessageId) {
        updateMessageById(processingMessageId, `Error: ${error.message || 'Failed to process your request'}`);
      }
      setProcessingState('hidden');
    };
    
    streamConversation(null, q, threadId, onChunk, onComplete, onError, "dataops");
    setInput("");
  }, [input, threadId, streamConversation, addUserMessage, addAssistantMessage, updateMessageById, isProcessing]);
  const handleAddToDashboard = (data: any) => {
    const trasformedData = data.chartMetadata.graph_data.map(data1=>({[data.chartMetadata.graph_config.primary_axis.x.field]: data1.x_axis, [data.chartMetadata.graph_config.primary_axis.y.field]: data1.y_axis}))
    const chartData = {
      id: `chart-${Date.now()}`,
      owner: "info@bighammer.ai",
      widget_type: "user-defined",
      name: data.chartMetadata.title,
      visibility: "private",
      sql_query: data.sql,
      executed_query: trasformedData,
      chart_config: {
        type: data.chartMetadata.chart_type,
        xAxis: data.chartMetadata.graph_config.primary_axis.x.field,
        yAxis: data.chartMetadata.graph_config.primary_axis.y.field,
        series: data.chartMetadata.graph_config.primary_axis.y.field,
        title: data.chartMetadata.title,
        metric: data.chartMetadata.graph_config.primary_axis.y.type
      }
    };

    // Dispatch custom event with chart data
    const chartEvent = new CustomEvent(CHART_ADDED_EVENT, {
      detail: chartData,
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(chartEvent);
  };
  
  return (
    <div className="h-full w-full flex flex-col">
      <ScrollArea className="flex-1 w-full">
        <div className="px-4 py-4 w-full  mx-auto">
          {messages.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-6 h-6 rounded-full flex-shrink-0"
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
                const isProcessingMessage = isA && processingMessageId === m.id;
                
                return (
                  <div key={m.id} className="flex items-start gap-4 py-2">
                    <div
                      className="w-6 h-6 rounded-full flex-shrink-0 mt-2"
                      style={{ backgroundColor: isA ? assistantColor : userColor }}
                    />
                    <div
                      className={`flex-1 rounded-2xl px-3 py-3 shadow ${isA ? 'bg-gray-100 text-black' : 'bg-gradient-to-r from-white to-slate-50'
                        }`}
                    >
                      {isProcessingMessage ? (
                        // This is our processing message
                        processingState === 'processing' ? (
                          <div className="flex items-center">
                            <p className="mr-2">Processing</p>
                            <span className="flex space-x-1">
                              <motion.span
                                className="text-xl font-bold"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                              >.</motion.span>
                              <motion.span
                                className="text-xl font-bold"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse", delay: 0.2 }}
                              >.</motion.span>
                              <motion.span
                                className="text-xl font-bold"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse", delay: 0.4 }}
                              >.</motion.span>
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <p>Processed</p>
                            <motion.span 
                              initial={{ scale: 0, opacity: 0 }} 
                              animate={{ scale: 1, opacity: 1 }}
                              className="ml-2 text-green-600 font-bold"
                            >
                              ✓
                            </motion.span>
                          </div>
                        )
                      ) : (
                        <p className="whitespace-pre-wrap break-words leading-relaxed max-w-full overflow-auto">{m.content}</p>
                      )}
                    </div>
                  </div>
                );
              })}
              {response && (
                <>
                  {(response.sql || response.chart || response.table) && (
                    <>
                      <AIDataVisualizer
                        sql={response.sql}
                        chart={response.chart}
                        data={response.table}
                        onAddToDashboard={handleAddToDashboard}
                      />
                      
                      {/* Explanation message */}
                      {response.explanation?.content && (
                        <div className="flex items-start gap-4 mt-4">
                          <div
                            className="w-6 h-6 rounded-full flex-shrink-0 mt-2"
                            style={{ backgroundColor: assistantColor }}
                          />
                          <div className="flex-1 rounded-2xl bg-gray-100 px-3 py-3 shadow">
                            <p className="whitespace-pre-wrap break-words leading-relaxed">
                              {response.explanation.content}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Follow-up question - only show when processing is complete */}
                      {processingState === 'processed' && (
                        <div className="flex items-start gap-4 mt-4">
                          <div
                            className="w-6 h-6 rounded-full flex-shrink-0 mt-2"
                            style={{ backgroundColor: assistantColor }}
                          />
                          <div className="flex-1 rounded-2xl bg-gray-100 px-3 py-3 shadow">
                            <p className="whitespace-pre-wrap break-words leading-relaxed">
                              Do you have any other queries?
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
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
