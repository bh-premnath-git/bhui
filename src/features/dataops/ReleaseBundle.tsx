import { Release } from "@/types/dataops/realease";
import { DataTable } from '@/components/bh-table/data-table';
import { columns, getToolbarConfig } from './release/config/columns.config';
export function ReleaseBundle({ releases }: { releases: Release[] }) {
  return (
    <DataTable<Release>
      columns={columns}
      data={releases || []}
      topVariant="simple"
      pagination={true}
      toolbarConfig={getToolbarConfig()}
    />
  );
}