import {DataItem } from "@/types/dashboard";

export const months = ["Jan", "Feb", "Mar", "Apr", "May"];
export const projects = ["Project1", "Project2", "Project3", "Project4"];
export const pipelines = ["Pipeline1", "Pipeline2", "Pipeline3", "Pipeline4"];

export const computeAverageMetrics = (
  data: DataItem[],
  metric: keyof Pick<DataItem, "latency" | "cost" | "freshness">
) => {
  return months.map((month, monthIndex) => {
    const monthData = data.filter((item) => item.date.getMonth() === monthIndex);
    return {
      name: month,
      ...projects.reduce((acc, proj) => {
        const projectData = monthData.filter((item) => item.project === proj);
        const avg =
          projectData.length > 0
            ? projectData.reduce((sum, item) => sum + item[metric], 0) /
              projectData.length
            : 0;
        acc[proj] = avg;
        return acc;
      }, {} as Record<string, number>),
    };
  });
};

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
        status: [
          "In Progress",
          "Completed",
          "Failed",
          "Did Not Arrive",
          "Not Published",
        ][Math.floor(Math.random() * 5)] as DataItem["status"],
        date: new Date(2023, monthIndex, 1),
      }))
    )
  );
};
