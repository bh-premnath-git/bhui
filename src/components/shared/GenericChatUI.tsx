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
    pipelineData: { label: string; value: number }[]
    projectStatusData: { label: string; value: number }[]
    latencyData: { name: string; avgLatency: number; p95Latency: number }[]
    latencySql: string
  } | null>(null)
  const [activeTab, setActiveTab] = useState<'chart' | 'sql'>('chart')
  const [chartConfig, setChartConfig] = useState<{ category: 'pipelineUsage' | 'projectStatusDuration' | 'latency'; seriesType: 'single' | 'multi'; axisType: 'vertical' | 'horizontal' }>({ category: 'pipelineUsage', seriesType: 'single', axisType: 'vertical' })
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return
    addUserMessage(input)
    addAssistantMessage('Processing...')
    setInput('')
    // Simulate AI response with mock datasets
    setTimeout(() => {
      const sql = 'SELECT pipeline_name, usage_count FROM pipelines;'
      const pipelineData = [
        { label: 'Pipeline A', value: 120 },
        { label: 'Pipeline B', value: 85 },
        { label: 'Pipeline C', value: 60 },
      ]
      const projectStatusData = [
        { label: 'Completed', value: 15 },
        { label: 'Running', value: 7 },
        { label: 'Failed', value: 3 },
      ]
      const latencyData = [
        { name: 'Service A', avgLatency: 120, p95Latency: 200 },
        { name: 'Service B', avgLatency: 85, p95Latency: 150 },
        { name: 'Service C', avgLatency: 60, p95Latency: 100 },
      ]
      const latencySql = 'SELECT service_name, avg_latency, p95_latency FROM service_metrics;'
      updateLastAssistantMessage('Here are analytics results:')
      setMockResponse({ sql, pipelineData, projectStatusData, latencyData, latencySql })
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
                      <ChatChartView
                        data={
                          chartConfig.category === 'latency'
                            ? mockResponse.latencyData
                            : chartConfig.category === 'pipelineUsage'
                              ? mockResponse.pipelineData
                              : mockResponse.projectStatusData
                        }
                        config={chartConfig}
                      />
                    </TabsContent>
                    <TabsContent value="sql" className="pt-4">
                      <ChatSQLView sql={chartConfig.category === 'latency' ? mockResponse.latencySql : mockResponse.sql} />
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
