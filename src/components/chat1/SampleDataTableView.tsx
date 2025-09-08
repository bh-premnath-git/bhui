import React from 'react';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/chat/features/DataTable';

// Simple sample data for demonstration; replace with real preview API if needed
const sampleTable = {
  column_names: ['id', 'name', 'value', 'updated_at'],
  column_values: [
    [1, 'Alpha', 12.34, '2025-01-01 10:00:00'],
    [2, 'Beta', 56.78, '2025-01-02 11:30:00'],
    [3, 'Gamma', 90.12, '2025-01-03 09:15:00']
  ],
  metadata: { total_rows: 3, columns_count: 4 }
};

export const SampleDataTableView: React.FC = () => {
  return (
    <div className="h-full w-full p-3">
      <div className="mb-2 text-xs text-muted-foreground">
        Showing sample output data (static demo). Replace with API data if available.
      </div>
      <Card className="p-2">
        <DataTable table={sampleTable as any} />
      </Card>
    </div>
  );
};

export default SampleDataTableView;