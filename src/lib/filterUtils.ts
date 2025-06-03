import { parse, isWithinInterval, subDays, startOfDay, endOfDay } from "date-fns";
import { FilterState, ExecutedQueryItem } from "@/types/dataops/dataops-dash";

export const filterDataByProject = (
  data: ExecutedQueryItem[],
  projectName: string | null
): ExecutedQueryItem[] => {
  if (!projectName) return data;
  return data.filter(item => item.project_name === projectName);
};

export const filterDataByTimeRange = (
  data: ExecutedQueryItem[],
  timeRange: string | null
): ExecutedQueryItem[] => {
  if (!timeRange) return data;

  const now = new Date();
  let startDate: Date | null = null;
  let endDate = endOfDay(now);

  switch (timeRange) {
    case 'today':
      startDate = startOfDay(now);
      break;
    case 'yesterday':
      startDate = startOfDay(subDays(now, 1));
      endDate = endOfDay(subDays(now, 1));
      break;
    case '7days':
      startDate = startOfDay(subDays(now, 7));
      break;
    case '30days':
      startDate = startOfDay(subDays(now, 30));
      break;
    case '90days':
      startDate = startOfDay(subDays(now, 90));
      break;
  }

  if (!startDate) return data;

  return data.filter(item => {
    try {
      const date = parse(item.month_label, 'MMM yyyy', new Date());
      return isWithinInterval(date, { start: startDate!, end: endDate });
    } catch {
      return true;
    }
  });
};

export const applyFilters = (
  data: ExecutedQueryItem[],
  filters: FilterState
): ExecutedQueryItem[] => {
  if (!Array.isArray(data)) return [];
  
  let filteredData = [...data];
  
  if (filters.projectName) {
    filteredData = filterDataByProject(filteredData, filters.projectName);
  }
  
  if (filters.timeRange) {
    filteredData = filterDataByTimeRange(filteredData, filters.timeRange);
  }
  
  return filteredData;
};