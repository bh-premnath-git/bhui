import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Badge } from "@/components/ui/badge"

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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Data Quality Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dqMetrics.overview.totalRecords.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Pass Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {((dqMetrics.overview.passedRules / dqMetrics.overview.totalRecords) * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Last Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dqMetrics.overview.freshness}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Rules Results</TabsTrigger>
          <TabsTrigger value="trends">Quality Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="rules">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rule Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Failed Records</TableHead>
                    <TableHead>Impact</TableHead>
                    <TableHead>Last Run</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dqMetrics.ruleResults.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>{rule.name}</TableCell>
                      <TableCell>{rule.category}</TableCell>
                      <TableCell>
                        <Badge variant={rule.status === "Passed" ? "success" : "destructive"}>
                          {rule.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{rule.failedRecords}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{rule.impact}</Badge>
                      </TableCell>
                      <TableCell>{new Date(rule.lastRun).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardContent className="pt-6">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dqMetrics.trendsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="passed" fill="#22c55e" name="Passed Rules" />
                    <Bar dataKey="failed" fill="#ef4444" name="Failed Rules" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default DQRules
