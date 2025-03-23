import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { useState } from "react"

// Enhanced mock data with more columns and types
const mockProfileData = {
  metadata: {
    name: "Customer Transaction Dataset",
    description: "Historical customer transaction data from retail operations",
    lastUpdated: "2025-03-15",
    owner: "Retail Analytics Team"
  },
  summary: {
    totalRows: 1243567,
    totalColumns: 24,
    missingCells: 39794,
    duplicateRows: 124,
    dataQualityScore: 87,
  },
  columnStats: [
    {
      name: "customer_id",
      type: "string",
      uniqueValues: 1241234,
      nullCount: 152843,
      nullPercentage: 12.3,
      duplicates: 2333,
      pattern: "CUST_[0-9]{6}",
      examples: ["CUST_123456", "CUST_789012"],
      distribution: [
        { range: "CUST_1xxxxx", count: 250000 },
        { range: "CUST_2xxxxx", count: 280000 },
        { range: "CUST_3xxxxx", count: 220000 },
        { range: "CUST_4xxxxx", count: 245000 },
        { range: "CUST_5xxxxx", count: 248567 },
      ]
    },
    {
      name: "transaction_date",
      type: "date",
      uniqueValues: 365,
      nullCount: 0,
      nullPercentage: 0,
      min: "2024-01-01",
      max: "2024-12-31",
      distribution: [
        { range: "Q1 2024", count: 310892 },
        { range: "Q2 2024", count: 298567 },
        { range: "Q3 2024", count: 315789 },
        { range: "Q4 2024", count: 318319 },
      ]
    },
    {
      name: "purchase_amount",
      type: "decimal",
      uniqueValues: 8234,
      nullCount: 0,
      nullPercentage: 0,
      min: 0.99,
      max: 9999.99,
      mean: 127.45,
      median: 89.99,
      stdDev: 245.67,
      distribution: [
        { range: "$0-$50", count: 456789 },
        { range: "$51-$100", count: 345678 },
        { range: "$101-$500", count: 234567 },
        { range: "$501-$1000", count: 123456 },
        { range: "$1000+", count: 83077 },
      ]
    },
    {
      name: "payment_method",
      type: "categorical",
      uniqueValues: 5,
      nullCount: 45987,
      nullPercentage: 3.7,
      distribution: [
        { range: "Credit Card", count: 623456 },
        { range: "Debit Card", count: 412345 },
        { range: "Digital Wallet", count: 98765 },
        { range: "Cash", count: 45678 },
        { range: "Other", count: 17336 },
      ]
    },
    {
      name: "store_id",
      type: "string",
      uniqueValues: 1243,
      nullCount: 1243,
      nullPercentage: 0.1,
      pattern: "ST[0-9]{4}",
      distribution: [
        { range: "ST0xxx", count: 312345 },
        { range: "ST1xxx", count: 298765 },
        { range: "ST2xxx", count: 321234 },
        { range: "ST3xxx", count: 311223 },
      ]
    },
    {
      name: "customer_age",
      type: "integer",
      uniqueValues: 72,
      nullCount: 24871,
      nullPercentage: 2.0,
      min: 18,
      max: 89,
      mean: 42.5,
      median: 41,
      stdDev: 12.3,
      distribution: [
        { range: "18-25", count: 156789 },
        { range: "26-35", count: 345678 },
        { range: "36-45", count: 378901 },
        { range: "46-55", count: 234567 },
        { range: "56+", count: 127632 },
      ]
    },
    {
      name: "customer_zipcode",
      type: "string",
      uniqueValues: 3456,
      nullCount: 101972,
      nullPercentage: 8.2,
      pattern: "[0-9]{5}",
      distribution: [
        { range: "10xxx", count: 234567 },
        { range: "11xxx", count: 198765 },
        { range: "12xxx", count: 167890 },
        { range: "Other", count: 642345 },
      ]
    },
    {
      name: "product_category",
      type: "categorical",
      uniqueValues: 8,
      nullCount: 0,
      nullPercentage: 0,
      distribution: [
        { range: "Electronics", count: 289765 },
        { range: "Clothing", count: 345678 },
        { range: "Home & Garden", count: 234567 },
        { range: "Food & Beverage", count: 198765 },
        { range: "Others", count: 174792 },
      ]
    },
    {
      name: "satisfaction_score",
      type: "integer",
      uniqueValues: 5,
      nullCount: 37307,
      nullPercentage: 3.0,
      min: 1,
      max: 5,
      mean: 4.2,
      median: 4,
      stdDev: 0.8,
      distribution: [
        { range: "1 Star", count: 24871 },
        { range: "2 Stars", count: 49742 },
        { range: "3 Stars", count: 248710 },
        { range: "4 Stars", count: 447678 },
        { range: "5 Stars", count: 472566 },
      ]
    },
    {
      name: "transaction_time",
      type: "time",
      uniqueValues: 1440,
      nullCount: 0,
      nullPercentage: 0,
      distribution: [
        { range: "Morning (6-12)", count: 372891 },
        { range: "Afternoon (12-17)", count: 447469 },
        { range: "Evening (17-22)", count: 298765 },
        { range: "Night (22-6)", count: 124442 },
      ]
    }
  ]
}

const COLORS = {
  primary: '#4F46E5',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  purple: '#8B5CF6',
  pink: '#EC4899',
  orange: '#F97316',
  teal: '#14B8A6',
  cyan: '#06B6D4'
}

const DataProfile = () => {
  const [selectedColumn, setSelectedColumn] = useState(mockProfileData.columnStats[0])

  return (
    <div className="p-6 bg-gray-50">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{mockProfileData.metadata.name}</h1>
        <p className="text-gray-600 mt-2">{mockProfileData.metadata.description}</p>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
          <span>Last updated: {mockProfileData.metadata.lastUpdated}</span>
          <span>•</span>
          <span>Owner: {mockProfileData.metadata.owner}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <h3 className="text-sm font-medium text-blue-700">Records</h3>
          <p className="text-2xl font-bold text-blue-900">{mockProfileData.summary.totalRows.toLocaleString()}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <h3 className="text-sm font-medium text-green-700">Fields</h3>
          <p className="text-2xl font-bold text-green-900">{mockProfileData.summary.totalColumns}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <h3 className="text-sm font-medium text-purple-700">Data Quality Score</h3>
          <div className="mt-2">
            <Progress value={mockProfileData.summary.dataQualityScore} className="bg-purple-200" 
              indicatorClassName="bg-purple-600" />
            <p className="mt-1 text-lg font-semibold text-purple-900">{mockProfileData.summary.dataQualityScore}%</p>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <h3 className="text-sm font-medium text-yellow-700">Missing Values</h3>
          <p className="text-2xl font-bold text-yellow-900">3.2%</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <h3 className="text-sm font-medium text-red-700">Duplicate Rows</h3>
          <p className="text-2xl font-bold text-red-900">{mockProfileData.summary.duplicateRows.toLocaleString()}</p>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Column List */}
        <Card className="lg:col-span-1 bg-white">
          <ScrollArea className="h-[700px] p-4">
            <h3 className="font-semibold mb-4 text-gray-900">Columns</h3>
            <div className="space-y-2">
              {mockProfileData.columnStats.map((column) => (
                <div
                  key={column.name}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedColumn.name === column.name 
                      ? 'bg-blue-50 border border-blue-200' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedColumn(column)}
                >
                  <p className="font-medium text-gray-900">{column.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-500">{column.type}</p>
                    {column.nullPercentage > 0 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                        {column.nullPercentage}% null
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Column Details */}
        <Card className="lg:col-span-3">
          <Tabs defaultValue="overview" className="p-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
              <TabsTrigger value="distribution">Distribution</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{selectedColumn.name}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-medium">{selectedColumn.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Unique Values</p>
                    <p className="font-medium">{selectedColumn.uniqueValues}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Null Count</p>
                    <p className="font-medium">{selectedColumn.nullCount}</p>
                  </div>
                  {selectedColumn.pattern && (
                    <div>
                      <p className="text-sm text-gray-500">Pattern</p>
                      <p className="font-medium">{selectedColumn.pattern}</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="statistics">
              {selectedColumn.type === 'integer' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="p-3">
                      <p className="text-sm text-gray-500">Minimum</p>
                      <p className="font-medium">{selectedColumn.min}</p>
                    </Card>
                    <Card className="p-3">
                      <p className="text-sm text-gray-500">Maximum</p>
                      <p className="font-medium">{selectedColumn.max}</p>
                    </Card>
                    <Card className="p-3">
                      <p className="text-sm text-gray-500">Mean</p>
                      <p className="font-medium">{selectedColumn.mean}</p>
                    </Card>
                    <Card className="p-3">
                      <p className="text-sm text-gray-500">Standard Deviation</p>
                      <p className="font-medium">{selectedColumn.stdDev}</p>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="distribution">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={selectedColumn.distribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}

export default DataProfile
