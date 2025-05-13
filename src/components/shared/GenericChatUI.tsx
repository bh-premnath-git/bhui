import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useChatMessages } from '@/hooks/useChatMessages'
import { AIChatInput } from '@/components/shared/AIChatInput'
import { motion } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ChatSQLView } from '@/components/shared/chat-components/ChatSQLView'
import { ChatChartView } from '@/components/shared/chat-components/ChatChartView'

interface GenericChatUIProps {
  imageSrc?: string
  assistantColor?: string
  userColor?: string
  suggestions?: string[]
}

const defaultSuggestions = [
  'Show me the data pipeline jobs with latency greater than 2 hours?',
  'List of jobs failed today?',
  'Jobs with latency more than 2 hours this week',
  'List 20 most expensive workloads'
]

// Original mock data for backward compatibility
const mockChartData = [
  { name: 'Orders', success: 150 },
  { name: 'Products', success: 180 },
  { name: 'Customers', success: 230 },
]

// Mock data for each query type with appropriate structures
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
    data: mockChartData
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
      { name: 'Other', count: 5 }
    ]
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
      { name: 'Recommendation Engine', latency_mins: 125 }
    ]
  },
  
  expensive: {
    sql: `
SELECT 
  workload_name AS name,
  ROUND(SUM(cost_usd), 2) AS cost
FROM workloads
GROUP BY workload_name
ORDER BY cost DESC
LIMIT 20;
`.trim(),
    message: 'Here are the 20 most expensive workloads:',
    data: [
      { name: 'ML Training Cluster', cost: 12500 },
      { name: 'Real-time Analytics', cost: 9800 },
      { name: 'Data Lake Processing', cost: 7600 },
      { name: 'BI Dashboard Backend', cost: 5400 },
      { name: 'Log Analytics Pipeline', cost: 4200 },
      { name: 'Customer Data Platform', cost: 3800 }
    ]
  }
}

export function GenericChatUI({
  imageSrc,
  assistantColor = '#009459',
  userColor = '#000000',
  suggestions = defaultSuggestions,
}: GenericChatUIProps) {
  const {
    messages,
    addUserMessage,
    addAssistantMessage,
    updateLastAssistantMessage,
  } = useChatMessages()

  const [input, setInput] = useState('')
  const [mockResponse, setMockResponse] = useState<{
    sql: string,
    data: any
  } | null>(null)
  const [activeTab, setActiveTab] = useState<'chart' | 'sql'>('chart')

  const handleSend = () => {
    const query = input.trim()
    if (!query) return

    addUserMessage(query)
    addAssistantMessage('Processing...')
    setInput('')

    setTimeout(() => {
      // Determine which mock response to use based on query keywords
      let responseType = 'default'
      
      if (query.toLowerCase().includes('failed')) {
        responseType = 'failed'
      } else if (query.toLowerCase().includes('expensive') || 
                query.toLowerCase().includes('cost')) {
        responseType = 'expensive'
      } else if (query.toLowerCase().includes('week')) {
        responseType = 'weekly'
      }
      
      const response = mockResponses[responseType]
      updateLastAssistantMessage(response.message)
      setMockResponse({
        sql: response.sql,
        data: response.data
      })
    }, 500)
  }

  return (
    <div className="h-full flex flex-col bg-white backdrop-blur-md shadow-lg rounded-lg">
      {/* Messages Area */}
      <ScrollArea className="flex-1 px-2 py-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full max-w-md"
            >
              <div className="flex items-start gap-4 px-1">
                <motion.div
                  className="inline-flex items-center justify-center mt-1"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: assistantColor }}
                    whileHover={{ scale: 1.05, opacity: 0.9 }}
                  />
                </motion.div>
                
                <div className="flex-1">
                  <div className="rounded-2xl px-4 py-3 bg-gray-100 border border-border/40 shadow-md">
                    <p className="text-sm text-gray-600 mb-3">How can I assist you?</p>
                    <div className="flex flex-col space-y-2">
                      {suggestions.map((s, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + (i * 0.1) }}
                          className="group"
                        >
                          <div
                            onClick={() => setInput(s)}
                            className="py-2 px-3 rounded-lg bg-white/80 hover:bg-white border border-gray-200 cursor-pointer transition-all duration-200 group-hover:shadow-sm"
                          >
                            <div className="text-sm text-gray-800 group-hover:text-black">
                              {s}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="space-y-8 py-2">
            {messages.map((msg, idx) => {
              const isAssistant = msg.role === 'assistant'
              const circleColor = isAssistant ? assistantColor : userColor

              return (
                <div key={idx} className="flex items-center gap-4 px-1">
                  <motion.div
                    className="inline-flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: circleColor }}
                      whileHover={{ scale: 1.05, opacity: 0.9 }}
                      whileTap={{ scale: 0.9 }}
                    />
                  </motion.div>

                  <div className="flex-1">
                    {isAssistant ? (
                      <div className="rounded-2xl px-4 py-3 bg-gray-100 border border-border/40 shadow-md transition-shadow hover:shadow-lg">
                        <div className="whitespace-pre-wrap leading-relaxed text-black">
                          {msg.content}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl px-4 py-3 bg-gradient-to-r from-white to-slate-50 border border-border/40 shadow-md transition-shadow hover:shadow-lg">
                        <div
                          className="whitespace-pre-wrap leading-relaxed"
                          style={{ color: userColor }}
                        >
                          {msg.content}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {mockResponse && (
              <>
                {/* Chart / SQL Tabs */}
                <Tabs
                  value={activeTab}
                  onValueChange={val => setActiveTab(val as 'chart' | 'sql')}
                  className="mt-6"
                >
                  <TabsList className="flex space-x-2 border-b">
                    <TabsTrigger value="chart" className="px-4 py-2 data-[state=active]:bg-green-500 data-[state=active]:text-white">
                      Chart
                    </TabsTrigger>
                    <TabsTrigger value="sql" className="px-4 py-2 data-[state=active]:bg-green-500 data-[state=active]:text-white">
                      SQL
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="chart" className="pt-4">
                    <ChatChartView data={mockResponse.data} />
                  </TabsContent>
                  <TabsContent value="sql" className="pt-4">
                    <ChatSQLView sql={mockResponse.sql} />
                  </TabsContent>
                </Tabs>

                {/* Follow-up assistant bubble */}
                <div className="flex items-center gap-4 px-1 mt-4">
                  <motion.div
                    className="inline-flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: assistantColor }}
                    />
                  </motion.div>
                  <div className="flex-1">
                    <div className="rounded-2xl px-4 py-3 bg-gray-100 border border-border/40 shadow-md">
                      <div className="whitespace-pre-wrap leading-relaxed text-black">
                        Do you want me to analyze the reasons for the latency issue?
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200 bg-white rounded-b-lg">
        <AIChatInput
          input={input}
          onChange={setInput}
          onSend={handleSend}
          placeholder="Type a message..."
          disabled={false}
        />
      </div>
    </div>
  )
}
