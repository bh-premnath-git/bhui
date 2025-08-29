import {create} from 'zustand';

const DEFAULT_QUERY = `SELECT 
  DATE_TRUNC('day', order_date) as sale_date,
  brand_name,
  SUM(total_sales_amount) as daily_sales
FROM 
  sales_summary
WHERE 
  order_date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY 
  sale_date, brand_name
ORDER BY 
  sale_date DESC, brand_name;`;

interface SQLQueryStore {
  query: string;
  defaultQuery: string;
  setQuery: (query: string) => void;
  executeQuery: () => void;
}

export const useSQLQuery = create<SQLQueryStore>((set) => ({
  query: DEFAULT_QUERY,
  defaultQuery: DEFAULT_QUERY,
  setQuery: (query) => set({ query }),
  executeQuery: () => {
    // This would be implemented when connecting to a real database
    console.log('Executing query...');
  },
}));