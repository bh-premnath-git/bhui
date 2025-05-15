import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatMessages } from '@/hooks/useChatMessages';
import { AIChatInput } from '@/components/shared/AIChatInput';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ChatSQLView } from '@/components/shared/chat-components/ChatSQLView';
import { ChatChartView } from '@/components/shared/chat-components/ChatChartView';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';

interface GenericChatUIProps {
  imageSrc?: string;
  assistantColor?: string;
  userColor?: string;
  suggestions?: string[];
  onAddToDashboard?: (chart: any) => void;
}

// Custom event name constant
export const CHART_ADDED_EVENT = 'chart-added-to-dashboard';

const defaultSuggestions = [
  'Show me the data pipeline jobs with latency greater than 2 hours?',
  'List of jobs failed today?',
  'Jobs with latency more than 2 hours this week',
];

const mockChartData = [
  { name: 'Orders', success: 150 },
  { name: 'Products', success: 180 },
  { name: 'Customers', success: 230 },
];

const mockResponses = {
  default: {
    sql: `
SELECT
  pipeline_name AS name,
  ROUND(AVG(latency_seconds) / 60, 2) AS avg_latency_min,
  ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_seconds) / 60, 2) AS p95_latency_min
FROM pipeline_runs
GROUP BY pipeline_name
HAVING AVG(latency_seconds) / 60 > 120;
`.trim(),
    message: 'Here are the pipelines with latency above 120 minutes:',
    data: mockChartData,
  },
  failed: {
    sql: `
SELECT 
  error_category AS name,
  COUNT(*) AS count
FROM jobs
WHERE status = 'FAILED' 
  AND failure_time >= CURRENT_DATE
GROUP BY error_category
ORDER BY count DESC;
`.trim(),
    message: "Here's the breakdown of today's failed jobs by error category:",
    data: [
      { name: 'Network Issues', count: 42 },
      { name: 'Resource Limits', count: 28 },
      { name: 'API Timeouts', count: 15 },
      { name: 'Data Validation', count: 10 },
      { name: 'Other', count: 5 },
    ],
  },
  weekly: {
    sql: `
SELECT
  pipeline_name AS name,
  ROUND(AVG(latency_seconds) / 60, 2) AS latency_mins
FROM pipeline_runs
WHERE run_start_time >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY pipeline_name
HAVING AVG(latency_seconds) / 60 > 120
ORDER BY latency_mins DESC;
`.trim(),
    message: 'These pipelines had average latency greater than 2 hours this week:',
    data: [
      { name: 'Data Pipeline Alpha', latency_mins: 185 },
      { name: 'ETL Process Beta', latency_mins: 164 },
      { name: 'Nightly Batch Job', latency_mins: 142 },
      { name: 'Customer Analytics', latency_mins: 130 },
      { name: 'Recommendation Engine', latency_mins: 125 },
    ],
  },
  expensive: {
    sql: `
SELECT 
  workload_name AS name,
  ROUND(SUM(cost_usd), 2) AS cost
FROM workloads
GROUP BY workload_name
ORDER BY cost DESC
LIMIT 6;
`.trim(),
    message: 'Here are the 6 most expensive workloads:',
    data: [
      { name: 'ML Training Cluster', cost: 12500 },
      { name: 'Real-time Analytics', cost: 9800 },
      { name: 'Data Lake Processing', cost: 7600 },
      { name: 'BI Dashboard Backend', cost: 5400 },
      { name: 'Log Analytics Pipeline', cost: 4200 },
      { name: 'Customer Data Platform', cost: 3800 },
    ],
  },
};

export function GenericChatUI({
  imageSrc,
  assistantColor = '#009459',
  userColor = '#000000',
  suggestions = defaultSuggestions,
  onAddToDashboard,
}: GenericChatUIProps) {
  const { messages, addUserMessage, addAssistantMessage, updateLastAssistantMessage } = useChatMessages();
  const [input, setInput] = useState('');
  const [mockResponse, setMockResponse] = useState<{ sql: string; data: any } | null>(null);
  const [activeTab, setActiveTab] = useState<'chart' | 'sql'>('chart');

  const handleSend = () => {
    const q = input.trim();
    if (!q) return;
    addUserMessage(q);
    addAssistantMessage('Processing...');
    setInput('');
    setTimeout(() => {
      let type: keyof typeof mockResponses = 'default';
      const lower = q.toLowerCase();
      if (lower.includes('failed')) type = 'failed';
      else if (lower.includes('expensive') || lower.includes('cost')) type = 'expensive';
      else if (lower.includes('week')) type = 'weekly';
      const r = mockResponses[type];
      updateLastAssistantMessage(r.message);
      setMockResponse({ sql: r.sql, data: r.data });
    }, 500);
  };

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
        <div className="px-6 py-4 w-full  mx-auto">
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
                {suggestions.map((s, i) => (
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
                ))}
              </div>
            </motion.div>
          ) : (
            <>
              {messages.map((m, i) => {
                const isA = m.role === 'assistant';
                return (
                  <div key={i} className="flex items-center gap-4 py-2">
                    <div
                      className="w-8 h-8 rounded-full flex-shrink-0"
                      style={{ backgroundColor: isA ? assistantColor : userColor }}
                    />
                    <div
                      className={`flex-1 rounded-2xl px-2 py-3 shadow ${
                        isA ? 'bg-gray-100 text-black' : 'bg-gradient-to-r from-white to-slate-50'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                    </div>
                  </div>
                );
              })}
              {mockResponse && (
                <>
                  <Tabs
                    value={activeTab}
                    onValueChange={v => setActiveTab(v as 'chart' | 'sql')}
                    className="mt-6"
                  >
                    <TabsList className="flex space-x-2 mb-2">
                      <TabsTrigger
                        value="chart"
                        className={`px-4 py-2 rounded-t-lg ${
                          activeTab === 'chart'
                            ? 'bg-gray-200 text-gray-800'
                            : 'bg-white text-gray-500'
                        }`}
                      >
                        Chart
                      </TabsTrigger>
                      <TabsTrigger
                        value="sql"
                        className={`px-2 py-2 rounded-t-lg ${
                          activeTab === 'sql'
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
                            onClick={() => handleAddToDashboard(mockResponse.data)}
                            className="h-7 text-xs"
                          >
                            Add to Dashboard
                          </Button>
                        </div>
                        <ChatChartView data={mockResponse.data} />
                      </div>
                    </TabsContent>
                    <TabsContent value="sql" className="pt-4">
                      <ChatSQLView sql={mockResponse.sql} />
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
      <div className="p-4 border-t border-slate-200 bg-white">
        <AIChatInput input={input} onChange={setInput} onSend={handleSend} placeholder="Type a message..." />
      </div>
    </div>
  );
}
