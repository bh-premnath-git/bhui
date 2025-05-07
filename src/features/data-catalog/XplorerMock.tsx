"use client"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
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

  return (
    <div className="w-full p-4 bg-white ">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 m-4">
        {/* Order Processing Status Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium mb-2">Order Processing Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={orderTimeData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis domain={[15, 47]} />
              <Tooltip />
              <Line
                type="natural"
                dataKey="processing"
                stroke={colors.darkBlue}
                strokeWidth={2}
                dot={{ r: 4, fill: colors.darkBlue }}
              />
              <Line
                type="natural"
                dataKey="shipped"
                stroke={colors.mediumBlue}
                strokeWidth={2}
                dot={{ r: 4, fill: colors.mediumBlue }}
              />
              <Line
                type="natural"
                dataKey="delivered"
                stroke={colors.skyBlue}
                strokeWidth={2}
                dot={{ r: 4, fill: colors.skyBlue }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Order Revenue Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium mb-2">Order Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.oceanBlue} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={colors.skyBlue} stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" />
              <YAxis domain={[630, 1474]} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={colors.oceanBlue}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order Distribution Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium mb-2">Order Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderDistributionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {orderDistributionData.map((entry, index) => {
                  const colorKeys = Object.keys(colors)
                  return <Cell key={`cell-${index}`} fill={colors[colorKeys[index % colorKeys.length]]} />
                })}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status by Category */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium mb-2">Order Status by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={orderStatusByCategory}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="category" />
              <YAxis domain={[0, 18]} />
              <Tooltip />
              <Bar dataKey="completed" fill={colors.darkBlue} />
              <Bar dataKey="pending" fill={colors.lightBlue} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order Quality Metrics */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium mb-2">Order Quality</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={qualityMetricsData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="category" />
              <YAxis domain={[31, 72]} />
              <Tooltip />
              <Bar dataKey="rating" fill={colors.darkBlue} />
              <Bar dataKey="returns" fill={colors.skyBlue} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order Incidents */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium mb-2">Order Incidents</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={incidentsData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="category" />
              <YAxis domain={[0, 8]} />
              <Tooltip />
              <Bar dataKey="minor" fill={colors.oceanBlue} />
              <Bar dataKey="major" fill={colors.darkBlue} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
