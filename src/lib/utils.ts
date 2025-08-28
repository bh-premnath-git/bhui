import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { DataItem, ChartData } from "@/types/dataops/data-ops-hub.d"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getUniqueValues = <TData, TValue extends string | number>(
  data: TData[],
  columnId: string,
): { label: string; value: string }[] => {
  const uniqueValues = new Set<TValue>()
  data.forEach((row) => {
    const value = row[columnId]
    if (value !== undefined && value !== null) {
      uniqueValues.add(value)
    }
  })
  return Array.from(uniqueValues).map((value) => ({
    label: value.toString(),
    value: value.toString(),
  }))
}

export function getInitials(input: string): string {
  return input
    .match(/\b\w/g)
    ?.join('')
    .toUpperCase() || ''
}

export const setCookie = (name: string, value: string, days: number) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = name + "=" + encodeURIComponent(value) + "; expires=" + expires + "; path=/"
}

export const getCookie = (name: string) => {
  return document.cookie.split("; ").reduce((r, v) => {
    const parts = v.split("=")
    return parts[0] === name ? decodeURIComponent(parts[1]) : r
  }, "")
}

export const months = ["Jan", "Feb", "Mar", "Apr", "May"]
export const projects = ["Project1", "Project2", "Project3", "Project4"]
export const pipelines = ["Pipeline1", "Pipeline2", "Pipeline3", "Pipeline4"]

export const generateData = (): DataItem[] => {
  return months.flatMap((month, monthIndex) =>
    projects.flatMap((project) =>
      pipelines.map((pipeline) => ({
        name: month,
        project,
        pipeline,
        latency: Math.floor(Math.random() * 40) + 10,
        cost: Math.floor(Math.random() * 1000) + 500,
        freshness: Math.floor(Math.random() * 20) + 80,
        status: ["In Progress", "Completed", "Failed", "Did Not Arrive", "Not Published"][
          Math.floor(Math.random() * 5)
        ] as DataItem["status"],
        date: new Date(2023, monthIndex, 1),
      })),
    ),
  )
}

export const computeAverageMetrics = (
  data: DataItem[],
  metric: keyof Pick<DataItem, "latency" | "cost">,
) => {
  return months.map((month) => {
    const monthData = data.filter((item) => item.name === month)
    return {
      name: month,
      ...projects.reduce(
        (acc, proj) => {
          const projectData = monthData.filter((item) => item.project === proj)
          const avg =
            projectData.length > 0 ? projectData.reduce((sum, item) => sum + item[metric], 0) / projectData.length : 0
          acc[proj] = Number(avg.toFixed(2))
          return acc
        },
        {} as Record<string, number>,
      ),
    }
  })
}

export const processChartData = (filteredData: DataItem[]): ChartData => ({
  latency: computeAverageMetrics(filteredData, "latency"),
  cost: computeAverageMetrics(filteredData, "cost"),
  ingestion: [
    { name: "Completed", value: filteredData.filter((item) => item.status === "Completed").length },
    { name: "Failed", value: filteredData.filter((item) => item.status === "Failed").length },
    { name: "In Progress", value: filteredData.filter((item) => item.status === "In Progress").length },
    { name: "Did Not Arrive", value: filteredData.filter((item) => item.status === "Did Not Arrive").length },
  ],
  publish: [
    { name: "Published", value: filteredData.filter((item) => item.status === "Completed").length },
    { name: "Failed", value: filteredData.filter((item) => item.status === "Failed").length },
    { name: "In Progress", value: filteredData.filter((item) => item.status === "In Progress").length },
    { name: "Not Published", value: filteredData.filter((item) => item.status === "Not Published").length },
  ],
  health: Object.values(
    filteredData.reduce(
      (acc, item) => {
        if (!acc[item.project]) {
          acc[item.project] = { name: item.project, success: 0, failed: 0 }
        }
        if (item.status === "Completed") {
          acc[item.project].success++
        } else {
          acc[item.project].failed++
        }
        return acc
      },
      {} as Record<string, { name: string; success: number; failed: number }>,
    ),
  ),
  quality: projects.map((project) => {
    const projectData = filteredData.filter((item) => item.project === project)
    const total = projectData.length
    const highQuality = projectData.filter((item) => item.freshness > 90).length
    return {
      name: project,
      success: total > 0 ? (highQuality / total) * 100 : 0,
      failed: total > 0 ? ((total - highQuality) / total) * 100 : 0,
    }
  }),
  incident: projects.map((project) => {
    const projectData = filteredData.filter((item) => item.project === project)
    return {
      name: project,
      failed: projectData.filter((item) => item.status === "Failed").length,
      inProgress: projectData.filter((item) => item.status === "In Progress").length,
      completed: projectData.filter((item) => item.status === "Completed").length,
    }
  }),
})


export const downloadCSV = (data: Array<Record<string, any>>, filename: string = "data.csv") => {
  // Convert array of objects to CSV format
  const csvData = [
    Object.keys(data[0]).join(","), // Header row
    ...data.map(row => Object.values(row).join(",")), // Data rows
  ].join("\n");

  // Create a Blob from the CSV data
  const blob = new Blob([csvData], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  // Create a link and click it programmatically
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export function createShortUUID() {
  let dt = new Date().getTime();
  const uuid = "xxxy4xxxx".replace(/[xy]/g, function (c) {
      var r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });

  return uuid;
}

export const mapFileTypeToLayoutType = (fileType: string): 'delimiter' | 'json' | 'xml' | 'xlsx' => {
  switch (fileType) {
      case 'csv':
      case 'txt':
          return 'delimiter'
      case 'json':
          return 'json'
      case 'xml':
          return 'xml'
      case 'xlsx':
          return 'xlsx'
      default:
          throw new Error(`Unsupported file type: ${fileType}`)
  }
}

export const toNumber = (v: number | string): number | null => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};