import { useState, useEffect } from "react";
import { GenericData } from "@/types/analytics";


export const formatCurrency = (value: number): string => {
  return `$${value.toLocaleString()}`;
};

export function useAnalyticsData() {
  const [data, setData] = useState<GenericData[]>([]);

  useEffect(() => {
    const dummyData: GenericData[] = [
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
    ];

    setData(dummyData);
  }, []);

  return { data, formatCurrency };
}