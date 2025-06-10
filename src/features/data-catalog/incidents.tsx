import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  Clock, 
  PieChart as PieChartIcon, 
  Shield,
  X
} from 'lucide-react'
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

// Mock data
const mockIncidents = [
  {
    id: 1,
    title: "Data Quality Issue",
    severity: "high",
    status: "open",
    type: "quality",
    affectedRows: 1500,
    timestamp: "2024-03-20T10:00:00",
    description: "Missing values detected in critical columns",
  },
  {
    id: 2,
    title: "Performance Degradation",
    severity: "medium",
    status: "investigating",
    type: "performance",
    affectedRows: 800,
    timestamp: "2024-03-19T15:30:00",
    description: "Query performance issues detected",
  },
  {
    id: 3,
    title: "Security Alert",
    severity: "high",
    status: "resolved",
    type: "security",
    affectedRows: 2000,
    timestamp: "2024-03-18T09:15:00",
    description: "Unusual access pattern detected",
  }
]

const pieChartData = [
  { name: 'Quality Issues', value: 40 },
  { name: 'Performance', value: 30 },
  { name: 'Security', value: 20 },
  { name: 'Other', value: 10 },
]

const mockMetrics = {
  totalIncidents: 45,
  openIncidents: 12,
  avgResolutionTime: "4.5 hours",
  dataQualityScore: 92,
  impactedSources: 3,
}

const trendData = [
  { name: 'Week 1', quality: 4, performance: 2, security: 1 },
  { name: 'Week 2', quality: 3, performance: 1, security: 2 },
  { name: 'Week 3', quality: 5, performance: 3, security: 0 },
  { name: 'Week 4', quality: 2, performance: 1, security: 1 },
]

// 2. Update the type definitions to be more specific for the chart data
type TrendDataPoint = {
  name: string;
  quality: number;
  performance: number;
  security: number;
}

type PieDataPoint = {
  name: string;
  value: number;
}

// 3. Add proper typing for the chart configs
type ChartConfig = {
  labels: string[];
  valueFormatter: (value: number) => string;
}

const Incidents = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Add data preparation for impact analysis
  const impactAnalysisData = mockIncidents.map(incident => ({
    name: incident.title,
    affectedRows: incident.affectedRows
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Data Incidents</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.totalIncidents}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Quality Score</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.dataQualityScore}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Resolution Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.avgResolutionTime}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="incidents">Incidents List</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="p-4 m-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border shadow-sm">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium">Incident Trends by Type</CardTitle>
                <CardDescription className="text-xs">Last 4 weeks</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="h-[250px]">
                  {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <span className="text-sm text-gray-500">Loading...</span>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={trendData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => value.toString()} />
                        <Legend />
                        <Bar dataKey="quality" name="Quality" fill="#f43f5e" />
                        <Bar dataKey="performance" name="Performance" fill="#f59e0b" />
                        <Bar dataKey="security" name="Security" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium">Incident Distribution by Type</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <PieChart
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  colors={["#f43f5e", "#f59e0b", "#3b82f6", "#a855f7"]}
                  config={{
                    innerRadius: 0,
                    outerRadius: 80,
                    showLabels: false,
                    valueFormatter: (value: number) => `${value}%`
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="incidents">
          <Card>
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Issue</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Detected At</TableHead>
                    <TableHead>Affected Rows</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockIncidents.map((incident) => (
                    <TableRow key={incident.id}>
                      <TableCell>{incident.title}</TableCell>
                      <TableCell>
                        <Badge variant={incident.severity === 'high' ? 'destructive' : 'default'}>
                          {incident.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>{incident.status}</TableCell>
                      <TableCell>{incident.timestamp}</TableCell>
                      <TableCell>{incident.affectedRows}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="p-4 m-0">
          <Card className="border shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium">Impact Analysis by Incident</CardTitle>
              <CardDescription className="text-xs">Showing affected rows by incident</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={impactAnalysisData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => value.toLocaleString()} />
                    <Legend />
                    <Bar dataKey="affectedRows" name="Affected Rows" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedIncident && (
        <div className="mt-4 p-4 border rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Incident Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Source</p>
              <p className="text-sm">{selectedIncident.source}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Assignee</p>
              <p className="text-sm">{selectedIncident.assignee}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-medium text-gray-500 mb-1">Description</p>
              <p className="text-sm text-gray-700">{selectedIncident.description}</p>
            </div>
            {selectedIncident.resolution && (
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-500 mb-1">Resolution</p>
                <p className="text-sm text-gray-700">{selectedIncident.resolution}</p>
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-end">
            <button 
              className="rounded-full p-1 hover:bg-gray-100"
              onClick={() => setSelectedIncident(null)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Incidents
