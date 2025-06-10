import { useState, useRef, useCallback, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useChatMessages } from '@/hooks/useChatMessages'
import { AIChatInput } from '@/components/shared/AIChatInput'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import { Button } from '../ui/button'
import { useConversation } from '@/hooks/useConversation'
import { useRecommendation } from '@/hooks/useRecommendation'
import { createShortUUID } from '@/lib/utils'
import { LoadingState } from '@/components/shared/LoadingState'

interface XplorerGenericChatUIProps {
  imageSrc?: string
  assistantColor?: string
  userColor?: string
  suggestions?: string[]
  variant?: 'governance' | 'explorer' | 'dataops'
}

// Custom event name constant
export const CHART_ADDED_EVENT = 'chart-added-to-xplorer-dashboard';
const allowedResponseTypes = ['SQL', 'CHART', 'TABLE', 'EXPLANATION'];

// Component to display SQL query
const SQLView = ({ query }) => {
  return (
    <pre className="bg-gray-700 text-white p-2 rounded whitespace-pre-wrap">
      {query}
    </pre>
  );
};

// Component to display table view
const TableView = ({ data }) => {
  if (!data || data.length === 0) return <p>No data available</p>;

  // Get all column keys
  const allColumns = Object.keys(data[0]);

  return (
    <div className="h-full w-full rounded-lg bg-white">
      <div className="h-full overflow-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {allColumns.map((key) => (
                <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {allColumns.map((key, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row[key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Enhanced chart view component with title and better axis labels
const ChartView = ({ data, metric, categoryKey, chartTitle }) => {
  // If it's products data, format specifically for that
  if (Array.isArray(data) && data.length > 0 && 'productName' in data[0] && 'unitPrice' in data[0]) {
    return (
      <div className="h-96 bg-gradient-to-br from-card to-card/95 overflow-hidden">
        <h3 className="text-center text-sm mb-2">{chartTitle || "Top 10 Most Expensive Products"}</h3>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <XAxis
              type="number"
            />
            <YAxis
              dataKey="productName"
              type="category"
              width={100}
              label={{ value: 'Product Name', angle: -90, position: 'insideLeft', offset: -30 }}
            />
            <Tooltip formatter={(value) => [`$${value}`, 'Price']} />
            <Legend />
            <Bar dataKey="unitPrice" fill="#A7D1F0" name="Unit Price ($)">
              <LabelList dataKey="unitPrice" position="right" formatter={(value) => `$${value}`} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // If it's a region count query, format data differently
  if (Array.isArray(data) && data.length > 0 && 'region' in data[0] && 'count' in data[0]) {
    return (
      <div className="h-96 bg-gradient-to-br from-card to-card/95 overflow-hidden">
        <h3 className="text-center text-lg font-semibold mb-2">{chartTitle || "Orders by Region"}</h3>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={data}>
            <XAxis dataKey="region" label={{ value: 'Region', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: 'Number of Orders', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#A7D1F0" name="Number of Orders" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Default chart for orders or order details
  return (
    <div className="h-96">
      <h3 className="text-center text-lg font-semibold mb-2">{chartTitle || "Data Visualization"}</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data}>
          <XAxis
            dataKey={categoryKey || 'id'}
            label={{ value: categoryKey || 'ID', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            label={{ value: metric.charAt(0).toUpperCase() + metric.slice(1), angle: -90, position: 'insideLeft' }}
          />
          <Tooltip />
          <Legend />
          <Bar dataKey={metric} fill="#A7D1F0" name={metric.charAt(0).toUpperCase() + metric.slice(1)} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

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
  const [activeTab, setActiveTab] = useState('chart');
  const [input, setInput] = useState('');
  const [sqlQuery, setSqlQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [metricToVisualize, setMetricToVisualize] = useState('total');
  const [categoryKey, setCategoryKey] = useState('id');
  const [chartTitle, setChartTitle] = useState('');
  
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
  const handleAddToDashboard = (data) => {
    // Create a custom event with all the necessary chart data
    const chartData = {
      id: `chart-${createShortUUID()}`,
      owner: "info@bighammer.ai",
      widget_type: "user_defined",
      name: chartTitle || "Explorer Data Chart",
      visibility: "private",
      sql_query: sqlQuery,
      intermediate_executed_query_json: {
        layout: {
          title: { text: chartTitle }
        }
      },
      executed_query: { data: filteredData },
      chart_config: {
        title: chartTitle,
        metric: metricToVisualize,
        categoryKey: categoryKey
      }
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
            
            if (responseTypeKey === 'sql' && parsedChunk.sql) {
              setSqlQuery(parsedChunk.sql);
            }
            
            if (responseTypeKey === 'table' && parsedChunk.data) {
              setFilteredData(parsedChunk.data);
            }
            
            if (responseTypeKey === 'chart') {
              if (parsedChunk.chart_title) {
                setChartTitle(parsedChunk.chart_title);
              }
              if (parsedChunk.metric) {
                setMetricToVisualize(parsedChunk.metric);
              }
              if (parsedChunk.category_key) {
                setCategoryKey(parsedChunk.category_key);
              }
            }
            
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
                return (
                  <div key={i} className="flex items-start gap-4 py-2">
                    <div
                      className="w-8 h-8 rounded-full mt-1"
                      style={{ backgroundColor: isA ? assistantColor : userColor }}
                    />
                    <div
                      className={`flex-1 rounded-2xl px-4 py-3 shadow ${isA ? 'bg-gray-100 text-black' : 'bg-gradient-to-r from-white to-slate-50'}`}
                    >
                      <p className="leading-relaxed">{m.content}</p>
                    </div>
                  </div>
                );
              })}

              {/* Only render when we have a response */}
              {response && !isProcessing && (
                <>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="chart">Chart</TabsTrigger>
                      <TabsTrigger value="table">Table</TabsTrigger>
                      <TabsTrigger value="sql">SQL</TabsTrigger>
                    </TabsList>
                    <TabsContent value="chart" className="pt-4">
                      <div className="bg-white p-4 rounded-xl border">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold">{chartTitle || 'Data Visualization'}</h3>
                          <Button
                            variant="outline"
                            onClick={() => handleAddToDashboard(response)}
                            className="h-7 text-xs"
                          >
                            Add to Dashboard
                          </Button>
                        </div>
                        <ChartView
                          data={filteredData}
                          metric={metricToVisualize}
                          categoryKey={categoryKey}
                          chartTitle={chartTitle}
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="table" className="pt-4">
                      <TableView data={filteredData} />
                    </TabsContent>
                    <TabsContent value="sql" className="pt-4">
                      <SQLView query={sqlQuery} />
                    </TabsContent>
                  </Tabs>
                  <div className="flex items-start gap-4 mt-4">
                    <div
                      className="w-8 h-8 rounded-full mt-1"
                      style={{ backgroundColor: assistantColor }}
                    />
                    <div className="flex-1 rounded-2xl bg-gray-100 px-4 py-3 shadow">
                      <p className="leading-relaxed text-black">
                        Do you want to analyze the Order and other details of this data?
                      </p>
                    </div>
                  </div>
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