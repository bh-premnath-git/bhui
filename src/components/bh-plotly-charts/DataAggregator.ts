import { IDataAggregator, AggregationMethod, GroupedData } from "@/types/plotly/systemtype";

export class DataAggregator implements IDataAggregator {
    aggregate(values: number[], method: AggregationMethod): number {
      if (!values.length) return 0;
      
      switch (method) {
        case 'avg': return values.reduce((a, b) => a + b, 0) / values.length;
        case 'min': return Math.min(...values);
        case 'max': return Math.max(...values);
        case 'sum': return values.reduce((a, b) => a + b, 0);
        default: return 0;
      }
    }
    
    groupBy<T>(data: T[], keys: string[]): GroupedData<T> {
      const map = new Map();
      
      for (const row of data) {
        const comp = keys.map(k => String((row as any)[k] || '')).join('\u0001');
        if (!map.has(comp)) map.set(comp, []);
        map.get(comp).push(row);
      }
      
      return {
        entries: [...map.entries()].map(([k, rows]) => ({
          key: k.split('\u0001'),
          rows
        }))
      };
    }
}