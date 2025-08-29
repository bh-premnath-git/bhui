import React from 'react';
import { DataTable } from '@/components/chat/features/DataTable';
import type { TableEvent } from '@/types/streaming';


export const TableTab: React.FC<{ table?: TableEvent['content'] | null }> = ({ table }) => {
if (!table) return <div className="text-sm text-muted-foreground italic">No table results available.</div>;
return (
<div className="overflow-auto border rounded-md">
<DataTable table={table} />
</div>
);
};