import { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import { ChevronDown, ChevronUp } from "lucide-react";

export function Xplorer() {
  // State to store added charts from XplorerGenericChatUI
  // Each chart object also carries a `collapsed: boolean` flag
  const [addedCharts, setAddedCharts] = useState<
    Array<{
      id: string;
      title: string;
      query?: string;
      category?: string;
      metric?: string;
      data: any[];
      collapsed: boolean;
    }>
  >([]);

  // Color palette
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

  // Listen for “addChartToDashboard” events; initialize collapsed = false
  useEffect(() => {
    const handleAddChartToDashboard = (event: CustomEvent) => {
      const chartData = event.detail as {
        title: string;
        query?: string;
        category?: string;
        metric?: string;
        data: any[];
      };

      setAddedCharts((prev) => [
        ...prev,
        {
          id: `chart-${Date.now()}`,
          ...chartData,
          collapsed: false,
        },
      ]);
    };

    document.addEventListener(
      "addChartToDashboard",
      handleAddChartToDashboard as EventListener
    );
    return () => {
      document.removeEventListener(
        "addChartToDashboard",
        handleAddChartToDashboard as EventListener
      );
    };
  }, []);

  // Toggle “collapsed” state for a given chart ID
  const toggleCollapse = (id: string) => {
    setAddedCharts((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, collapsed: !c.collapsed } : c
      )
    );
  };

  // Render a single “added” chart: either horizontal bar, region bar, or generic bar
  const renderAddedChart = (chart: {
    id: string;
    title: string;
    query?: string;
    category?: string;
    metric?: string;
    data: any[];
    collapsed: boolean;
  }) => {
    // If collapsed, render nothing (empty placeholder)
    if (chart.collapsed) {
      return null;
    }

    // === “Top Expensive Products” horizontal bar ===
    if (
      Array.isArray(chart.data) &&
      chart.data.length > 0 &&
      "productName" in chart.data[0] &&
      "unitPrice" in chart.data[0]
    ) {
      const xValues = chart.data.map((row: any) => row.unitPrice);
      const yValues = chart.data.map((row: any) => row.productName);

      return (
        <Plot
          data={[
            {
              type: "bar",
              x: xValues,
              y: yValues,
              orientation: "h",
              marker: { color: colors.skyBlue },
              name: "Unit Price ($)",
              text: xValues.map((val: number) => `$${val}`),
              textposition: "auto",
            },
          ]}
          layout={{
            margin: { t: 20, b: 50, l: 100, r: 20 },
            xaxis: { title: "Unit Price ($)" },
            yaxis: { title: "Product Name", automargin: true },
            showlegend: false,
          }}
          style={{ width: "100%", height: "300px" }}
          config={{ displayModeBar: false }}
        />
      );
    }

    // === “Region Count” vertical bar ===
    if (
      Array.isArray(chart.data) &&
      chart.data.length > 0 &&
      "region" in chart.data[0] &&
      "count" in chart.data[0]
    ) {
      const xValues = chart.data.map((row: any) => row.region);
      const yValues = chart.data.map((row: any) => row.count);

      return (
        <Plot
          data={[
            {
              type: "bar",
              x: xValues,
              y: yValues,
              marker: { color: colors.skyBlue },
              name: "Number of Orders",
              text: yValues,
              textposition: "auto",
            },
          ]}
          layout={{
            margin: { t: 20, b: 50, l: 50, r: 20 },
            xaxis: { title: "Region" },
            yaxis: { title: "Number of Orders" },
            showlegend: false,
          }}
          style={{ width: "100%", height: "300px" }}
          config={{ displayModeBar: false }}
        />
      );
    }

    // === Default: single‐series bar using chart.category & chart.metric ===
    if (
      Array.isArray(chart.data) &&
      chart.data.length > 0 &&
      chart.category &&
      chart.metric
    ) {
      const xValues = chart.data.map((row: any) => row[chart.category!]);
      const yValues = chart.data.map((row: any) => row[chart.metric!]);

      return (
        <Plot
          data={[
            {
              type: "bar",
              x: xValues,
              y: yValues,
              marker: { color: colors.oceanBlue },
              name: chart.metric,
              text: yValues.map((val: number) =>
                chart.metric!.toLowerCase().includes("price")
                  ? `$${val}`
                  : val
              ),
              textposition: "auto",
            },
          ]}
          layout={{
            margin: { t: 20, b: 50, l: 60, r: 20 },
            xaxis: {
              title:
                chart.category!.charAt(0).toUpperCase() +
                chart.category!.slice(1),
            },
            yaxis: {
              title:
                chart.metric!.charAt(0).toUpperCase() +
                chart.metric!.slice(1),
            },
            showlegend: false,
          }}
          style={{ width: "100%", height: "300px" }}
          config={{ displayModeBar: false }}
        />
      );
    }

    // If none of the above match, show a placeholder
    return (
      <div className="text-sm text-gray-500">
        Unable to render chart: unsupported data format.
      </div>
    );
  };

  // === Prepare traces for “Order Processing Status” (stacked area) ===
  const months = orderTimeData.map((row) => row.month);
  const processingVals = orderTimeData.map((row) => row.processing);
  const shippedVals = orderTimeData.map((row) => row.shipped);
  const deliveredVals = orderTimeData.map((row) => row.delivered);

  // === Prepare trace for “Order Revenue” (simple bar) ===
  const revMonths = revenueData.map((row) => row.month);
  const revValues = revenueData.map((row) => row.revenue);

  return (
    <div className="w-full p-4 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 m-4">
        {/* === Order Processing Status (Stacked Area, shows legend) === */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium mb-2">
            Order Processing Status
          </h3>
          <Plot
            data={[
              {
                x: months,
                y: processingVals,
                type: "scatter",
                mode: "lines",
                fill: "tozeroy",
                name: "Processing",
                line: { color: colors.darkBlue },
                fillcolor: colors.darkBlue,
              },
              {
                x: months,
                y: shippedVals,
                type: "scatter",
                mode: "lines",
                fill: "tonexty",
                name: "Shipped",
                line: { color: colors.mediumBlue },
                fillcolor: colors.mediumBlue,
              },
              {
                x: months,
                y: deliveredVals,
                type: "scatter",
                mode: "lines",
                fill: "tonexty",
                name: "Delivered",
                line: { color: colors.skyBlue },
                fillcolor: colors.skyBlue,
              },
            ]}
            layout={{
              margin: { t: 20, b: 50, l: 50, r: 20 },
              xaxis: { title: "Month" },
              yaxis: { title: "Count", range: [0, 120] },
              showlegend: true,
            }}
            style={{ width: "100%", height: "300px" }}
            config={{ displayModeBar: false }}
          />
        </div>

        {/* === Order Revenue (Single‐series bar, no legend) === */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium mb-2">Order Revenue</h3>
          <Plot
            data={[
              {
                x: revMonths,
                y: revValues,
                type: "bar",
                marker: { color: colors.oceanBlue },
                name: "Revenue",
                text: revValues.map((v) => `$${v}`),
                textposition: "auto",
              },
            ]}
            layout={{
              margin: { t: 20, b: 50, l: 60, r: 20 },
              xaxis: { title: "Month" },
              yaxis: { title: "Revenue ($)", range: [630, 1500] },
              showlegend: false,
            }}
            style={{ width: "100%", height: "300px" }}
            config={{ displayModeBar: false }}
          />
        </div>

        {/* === Dynamically Added Charts === */}
        {addedCharts.map((chart) => (
          <div key={chart.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">{chart.title}</h3>
              <button
                onClick={() => toggleCollapse(chart.id)}
                className="text-xs"
              >
                {chart.collapsed ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronUp size={16} />
                )}
              </button>
            </div>
            <div className="text-xs text-gray-500 mb-4">
              {chart.query && (
                <code className="bg-gray-100 p-1 rounded">
                  {chart.query.substring(0, 40)}…
                </code>
              )}
            </div>
            {/* Only render the Plot if not collapsed */}
            {renderAddedChart(chart)}
          </div>
        ))}
      </div>
    </div>
  );
}
