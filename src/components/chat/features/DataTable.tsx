import React from 'react';
import type { TableEvent } from '@/types/streaming';


export const DataTable: React.FC<{ table: TableEvent['content'] }> = ({ table }) => (
<div className="overflow-auto border rounded-md">
<table className="w-full text-sm">
<thead className="bg-muted/50">
<tr>
{table.column_names.map((c, idx) => (
<th key={idx} className="text-left px-3 py-2 border-b">{c}</th>
))}
</tr>
</thead>
<tbody>
{table.column_values.map((row, rIdx) => (
<tr key={rIdx} className="odd:bg-background even:bg-muted/10">
{row.map((cell, cIdx) => (
<td key={cIdx} className="px-3 py-2 border-b">{cell as any}</td>
))}
</tr>
))}
</tbody>
</table>
</div>
);