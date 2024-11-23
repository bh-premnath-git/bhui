import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



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


