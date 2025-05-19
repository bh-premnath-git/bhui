import { ChevronDown } from "lucide-react";
import React, { useState, useEffect } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  ComposedChart,
  LabelList,
} from "recharts";

export function XplorerMock() {
  // State to store added charts from XplorerGenericChatUI
  const [addedCharts, setAddedCharts] = useState([]);

  // Color palette from the image - various shades of blue
  const colors = {
    lightBlue: "#D6E8F5",
    skyBlue: "#A7D1F0",
    mediumBlue: "#5BAEE5",
    oceanBlue: "#3D8BC9",
    darkBlue: "#1A4971",
  };

  // Mock data for order metrics over time
  const orderTimeData = [
    { month: "Jan", processing: 27, shipped: 23, delivered: 31 },
    { month: "Feb", processing: 34, shipped: 23, delivered: 28 },
    { month: "Mar", processing: 22, shipped: 39, delivered: 33 },
    { month: "Apr", processing: 29, shipped: 26, delivered: 31 },
    { month: "May", processing: 43, shipped: 25, delivered: 35 },
  ];

  // Mock data for order revenue
  const revenueData = [
    { month: "Jan", revenue: 880 },
    { month: "Feb", revenue: 1130 },
    { month: "Mar", revenue: 950 },
    { month: "Apr", revenue: 1050 },
    { month: "May", revenue: 1474 },
  ];

  // Event listener to handle charts added from XplorerGenericChatUI
  useEffect(() => {
    // Function to handle the custom event
    const handleAddChartToDashboard = (event) => {
      const chartData = event.detail;
      console.log("Adding chart to dashboard:", chartData);
      
      // Add the chart to the state with a unique id
      setAddedCharts((prevCharts) => [
        ...prevCharts,
        {
          id: `chart-${Date.now()}`,
          ...chartData,
        },
      ]);
    };

    // Add event listener
    document.addEventListener("addChartToDashboard", handleAddChartToDashboard);

    // Cleanup function to remove event listener
    return () => {
      document.removeEventListener("addChartToDashboard", handleAddChartToDashboard);
    };
  }, []);

  // Function to render individual chart based on the data type
  const renderAddedChart = (chart) => {
    // Check if it's the top expensive products chart
    if (
      Array.isArray(chart.data) &&
      chart.data.length > 0 &&
      "productName" in chart.data[0] &&
      "unitPrice" in chart.data[0]
    ) {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chart.data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <XAxis type="number" />
            <YAxis
              dataKey="productName"
              type="category"
              width={100}
              label={{
                value: "Product Name",
                angle: -90,
                position: "insideLeft",
                offset: -30,
              }}
            />
            <Tooltip formatter={(value) => [`$${value}`, "Price"]} />
            <Legend />
            <Bar dataKey="unitPrice" fill={colors.skyBlue} name="Unit Price ($)">
              <LabelList
                dataKey="unitPrice"
                position="right"
                formatter={(value) => `$${value}`}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    }

    // If it's a region count query
    if (
      Array.isArray(chart.data) &&
      chart.data.length > 0 &&
      "region" in chart.data[0] &&
      "count" in chart.data[0]
    ) {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chart.data}>
            <XAxis
              dataKey="region"
              label={{ value: "Region", position: "insideBottom", offset: -5 }}
            />
            <YAxis
              label={{
                value: "Number of Orders",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill={colors.skyBlue} name="Number of Orders" />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    // Default chart for orders or other data
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chart.data}>
          <XAxis
            dataKey={chart.category || "id"}
            label={{
              value: chart.category || "ID",
              position: "insideBottom",
              offset: -5,
            }}
          />
          <YAxis
            label={{
              value: chart.metric.charAt(0).toUpperCase() + chart.metric.slice(1),
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip />
          <Legend />
          <Bar
            dataKey={chart.metric}
            fill={colors.oceanBlue}
            name={chart.metric.charAt(0).toUpperCase() + chart.metric.slice(1)}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="w-full p-4 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 m-4">
        {/* Original charts */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium mb-2">Order Processing Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={orderTimeData}>
              <XAxis dataKey="month" />
              <YAxis domain={[0, 120]} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="processing"
                stackId="1"
                stroke={colors.darkBlue}
                fill={colors.darkBlue}
              />
              <Area
                type="monotone"
                dataKey="shipped"
                stackId="1"
                stroke={colors.mediumBlue}
                fill={colors.mediumBlue}
              />
              <Area
                type="monotone"
                dataKey="delivered"
                stackId="1"
                stroke={colors.skyBlue}
                fill={colors.skyBlue}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium mb-2">Order Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={revenueData}>
              <XAxis dataKey="month" />
              <YAxis domain={[630, 1500]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" barSize={30} fill={colors.oceanBlue} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Added charts from XplorerGenericChatUI */}
        {addedCharts.map((chart) => (
          <div key={chart.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">{chart.title}</h3>
              <button 
                onClick={() => setAddedCharts(addedCharts.filter(c => c.id !== chart.id))}
                className="text-xs"
              >
                <ChevronDown/>
              </button>
            </div>
            <div className="text-xs text-gray-500 mb-4">
              {chart.query && <code className="bg-gray-100 p-1 rounded">{chart.query.substring(0, 40)}...</code>}
            </div>
            {renderAddedChart(chart)}
          </div>
        ))}
      </div>
    </div>
  );
}