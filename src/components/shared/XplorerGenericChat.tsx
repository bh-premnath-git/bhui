import { useState, useRef, useCallback, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useChatMessages } from '@/hooks/useChatMessages'
import { AIChatInput } from '@/components/shared/AIChatInput'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import { useConversation } from '@/hooks/useConversation'
import { useRecommendation } from '@/hooks/useRecommendation'
import { createShortUUID } from '@/lib/utils'
import { LoadingState } from '@/components/shared/LoadingState'
import { AIDataVisualizer } from '@/components/shared/chat-components/DataVizualizer'

interface XplorerGenericChatUIProps {
  imageSrc?: string
  assistantColor?: string
  userColor?: string
  suggestions?: string[]
  variant?: 'governance' | 'explorer' | 'dataops'
}

// Custom event name constant
export const CHART_ADDED_EVENT = 'chart-added-to-xplorer-dashboard';
export const WIDGET_REMOVED_EVENT = 'widget-removed-from-xplorer-dashboard';
const allowedResponseTypes = ['SQL', 'CHART', 'TABLE', 'EXPLANATION'];

export function XplorerGenericChatUI({ imageSrc, assistantColor = '#009459',
  userColor = '#000000', suggestions, variant = 'explorer' }: XplorerGenericChatUIProps) {
  const {
    messages,
    addUserMessage,
    addAssistantMessage,
    updateMessageById
  } = useChatMessages();
  
  // Move connectionId state declaration to before its usage
  const [connectionId, setConnectionId] = useState<string | null>(null);
  
  const { data: recommendedSuggestions, isLoading: isLoadingRecommendations, isError: isRecommendationsError } = useRecommendation(
    variant,
    variant === 'explorer' ? connectionId : null
  );
  const [input, setInput] = useState('');
  
  // Conversation management
  const [threadId, setThreadId] = useState<string | null>(null);
  const { createConversation, streamConversation } = useConversation();
  const [response, setResponse] = useState<{ sql: any; chart: any; table: any; explanation: any } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingState, setProcessingState] = useState<'processing' | 'processed' | 'hidden'>('hidden');
  const [processingMessageId, setProcessingMessageId] = useState<string | null>(null);
  const streamAbortRef = useRef<() => void>();
  
  // Initialize conversation
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

  // Function to handle adding data to the dashboard
  const handleAddToDashboard = (data: any) => {
    const chartData = {
      id: `chart-${createShortUUID()}`,
      owner: "info@bighammer.ai",
      widget_type: "user_defined",
      name: data.chartMetadata.layout.title.text,
      visibility: "private",
      sql_query: data.sql,
      intermediate_executed_query_json: data.chartMetadata,
      executed_query:  { ...data.data },
      chart_config: ""
    };
    
    // Dispatch a custom event that XplorerMock can listen for
    const chartEvent = new CustomEvent(CHART_ADDED_EVENT, {
      detail: chartData,
      bubbles: true,
      cancelable: true
    });
    
    document.dispatchEvent(chartEvent);
  };

  const handleSend = useCallback((query: string) => {
    const q = query.trim();
    if (!q || !threadId) return;
    
    // Cancel any ongoing streams
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
    
    // Use the connectionId state directly instead of querying DOM
    const connId = variant === 'explorer' && connectionId ? parseInt(connectionId) : null;
    
    const onChunk = (chunk: string) => {
      if (typeof chunk === 'string') {
        try {
          const parsedChunk = JSON.parse(chunk);
          
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
      // Update processing message with completion confirmation
      if (processingMessageId) {
        updateMessageById(processingMessageId, 'Here are the results of your query:');
      }
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
      setIsProcessing(false);
    };
    
    // Start streaming with the appropriate module
    streamAbortRef.current = streamConversation(
      connId,
      q,
      threadId,
      onChunk,
      onComplete,
      onError,
      variant
    );
    
    setInput("");
  }, [threadId, addUserMessage, addAssistantMessage, updateMessageById, variant, connectionId]);

  return (
    <div className="h-full w-full flex flex-col">
      <ScrollArea className="flex-1 w-full">
        <div className="px-4 py-4 w-full mx-auto">
          {messages.length === 0 ? (
            <motion.div
              className="flex flex-col space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex gap-4">
                <div
                  className="w-8 h-8 rounded-full mt-1"
                  style={{ backgroundColor: assistantColor }}
                />
                <div className="flex-1 rounded-2xl px-4 py-3 bg-gray-100 shadow">
                  <p className="text-black leading-relaxed">
                    I'm your AI assistant for data exploration. How can I help you analyze data?
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-3 ml-12">You can ask me questions like:</p>
                <div className="flex flex-col gap-2 ml-12">
                  {isLoadingRecommendations ? (
                    <div className="flex justify-center items-center h-20">
                      <LoadingState classNameContainer="w-16 h-16" />
                    </div>
                  ) : isRecommendationsError ? (
                    <div className="text-sm text-gray-500 italic">
                      Unable to load suggestions. Please try asking a question directly.
                    </div>
                  ) : (recommendedSuggestions || suggestions || ['List the top ten expensive products', 'Show me all orders above $300', 'Find orders with delivery status "Shipped"', 'Which region has the most orders?']).map((s, i) => (
                    <motion.div
                      key={i}
                      className="flex gap-2"
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
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
                  ))}
                </div>
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
                      className="w-8 h-8 rounded-full mt-1"
                      style={{ backgroundColor: isA ? assistantColor : userColor }}
                    />
                    <div
                      className={`flex-1 rounded-2xl px-4 py-3 shadow ${isA ? 'bg-gray-100 text-black' : 'bg-gradient-to-r from-white to-slate-50'}`}
                    >
                      {isProcessingMessage ? (
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
                        <p className="leading-relaxed">{m.content}</p>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Only render when we have a response */}
              {response && (
                <>
                  {(response.sql || response.chart || response.table) && (
                    <AIDataVisualizer
                      sql={response.sql}
                      chart={response.chart}
                      data={response.table}
                      onAddToDashboard={handleAddToDashboard}
                    />
                  )}

                  {/* Follow-up question - only show when processing is complete */}
                  {processingState === 'processed' && (
                    <div className="flex items-start gap-4 mt-4">
                      <div
                        className="w-8 h-8 rounded-full mt-1"
                        style={{ backgroundColor: assistantColor }}
                      />
                      <div className="flex-1 rounded-2xl bg-gray-100 px-4 py-3 shadow">
                        <p className="leading-relaxed text-black">
                          Do you have any other queries?
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t border-slate-200 bg-white">
        <AIChatInput 
          input={input} 
          onChange={setInput} 
          onSend={() => handleSend(input)} 
          placeholder="Type a message..." 
          variant={variant} 
          onConnectionChange={setConnectionId}
        />
      </div>
    </div>
  );
}