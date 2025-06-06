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
              name: "Unit Price ($)" as any,
              text: xValues.map((val: number) => `$${val}`),
              textposition: "auto",
            },
          ]}
          layout={{
            margin: { t: 20, b: 50, l: 100, r: 20 },
            xaxis: { title: "Unit Price ($)" as any },
            yaxis: { title: "Product Name" as any, automargin: true },
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
              name: "Number of Orders" as any,
              text: yValues,
              textposition: "auto",
            },
          ]}
          layout={{
            margin: { t: 20, b: 50, l: 50, r: 20 },
            xaxis: { title: "Region" as any },
            yaxis: { title: "Number of Orders" as any },
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
              name: chart.metric as any,
              text: yValues.map((val: number) =>
                chart.metric!.toLowerCase().includes("price")
                  ? `$${val}`
                  : val
              ) as any,
              textposition: "auto",
            },
          ]}
          layout={{
            margin: { t: 20, b: 50, l: 60, r: 20 },
            xaxis: {
              title: (
                chart.category!.charAt(0).toUpperCase() +
                chart.category!.slice(1)
              ) as any,
            },
            yaxis: {
              title: (
                chart.metric!.charAt(0).toUpperCase() +
                chart.metric!.slice(1)
              ) as any,
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


  return (
    <div className="w-full p-4 bg-white">
      {addedCharts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 m-4">
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
      ) : (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 m-4">
          <div className="text-center p-5">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No widgets yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding widgets to your data explorer.</p>
            <p className="text-xs text-gray-400 mt-2">Use the AI Chat to analyze data and create visualizations</p>
          </div>
        </div>
      )}
    </div>
  );
}
