import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  const [mockResponse, setMockResponse] = useState<{ sql: string; chartData: any[] } | null>(null)
  const [activeTab, setActiveTab] = useState<'chart' | 'sql'>('chart')
  const [input, setInput] = useState('')

  const handleSend = () => {
    const query = input
    if (!query.trim()) return
    addUserMessage(query)
    addAssistantMessage('Processing...')
    setInput('')

    setTimeout(() => {
      let sql = ''
      let chartData: any[] = []

      if (query.includes('failed for last week')) {
        sql = `SELECT run_date AS date,
       total_runs,
       failure_count,
       ROUND((failure_count/total_runs)*100,1) AS failure_rate,
       (total_runs - failure_count) AS success_count,
       ROUND(((total_runs - failure_count)/total_runs)*100,1) AS success_rate
FROM (
  SELECT run_date,
         COUNT(*) AS total_runs,
         SUM(CASE WHEN status='failed' THEN 1 ELSE 0 END) AS failure_count
  FROM jobs
  WHERE run_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
  GROUP BY run_date
) t;`
        chartData = [
          { name: '2025-05-01', total_runs: 150, failure_count: 12, failure_rate: 8.0, success_count: 138, success_rate: 92.0 },
          { name: '2025-05-02', total_runs: 160, failure_count: 18, failure_rate: 11.3, success_count: 142, success_rate: 88.7 },
          { name: '2025-05-03', total_runs: 140, failure_count: 9, failure_rate: 6.4, success_count: 131, success_rate: 93.6 },
          { name: '2025-05-04', total_runs: 170, failure_count: 14, failure_rate: 8.2, success_count: 156, success_rate: 91.8 },
          { name: '2025-05-05', total_runs: 155, failure_count: 22, failure_rate: 14.2, success_count: 133, success_rate: 85.8 },
          { name: '2025-05-06', total_runs: 145, failure_count: 7, failure_rate: 4.8, success_count: 138, success_rate: 95.2 },
          { name: '2025-05-07', total_runs: 165, failure_count: 11, failure_rate: 6.7, success_count: 154, success_rate: 93.3 },
        ]
      } else if (query.includes('cost more than')) {
        sql = `SELECT job_name AS name, cost_usd, budget_usd,
       ROUND((cost_usd/budget_usd)*100,1) AS budget_pct,
       cost_usd - budget_usd AS over_budget
FROM jobs
WHERE cost_usd > 1000;`
        chartData = [
          { name: 'Data Ingest', cost_usd: 1500, budget_usd: 2000, budget_pct: 75.0, over_budget: -500 },
          { name: 'Model Training', cost_usd: 2400, budget_usd: 2000, budget_pct: 120.0, over_budget: 400 },
          { name: 'Analytics Report', cost_usd: 1800, budget_usd: 1500, budget_pct: 120.0, over_budget: 300 },
          { name: 'Data Export', cost_usd: 1100, budget_usd: 1000, budget_pct: 110.0, over_budget: 100 },
        ]
      } else if (query.includes('less than 90% accuracy')) {
        sql = `SELECT job_name AS name, accuracy_pct,
       ROUND((100-accuracy_pct),1) AS error_rate,
       test_count,
       passed_count
FROM (
  SELECT job_name,
         AVG(accuracy) AS accuracy_pct,
         COUNT(*) AS test_count,
         SUM(CASE WHEN accuracy >= 90 THEN 1 ELSE 0 END) AS passed_count
  FROM job_tests
  GROUP BY job_name
) t
WHERE accuracy_pct < 90;`
        chartData = [
          { name: 'Image Classifier', accuracy_pct: 85.2, error_rate: 14.8, test_count: 200, passed_count: 171 },
          { name: 'Speech Recognition', accuracy_pct: 88.9, error_rate: 11.1, test_count: 180, passed_count: 160 },
          { name: 'Language Model', accuracy_pct: 79.5, error_rate: 20.5, test_count: 220, passed_count: 175 },
          { name: 'Recommendation', accuracy_pct: 82.3, error_rate: 17.7, test_count: 210, passed_count: 173 },
        ]
      } else if (query.includes('latency more than')) {
        sql = `SELECT service_name AS name, avg_latency_ms, p50_latency_ms, p95_latency_ms
FROM service_metrics
WHERE avg_latency_ms > 100;`
        chartData = [
          { name: 'Auth Service', avg_latency_ms: 120, p50_latency_ms: 110, p95_latency_ms: 250 },
          { name: 'Data API', avg_latency_ms: 180, p50_latency_ms: 170, p95_latency_ms: 320 },
          { name: 'Notification', avg_latency_ms: 150, p50_latency_ms: 140, p95_latency_ms: 280 },
          { name: 'Billing', avg_latency_ms: 130, p50_latency_ms: 125, p95_latency_ms: 260 },
        ]
      } else {
        sql = 'SELECT job_name AS name, status, run_time_s FROM jobs ORDER BY run_time_s DESC LIMIT 10;'
        chartData = []
      }

      updateLastAssistantMessage('Here are realistic analytics results:')
      setMockResponse({ sql, chartData })
    }, 500)
  }

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex-1 mt-4 overflow-hidden">
        {!messages.length ? (
          <div className="flex flex-col items-center justify-center h-full">
            {imageSrc && <img src={imageSrc} alt="AI logo" className="w-12 h-12 mb-4" />}
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
              {messages.map((msg, idx) => (
                <div key={idx} className="flex items-start gap-2.5"> {/* Ensure left alignment and add gap for dot */}
                  {/* Dot Indicator */}
                  {msg.role === 'assistant' ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-black mt-2 flex-shrink-0"></div>
                  )}
                  <div
                    className={cn(
                      'rounded-lg px-4 py-2 max-w-[80%] whitespace-pre-wrap break-words',
                      msg.role === 'assistant' 
                        ? 'bg-green-600 text-white'  // Assistant: green background, white text
                        : 'bg-black text-white'       // User: black background, white text
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {mockResponse && (
                <>
                  <Tabs
                    value={activeTab}
                    onValueChange={(val) => setActiveTab(val as 'chart' | 'sql')}
                    className="mt-6"
                  >
                    <TabsList className="flex space-x-2 border-b">
                      <TabsTrigger value="chart" className="px-4 py-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white">Chart</TabsTrigger>
                      <TabsTrigger value="sql" className="px-4 py-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white">SQL</TabsTrigger>
                    </TabsList>
                    <TabsContent value="chart" className="pt-4">
                      <ChatChartView data={mockResponse.chartData} />
                    </TabsContent>
                    <TabsContent value="sql" className="pt-4">
                      <ChatSQLView sql={mockResponse.sql} />
                    </TabsContent>
                  </Tabs>
                  <div className="mt-4 text-left text-sm text-gray-600">Do you have any further queries?</div>
                </>
              )}
            </div>
          </ScrollArea>
        )}
      </div>
      <div className="flex gap-2 mt-4 flex-shrink-0">
        <AIChatInput input={input} onChange={setInput} onSend={handleSend} />
      </div>
    </div >
  )
}
