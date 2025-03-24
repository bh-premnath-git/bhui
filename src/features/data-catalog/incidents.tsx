import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar,
  PieChart, 
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'
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
  Shield 
} from 'lucide-react'

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

const lineChartData = [
  { name: 'Jan', incidents: 4 },
  { name: 'Feb', incidents: 3 },
  { name: 'Mar', incidents: 7 },
  { name: 'Apr', incidents: 2 },
  { name: 'May', incidents: 6 },
  { name: 'Jun', incidents: 4 },
]

const pieChartData = [
  { name: 'Quality Issues', value: 40 },
  { name: 'Performance', value: 30 },
  { name: 'Security', value: 20 },
  { name: 'Other', value: 10 },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

const mockMetrics = {
  totalIncidents: 45,
  openIncidents: 12,
  avgResolutionTime: "4.5 hours",
  dataQualityScore: 92,
  impactedSources: 3,
}

const Incidents = () => {
  const [activeTab, setActiveTab] = useState('overview')

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

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Incident Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="incidents" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Incident Types Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
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

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Impact Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockIncidents}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="affectedRows" fill="#8884d8" />
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

export default Incidents
