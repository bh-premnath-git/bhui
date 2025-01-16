import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function SQLViewer() {
  const [query, setQuery] = useState(
    `SELECT 
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
  sale_date DESC, brand_name;`
  );

  return (
    <div className="space-y-4">
      <Textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="font-mono h-[200px]"
      />
      <Button className="w-full bg-black">Run Query</Button>
    </div>
  );
}