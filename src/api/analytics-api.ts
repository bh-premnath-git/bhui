import { GenericData, DashboardData } from "@/types/dataops/data-ops-hub.d";

export const fetchDashboardData = async (): Promise<DashboardData> => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    title: "Daily Sales by Brand",
    description: "What were our daily sales for each brand?",
    timeRange: "Last 7 days",
    brands: ["Dole", "Frieda's", "Goya", "Chiquita"],
    metrics: [
      {
        brand: "Dole",
        value: 12100,
        trend: "+5.2%",
        status: "increase"
      },
      {
        brand: "Frieda's",
        value: 8510,
        trend: "-2.1%",
        status: "decrease"
      },
      {
        brand: "Goya",
        value: 8112,
        trend: "+1.8%",
        status: "increase"
      },
      {
        brand: "Chiquita",
        value: 7472,
        trend: "+0.5%",
        status: "increase"
      }
    ],
    salesData: [
      {
        date: "Jan 25",
        Dole: 12100,
        "Frieda's": 8510,
        Goya: 8112,
        Chiquita: 7472,
      },
      {
        date: "Jan 26",
        Dole: 10500,
        "Frieda's": 7900,
        Goya: 7600,
        Chiquita: 6900,
      },
      {
        date: "Jan 27",
        Dole: 11200,
        "Frieda's": 8200,
        Goya: 7800,
        Chiquita: 7100,
      },
      {
        date: "Jan 28",
        Dole: 9800,
        "Frieda's": 7600,
        Goya: 7200,
        Chiquita: 6600,
      },
      {
        date: "Jan 29",
        Dole: 13500,
        "Frieda's": 9100,
        Goya: 8500,
        Chiquita: 7800,
      },
    ]
  };
};
