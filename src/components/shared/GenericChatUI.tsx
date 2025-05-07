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
]

// 🤖 Mock data lives here — update this array to change your sample results
const mockChartData = [
  { name: 'Orders', success: 150 },
  { name: 'Products', success: 180 },
  { name: 'Customers', success: 230 },
]

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
    sql: string
    chartData: typeof mockChartData
  } | null>(null)
  const [activeTab, setActiveTab] = useState<'chart' | 'sql'>('chart')

  const handleSend = () => {
    const query = input.trim()
    if (!query) return

    addUserMessage(query)
    addAssistantMessage('Processing...')
    setInput('')

    setTimeout(() => {
      const sql = `
SELECT
  pipeline_name AS name,
  ROUND(AVG(latency_seconds) / 60, 2) AS avg_latency_min,
  ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_seconds) / 60, 2) AS p95_latency_min
FROM pipeline_runs
GROUP BY pipeline_name
HAVING AVG(latency_seconds) / 60 > 120;
      `.trim()

      updateLastAssistantMessage('Here are the pipelines with latency above 120 minutes:')
      setMockResponse({ sql, chartData: mockChartData })
    }, 500)
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50 backdrop-blur-md shadow-lg rounded-lg">
      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4 py-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">
            {imageSrc && <img src={imageSrc} alt="AI logo" className="w-12 h-12 mb-4" />}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setInput(s)}
                  className="px-3 py-1 rounded-full bg-gray-200 hover:bg-gray-300 text-sm"
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600">How can I assist you?</p>
          </div>
        ) : (
          <div className="space-y-8 py-2">
            {messages.map((msg, idx) => {
              const isAssistant = msg.role === 'assistant'
              const circleColor = isAssistant ? assistantColor : userColor
              const textColor   = isAssistant ? assistantColor : userColor

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
                    <div className="rounded-2xl px-4 py-3 bg-gradient-to-r from-white to-slate-50 border border-border/40 shadow-md transition-shadow hover:shadow-lg">
                      <div
                        className="whitespace-pre-wrap leading-relaxed"
                        style={{ color: textColor }}
                      >
                        {msg.content}
                      </div>
                    </div>
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
                    <TabsTrigger value="chart" className="px-4 py-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                      Chart
                    </TabsTrigger>
                    <TabsTrigger value="sql" className="px-4 py-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                      SQL
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="chart" className="pt-4">
                    <ChatChartView data={mockResponse.chartData} />
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
                    <div className="rounded-2xl px-4 py-3 bg-gradient-to-r from-white to-slate-50 border border-border/40 shadow-md">
                      <div
                        className="whitespace-pre-wrap leading-relaxed"
                        style={{ color: assistantColor }}
                      >
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
      <div className="p-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-b-lg">
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
