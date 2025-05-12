"use client"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Scatter,
  ScatterChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
} from "recharts"


export function XplorerMock() {
  // Color palette from the image - various shades of blue
  const colors = {
    lightBlue: "#D6E8F5",
    skyBlue: "#A7D1F0",
    mediumBlue: "#5BAEE5",
    oceanBlue: "#3D8BC9",
    darkBlue: "#1A4971",
  }

  // Array of colors for pie chart
  const COLORS = [colors.darkBlue, colors.oceanBlue, colors.mediumBlue, colors.skyBlue, colors.lightBlue];

  // Mock data for order metrics over time
  const orderTimeData = [
    { month: "Jan", processing: 27, shipped: 23, delivered: 31 },
    { month: "Feb", processing: 34, shipped: 23, delivered: 28 },
    { month: "Mar", processing: 22, shipped: 39, delivered: 33 },
    { month: "Apr", processing: 29, shipped: 26, delivered: 31 },
    { month: "May", processing: 43, shipped: 25, delivered: 35 },
  ]

  // Mock data for order revenue
  const revenueData = [
    { month: "Jan", revenue: 880 },
    { month: "Feb", revenue: 1130 },
    { month: "Mar", revenue: 950 },
    { month: "Apr", revenue: 1050 },
    { month: "May", revenue: 1474 },
  ]

  // Mock data for order distribution
  const orderDistributionData = [
    { name: "Standard", value: 45 },
    { name: "Express", value: 30 },
    { name: "Same Day", value: 15 },
    { name: "International", value: 10 },
  ]

  // Mock data for order status by product category
  const orderStatusByCategory = [
    { category: "Electronics", completed: 5, pending: 13 },
    { category: "Clothing", completed: 6, pending: 14 },
    { category: "Home", completed: 4, pending: 16 },
    { category: "Books", completed: 4, pending: 15 },
  ]

  // Mock data for order quality metrics
  const qualityMetricsData = [
    { category: "Electronics", rating: 36, returns: 65 },
    { category: "Clothing", rating: 51, returns: 48 },
    { category: "Home", rating: 40, returns: 55 },
    { category: "Books", rating: 35, returns: 63 },
  ]

  // Mock data for order incidents
  const incidentsData = [
    { category: "Electronics", minor: 2, major: 5 },
    { category: "Clothing", minor: 3, major: 4 },
    { category: "Home", minor: 7, major: 5 },
    { category: "Books", minor: 2, major: 3 },
  ]

  // Transformed data for radar chart
  const radarData = [
    { subject: "Processing", A: orderTimeData[4].processing, fullMark: 50 },
    { subject: "Shipped", A: orderTimeData[4].shipped, fullMark: 50 },
    { subject: "Delivered", A: orderTimeData[4].delivered, fullMark: 50 },
  ]

  // Transformed data for scatter chart
  const scatterData = qualityMetricsData.map((item) => ({
    x: item.rating,
    y: item.returns,
    z: 200,
    name: item.category,
  }))

  // Custom render function for Pie Chart labels
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.1;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill={COLORS[index % COLORS.length]}
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontWeight="bold"
      >
        {`${name}: ${value}`}
      </text>
    );
  };

  return (
    <div className="w-full p-4 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 m-4">
        {/* Order Processing Status - Stacked Area Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium mb-2">Order Processing Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={orderTimeData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 120]} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="processing" stackId="1" stroke={colors.darkBlue} fill={colors.darkBlue} />
              <Area type="monotone" dataKey="shipped" stackId="1" stroke={colors.mediumBlue} fill={colors.mediumBlue} />
              <Area type="monotone" dataKey="delivered" stackId="1" stroke={colors.skyBlue} fill={colors.skyBlue} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order Revenue Chart - Composed Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium mb-2">Order Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis domain={[630, 1500]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" barSize={20} fill={colors.oceanBlue} />
              <Line type="monotone" dataKey="revenue" stroke={colors.darkBlue} strokeWidth={3} dot={{ r: 5 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  )
}