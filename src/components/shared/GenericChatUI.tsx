import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useChatMessages } from '@/hooks/useChatMessages'
import { AIChatInput } from '@/components/shared/AIChatInput'
import { cn } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ChatSQLView } from '@/components/shared/chat-components/ChatSQLView'
import { ChatChartView } from '@/components/shared/chat-components/ChatChartView'

interface GenericChatUIProps {
  imageSrc?: string
}

// Four query suggestions to display
const suggestions = [
  'Show me jobs failed for last week',
  'Show me jobs which cost more than $1000',
  'Show me jobs with less than 90% accuracy',
  'Show me jobs with latency more than 100ms',
]

export function GenericChatUI({ imageSrc }: GenericChatUIProps) {
  const { messages, addUserMessage, addAssistantMessage, updateLastAssistantMessage } = useChatMessages()
  const [mockResponse, setMockResponse] = useState<{
    sql: string
    chartData: any[]
  } | null>(null)
  const [activeTab, setActiveTab] = useState<'chart' | 'sql'>('chart')
  const [input, setInput] = useState('')

  const handleSend = () => {
    const query = input
    if (!query.trim()) return
    addUserMessage(query)
    addAssistantMessage('Processing...')
    setInput('')

    // Determine mock SQL and multi-line data based on the query
    setTimeout(() => {
      let sql = ''
      let chartData: any[] = []

      if (query.includes('failed for last week')) {
        sql = "SELECT job_name, failure_count FROM jobs WHERE run_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY);"
        chartData = [
          { name: 'Job A', failure_count: 5, failure_rate: 10 },
          { name: 'Job B', failure_count: 3, failure_rate: 5 },
          { name: 'Job C', failure_count: 8, failure_rate: 15 },
        ]
      } else if (query.includes('cost more than')) {
        sql = "SELECT job_name, cost_usd FROM jobs WHERE cost_usd > 1000;"
        chartData = [
          { name: 'Job X', cost_usd: 1500, budget_pct: 75 },
          { name: 'Job Y', cost_usd: 2200, budget_pct: 90 },
        ]
      } else if (query.includes('less than 90% accuracy')) {
        sql = "SELECT job_name, accuracy_pct FROM jobs WHERE accuracy_pct < 90;"
        chartData = [
          { name: 'Job L', accuracy_pct: 85, error_rate: 15 },
          { name: 'Job M', accuracy_pct: 78, error_rate: 22 },
        ]
      } else if (query.includes('latency more than')) {
        sql = "SELECT job_name, avg_latency_ms, p95_latency_ms FROM jobs WHERE avg_latency_ms > 100;"
        chartData = [
          { name: 'Job Q', avg_latency_ms: 120, p95_latency_ms: 200 },
          { name: 'Job R', avg_latency_ms: 180, p95_latency_ms: 300 },
        ]
      } else {
        sql = 'SELECT * FROM jobs LIMIT 10;'
        chartData = []
      }

      updateLastAssistantMessage('Here are agent results:')
      setMockResponse({ sql, chartData })
    }, 500)
  }

  return (
    <div className="flex flex-col h-full p-4">
      {/* Message Area */}
      <div className="flex-1 mt-4 overflow-hidden">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            {imageSrc && (
              <img src={imageSrc} alt="AI logo" className="w-12 h-12 mb-4" />
            )}

            {/* Query Suggestions */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {suggestions.map((sug) => (
                <button
                  key={sug}
                  onClick={() => setInput(sug)}
                  className="px-3 py-1 rounded-full bg-gray-200 hover:bg-gray-300 text-sm"
                >
                  {sug}
                </button>
              ))}
            </div>

            <p className="text-sm text-gray-600">How can I assist you?</p>
          </div>
        ) : (
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6">
              {messages.map((message, i) => (
                <div key={i} className="flex items-start gap-3">
                  {message.role === 'assistant' ? (
                    <Avatar className="h-8 w-8 flex items-center justify-center bg-[#009f59]">
                      <AvatarImage
                        src={imageSrc}
                        className="w-3.5 h-5 transform -rotate-[40deg]"
                        style={{ objectFit: 'contain' }}
                      />
                      <AvatarFallback className="text-white">AI</AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-[#009f59] text-white">B</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'rounded-lg px-4 py-2 max-w-[80%] relative whitespace-pre-wrap break-words',
                      message.role === 'assistant'
                        ? 'bg-gray-100 text-black before:absolute before:left-[-6px] before:top-3 before:border-4 before:border-transparent before:border-r-gray-100'
                        : 'bg-blue-100 text-blue-900 before:absolute before:left-[-6px] before:top-3 before:border-4 before:border-transparent before:border-r-blue-100'
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {/* Mock response tabs */}
              {mockResponse && (
                <>
                  <Tabs
                    value={activeTab}
                    onValueChange={(value: string) => setActiveTab(value as 'chart' | 'sql')}
                    className="mt-6"
                  >
                    <TabsList className="flex space-x-2 border-b">
                      <TabsTrigger
                        value="chart"
                        className="px-4 py-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                      >
                        Chart
                      </TabsTrigger>
                      <TabsTrigger
                        value="sql"
                        className="px-4 py-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                      >
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

                  {/* Follow-up prompt */}
                  <div className="mt-4 text-left text-sm text-gray-600">
                    Do you have any further queries?
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Input Area */}
      <div className="flex gap-2 mt-4 flex-shrink-0">
        <AIChatInput
          input={input}
          onChange={setInput}
          onSend={handleSend}
        />
      </div>
    </div>
  )
}
