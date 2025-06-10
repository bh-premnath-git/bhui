import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Clock, CheckCircle, BarChart } from "lucide-react"
import { cn } from "@/lib/utils"

// Stub data - replace with API data later
const dqMetrics = {
  overview: {
    totalRecords: 150000,
    passedRules: 142500,
    failedRules: 7500,
    completeness: 95.6,
    accuracy: 98.2,
    freshness: "2 hours ago",
  },
  ruleResults: [
    {
      id: 1,
      name: "Null Check - Customer ID",
      category: "Completeness",
      status: "Failed",
      failedRecords: 150,
      impact: "High",
      lastRun: "2024-03-20T10:00:00",
    },
    {
      id: 2,
      name: "Date Format Validation",
      category: "Accuracy",
      status: "Passed",
      failedRecords: 0,
      impact: "Medium",
      lastRun: "2024-03-20T10:00:00",
    },
    // Add more rules as needed
  ],
  trendsData: [
    { date: "2024-03-14", passed: 95, failed: 5 },
    { date: "2024-03-15", passed: 97, failed: 3 },
    { date: "2024-03-16", passed: 94, failed: 6 },
    { date: "2024-03-17", passed: 98, failed: 2 },
    { date: "2024-03-18", passed: 96, failed: 4 },
  ]
}

const DQRules = () => {
  return (
    <div className="p-4 bg-gray-50">
      {/* Header */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Data Quality Rules</h1>
            <p className="text-sm text-gray-500">Monitor and manage data quality checks</p>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
          <Card className="bg-white border shadow-sm">
            <CardContent className="p-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-500">Total Records</p>
                  <p className="text-lg font-semibold">{dqMetrics.overview.totalRecords.toLocaleString()}</p>
                </div>
                <AlertCircle className="h-4 w-4 text-blue-500 mt-1" />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-gray-600">Passed: {dqMetrics.overview.passedRules.toLocaleString()}</span>
                </div>
                <div className="flex-1 flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-red-500"></div>
                  <span className="text-xs text-gray-600">Failed: {dqMetrics.overview.failedRules.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border shadow-sm">
            <CardContent className="p-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-500">Pass Rate</p>
                  <p className="text-lg font-semibold">
                    {((dqMetrics.overview.passedRules / dqMetrics.overview.totalRecords) * 100).toFixed(1)}%
                  </p>
                </div>
                <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
              </div>
              <div className="mt-2 flex items-center">
                <span className="text-xs text-gray-500">Target: 99.9%</span>
                <span className="text-xs ml-auto text-amber-600">-0.8%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border shadow-sm">
            <CardContent className="p-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-500">Last Updated</p>
                  <p className="text-lg font-semibold">{dqMetrics.overview.freshness}</p>
                </div>
                <Clock className="h-4 w-4 text-blue-500 mt-1" />
              </div>
              <div className="mt-2">
                <span className="text-xs text-gray-500">Next update in 30 mins</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main content */}
      <Tabs defaultValue="rules" className="bg-white border rounded-md shadow-sm">
        <div className="border-b px-3 py-2">
          <TabsList className="h-8 bg-transparent">
            <TabsTrigger value="rules" className="text-xs data-[state=active]:bg-gray-100">Rules Results</TabsTrigger>
            <TabsTrigger value="trends" className="text-xs data-[state=active]:bg-gray-100">Quality Trends</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="rules" className="m-0">
          <div className="overflow-x-auto p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule Name</TableHead>
                  <TableHead className="w-[120px]">Category</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[120px]">Failed Records</TableHead>
                  <TableHead className="w-[100px]">Impact</TableHead>
                  <TableHead className="w-[180px]">Last Run</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dqMetrics.ruleResults.map((rule) => (
                  <TableRow key={rule.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-sm">{rule.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{rule.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={cn(
                          "text-[10px] px-1.5 py-0",
                          rule.status === "Passed" 
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-red-100 text-red-800 border-red-200"
                        )}
                      >
                        {rule.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{rule.failedRecords.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge 
                        className={cn(
                          "text-[10px]",
                          rule.impact === "High" ? "bg-red-100 text-red-800 border-red-200" :
                          rule.impact === "Medium" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                          "bg-blue-100 text-blue-800 border-blue-200"
                        )}
                      >
                        {rule.impact}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{new Date(rule.lastRun).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="p-4 m-0">
          <Card className="border shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium">Rule Execution Results</CardTitle>
              <CardDescription className="text-xs">Last 5 days trend</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-[250px]">
                <BarChart
                  data={dqMetrics.trendsData}
                  xAxisDataKey="date"
                  bars={["passed", "failed"]}
                  colors={["#22c55e", "#ef4444"]}
                  config={{
                    labels: ["Passed Rules", "Failed Rules"],
                    valueFormatter: (value: number) => value.toString()
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default DQRules
